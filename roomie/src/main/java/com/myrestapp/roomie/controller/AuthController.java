package com.myrestapp.roomie.controller;


import com.myrestapp.roomie.dto.AuthResponseDto;
import com.myrestapp.roomie.dto.LoginRequestDto;
import com.myrestapp.roomie.dto.RegisterRequestDto;
import com.myrestapp.roomie.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @RequestBody LoginRequestDto request) {

        AuthResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequestDto request) {

        try {
            authService.register(request);
            return ResponseEntity.ok("User registered successfully");
        } catch (ResponseStatusException e) {
            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(e.getReason());
        }
    }

}
