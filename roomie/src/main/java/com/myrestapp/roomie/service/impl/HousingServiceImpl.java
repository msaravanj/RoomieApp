package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.Housing;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.HousingDto;
import com.myrestapp.roomie.mapper.HousingMapper;
import com.myrestapp.roomie.repository.HousingRepository;
import com.myrestapp.roomie.repository.PhotoRepository;
import com.myrestapp.roomie.repository.UserRepository;
import com.myrestapp.roomie.service.HousingService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HousingServiceImpl implements HousingService {

    private final PhotoRepository photoRepository;
    private HousingRepository housingRepository;
    private UserRepository userRepository;

    @Autowired
    public HousingServiceImpl(HousingRepository theHousingRepository, UserRepository theUserRepository, PhotoRepository photoRepository) {
        housingRepository = theHousingRepository;
        userRepository = theUserRepository;
        this.photoRepository = photoRepository;
    }

    @Override
    public List<HousingDto> findAll() {
        return housingRepository.findAll().stream().map(HousingMapper::toDto).toList();
    }

    @Override
    public HousingDto findById(int theId) {
        return housingRepository.findById(theId)
                .map(HousingMapper::toDto)
                .orElse(null);
    }

    @Override
    public HousingDto save(HousingDto theHousing) {
        if (theHousing.getId() == 0) {
            // CREATE
            User user = userRepository.findById(theHousing.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Housing saved = housingRepository.save(HousingMapper.toEntity(theHousing, user));
            return HousingMapper.toDto(saved);
        } else {
            // UPDATE
            Housing existingHousing = housingRepository.findById(theHousing.getId())
                    .orElseThrow(() -> new RuntimeException("Housing not found"));

            existingHousing.setName(theHousing.getName());
            existingHousing.setDescription(theHousing.getDescription());
            existingHousing.setAddress(theHousing.getAddress());
            existingHousing.setLatitude(theHousing.getLatitude());
            existingHousing.setLongitude(theHousing.getLongitude());
            existingHousing.setCity(theHousing.getCity());
            existingHousing.setPricePerMonth(theHousing.getPricePerMonth());
            existingHousing.setNumberOfRooms(theHousing.getNumberOfRooms());
            existingHousing.setCapacity(theHousing.getCapacity());
            existingHousing.setAvailableFrom(theHousing.getAvailableFrom());
            existingHousing.setAvailableTo(theHousing.getAvailableTo());
            existingHousing.setSizeM2(theHousing.getSizeM2());
            existingHousing.setPetFriendly(theHousing.isPetFriendly());

            Housing saved = housingRepository.save(existingHousing);
            return HousingMapper.toDto(saved);
        }
    }

    @Override
    public Optional<HousingDto> findByUserId(int userId) {
        return housingRepository.findByUser_Id(userId)
                .map(HousingMapper::toDto);
    }

    @Override
    @Transactional
    public void deleteById(int theId) {
        photoRepository.deleteAllByHousing_Id(theId);
        housingRepository.deleteById(theId);
    }
}
