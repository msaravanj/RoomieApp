package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.ConversationDto;
import com.myrestapp.roomie.mapper.ConversationMapper;
import com.myrestapp.roomie.repository.ConversationRepository;
import com.myrestapp.roomie.repository.UserRepository;
import com.myrestapp.roomie.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConversationServiceImpl implements ConversationService {

    private ConversationRepository conversationRepository;
    private UserRepository userRepository;

    @Autowired
    public ConversationServiceImpl(ConversationRepository conversationRepository, UserRepository userRepository){
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<ConversationDto> findAll() {
        return conversationRepository.findAll().stream().map(ConversationMapper::toDto).toList();
    }

    @Override
    public ConversationDto findById(int theId) {
        return conversationRepository.findById(theId)
                .map(ConversationMapper::toDto)
                .orElse(null);
    }

    @Override
    public ConversationDto save(ConversationDto theConversation) {
        User user1 = userRepository.findById(theConversation.getUser1_Id())
                .orElseThrow(() -> new RuntimeException("User 1 not found"));
        User user2 = userRepository.findById(theConversation.getUser2_Id())
                .orElseThrow(() -> new RuntimeException("User 2 not found"));
        return ConversationMapper.toDto(conversationRepository.save(ConversationMapper.toEntity(theConversation, user1, user2)));
    }

    @Override
    public void deleteById(int theId) {
        conversationRepository.deleteById(theId);
    }

    @Override
    public Optional<ConversationDto> findByUsersIds(int userId, int otherUserId) {
        return conversationRepository.findByUsersIds(userId, otherUserId)
                .map(ConversationMapper::toDto);

    }
}
