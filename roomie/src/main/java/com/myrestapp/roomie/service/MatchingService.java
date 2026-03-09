package com.myrestapp.roomie.service;

import com.myrestapp.roomie.dto.MatchResultDto;

import java.util.List;

public interface MatchingService {

    List<MatchResultDto> findMatches(Integer lifestyleProfileId);
}
