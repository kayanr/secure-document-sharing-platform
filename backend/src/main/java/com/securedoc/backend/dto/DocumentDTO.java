package com.securedoc.backend.dto;

import java.time.LocalDateTime;

public class DocumentDTO {

    private Long id;
    private String originalFilename;
    private String storedFilename;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private String ownerEmail;

    public DocumentDTO(Long id, String originalFilename, String storedFilename,
                       Long fileSize, LocalDateTime uploadedAt, String ownerEmail) {
        this.id = id;
        this.originalFilename = originalFilename;
        this.storedFilename = storedFilename;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
        this.ownerEmail = ownerEmail;
    }

    public Long getId() { return id; }
    public String getOriginalFilename() { return originalFilename; }
    public String getStoredFilename() { return storedFilename; }
    public Long getFileSize() { return fileSize; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public String getOwnerEmail() { return ownerEmail; }
}
