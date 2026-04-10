package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.UserDto;
import com.myrestapp.roomie.dto.UserInfoDto;
import com.myrestapp.roomie.mapper.UserInfoMapper;
import com.myrestapp.roomie.mapper.UserMapper;
import com.myrestapp.roomie.repository.LifestyleProfileRepository;
import com.myrestapp.roomie.repository.UserRepository;
import com.myrestapp.roomie.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private UserRepository userRepository;
    private LifestyleProfileRepository lifestyleProfileRepository;

    @Autowired
    public UserServiceImpl(UserRepository theUserRepository, LifestyleProfileRepository theLifestyleProfileRepository) {
        userRepository = theUserRepository;
        lifestyleProfileRepository = theLifestyleProfileRepository;
    }

    @Override
    public List<UserDto> findAll() {
        return userRepository.findAll().stream().map(UserMapper::toDto).toList();
    }

    @Override
    public UserDto findById(int theId) {
        User user = userRepository.findById(theId).orElse(null);
        return UserMapper.toDto(user);
    }

    @Override
    public UserInfoDto findByEmail(String email) {
        return UserInfoMapper.toDto(userRepository.findByEmail(email).orElse(null));
    }

    @Override
    public Optional<UserInfoDto> findByLifestyleProfileId(int lifestyleProfileId) {
        return userRepository.findByLifestyleProfile_Id(lifestyleProfileId).map(UserInfoMapper::toDto);
    }

    @Override
    public void save(UserDto theUser) {

        LifestyleProfile lifestyleProfile = lifestyleProfileRepository.findById(theUser.getLifestyleProfileId())
                .orElseThrow(() -> new RuntimeException("LifestyleProfile not found"));

        if (theUser.getId() == 0) {
            // CREATE
            User newUser = UserMapper.toEntity(theUser, lifestyleProfile);
            userRepository.save(newUser);
        } else {
            // UPDATE
            User existingUser = userRepository.findById(theUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            existingUser.setName(theUser.getName());
            existingUser.setLastName(theUser.getLastName());
            existingUser.setGender(theUser.getGender());
            existingUser.setYob(theUser.getYob());
            existingUser.setCity(theUser.getCity());
            existingUser.setDescription(theUser.getDescription());
            existingUser.setProfilePictureUrl(theUser.getProfilePictureUrl());
            existingUser.setHasAccomodation(theUser.isHasAccomodation());

            existingUser.setLifestyleProfile(lifestyleProfile);

            userRepository.save(existingUser);
        }
    }

    @Override
    public void deleteById(int theId) {
        userRepository.deleteById(theId);
    }

    @Override
    public void updateLifestyleProfile(int userId, int profileId) {
        userRepository.updateLifestyleProfile(userId, profileId);
    }
}
