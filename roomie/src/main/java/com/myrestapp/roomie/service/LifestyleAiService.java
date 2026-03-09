package com.myrestapp.roomie.service;

import com.myrestapp.roomie.dto.LifestyleGenerateRequestDto;

public interface LifestyleAiService {

    String generateLifestyleProfile(LifestyleGenerateRequestDto request);
}
