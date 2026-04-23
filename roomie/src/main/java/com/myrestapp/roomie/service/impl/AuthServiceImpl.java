package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.AuthResponseDto;
import com.myrestapp.roomie.dto.LoginRequestDto;
import com.myrestapp.roomie.dto.RegisterRequestDto;
import com.myrestapp.roomie.jwt.JwtService;
import com.myrestapp.roomie.repository.UserRepository;
import com.myrestapp.roomie.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthServiceImpl implements AuthService {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;

    @Value("${jwt.expiration-ms}")
    private int jwtExpirationInMs;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;

    }

    @Override
    public AuthResponseDto login(LoginRequestDto request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
           throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponseDto.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .jwtExpirationInMs(jwtExpirationInMs)
                .role(user.getRole())
                .build();
    }

    @Override
    public void register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already in use"
            );
        }

        User user = User.builder()
                .name(request.getName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .city(request.getCity())
                .gender(request.getGender())
                .yob(request.getYob())
                .hasAccomodation(request.isHasAccomodation())
                .build();

        userRepository.save(user);
    }
}
