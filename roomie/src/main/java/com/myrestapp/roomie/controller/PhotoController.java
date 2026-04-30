package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.dto.PhotoDto;
import com.myrestapp.roomie.service.HousingService;
import com.myrestapp.roomie.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class PhotoController {

    private final PhotoService photoService;
    private final HousingService housingService;

    @Autowired
    public PhotoController(PhotoService thePhotoService, HousingService theHousingService) {
        photoService = thePhotoService;
        housingService = theHousingService;
    }

    @GetMapping("/photos")
    public List<PhotoDto> findAll(){
        return photoService.findAll();
    }

    @GetMapping("/photos/{photoId}")
    public PhotoDto getPhotoById(@PathVariable int photoId){
        PhotoDto thePhoto = photoService.findById(photoId);

        if (thePhoto == null) {
            throw new RuntimeException("Photo id not found - " + photoId);
        }

        return thePhoto;
    }

    @GetMapping("/photos/housing/{housingId}")
    public List<PhotoDto> getPhotosByHousingId(@PathVariable int housingId){
        List<PhotoDto> photos = photoService.findPhotosByHousingId(housingId);

        if (photos.isEmpty()) {
            throw new RuntimeException("No photos found for housing id - " + housingId);
        }

        return photos;
    }

    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == @housingServiceImpl.findById(#thePhoto.housingId).userId")
    @PutMapping("/photos")
    public void updatePhoto(@RequestBody PhotoDto thePhoto) {
        photoService.save(thePhoto);

    }

    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == @housingServiceImpl.findById(#thePhoto.housingId).userId")
    @PostMapping("/photos")
    public void addPhoto(@RequestBody PhotoDto thePhoto) {

        thePhoto.setId(0);
        photoService.save(thePhoto);
    }

    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == @housingServiceImpl.findById(@photoServiceImpl.findById(#photoId).housingId).userId")
    @DeleteMapping("/photos/{photoId}")
    public void deletePhoto(@PathVariable int photoId) {
        PhotoDto tempPhoto = photoService.findById(photoId);

        if (tempPhoto == null) {
            throw new RuntimeException("Photo id not found - " + photoId);
        }

        photoService.deleteById(photoId);
    }
}
