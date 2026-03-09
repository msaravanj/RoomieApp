package com.myrestapp.roomie.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDto {

    private int id;
    private int senderId;
    private int receiverId;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;
    private int conversationId;
}
