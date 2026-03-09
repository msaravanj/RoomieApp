package com.myrestapp.roomie.dto;

import lombok.Data;

@Data
public class ChatRequestDto {

    private String sessionId;
    private String answer;   // odgovor korisnika (može biti null za prvi korak)
}
