package com.myrestapp.roomie.service.impl;

import com.myrestapp.roomie.dto.LifestyleGenerateRequestDto;
import com.myrestapp.roomie.service.LifestyleAiService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class LifestyleAiServiceImpl implements LifestyleAiService {

    private final ChatClient chatClient;

    public LifestyleAiServiceImpl(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public String generateLifestyleProfile(LifestyleGenerateRequestDto request) {
        if (request.getAnswers() == null || request.getAnswers().size() != 9) {
            throw new IllegalArgumentException("Mora biti točno 9 odgovora");
        }

        String prompt = """
                Na temelju sljedećih odgovora korisnika GENERIRAJ ISKLJUČIVO JSON
                koji odgovara LifestyleProfile klasi.

                PRAVILA:
                - Ne dodaj objašnjenja
                - Ne koristi markdown
                - Ne dodaj dodatni tekst
                - Odgovaraj ISKLJUČIVO JSON-om
                - Vrijeme mora biti u formatu HH:mm
                - cleanliness i sociality moraju biti u rasponu 1–5
                - Boolean vrijednosti moraju biti true/false

                ODGOVORI (redoslijedom pitanja 1–9):
                1. %s
                2. %s
                3. %s
                4. %s
                5. %s
                6. %s
                7. %s
                8. %s
                9. %s

                FORMAT (MORA BITI TOČAN):

                {
                  "isSmoker": true/false,
                  "hasPets": true/false,
                  "hobbies": "string",
                  "bedTime": "HH:mm",
                  "wakeUpTime": "HH:mm",
                  "cleanliness": 1-5,
                  "sociality": 1-5,
                  "workSchedule": "string",
                  "nutrition": "string"
                }
                """.formatted(
                request.getAnswers().get(0),
                request.getAnswers().get(1),
                request.getAnswers().get(2),
                request.getAnswers().get(3),
                request.getAnswers().get(4),
                request.getAnswers().get(5),
                request.getAnswers().get(6),
                request.getAnswers().get(7),
                request.getAnswers().get(8)
        );

        return chatClient.prompt(prompt).call().content();

    }
}
