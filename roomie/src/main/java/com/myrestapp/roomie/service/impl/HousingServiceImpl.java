package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.Housing;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.HousingDto;
import com.myrestapp.roomie.mapper.HousingMapper;
import com.myrestapp.roomie.repository.HousingRepository;
import com.myrestapp.roomie.repository.UserRepository;
import com.myrestapp.roomie.service.HousingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HousingServiceImpl implements HousingService {

    private HousingRepository housingRepository;
    private UserRepository userRepository;

    @Autowired
    public HousingServiceImpl(HousingRepository theHousingRepository, UserRepository theUserRepository) {
        housingRepository = theHousingRepository;
        userRepository = theUserRepository;
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
        User user = userRepository.findById(theHousing.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Housing saved = housingRepository.save(HousingMapper.toEntity(theHousing, user));
        return HousingMapper.toDto(saved);
    }

    @Override
    public Optional<HousingDto> findByUserId(int userId) {
        return housingRepository.findByUser_Id(userId)
                .map(HousingMapper::toDto);
    }

    @Override
    public void deleteById(int theId) {
        housingRepository.deleteById(theId);
    }
}
