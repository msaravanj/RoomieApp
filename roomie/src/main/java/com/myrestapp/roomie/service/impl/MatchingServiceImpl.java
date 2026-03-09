package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.dto.MatchResultDto;
import com.myrestapp.roomie.dto.UserInfoDto;
import com.myrestapp.roomie.repository.LifestyleProfileRepository;
import com.myrestapp.roomie.service.EmbeddingService;
import com.myrestapp.roomie.service.MatchingService;
import com.myrestapp.roomie.service.UserService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Comparator;
import java.util.List;

@Service
public class MatchingServiceImpl implements MatchingService {

    private final LifestyleProfileRepository lifestyleProfileRepository;
    private final EmbeddingService embeddingService;
    private final UserService userService;

    public MatchingServiceImpl(
            LifestyleProfileRepository lifestyleProfileRepository,
            EmbeddingService embeddingService,
            UserService userService
    ) {
        this.lifestyleProfileRepository = lifestyleProfileRepository;
        this.embeddingService = embeddingService;
        this.userService = userService;
    }

    @Override
    public List<MatchResultDto> findMatches(Integer lifestyleProfileId) {

        LifestyleProfile lifestyleProfile = lifestyleProfileRepository.findById(lifestyleProfileId)
                .orElseThrow();

        return lifestyleProfileRepository.findAllByIdNot(lifestyleProfileId).stream()
                .map(profile -> {

                   double score = calculateScore(lifestyleProfile, profile);
                   System.out.println("Calculated score: " + score + " for profile ID: " + profile.getId());

                    UserInfoDto user = userService.findByLifestyleProfileId(profile.getId())
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    return new MatchResultDto(user.getId(), score);
                })
                .filter(r -> r.getScore() > 0.6)
                .sorted(Comparator.comparingDouble(MatchResultDto::getScore).reversed())
                .limit(10)
                .toList();
    }


    private double cosineSimilarity(
            List<Double> v1,
            List<Double> v2
    ) {
        double dot = 0, norm1 = 0, norm2 = 0;

        for (int i = 0; i < v1.size(); i++) {
            dot += v1.get(i) * v2.get(i);
            norm1 += v1.get(i) * v1.get(i);
            norm2 += v2.get(i) * v2.get(i);
        }

        return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    private double calculateScore(LifestyleProfile userProfile, LifestyleProfile otherProfile) {

        double hobbiesScore= cosineSimilarity(
                embeddingService.fromJson(userProfile.getHobbiesEmbeddingJson()),
                embeddingService.fromJson(otherProfile.getHobbiesEmbeddingJson())
        );
        double smokerScore = userProfile.isSmoker() == otherProfile.isSmoker() ? 1.0 : 0.0;
        double petsScore = userProfile.isHasPets() == otherProfile.isHasPets() ? 1.0 : 0.5;

        long diff =
                Math.abs(
                        Duration.between(userProfile.getBedTime(), otherProfile.getBedTime()).toMinutes()
                );
        double bedTimeScore = Math.max(
                0,
                1 - (diff / 240.0)  // 4 sata = totalni mismatch
        );

        double cleanlinessScore = 1 - (Math.abs(userProfile.getCleanliness() - otherProfile.getCleanliness()) / 4.0);

        double socialityScore = 1 - (Math.abs(userProfile.getSociality() - otherProfile.getSociality()) / 4.0);

        double workScore = userProfile.getWorkSchedule().equalsIgnoreCase(otherProfile.getWorkSchedule()) ? 1.0 : 0.4;

        double nutritionScore = cosineSimilarity(embeddingService.fromJson(userProfile.getNutritionEmbeddingJson()),
                embeddingService.fromJson(otherProfile.getNutritionEmbeddingJson()));

        double totalScore =
                hobbiesScore     * 0.30
                        + smokerScore      * 0.20
                        + bedTimeScore     * 0.10
                        + nutritionScore   * 0.10
                        + cleanlinessScore * 0.10
                        + socialityScore   * 0.10
                        + petsScore        * 0.05
                        + workScore        * 0.05;

        return totalScore;
    }
}
