package com.myrestapp.roomie.validation;

import org.springframework.stereotype.Component;
import java.time.LocalTime;

@Component
public class LifestyleAnswerValidator {

    public Object validate(int step, String answer) {

        return switch (step) {
            case 1, 2 -> parseBoolean(answer);
            case 4, 5 -> parseTime(answer);
            case 6, 7 -> parseScale(answer);
            case 3, 8, 9 -> parseText(answer);
            default -> throw new IllegalStateException(step + " -> nije valjani korak. ");
        };
    }

    private boolean parseBoolean(String a) {
        if (a.equalsIgnoreCase("da")) return true;
        if (a.equalsIgnoreCase("ne")) return false;
        throw new IllegalArgumentException("Odgovor mora biti DA ili NE.");
    }

    private LocalTime parseTime(String a) {
        try { return LocalTime.parse(a); }
        catch (Exception e) {
            throw new IllegalArgumentException("Vrijeme mora biti u formatu HH:mm.");
        }
    }

    private int parseScale(String a) {
        int v = Integer.parseInt(a);
        if (v < 1 || v > 5)
            throw new IllegalArgumentException("Vrijednost mora biti 1–5.");
        return v;
    }

    private String parseText(String a) {
        if (a == null || a.length() < 2)
            throw new IllegalArgumentException("Odgovor je prekratak.");
        return a;
    }
}
