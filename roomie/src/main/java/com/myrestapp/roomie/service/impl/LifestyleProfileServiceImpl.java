package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.dto.LifestyleProfileDto;
import com.myrestapp.roomie.mapper.LifestyleProfileMapper;
import com.myrestapp.roomie.repository.LifestyleProfileRepository;
import com.myrestapp.roomie.service.LifestyleProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LifestyleProfileServiceImpl implements LifestyleProfileService {

    private LifestyleProfileRepository lifestyleProfileRepository;

    @Autowired
    public LifestyleProfileServiceImpl(LifestyleProfileRepository theLifestyleProfileRepository) {
        lifestyleProfileRepository = theLifestyleProfileRepository;
    }

    @Override
    public List<LifestyleProfileDto> findAll() {
        return lifestyleProfileRepository.findAll().stream().map(LifestyleProfileMapper::toDto).toList();
    }

    @Override
    public LifestyleProfileDto findById(int theId) {
        return lifestyleProfileRepository.findById(theId)
                .map(LifestyleProfileMapper::toDto)
                .orElse(null);
    }

    @Override
    public List<LifestyleProfileDto> findAllExceptId(int theId) {
        return lifestyleProfileRepository.findAllByIdNot(theId).stream()
                .map(LifestyleProfileMapper::toDto)
                .toList();
    }

    @Override
    public LifestyleProfile save(LifestyleProfileDto theLifestyleProfile) {
        LifestyleProfile lifestyleProfile = lifestyleProfileRepository.save(LifestyleProfileMapper.toEntity(theLifestyleProfile));
        return lifestyleProfile;
    }

    @Override
    public void deleteById(int theId) {
        lifestyleProfileRepository.deleteById(theId);
    }
}
