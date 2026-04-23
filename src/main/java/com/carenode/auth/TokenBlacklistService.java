package com.carenode.auth;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class TokenBlacklistService {

    private static final String TOKEN_BLACKLIST_PREFIX = "jwt:blacklist:";
    private final RedisTemplate<String, Object> redisTemplate;

    public TokenBlacklistService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void blacklistToken(String token, Duration ttl) {
        if (token == null || ttl == null || ttl.isNegative() || ttl.isZero()) {
            return;
        }
        redisTemplate.opsForValue().set(getKey(token), true, ttl);
    }

    public boolean isBlacklisted(String token) {
        if (token == null) {
            return false;
        }
        return Boolean.TRUE.equals(redisTemplate.hasKey(getKey(token)));
    }

    private String getKey(String token) {
        return TOKEN_BLACKLIST_PREFIX + token;
    }
}
