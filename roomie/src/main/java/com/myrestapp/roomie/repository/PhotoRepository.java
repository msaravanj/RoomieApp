package com.myrestapp.roomie.repository;

import com.myrestapp.roomie.domain.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Integer> {

    Optional<Photo> findByHousing_Id(int housingId);

    List<Photo> findPhotosByHousing_Id(int housingId);

    void deleteAllByHousing_Id(int housingId);
}
