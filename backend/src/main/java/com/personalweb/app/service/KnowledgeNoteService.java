package com.personalweb.app.service;

import com.personalweb.app.dto.KnowledgeNoteDto;
import com.personalweb.app.dto.KnowledgeNoteRequest;

import java.util.List;

public interface KnowledgeNoteService {
    List<KnowledgeNoteDto> getAll();
    List<KnowledgeNoteDto> getByCategory(String category);
    List<KnowledgeNoteDto> search(String query);
    List<String> getCategories();
    KnowledgeNoteDto getById(Long id);
    KnowledgeNoteDto create(KnowledgeNoteRequest request, String username);
    KnowledgeNoteDto update(Long id, KnowledgeNoteRequest request);
    void delete(Long id);
}
