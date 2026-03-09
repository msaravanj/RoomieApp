package com.myrestapp.roomie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LifestyleProfileDto {

    private int id;
    private boolean isSmoker;
    private boolean hasPets;
    private String hobbies;
    private String hobbiesEmbeddingJson;
    private LocalTime bedTime;
    private LocalTime wakeUpTime;
    private int cleanliness;   // 1–5
    private int sociality;     // 1–5
    private String workSchedule;
    private String nutrition;
    private String nutritionEmbeddingJson;
    private int userId;
}
