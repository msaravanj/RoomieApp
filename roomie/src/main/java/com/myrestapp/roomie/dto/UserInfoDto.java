package com.myrestapp.roomie.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoDto {

    private int id;

    private String name;

    private String lastName;

    private String email;

    private String gender;

    private int yob;

    private String city;

    private String description;

    private boolean hasAccomodation;

    private int lifestyleProfileId;
}
