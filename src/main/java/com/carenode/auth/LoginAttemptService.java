package com.carenode.auth;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration BLOCK_TTL = Duration.ofMinutes(15);
    private static final String ATTEMPT_PREFIX = "login:attempt:";

    private final RedisTemplate<String, Object> redisTemplate;

    public LoginAttemptService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isBlocked(String username, String ip) {
        String key = getKey(username, ip);
        Object value = redisTemplate.opsForValue().get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue() >= MAX_ATTEMPTS;
        }
        try {
            return Integer.parseInt(String.valueOf(value)) >= MAX_ATTEMPTS;
        } catch (Exception e) {
            return false;
        }
    }

    public void loginSucceeded(String username, String ip) {
        redisTemplate.delete(getKey(username, ip));
    }

    public void loginFailed(String username, String ip) {
        String key = getKey(username, ip);
        Long attempts = redisTemplate.opsForValue().increment(key);
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, BLOCK_TTL);
        }
    }

    private String getKey(String username, String ip) {
        String sanitizedUsername = username != null ? username.trim().toLowerCase() : "unknown";
        String sanitizedIp = ip != null ? ip : "unknown";
        return ATTEMPT_PREFIX + sanitizedUsername + ":" + sanitizedIp;
    }
}
