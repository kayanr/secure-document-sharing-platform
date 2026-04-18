package com.securedoc.backend.dto;

import java.time.LocalDateTime;

public class ShareInfoDTO {

    private Long userId;
    private String email;
    private LocalDateTime sharedAt;

    public ShareInfoDTO(Long userId, String email, LocalDateTime sharedAt) {
        this.userId = userId;
        this.email = email;
        this.sharedAt = sharedAt;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public LocalDateTime getSharedAt() { return sharedAt; }
}
