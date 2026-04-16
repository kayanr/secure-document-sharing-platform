package com.securedoc.backend.service;

import com.securedoc.backend.dto.DocumentDTO;
import com.securedoc.backend.model.Document;
import com.securedoc.backend.repository.DocumentRepository;
import com.securedoc.backend.storage.StorageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final DocumentRepository documentRepository;
    private final StorageService storageService;

    public AdminService(DocumentRepository documentRepository, StorageService storageService) {
        this.documentRepository = documentRepository;
        this.storageService = storageService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<DocumentDTO> listAllDocuments() {
        return documentRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAnyDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        storageService.delete(document.getFilePath());
        documentRepository.delete(document);
    }

    private DocumentDTO toDTO(Document document) {
        return new DocumentDTO(
                document.getId(),
                document.getFileName(),
                document.getFilePath(),
                document.getFileSize(),
                document.getUploadedAt(),
                document.getOwner().getEmail()
        );
    }
}
