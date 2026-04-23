package com.carenode.auth;

import com.carenode.entity.Worker;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final LoginAttemptService loginAttemptService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService,
                          LoginAttemptService loginAttemptService,
                          TokenBlacklistService tokenBlacklistService,
                          JwtUtil jwtUtil) {
        this.authService = authService;
        this.loginAttemptService = loginAttemptService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        if (loginAttemptService.isBlocked(request.getUsername(), ip)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many failed login attempts. Try again later.");
        }

        try {
            String token = authService.authenticate(request.getUsername(), request.getPassword());
            loginAttemptService.loginSucceeded(request.getUsername(), ip);
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (RuntimeException ex) {
            loginAttemptService.loginFailed(request.getUsername(), ip);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, ex.getMessage(), ex);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            tokenBlacklistService.blacklistToken(token, java.time.Duration.ofMillis(jwtUtil.getTokenTimeToLiveMillis(token)));
        }
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Worker worker) {
        authService.register(worker);
        return ResponseEntity.ok("User registered successfully");
    }

    public static class LoginRequest {
        private String username;
        private String password;

        // getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;

        public AuthResponse(String token) { this.token = token; }
        public String getToken() { return token; }
    }
}