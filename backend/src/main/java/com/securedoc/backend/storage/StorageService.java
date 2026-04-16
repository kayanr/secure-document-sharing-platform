package com.securedoc.backend.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    // Save a file to storage — returns the filename it was saved as
    String store(MultipartFile file);

    // Load a file by filename — returns it as a Resource for download
    Resource load(String filename);

    // Delete a file by filename
    void delete(String filename);
}
