package com.personalweb.app.controller;

import com.personalweb.app.dto.KnowledgeNoteDto;
import com.personalweb.app.dto.KnowledgeNoteRequest;
import com.personalweb.app.service.KnowledgeNoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/knowledge")
@RequiredArgsConstructor
@Tag(name = "Knowledge Notes", description = "Sổ tay kiến thức")
@SecurityRequirement(name = "bearerAuth")
public class KnowledgeNoteController {

    private final KnowledgeNoteService service;

    @GetMapping
    @Operation(summary = "Lấy tất cả ghi chú")
    public ResponseEntity<List<KnowledgeNoteDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/categories")
    @Operation(summary = "Lấy danh sách danh mục")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(service.getCategories());
    }

    @GetMapping("/by-category")
    @Operation(summary = "Lấy ghi chú theo danh mục")
    public ResponseEntity<List<KnowledgeNoteDto>> getByCategory(@RequestParam String category) {
        return ResponseEntity.ok(service.getByCategory(category));
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm ghi chú (title, content, tags)")
    public ResponseEntity<List<KnowledgeNoteDto>> search(@RequestParam String q) {
        return ResponseEntity.ok(service.search(q));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy ghi chú theo ID")
    public ResponseEntity<KnowledgeNoteDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo ghi chú mới")
    public ResponseEntity<KnowledgeNoteDto> create(
            @Valid @RequestBody KnowledgeNoteRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật ghi chú")
    public ResponseEntity<KnowledgeNoteDto> update(
            @PathVariable Long id,
            @Valid @RequestBody KnowledgeNoteRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xoá ghi chú")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
