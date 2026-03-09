package com.myrestapp.roomie.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LifestyleProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "is_smoker")
    private boolean isSmoker;

    @Column(name = "has_pets")
    private boolean hasPets;

    @Column(name = "hobbies", length = 2000)
    private String hobbies;

    @Column(name = "hobbies_embedding_json", columnDefinition = "LONGTEXT")
    private String hobbiesEmbeddingJson;

    @Column(name = "bed_time")
    private LocalTime bedTime;

    @Column(name = "wake_up_time")
    private LocalTime wakeUpTime;

    @Column(name = "cleanliness")
    private int cleanliness;  // 1–5

    @Column(name = "sociality")
    private int sociality;   // 1–5

    @Column(name = "work_schedule")
    private String workSchedule;

    @Column(name = "nutrition", length = 2000)
    private String nutrition;

    @Column(name = "nutrition_embedding_json", columnDefinition = "LONGTEXT")
    private String nutritionEmbeddingJson;

    @OneToOne(mappedBy = "lifestyleProfile",
              cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH},
              fetch = FetchType.LAZY)
    private User user;
}
