package com.myrestapp.roomie.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HousingDto {

    private int id;

    private String name;

    private String description;

    private String address;

    private Long latitude;

    private Long longitude;

    private String city;

    private Double pricePerMonth;

    private int numberOfRooms;

    private int capacity;

    private List<String> photoUrls;

    private LocalDate availableFrom;

    private LocalDate availableTo;

    private int userId;

    private int sizeM2;

    private boolean isPetFriendly;
}
