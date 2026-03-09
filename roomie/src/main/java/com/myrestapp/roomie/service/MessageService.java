package com.myrestapp.roomie.service;

import com.myrestapp.roomie.domain.Message;
import com.myrestapp.roomie.dto.MessageDto;

import java.util.List;

public interface MessageService {

    List<MessageDto> findAllMessagesForUser(int theId);

    List<MessageDto> findAllMessagesByConversationId(int conversationId);

    MessageDto findById(int theId);

    Message save(MessageDto theMessage);

    void deleteById(int theId);

    List<Integer> getConversationPartners(int userId);
}
