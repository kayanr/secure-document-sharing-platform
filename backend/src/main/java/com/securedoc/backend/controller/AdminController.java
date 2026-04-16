package com.securedoc.backend.controller;

import com.securedoc.backend.dto.DocumentDTO;
import com.securedoc.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentDTO>> listAllDocuments() {
        return ResponseEntity.ok(adminService.listAllDocuments());
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        adminService.deleteAnyDocument(id);
        return ResponseEntity.noContent().build();
    }
}
