package com.securedoc.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securedoc.backend.model.Document;
import com.securedoc.backend.model.Role;
import com.securedoc.backend.model.User;
import com.securedoc.backend.repository.DocumentRepository;
import com.securedoc.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ShareControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private DocumentRepository documentRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private String ownerToken;
    private String recipientToken;
    private String otherToken;
    private Long documentId;
    private Long recipientId;

    @BeforeEach
    void setUp() throws Exception {
        ownerToken = registerAndLogin("owner@test.com", "password123");
        recipientToken = registerAndLogin("recipient@test.com", "password123");
        otherToken = registerAndLogin("other@test.com", "password123");

        User owner = userRepository.findByEmail("owner@test.com").orElseThrow();
        recipientId = userRepository.findByEmail("recipient@test.com").orElseThrow().getId();

        Document doc = new Document();
        doc.setFileName("test.pdf");
        doc.setFilePath("/uploads/test.pdf");
        doc.setFileSize(1024L);
        doc.setContentType("application/pdf");
        doc.setOwner(owner);
        doc.setUploadedAt(LocalDateTime.now());
        documentId = documentRepository.save(doc).getId();
    }

    // --- POST /{id}/share ---

    @Test
    void share_validRecipient_returns201() throws Exception {
        mockMvc.perform(post("/api/documents/{id}/share", documentId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("recipientEmail", "recipient@test.com"))))
                .andExpect(status().isCreated());
    }

    @Test
    void share_withSelf_returns400() throws Exception {
        mockMvc.perform(post("/api/documents/{id}/share", documentId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("recipientEmail", "owner@test.com"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void share_duplicate_returns400() throws Exception {
        // First share
        mockMvc.perform(post("/api/documents/{id}/share", documentId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("recipientEmail", "recipient@test.com"))))
                .andExpect(status().isCreated());

        // Duplicate share
        mockMvc.perform(post("/api/documents/{id}/share", documentId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("recipientEmail", "recipient@test.com"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void share_nonOwner_returns403() throws Exception {
        mockMvc.perform(post("/api/documents/{id}/share", documentId)
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("recipientEmail", "recipient@test.com"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void share_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/documents/{id}/share", documentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("recipientEmail", "recipient@test.com"))))
                .andExpect(status().isUnauthorized());
    }

    // --- GET /shared-with-me ---

    @Test
    void sharedWithMe_authenticated_returns200() throws Exception {
        // Share first so there's something to return
        mockMvc.perform(post("/api/documents/{id}/share", documentId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("recipientEmail", "recipient@test.com"))));

        mockMvc.perform(get("/api/documents/shared-with-me")
                .header("Authorization", "Bearer " + recipientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void sharedWithMe_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/documents/shared-with-me"))
                .andExpect(status().isUnauthorized());
    }

    // --- GET /{id}/shares ---

    @Test
    void listShares_owner_returns200() throws Exception {
        mockMvc.perform(post("/api/documents/{id}/share", documentId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("recipientEmail", "recipient@test.com"))));

        mockMvc.perform(get("/api/documents/{id}/shares", documentId)
                .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].email").value("recipient@test.com"))
                .andExpect(jsonPath("$[0].userId").exists());
    }

    @Test
    void listShares_nonOwner_returns403() throws Exception {
        mockMvc.perform(get("/api/documents/{id}/shares", documentId)
                .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    // --- DELETE /{id}/share/{recipientId} ---

    @Test
    void revoke_owner_returns204() throws Exception {
        // Share first
        mockMvc.perform(post("/api/documents/{id}/share", documentId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("recipientEmail", "recipient@test.com"))));

        mockMvc.perform(delete("/api/documents/{id}/share/{recipientId}", documentId, recipientId)
                .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void revoke_nonOwner_returns403() throws Exception {
        mockMvc.perform(delete("/api/documents/{id}/share/{recipientId}", documentId, recipientId)
                .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    // --- Helper ---

    private String registerAndLogin(String email, String password) throws Exception {
        // Register
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Test User",
                        "email", email,
                        "password", password))));

        // Login and extract token
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", email,
                        "password", password))))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("token").asText();
    }
}
