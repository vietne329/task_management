package com.personalweb.app.service.impl;

import com.personalweb.app.dto.MsuiteAccountDto;
import com.personalweb.app.dto.MsuiteAccountRequest;
import com.personalweb.app.entity.MsuiteAccount;
import com.personalweb.app.exception.ResourceNotFoundException;
import com.personalweb.app.repository.MsuiteAccountRepository;
import com.personalweb.app.service.MsuiteAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MsuiteAccountServiceImpl implements MsuiteAccountService {

    private final MsuiteAccountRepository repository;

    @Override
    public List<MsuiteAccountDto> getAll() {
        return repository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MsuiteAccountDto> getByCountry(MsuiteAccount.Country country) {
        return repository.findByCountry(country).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public MsuiteAccountDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Override
    @Transactional
    public MsuiteAccountDto create(MsuiteAccountRequest request) {
        MsuiteAccount entity = MsuiteAccount.builder()
                .country(request.getCountry())
                .keyRestore(request.getKeyRestore())
                .domain(request.getDomain())
                .account(request.getAccount())
                .password(request.getPassword())
                .build();
        MsuiteAccount saved = repository.save(entity);
        log.info("Created MsuiteAccount id={} country={}", saved.getId(), saved.getCountry());
        return toDto(saved);
    }

    @Override
    @Transactional
    public MsuiteAccountDto update(Long id, MsuiteAccountRequest request) {
        MsuiteAccount entity = findOrThrow(id);
        entity.setCountry(request.getCountry());
        entity.setKeyRestore(request.getKeyRestore());
        entity.setDomain(request.getDomain());
        entity.setAccount(request.getAccount());
        entity.setPassword(request.getPassword());
        MsuiteAccount saved = repository.save(entity);
        log.info("Updated MsuiteAccount id={}", saved.getId());
        return toDto(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        MsuiteAccount entity = findOrThrow(id);
        repository.delete(entity);
        log.info("Deleted MsuiteAccount id={}", id);
    }

    private MsuiteAccount findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MsuiteAccount not found with id: " + id));
    }

    private MsuiteAccountDto toDto(MsuiteAccount e) {
        return MsuiteAccountDto.builder()
                .id(e.getId())
                .country(e.getCountry())
                .keyRestore(e.getKeyRestore())
                .domain(e.getDomain())
                .account(e.getAccount())
                .password(e.getPassword())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
