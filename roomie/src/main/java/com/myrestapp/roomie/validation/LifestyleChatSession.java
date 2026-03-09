package com.myrestapp.roomie.validation;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.enums.LifestyleQuestion;
import lombok.Data;

import java.io.Serializable;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LifestyleChatSession implements Serializable {

    private static final long serialVersionUID = 1L;

    private int step;
    private final LifestyleProfile profile;
    private int userId;


    public LifestyleChatSession() {
        this.step = 0;
        this.profile = new LifestyleProfile();

    }

    /**
     * Vraća trenutno pitanje
     */
    public LifestyleQuestion currentQuestion() {
        if (isFinished()) {
            throw new IllegalStateException("Lifestyle chat je završen.");
        }
        return LifestyleQuestion.values()[step];
    }

    /**
     * Pomak na sljedeće pitanje
     */
    public void next() {
        step++;
    }

    /**
     * Je li razgovor završen
     */
    public boolean isFinished() {
        return step >= LifestyleQuestion.values().length;
    }

    /**
     * Koliko je pitanja prošlo (korisno za progress bar)
     */
    public int getProgress() {
        return step + 1;
    }

    /**
     * Ukupan broj pitanja
     */
    public int getTotal() {
        return LifestyleQuestion.values().length;
    }

    public LifestyleProfile getProfile() {
        return profile;
    }
}
