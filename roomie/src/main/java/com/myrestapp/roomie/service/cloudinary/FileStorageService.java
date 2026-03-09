package com.myrestapp.roomie.service.cloudinary;

import com.cloudinary.Cloudinary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.util.Map;

@Service
public class FileStorageService {

    private final Cloudinary cloudinary;

    public FileStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadProfilePicture(MultipartFile file){
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        } else{
      try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of(
                            "folder", "roomie/images",
                            "overwrite", true
                    )
            );

            String imageUrl = uploadResult.get("secure_url").toString();


            return imageUrl;

        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed", e);
        }

}}}
