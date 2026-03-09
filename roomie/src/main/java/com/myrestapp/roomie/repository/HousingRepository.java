package com.myrestapp.roomie.repository;

import com.myrestapp.roomie.domain.Housing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HousingRepository extends JpaRepository<Housing, Integer> {

    Optional<Housing> findByUser_Id(int userId);
}
