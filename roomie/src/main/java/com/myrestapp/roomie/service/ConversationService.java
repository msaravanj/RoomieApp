package com.myrestapp.roomie.service;

import com.myrestapp.roomie.dto.ConversationDto;

import java.util.List;
import java.util.Optional;

public interface ConversationService {

    List<ConversationDto> findAll();

    ConversationDto findById(int theId);

    ConversationDto save(ConversationDto theConversation);

    void deleteById(int theId);

    Optional<ConversationDto> findByUsersIds(int userId, int otherUserId);
}
