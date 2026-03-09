package com.myrestapp.roomie.mapper;

import com.myrestapp.roomie.domain.Housing;
import com.myrestapp.roomie.domain.Photo;
import com.myrestapp.roomie.dto.PhotoDto;

public class PhotoMapper {

    public static PhotoDto toDto(Photo photo) {
        if (photo == null) {
            return null;
        }
        PhotoDto dto = new PhotoDto();
        dto.setId(photo.getId());
        dto.setUrl(photo.getUrl());
        dto.setHousingId(photo.getHousing().getId());
        return dto;
    }

    public static Photo toEntity(PhotoDto dto, Housing housing) {
        if (dto == null) {
            return null;
        }
        Photo photo = new Photo();
        photo.setId(dto.getId());
        photo.setUrl(dto.getUrl());
        if (housing != null){
            photo.setHousing(housing);
        }

        return photo;
    }
}
