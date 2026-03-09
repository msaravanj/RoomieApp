package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.Conversation;
import com.myrestapp.roomie.domain.Message;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.MessageDto;
import com.myrestapp.roomie.mapper.MessageMapper;
import com.myrestapp.roomie.repository.ConversationRepository;
import com.myrestapp.roomie.repository.MessageRepository;
import com.myrestapp.roomie.repository.UserRepository;
import com.myrestapp.roomie.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    private MessageRepository messageRepository;
    private ConversationRepository conversationRepository;
    private UserRepository userRepository;

    @Autowired
    public MessageServiceImpl(MessageRepository theMessageRepository, UserRepository theUserRepository, ConversationRepository theConversationRepository) {
        userRepository = theUserRepository;
        messageRepository = theMessageRepository;
        conversationRepository = theConversationRepository;
    }

    @Override
    public List<MessageDto> findAllMessagesForUser(int theId) {
        return messageRepository.findAllMessagesForUser(theId).stream()
                .map(MessageMapper::toDto).toList();
    }

    @Override
    public List<MessageDto> findAllMessagesByConversationId(int conversationId) {
        return messageRepository.findAllMessagesByConversationId(conversationId).stream()
                .map(MessageMapper::toDto).toList();
    }

    @Override
    public MessageDto findById(int theId) {
        return messageRepository.findById(theId)
                .map(MessageMapper::toDto)
                .orElse(null);
    }

    @Override
    public Message save(MessageDto theMessage) {
        User sender = userRepository.findById(theMessage.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(theMessage.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Conversation conversation = conversationRepository.findById(theMessage.getConversationId())
                .orElse(new Conversation(0, sender, receiver, theMessage.getTimestamp(), theMessage.getContent()));
        conversation.setLastUpdated(theMessage.getTimestamp());
        conversation.setLastMessageContent(theMessage.getContent());
        conversationRepository.save(conversation);

        return messageRepository.save(MessageMapper.toEntity(theMessage, sender, receiver, conversation));
    }

    @Override
    public void deleteById(int theId) {
        messageRepository.deleteById(theId);
    }


    @Override
    public List<Integer> getConversationPartners(int userId) {
        return messageRepository.findConversationPartners(userId);
    }
}
