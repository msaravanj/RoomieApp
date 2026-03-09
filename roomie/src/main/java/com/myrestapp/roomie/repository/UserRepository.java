package com.myrestapp.roomie.repository;

import com.myrestapp.roomie.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    @Override
    Optional<User> findById(Integer integer);

    Optional<User> findByLifestyleProfile_Id(int lifestyleProfileId);

    boolean existsByEmail(String email);

    @Modifying
    @Query("""
        UPDATE User u
        SET u.lifestyleProfile.id = :profileId
        WHERE u.id = :userId
    """)
    void updateLifestyleProfile(
            @Param("userId") int userId,
            @Param("profileId") int profileId
    );
}
