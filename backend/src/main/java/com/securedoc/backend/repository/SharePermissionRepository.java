package com.securedoc.backend.repository;

import com.securedoc.backend.model.Document;
import com.securedoc.backend.model.SharePermission;
import com.securedoc.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SharePermissionRepository extends JpaRepository<SharePermission, Long> {

    List<SharePermission> findBySharedWith(User user);

    List<SharePermission> findByDocument(Document document);

    boolean existsByDocumentAndSharedWith(Document document, User user);
}
