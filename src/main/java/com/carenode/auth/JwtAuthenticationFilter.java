package com.carenode.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import com.carenode.entity.Worker;
import com.carenode.repository.WorkerRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

import com.carenode.auth.TokenBlacklistService;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final WorkerRepository workerRepository;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, WorkerRepository workerRepository, TokenBlacklistService tokenBlacklistService) {
        this.jwtUtil = jwtUtil;
        this.workerRepository = workerRepository;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (tokenBlacklistService.isBlacklisted(token)) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been invalidated");
                    return;
                }
                String username = jwtUtil.extractUsername(token);
                Worker worker = workerRepository.findByUsername(username).orElse(null);
                if (worker != null) {
                    String role = worker.getRole() != null ? worker.getRole() : "USER";
                    UserDetails userDetails = User.withUsername(username)
                        .password("")
                        .authorities("ROLE_" + role.toUpperCase())
                        .build();
                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // Invalid token
            }
        }
        filterChain.doFilter(request, response);
    }
}