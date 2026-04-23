package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.enums.LifestyleQuestion;
import com.myrestapp.roomie.service.EmbeddingService;
import com.myrestapp.roomie.validation.LifestyleAnswerValidator;
import com.myrestapp.roomie.validation.LifestyleChatSession;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
public class LifestyleChatFlowService {

    private final LifestyleAnswerValidator validator;
    private final EmbeddingService embeddingService;
    private final ChatClient chatClient;


    public LifestyleChatFlowService(LifestyleAnswerValidator validator, EmbeddingService embeddingService, ChatClient chatClient) {
        this.validator = validator;
        this.embeddingService = embeddingService;
        this.chatClient = chatClient;
    }

    public String checkAnswerValidity(String answer, String question) {
        String prompt = "Pitanje: " + question + "\n" +
                "Odgovor korisnika: " + answer + "\n" +
                "Procijeni ima li ovaj odgovor smisla u kontekstu pitanja. Ne traži dodatne informacije, ne postavljaj pitanja, ne objašnjavaj. " +
                "Vrati JSON: {valid: true/false, reason: ...}";

        return chatClient.prompt(prompt).call().content();
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
        String result = checkAnswerValidity(answer, question.getQuestionText());
        if (result.contains("true")) {

            //  Spremanje u profile
            applyValue(session.getProfile(), question, value);

            //  Sljedeći korak
            session.next();
        } else {
            String r = result.split("\"")[5].trim();
            throw new IllegalArgumentException(result.contains("reason") ? r : "Neispravan odgovor.");
        }
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
