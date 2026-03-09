package com.myrestapp.roomie.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDto {

    private String name;

    private String lastName;

    private String email;

    private String password;

    private int yob;

    private String city;

    private String gender;

    private boolean hasAccomodation;
}
