package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.enums.LifestyleQuestion;
import com.myrestapp.roomie.service.EmbeddingService;
import com.myrestapp.roomie.validation.LifestyleAnswerValidator;
import com.myrestapp.roomie.validation.LifestyleChatSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
public class LifestyleChatFlowService {

    private final LifestyleAnswerValidator validator;
    private final EmbeddingService embeddingService;


    public LifestyleChatFlowService(LifestyleAnswerValidator validator, EmbeddingService embeddingService) {
        this.validator = validator;
        this.embeddingService = embeddingService;
    }

    /**
     * Obradi odgovor korisnika za trenutno pitanje.
     * Ako je odgovor neispravan → baca IllegalArgumentException
     */
    public void processAnswer(LifestyleChatSession session, String answer) {

        if (session.isFinished()) {
            throw new IllegalStateException("Lifestyle chat je već završen.");
        }

        LifestyleQuestion question = session.currentQuestion();

        //  Validacija odgovora
        Object value = validator.validate(session.getProgress(), answer);

        //  Spremanje u profile
        applyValue(session.getProfile(), question, value);

        //  Sljedeći korak
        session.next();
    }

    /**
     * Centralizirano mapiranje pitanja → LifestyleProfile polje
     */
    private void applyValue(
            LifestyleProfile profile,
            LifestyleQuestion question,
            Object value
    ) {
        switch (question) {
            case IS_SMOKER: profile.setSmoker((Boolean) value); break;
            case HAS_PETS: profile.setHasPets((Boolean) value); break;
            case HOBBIES: profile.setHobbies((String) value);
                            profile.setHobbiesEmbeddingJson(embeddingService.toJson(embeddingService.createEmbedding((String) value)));
                            break;
            case BED_TIME: profile.setBedTime((LocalTime) value); break;
            case WAKE_UP_TIME: profile.setWakeUpTime((LocalTime) value); break;
            case CLEANLINESS: profile.setCleanliness((Integer) value); break;
            case SOCIALITY: profile.setSociality((Integer) value); break;
            case WORK_SCHEDULE: profile.setWorkSchedule((String) value); break;
            case NUTRITION: profile.setNutrition((String) value);
                            profile.setNutritionEmbeddingJson(embeddingService.toJson(embeddingService.createEmbedding((String) value)));
                            break;

        }
    }
}
