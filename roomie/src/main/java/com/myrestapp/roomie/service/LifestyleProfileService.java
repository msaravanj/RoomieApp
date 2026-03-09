package com.myrestapp.roomie.service;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.dto.LifestyleProfileDto;
import com.myrestapp.roomie.dto.MessageDto;

import java.util.List;

public interface LifestyleProfileService {

    List<LifestyleProfileDto> findAll();

    LifestyleProfileDto findById(int theId);

    List<LifestyleProfileDto> findAllExceptId(int theId);

    LifestyleProfile save(LifestyleProfileDto theLifestyleProfile);

    void deleteById(int theId);
}
