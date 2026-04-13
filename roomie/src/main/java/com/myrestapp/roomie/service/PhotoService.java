package com.myrestapp.roomie.service;


import com.myrestapp.roomie.dto.PhotoDto;
import java.util.List;

public interface PhotoService {

    List<PhotoDto> findAll();

    PhotoDto findById(int theId);

    PhotoDto findByHousingId(int housingId);

    List<PhotoDto> findPhotosByHousingId(int housingId);

    void save(PhotoDto thePhoto);

    void deleteById(int theId);
}
