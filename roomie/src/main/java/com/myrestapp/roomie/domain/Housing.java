package com.myrestapp.roomie.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
@EqualsAndHashCode(exclude = "user")
public class Housing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "name")
    private String name;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "address")
    private String address;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "city")
    private String city;

    @Column(name = "price_per_month")
    private Double pricePerMonth;

    @Column(name = "number_of_rooms")
    private int numberOfRooms;

    @Column(name = "capacity")
    private int capacity;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "available_from")
    private LocalDate availableFrom;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "available_to")
    private LocalDate availableTo;

    @OneToOne(cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH},
            fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "size_m2")
    private int sizeM2;

    @Column(name = "is_pet_friendly")
    private boolean isPetFriendly;


}
