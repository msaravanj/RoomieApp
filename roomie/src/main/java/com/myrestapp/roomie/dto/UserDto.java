package com.myrestapp.roomie.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private int id;

    private String name;

    private String lastName;

    private String password;

    private String gender;

    private int yob;

    private String city;

    private String description;

    private String profilePictureUrl;

    private String email;

    private boolean hasAccomodation;

    private String role;

    private int lifestyleProfileId;
}
