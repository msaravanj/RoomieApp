package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.domain.Message;
import com.myrestapp.roomie.dto.MessageDto;
import com.myrestapp.roomie.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate,
                                   MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(MessageDto messageDto) {

        // spremi u bazu
        Message saved = messageService.save(messageDto);
        System.out.println("Saved message with ID: " + saved.getId());

        MessageDto savedDto = new MessageDto(
                saved.getId(),
                saved.getSender().getId(),
                saved.getReceiver().getId(),
                saved.getContent(),
                saved.getTimestamp(),
                saved.isRead(),
                saved.getConversation().getId()
        );

        // pošalji receiveru (privatni kanal)
        messagingTemplate.convertAndSendToUser(
                String.valueOf(saved.getReceiver().getEmail()),
                "/queue/messages",
                savedDto
        );
    }
}
