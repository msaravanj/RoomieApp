package com.myrestapp.roomie.service;

import com.myrestapp.roomie.dto.HousingDto;
import com.myrestapp.roomie.dto.UserInfoDto;

import java.util.List;
import java.util.Optional;

public interface HousingService {


    List<HousingDto> findAll();

    HousingDto findById(int theId);

    HousingDto save(HousingDto theHousing);

    Optional<HousingDto> findByUserId(int userId);

    void deleteById(int theId);
}
