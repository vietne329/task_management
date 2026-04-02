package com.personalweb.app.controller;

import com.personalweb.app.dto.MsuiteAccountDto;
import com.personalweb.app.dto.MsuiteAccountRequest;
import com.personalweb.app.entity.MsuiteAccount;
import com.personalweb.app.service.MsuiteAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/msuite-accounts")
@RequiredArgsConstructor
@Tag(name = "Msuite Accounts", description = "Msuite Account management endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class MsuiteAccountController {

    private final MsuiteAccountService service;

    @GetMapping
    @Operation(summary = "Get all Msuite accounts")
    public ResponseEntity<List<MsuiteAccountDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/by-country/{country}")
    @Operation(summary = "Get accounts by country")
    public ResponseEntity<List<MsuiteAccountDto>> getByCountry(
            @PathVariable MsuiteAccount.Country country) {
        return ResponseEntity.ok(service.getByCountry(country));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<MsuiteAccountDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create new Msuite account")
    public ResponseEntity<MsuiteAccountDto> create(@Valid @RequestBody MsuiteAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Msuite account")
    public ResponseEntity<MsuiteAccountDto> update(
            @PathVariable Long id,
            @Valid @RequestBody MsuiteAccountRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Msuite account")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
