package com.myrestapp.roomie.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationDto {

    private int id;
    private int user1_Id;
    private int user2_Id;
    private LocalDateTime lastUpdated;
    private String lastMessageContent;
}
