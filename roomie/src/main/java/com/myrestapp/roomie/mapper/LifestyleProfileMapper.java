package com.myrestapp.roomie.mapper;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.dto.LifestyleProfileDto;

public class LifestyleProfileMapper {

    public static LifestyleProfileDto toDto(LifestyleProfile lifestyleProfile) {
        if (lifestyleProfile == null) {
            return null;
        }
        LifestyleProfileDto dto = new LifestyleProfileDto();
        dto.setId(lifestyleProfile.getId());
        dto.setSmoker((lifestyleProfile.isSmoker()));
        dto.setHasPets(lifestyleProfile.isHasPets());
        dto.setCleanliness(lifestyleProfile.getCleanliness());
        dto.setWakeUpTime(lifestyleProfile.getWakeUpTime());
        dto.setBedTime(lifestyleProfile.getBedTime());
        dto.setSociality(lifestyleProfile.getSociality());
        dto.setHobbies(lifestyleProfile.getHobbies());
        dto.setHobbiesEmbeddingJson(lifestyleProfile.getHobbiesEmbeddingJson());
        dto.setNutrition(lifestyleProfile.getNutrition());
        dto.setNutritionEmbeddingJson(lifestyleProfile.getNutritionEmbeddingJson());
        dto.setWorkSchedule(lifestyleProfile.getWorkSchedule());
        return dto;
    }

    public static LifestyleProfile toEntity(LifestyleProfileDto dto) {
        if (dto == null) {
            return null;
        }
        LifestyleProfile lifestyleProfile = new LifestyleProfile();
        lifestyleProfile.setId(dto.getId());
        lifestyleProfile.setSmoker(dto.isSmoker());
        lifestyleProfile.setHasPets(dto.isHasPets());
        lifestyleProfile.setCleanliness(dto.getCleanliness());
        lifestyleProfile.setWakeUpTime(dto.getWakeUpTime());
        lifestyleProfile.setBedTime(dto.getBedTime());
        lifestyleProfile.setSociality(dto.getSociality());
        lifestyleProfile.setHobbies(dto.getHobbies());
        lifestyleProfile.setHobbiesEmbeddingJson(dto.getHobbiesEmbeddingJson());
        lifestyleProfile.setNutrition(dto.getNutrition());
        lifestyleProfile.setNutritionEmbeddingJson(dto.getNutritionEmbeddingJson());
        lifestyleProfile.setWorkSchedule(dto.getWorkSchedule());
        return lifestyleProfile;
    }
}
