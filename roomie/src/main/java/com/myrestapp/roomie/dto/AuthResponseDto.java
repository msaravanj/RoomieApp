package com.myrestapp.roomie.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class AuthResponseDto {

    private String token;
    private int userId;
    private String email;
    private int jwtExpirationInMs;
}
