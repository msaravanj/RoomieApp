package com.myrestapp.roomie.service;

import com.myrestapp.roomie.dto.AuthResponseDto;
import com.myrestapp.roomie.dto.LoginRequestDto;
import com.myrestapp.roomie.dto.RegisterRequestDto;

public interface AuthService {

    AuthResponseDto login(LoginRequestDto loginRequestDto);

    void register(RegisterRequestDto registerRequestDto);

}
