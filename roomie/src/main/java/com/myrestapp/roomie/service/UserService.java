package com.myrestapp.roomie.service;

import com.myrestapp.roomie.dto.UserDto;
import com.myrestapp.roomie.dto.UserInfoDto;

import java.util.List;
import java.util.Optional;

public interface UserService {

    List<UserDto> findAll();

    UserDto findById(int theId);

    UserInfoDto findByEmail(String email);

    Optional<UserInfoDto> findByLifestyleProfileId(int lifestyleProfileId);

    void save(UserDto theUser);

    void deleteById(int theId);

    void updateLifestyleProfile(int userId, int profileId);
}
