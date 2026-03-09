package com.myrestapp.roomie.mapper;

import com.myrestapp.roomie.domain.Conversation;
import com.myrestapp.roomie.domain.Message;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.MessageDto;

public class MessageMapper {

    public static MessageDto toDto(Message message) {
        if (message == null) {
            return null;
        }
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setRead(message.isRead());
        dto.setConversationId(message.getConversation().getId());
        return dto;
    }

    public static Message toEntity(MessageDto dto, User sender, User receiver, Conversation conversation) {
        if (dto == null) {
            return null;
        }
        Message message = new Message();
        message.setId(dto.getId());
        message.setContent(dto.getContent());
        message.setTimestamp(dto.getTimestamp());
        message.setRead(dto.isRead());
        message.setConversation(conversation);
        if (sender != null && receiver != null){
            message.setSender(sender);
            message.setReceiver(receiver);
        }
        return message;
    }
}
