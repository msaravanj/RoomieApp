package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.domain.Message;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.MessageDto;
import com.myrestapp.roomie.dto.UserInfoDto;
import com.myrestapp.roomie.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class MessageController {

    private MessageService messageService;

    @Autowired
    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PreAuthorize("authentication.principal.id == #userId or hasRole('ADMIN')")
    @GetMapping("/messages/user/{userId}")
    public List<MessageDto> findAllMessagesForUser(@PathVariable int userId){
        return messageService.findAllMessagesForUser(userId);
    }

    @PreAuthorize("authentication.principal.id == messageService.findById(#messageId).senderId or authentication.principal.id == messageService.findById(#messageId).receiverId or hasRole('ADMIN')")
    @GetMapping("/messages/{messageId}")
    public MessageDto getMessageById(@PathVariable int messageId){
        MessageDto theMessage = messageService.findById(messageId);

        if (theMessage == null) {
            throw new RuntimeException("Message id not found - " + messageId);
        }

        return theMessage;
    }

    @PreAuthorize("authentication.principal.id == #theMessage.senderId or hasRole('ADMIN')")
    @PutMapping("/messages")
    public void updateMessage(@RequestBody MessageDto theMessage) {
        messageService.save(theMessage);
    }

    @PostMapping("/messages")
    public void addMessage(@RequestBody MessageDto theMessage) {

        theMessage.setId(0);
        messageService.save(theMessage);
    }

    @PreAuthorize("authentication.principal.id == messageService.findById(#messageId).senderId or hasRole('ADMIN')")
    @DeleteMapping("/messages/{messageId}")
    public void deleteMessage(@PathVariable int messageId) {
        MessageDto tempMessage = messageService.findById(messageId);

        if (tempMessage == null) {
            throw new RuntimeException("Message id not found - " + messageId);
        }

        messageService.deleteById(messageId);
    }

    @GetMapping("/conversations/partners")
    public List<Integer> getConversationPartners(Authentication auth) {
        int myId = ((User) auth.getPrincipal()).getId();
        System.out.println("Getting conversation partners for user " + myId);

        return messageService.getConversationPartners(myId);
    }

    @GetMapping("/messages/conversation/{conversationId}")
    public List<MessageDto> getMessagesByConversationId(@PathVariable int conversationId) {
        System.out.println("Getting messages for conversation " + conversationId);

        return messageService.findAllMessagesByConversationId(conversationId);
    }

}
