package com.myrestapp.roomie.repository;

import com.myrestapp.roomie.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Integer> {


        @Query("SELECT c FROM Conversation c " +
               "WHERE (c.user1.id = :userId AND c.user2.id = :otherUserId) " +
               "OR (c.user1.id = :otherUserId AND c.user2.id = :userId)")
        Optional<Conversation> findByUsersIds(@Param("userId") int userId, @Param("otherUserId") int otherUserId);
}

