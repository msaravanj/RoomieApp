package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.dto.ConversationDto;
import com.myrestapp.roomie.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api")
public class ConversationController {

    private ConversationService conversationService;

    @Autowired
    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
     }

     @GetMapping("/conversations")
     List<ConversationDto> findAll() {
         return conversationService.findAll();
     }

     @GetMapping("/conversations/{conversationId}")
     ConversationDto findById(@PathVariable int conversationId) {
            return conversationService.findById(conversationId);
    }

    @GetMapping("/conversations/users/{userId}/{otherUserId}")
    ConversationDto findByUsersIds(@PathVariable("userId") int userId, @PathVariable("otherUserId") int otherUserId) {

        if (userId == otherUserId) {
            throw new RuntimeException("Cannot create conversation with oneself");
        }

        Optional<ConversationDto> conversation =
                conversationService.findByUsersIds(userId, otherUserId);

        if (conversation.isPresent()){
            return conversation.get();}

        return conversationService.save(new ConversationDto(0,userId,otherUserId, LocalDateTime.now(), ""));
    }

    @PostMapping("/conversations")
    ConversationDto save(@RequestBody ConversationDto theConversation) {
        theConversation.setId(0);
        return conversationService.save(theConversation);
    }

    @PutMapping("/conversations")
    ConversationDto update(@RequestBody ConversationDto theConversation) {
        return conversationService.save(theConversation);
    }

     @DeleteMapping("/conversations/{conversationId}")
     void deleteById(@PathVariable int conversationId) {
         conversationService.deleteById(conversationId);
     }

}
