package com.myrestapp.roomie.repository;

import com.myrestapp.roomie.domain.LifestyleProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LifestyleProfileRepository extends JpaRepository<LifestyleProfile, Integer> {

    List<LifestyleProfile> findAllByIdNot(Integer lifestyleProfileId);
}
