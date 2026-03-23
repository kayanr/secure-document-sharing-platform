package com.securedoc.backend.repository;

import com.securedoc.backend.model.Document;
import com.securedoc.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByOwner(User owner);
}
