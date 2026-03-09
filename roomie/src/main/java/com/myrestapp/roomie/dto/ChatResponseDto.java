package com.myrestapp.roomie.dto;

import com.myrestapp.roomie.domain.LifestyleProfile;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponseDto {

    private String sessionId;
    private int userId;
    private String question;
    private int step;
    private int total;
    private boolean finished;
    private LifestyleProfile lifestyleProfile;

    // optional – samo ako je odgovor neispravan
    private String error;
}
