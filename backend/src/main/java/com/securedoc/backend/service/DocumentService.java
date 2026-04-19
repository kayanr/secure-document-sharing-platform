package com.securedoc.backend.service;

import com.securedoc.backend.dto.DocumentDTO;
import com.securedoc.backend.model.Document;
import com.securedoc.backend.model.User;
import com.securedoc.backend.repository.DocumentRepository;
import com.securedoc.backend.repository.SharePermissionRepository;
import com.securedoc.backend.repository.UserRepository;
import com.securedoc.backend.storage.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Service
public class DocumentService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "image/jpeg",
            "image/png"
    );

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final SharePermissionRepository sharePermissionRepository;

    public DocumentService(DocumentRepository documentRepository,
                           UserRepository userRepository,
                           StorageService storageService,
                           SharePermissionRepository sharePermissionRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.sharePermissionRepository = sharePermissionRepository;
    }

    public DocumentDTO upload(MultipartFile file, String email) {
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "File type not allowed. Accepted types: PDF, DOCX, TXT, JPG, PNG");
        }

        User owner = getUser(email);

        String storedFilename = storageService.store(file);

        Document document = new Document();
        document.setFileName(file.getOriginalFilename());
        document.setFilePath(storedFilename);
        document.setFileSize(file.getSize());
        document.setContentType(file.getContentType());
        document.setOwner(owner);

        Document saved = documentRepository.save(document);
        return toDTO(saved);
    }

    public List<DocumentDTO> listForUser(String email) {
        User owner = getUser(email);
        return documentRepository.findByOwner(owner)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public Resource download(Long id, String email) {
        User user = getUser(email);
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        boolean isOwner = document.getOwner().getEmail().equals(email);
        boolean isRecipient = sharePermissionRepository.existsByDocumentAndSharedWith(document, user);

        if (!isOwner && !isRecipient) {
            throw new SecurityException("Access denied");
        }

        return storageService.load(document.getFilePath());
    }

    public void delete(Long id, String email) {
        Document document = getOwnedDocument(id, email);
        storageService.delete(document.getFilePath());
        documentRepository.delete(document);
    }

    // --- Private helpers ---

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private Document getOwnedDocument(Long id, String email) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (!document.getOwner().getEmail().equals(email)) {
            throw new SecurityException("Access denied");
        }

        return document;
    }

    private DocumentDTO toDTO(Document document) {
        return new DocumentDTO(
                document.getId(),
                document.getFileName(),
                document.getFilePath(),
                document.getFileSize(),
                document.getUploadedAt(),
                document.getOwner().getEmail(),
                sharePermissionRepository.countByDocument(document)
        );
    }
}
