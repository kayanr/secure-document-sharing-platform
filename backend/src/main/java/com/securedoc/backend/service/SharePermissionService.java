package com.securedoc.backend.service;

import com.securedoc.backend.dto.DocumentDTO;
import com.securedoc.backend.model.Document;
import com.securedoc.backend.model.SharePermission;
import com.securedoc.backend.model.User;
import com.securedoc.backend.repository.DocumentRepository;
import com.securedoc.backend.repository.SharePermissionRepository;
import com.securedoc.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SharePermissionService {

    private final SharePermissionRepository sharePermissionRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public SharePermissionService(SharePermissionRepository sharePermissionRepository,
                                  DocumentRepository documentRepository,
                                  UserRepository userRepository) {
        this.sharePermissionRepository = sharePermissionRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    // Share a document with another user by email
    public void share(Long documentId, String recipientEmail, String ownerEmail) {
        User owner = getUser(ownerEmail);
        Document document = getOwnedDocument(documentId, owner);
        User recipient = getUser(recipientEmail);

        if (owner.getEmail().equals(recipient.getEmail())) {
            throw new IllegalArgumentException("You cannot share a document with yourself");
        }

        if (sharePermissionRepository.existsByDocumentAndSharedWith(document, recipient)) {
            throw new IllegalArgumentException("Document already shared with this user");
        }

        SharePermission permission = new SharePermission();
        permission.setDocument(document);
        permission.setSharedBy(owner);
        permission.setSharedWith(recipient);

        sharePermissionRepository.save(permission);
    }

    // List all documents shared with the logged-in user
    public List<DocumentDTO> listSharedWithMe(String email) {
        User user = getUser(email);
        return sharePermissionRepository.findBySharedWith(user)
                .stream()
                .map(p -> toDTO(p.getDocument()))
                .toList();
    }

    // Revoke a share — only the document owner can do this
    public void revoke(Long documentId, Long recipientId, String ownerEmail) {
        User owner = getUser(ownerEmail);
        Document document = getOwnedDocument(documentId, owner);

        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient user not found"));

        SharePermission permission = sharePermissionRepository
                .findByDocumentAndSharedWith(document, recipient)
                .orElseThrow(() -> new IllegalArgumentException("Share not found"));

        sharePermissionRepository.delete(permission);
    }

    // --- Private helpers ---

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private Document getOwnedDocument(Long documentId, User owner) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (!document.getOwner().getEmail().equals(owner.getEmail())) {
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
                document.getOwner().getEmail()
        );
    }
}
