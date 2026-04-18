package com.securedoc.backend.controller;

import com.securedoc.backend.dto.DocumentDTO;
import com.securedoc.backend.dto.ShareInfoDTO;
import com.securedoc.backend.dto.ShareRequestDTO;
import com.securedoc.backend.service.SharePermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class ShareController {

    private final SharePermissionService sharePermissionService;

    public ShareController(SharePermissionService sharePermissionService) {
        this.sharePermissionService = sharePermissionService;
    }

    // Share a document with another user by email
    @PostMapping("/{id}/share")
    public ResponseEntity<Void> share(@PathVariable Long id,
                                      @RequestBody ShareRequestDTO request,
                                      Principal principal) {
        sharePermissionService.share(id, request.getRecipientEmail(), principal.getName());
        return ResponseEntity.status(201).build();
    }

    // List all users a document is shared with — owner only
    @GetMapping("/{id}/shares")
    public ResponseEntity<List<ShareInfoDTO>> listShares(@PathVariable Long id,
                                                         Principal principal) {
        return ResponseEntity.ok(sharePermissionService.listShares(id, principal.getName()));
    }

    // List all documents shared with the logged-in user
    @GetMapping("/shared-with-me")
    public ResponseEntity<List<DocumentDTO>> sharedWithMe(Principal principal) {
        return ResponseEntity.ok(sharePermissionService.listSharedWithMe(principal.getName()));
    }

    // Revoke a share — only the document owner can do this
    @DeleteMapping("/{id}/share/{recipientId}")
    public ResponseEntity<Void> revoke(@PathVariable Long id,
                                       @PathVariable Long recipientId,
                                       Principal principal) {
        sharePermissionService.revoke(id, recipientId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
