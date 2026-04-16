package com.securedoc.backend.repository;

import com.securedoc.backend.model.Document;
import com.securedoc.backend.model.SharePermission;
import com.securedoc.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SharePermissionRepository extends JpaRepository<SharePermission, Long> {

    // Used by "shared with me" — find all documents shared with the logged-in user
    List<SharePermission> findBySharedWith(User user);

    // Used to list all shares on a specific document (owner view)
    List<SharePermission> findByDocument(Document document);

    // Used to block duplicate shares
    boolean existsByDocumentAndSharedWith(Document document, User user);

    // Used by revoke — find the exact share record to delete
    Optional<SharePermission> findByDocumentAndSharedWith(Document document, User sharedWith);
}
