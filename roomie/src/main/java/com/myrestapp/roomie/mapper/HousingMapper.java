package com.myrestapp.roomie.mapper;

import com.myrestapp.roomie.domain.Housing;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.HousingDto;

public class HousingMapper {


    public static HousingDto toDto(Housing housing) {
        if (housing == null) {
            return null;
        }
        HousingDto dto = new HousingDto();
        dto.setId(housing.getId());
        dto.setName(housing.getName());
        dto.setCity(housing.getCity());
        dto.setAvailableFrom(housing.getAvailableFrom());
        dto.setAvailableTo(housing.getAvailableTo());
        dto.setLatitude(housing.getLatitude());
        dto.setLongitude(housing.getLongitude());
        dto.setDescription(housing.getDescription());
        dto.setAddress(housing.getAddress());
        dto.setPricePerMonth(housing.getPricePerMonth());
        dto.setUserId(housing.getUser().getId());
        dto.setPetFriendly(housing.isPetFriendly());
        dto.setNumberOfRooms(housing.getNumberOfRooms());
        dto.setSizeM2(housing.getSizeM2());
        dto.setCapacity(housing.getCapacity());
        return dto;
    }

    public static Housing toEntity(HousingDto dto, User user) {
        if (dto == null) {
            return null;
        }
        Housing housing = new Housing();
        housing.setId(dto.getId());
        housing.setName(dto.getName());
        housing.setDescription(dto.getDescription());
        housing.setAddress(dto.getAddress());
        housing.setPricePerMonth(dto.getPricePerMonth());
        housing.setUser(user);
        housing.setCity(dto.getCity());
        housing.setAvailableFrom(dto.getAvailableFrom());
        housing.setAvailableTo(dto.getAvailableTo());
        housing.setLatitude(dto.getLatitude());
        housing.setLongitude(dto.getLongitude());
        housing.setPetFriendly(dto.isPetFriendly());
        housing.setNumberOfRooms(dto.getNumberOfRooms());
        housing.setSizeM2(dto.getSizeM2());
        housing.setCapacity(dto.getCapacity());
        return housing;
    }
}
