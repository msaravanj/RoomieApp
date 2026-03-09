package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.domain.User;
import com.myrestapp.roomie.dto.ChatRequestDto;
import com.myrestapp.roomie.dto.ChatResponseDto;
import com.myrestapp.roomie.dto.LifestyleProfileDto;
import com.myrestapp.roomie.service.LifestyleProfileService;
import com.myrestapp.roomie.service.UserService;
import com.myrestapp.roomie.service.impl.LifestyleChatFlowService;
import com.myrestapp.roomie.store.ChatSessionStore;
import com.myrestapp.roomie.validation.LifestyleChatSession;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatSessionStore sessionStore;
    private final LifestyleChatFlowService chatFlowService;
    private final LifestyleProfileService lifestyleProfileService;
    private final UserService userService;

    public ChatController(ChatSessionStore sessionStore,
                          LifestyleChatFlowService chatFlowService,
                          LifestyleProfileService lifestyleProfileService,
                          UserService userService) {
        this.sessionStore = sessionStore;
        this.chatFlowService = chatFlowService;
        this.lifestyleProfileService = lifestyleProfileService;
        this.userService = userService;
    }

    /**
     * START CHAT
     * Kreira novi chat session i vraća prvo pitanje
     */

    @PostMapping("/start")
    public ChatResponseDto startChat() {

        String sessionId = sessionStore.createSession();
        LifestyleChatSession session = sessionStore.getSession(sessionId);

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();
        session.setUserId(user.getId());

        sessionStore.saveSession(sessionId, session);

        return ChatResponseDto.builder()
                .sessionId(sessionId)
                .question(session.currentQuestion().getQuestionText())
                .step(1)
                .total(session.getTotal())
                .lifestyleProfile(session.getProfile())
                .userId(session.getUserId())
                .finished(false)
                .build();
    }

    /**
     * ANSWER QUESTION
     * Validira odgovor, sprema ga i vraća sljedeće pitanje
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/answer")
    public ChatResponseDto answer(@RequestBody ChatRequestDto request) {

        LifestyleChatSession session =
                sessionStore.getSession(request.getSessionId());

        try {
            chatFlowService.processAnswer(session, request.getAnswer());

        } catch (IllegalArgumentException ex) {
            // Neispravan odgovor -> frontend ostaje na istom pitanju
            return ChatResponseDto.builder()
                    .sessionId(request.getSessionId())
                    .question(session.currentQuestion().getQuestionText())
                    .step(session.getProgress())
                    .total(session.getTotal())
                    .userId(session.getUserId())
                    .finished(false)
                    .lifestyleProfile(session.getProfile())
                    .error(ex.getMessage())
                    .build();
        }

        // Chat završen
        if (session.isFinished()) {
            sessionStore.removeSession(request.getSessionId());
            LifestyleProfileDto profile = LifestyleProfileDto.builder()
                    .userId(session.getUserId())
                    .id(session.getProfile().getId())
                    .bedTime(session.getProfile().getBedTime())
                    .wakeUpTime(session.getProfile().getWakeUpTime())
                    .cleanliness(session.getProfile().getCleanliness())
                    .isSmoker(session.getProfile().isSmoker())
                    .hasPets(session.getProfile().isHasPets())
                    .workSchedule(session.getProfile().getWorkSchedule())
                    .sociality(session.getProfile().getSociality())
                    .hobbies(session.getProfile().getHobbies())
                    .hobbiesEmbeddingJson(session.getProfile().getHobbiesEmbeddingJson())
                    .nutrition(session.getProfile().getNutrition())
                    .nutritionEmbeddingJson(session.getProfile().getNutritionEmbeddingJson())
                    .build();

            LifestyleProfile savedProfile = lifestyleProfileService.save(profile);
            userService.updateLifestyleProfile(session.getUserId(), savedProfile.getId());

            return ChatResponseDto.builder()
                    .finished(true)
                    .question("Hvala! Prikupio sam sve potrebne informacije.")
                    .lifestyleProfile(session.getProfile())
                    .userId(session.getUserId())
                    .build();
        }

        // Spremi session natrag u Redis
        sessionStore.saveSession(request.getSessionId(), session);

        return ChatResponseDto.builder()
                .sessionId(request.getSessionId())
                .question(session.currentQuestion().getQuestionText())
                .step(session.getProgress())
                .total(session.getTotal())
                .lifestyleProfile(session.getProfile())
                .userId(session.getUserId())
                .finished(false)
                .build();
    }

    /**
     *  Cancel / reset chat
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{sessionId}")
    public void cancelChat(@PathVariable String sessionId) {
        sessionStore.removeSession(sessionId);
    }
}
