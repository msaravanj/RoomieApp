package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.Housing;
import com.myrestapp.roomie.dto.PhotoDto;
import com.myrestapp.roomie.mapper.PhotoMapper;
import com.myrestapp.roomie.repository.HousingRepository;
import com.myrestapp.roomie.repository.PhotoRepository;
import com.myrestapp.roomie.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PhotoServiceImpl implements PhotoService {

    private PhotoRepository photoRepository;
    private HousingRepository housingRepository;

    @Autowired
    public PhotoServiceImpl(PhotoRepository thePhotoRepository, HousingRepository theHousingRepository) {
        photoRepository = thePhotoRepository;
        housingRepository = theHousingRepository;
    }

    @Override
    public List<PhotoDto> findAll() {
        return photoRepository.findAll().stream().map(PhotoMapper::toDto).toList();
    }

    @Override
    public PhotoDto findById(int theId) {
        return photoRepository.findById(theId)
                .map(PhotoMapper::toDto)
                .orElse(null);
    }

    @Override
    public PhotoDto findByHousingId(int housingId) {
        return photoRepository.findByHousing_Id(housingId)
                .map(PhotoMapper::toDto)
                .orElse(null);
    }

    @Override
    public void save(PhotoDto thePhoto) {
        Housing housing = housingRepository.findById(thePhoto.getHousingId())
                .orElseThrow(() -> new RuntimeException("Housing not found"));
        photoRepository.save(PhotoMapper.toEntity(thePhoto, housing));
    }

    @Override
    public void deleteById(int theId) {
        photoRepository.deleteById(theId);
    }
}
