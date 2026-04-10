package com.myrestapp.roomie.mapper;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.UserDto;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public static UserDto toDto(User user){
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setLastName(user.getLastName());
        dto.setGender(user.getGender());
        dto.setYob(user.getYob());
        dto.setCity(user.getCity());
        dto.setDescription(user.getDescription());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setEmail(user.getEmail());
        dto.setHasAccomodation(user.isHasAccomodation());
        if (user.getLifestyleProfile() != null){
        dto.setLifestyleProfileId(user.getLifestyleProfile().getId());}
        return dto;
    }

    public static User toEntity(UserDto dto, LifestyleProfile lifestyleProfile){
        User user = new User();
        user.setId(dto.getId());
        user.setName(dto.getName());
        user.setLastName(dto.getLastName());
        user.setGender(dto.getGender());
        user.setYob(dto.getYob());
        user.setCity(dto.getCity());
        user.setDescription(dto.getDescription());
        user.setProfilePictureUrl(dto.getProfilePictureUrl());
        user.setEmail(dto.getEmail());
        user.setHasAccomodation(dto.isHasAccomodation());
        if (lifestyleProfile != null){
            user.setLifestyleProfile(lifestyleProfile);
        }
        return user;
    }
}
