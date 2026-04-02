package com.personalweb.app.service.impl;

import com.personalweb.app.dto.KnowledgeNoteDto;
import com.personalweb.app.dto.KnowledgeNoteRequest;
import com.personalweb.app.dto.UserDto;
import com.personalweb.app.entity.KnowledgeNote;
import com.personalweb.app.entity.User;
import com.personalweb.app.exception.ResourceNotFoundException;
import com.personalweb.app.repository.KnowledgeNoteRepository;
import com.personalweb.app.repository.UserRepository;
import com.personalweb.app.service.KnowledgeNoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeNoteServiceImpl implements KnowledgeNoteService {

    private final KnowledgeNoteRepository noteRepository;
    private final UserRepository userRepository;

    @Override
    public List<KnowledgeNoteDto> getAll() {
        return noteRepository.findAllWithCreatedBy().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<KnowledgeNoteDto> getByCategory(String category) {
        return noteRepository.findByCategoryWithCreatedBy(category).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<KnowledgeNoteDto> search(String query) {
        return noteRepository.search(query).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<String> getCategories() {
        return noteRepository.findDistinctCategories();
    }

    @Override
    public KnowledgeNoteDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Override
    @Transactional
    public KnowledgeNoteDto create(KnowledgeNoteRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        KnowledgeNote note = KnowledgeNote.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(trimOrNull(request.getCategory()))
                .tags(trimOrNull(request.getTags()))
                .createdBy(author)
                .build();

        KnowledgeNote saved = noteRepository.save(note);
        log.info("Created KnowledgeNote id={} title='{}' by '{}'", saved.getId(), saved.getTitle(), username);
        return toDto(saved);
    }

    @Override
    @Transactional
    public KnowledgeNoteDto update(Long id, KnowledgeNoteRequest request) {
        KnowledgeNote note = findOrThrow(id);
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setCategory(trimOrNull(request.getCategory()));
        note.setTags(trimOrNull(request.getTags()));
        KnowledgeNote saved = noteRepository.save(note);
        log.info("Updated KnowledgeNote id={}", saved.getId());
        return toDto(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        noteRepository.delete(findOrThrow(id));
        log.info("Deleted KnowledgeNote id={}", id);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private KnowledgeNote findOrThrow(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeNote not found: " + id));
    }

    private String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private KnowledgeNoteDto toDto(KnowledgeNote n) {
        UserDto author = null;
        if (n.getCreatedBy() != null) {
            User u = n.getCreatedBy();
            author = UserDto.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .role(u.getRole())
                    .enabled(u.getEnabled())
                    .createdAt(u.getCreatedAt())
                    .build();
        }
        return KnowledgeNoteDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .category(n.getCategory())
                .tags(n.getTags())
                .createdBy(author)
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
