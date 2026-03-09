package com.myrestapp.roomie.mapper;

import com.myrestapp.roomie.domain.Conversation;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.ConversationDto;

public class ConversationMapper {

    public static ConversationDto toDto(Conversation conversation){
        if (conversation == null){
            return null;
        }
        ConversationDto dto = new ConversationDto();
        dto.setId(conversation.getId());
        dto.setUser1_Id(conversation.getUser1().getId());
        dto.setUser2_Id(conversation.getUser2().getId());
        dto.setLastUpdated(conversation.getLastUpdated());
        dto.setLastMessageContent(conversation.getLastMessageContent());
        return dto;
    }

    public static Conversation toEntity(ConversationDto dto, User user1, User user2){
        if (dto == null){
            return null;
        }
        Conversation conversation = new Conversation();
        conversation.setId(dto.getId());
        conversation.setUser1(user1);
        conversation.setUser2(user2);
        conversation.setLastUpdated(dto.getLastUpdated());
        conversation.setLastMessageContent(dto.getLastMessageContent());
        return conversation;
    }

}
