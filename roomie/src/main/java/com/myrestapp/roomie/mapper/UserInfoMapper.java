package com.myrestapp.roomie.mapper;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.UserInfoDto;
import org.springframework.stereotype.Component;

@Component
public class UserInfoMapper {

    public static UserInfoDto toDto(User user){
        UserInfoDto dto = new UserInfoDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setLastName(user.getLastName());
        dto.setGender(user.getGender());
        dto.setYob(user.getYob());
        dto.setCity(user.getCity());
        dto.setDescription(user.getDescription());
        dto.setHasAccomodation(user.isHasAccomodation());
        if (user.getLifestyleProfile() != null){
            dto.setLifestyleProfileId(user.getLifestyleProfile().getId());}
        return dto;
    }

    public static User toEntity(UserInfoDto dto, LifestyleProfile lifestyleProfile){
        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setLastName(dto.getLastName());
        user.setGender(dto.getGender());
        user.setYob(dto.getYob());
        user.setCity(dto.getCity());
        user.setDescription(dto.getDescription());
        user.setHasAccomodation(dto.isHasAccomodation());
        if (lifestyleProfile != null){
            user.setLifestyleProfile(lifestyleProfile);
        }
        return user;
    }
}
