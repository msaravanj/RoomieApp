package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.service.cloudinary.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/photos")
@RestController
public class CloudinaryController {

    private final FileStorageService fileStorageService;

    @Autowired
    public CloudinaryController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(value="/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
                fileStorageService.uploadProfilePicture(file)
        );
    }
}
