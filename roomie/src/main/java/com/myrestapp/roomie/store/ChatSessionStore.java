package com.myrestapp.roomie.store;

import com.myrestapp.roomie.validation.LifestyleChatSession;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;

@Component
public class ChatSessionStore {

    private static final String PREFIX = "chat:session:";
    private static final Duration TTL = Duration.ofMinutes(30);

    private final RedisTemplate<String, LifestyleChatSession> redisTemplate;

    public ChatSessionStore(RedisTemplate<String, LifestyleChatSession> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String createSession() {
        String sessionId = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(key(sessionId),
                new LifestyleChatSession(),
                TTL);
        return sessionId;
    }

    public LifestyleChatSession getSession(String sessionId) {
        LifestyleChatSession session =
                redisTemplate.opsForValue().get(key(sessionId));

        if (session == null) {
            throw new IllegalArgumentException("Chat sesija ne postoji ili je istekla.");
        }
        return session;
    }

    public void saveSession(String sessionId, LifestyleChatSession session) {
        redisTemplate.opsForValue().set(key(sessionId), session, TTL);
    }

    public void removeSession(String sessionId) {
        redisTemplate.delete(key(sessionId));
    }

    private String key(String sessionId) {
        return PREFIX + sessionId;
    }
}
