package com.securedoc.backend.controller;

import com.securedoc.backend.dto.DocumentDTO;
import com.securedoc.backend.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public ResponseEntity<DocumentDTO> upload(@RequestParam("file") MultipartFile file,
                                              Principal principal) {
        DocumentDTO dto = documentService.upload(file, principal.getName());
        return ResponseEntity.status(201).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<DocumentDTO>> list(Principal principal) {
        return ResponseEntity.ok(documentService.listForUser(principal.getName()));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id, Principal principal) {
        Resource resource = documentService.download(id, principal.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        documentService.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
