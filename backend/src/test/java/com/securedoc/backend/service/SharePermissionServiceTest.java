package com.securedoc.backend.service;

import com.securedoc.backend.dto.DocumentDTO;
import com.securedoc.backend.dto.ShareInfoDTO;
import com.securedoc.backend.model.Document;
import com.securedoc.backend.model.SharePermission;
import com.securedoc.backend.model.User;
import com.securedoc.backend.repository.DocumentRepository;
import com.securedoc.backend.repository.SharePermissionRepository;
import com.securedoc.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SharePermissionServiceTest {

    @Mock private SharePermissionRepository sharePermissionRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private SharePermissionService sharePermissionService;

    private User owner;
    private User recipient;
    private Document document;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@test.com");

        recipient = new User();
        recipient.setId(2L);
        recipient.setEmail("recipient@test.com");

        document = new Document();
        document.setId(10L);
        document.setFileName("test.pdf");
        document.setFilePath("/uploads/test.pdf");
        document.setFileSize(1024L);
        document.setOwner(owner);
        document.setUploadedAt(LocalDateTime.now());
    }

    // --- share() ---

    @Test
    void share_success_savesPermission() {
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("recipient@test.com")).thenReturn(Optional.of(recipient));
        when(documentRepository.findById(10L)).thenReturn(Optional.of(document));
        when(sharePermissionRepository.existsByDocumentAndSharedWith(document, recipient)).thenReturn(false);

        sharePermissionService.share(10L, "recipient@test.com", "owner@test.com");

        verify(sharePermissionRepository).save(any(SharePermission.class));
    }

    @Test
    void share_withSelf_throwsIllegalArgumentException() {
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(documentRepository.findById(10L)).thenReturn(Optional.of(document));

        assertThatThrownBy(() ->
                sharePermissionService.share(10L, "owner@test.com", "owner@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot share a document with yourself");

        verify(sharePermissionRepository, never()).save(any());
    }

    @Test
    void share_duplicate_throwsIllegalArgumentException() {
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("recipient@test.com")).thenReturn(Optional.of(recipient));
        when(documentRepository.findById(10L)).thenReturn(Optional.of(document));
        when(sharePermissionRepository.existsByDocumentAndSharedWith(document, recipient)).thenReturn(true);

        assertThatThrownBy(() ->
                sharePermissionService.share(10L, "recipient@test.com", "owner@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already shared");

        verify(sharePermissionRepository, never()).save(any());
    }

    @Test
    void share_nonOwner_throwsSecurityException() {
        User other = new User();
        other.setId(3L);
        other.setEmail("other@test.com");

        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));
        when(documentRepository.findById(10L)).thenReturn(Optional.of(document));

        assertThatThrownBy(() ->
                sharePermissionService.share(10L, "recipient@test.com", "other@test.com"))
                .isInstanceOf(SecurityException.class);

        verify(sharePermissionRepository, never()).save(any());
    }

    // --- listSharedWithMe() ---

    @Test
    void listSharedWithMe_returnsDocumentDTOs() {
        SharePermission permission = new SharePermission();
        permission.setDocument(document);
        permission.setSharedWith(recipient);
        permission.setSharedBy(owner);
        permission.setSharedAt(LocalDateTime.now());

        when(userRepository.findByEmail("recipient@test.com")).thenReturn(Optional.of(recipient));
        when(sharePermissionRepository.findBySharedWith(recipient)).thenReturn(List.of(permission));

        List<DocumentDTO> result = sharePermissionService.listSharedWithMe("recipient@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getOriginalFilename()).isEqualTo("test.pdf");
    }

    // --- listShares() ---

    @Test
    void listShares_returnsShareInfoDTOs() {
        SharePermission permission = new SharePermission();
        permission.setDocument(document);
        permission.setSharedWith(recipient);
        permission.setSharedBy(owner);
        permission.setSharedAt(LocalDateTime.now());

        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(documentRepository.findById(10L)).thenReturn(Optional.of(document));
        when(sharePermissionRepository.findByDocument(document)).thenReturn(List.of(permission));

        List<ShareInfoDTO> result = sharePermissionService.listShares(10L, "owner@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("recipient@test.com");
        assertThat(result.get(0).getUserId()).isEqualTo(2L);
    }

    // --- revoke() ---

    @Test
    void revoke_success_deletesPermission() {
        SharePermission permission = new SharePermission();
        permission.setDocument(document);
        permission.setSharedWith(recipient);

        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(documentRepository.findById(10L)).thenReturn(Optional.of(document));
        when(sharePermissionRepository.findByDocumentAndSharedWith(document, recipient))
                .thenReturn(Optional.of(permission));

        sharePermissionService.revoke(10L, 2L, "owner@test.com");

        verify(sharePermissionRepository).delete(permission);
    }

    @Test
    void revoke_nonOwner_throwsSecurityException() {
        User other = new User();
        other.setId(3L);
        other.setEmail("other@test.com");

        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));
        when(documentRepository.findById(10L)).thenReturn(Optional.of(document));

        assertThatThrownBy(() ->
                sharePermissionService.revoke(10L, 2L, "other@test.com"))
                .isInstanceOf(SecurityException.class);

        verify(sharePermissionRepository, never()).delete(any());
    }

    @Test
    void revoke_shareNotFound_throwsIllegalArgumentException() {
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(documentRepository.findById(10L)).thenReturn(Optional.of(document));
        when(sharePermissionRepository.findByDocumentAndSharedWith(document, recipient))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                sharePermissionService.revoke(10L, 2L, "owner@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Share not found");

        verify(sharePermissionRepository, never()).delete(any());
    }
}
