package com.myrestapp.roomie.repository;

import com.myrestapp.roomie.domain.Message;
import com.myrestapp.roomie.dto.MessageDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {

    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.timestamp DESC")
    List<Message> findAllMessagesForUser(@Param("userId") int userId);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.timestamp ASC")
    List<Message> findAllMessagesByConversationId(@Param("conversationId") int conversationId);


    @Query("""
    SELECT DISTINCT CASE
        WHEN m.sender.id = :userId THEN m.receiver.id
        ELSE m.sender.id
    END
    FROM Message m
    WHERE m.sender.id = :userId OR m.receiver.id = :userId  
""")
    List<Integer> findConversationPartners(@Param("userId") int userId);
}



