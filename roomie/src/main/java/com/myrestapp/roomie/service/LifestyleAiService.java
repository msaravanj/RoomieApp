package com.myrestapp.roomie.service;

import com.myrestapp.roomie.dto.LifestyleGenerateRequestDto;
import com.myrestapp.roomie.dto.LifestyleProfileDto;

public interface LifestyleAiService {

    String generateLifestyleProfile(LifestyleGenerateRequestDto request);

    String collateLifestyleProfiles(LifestyleProfileDto profile1, LifestyleProfileDto profile2);
}
