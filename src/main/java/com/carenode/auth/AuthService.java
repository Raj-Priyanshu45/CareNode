package com.carenode.auth;

import com.carenode.entity.Worker;
import com.carenode.repository.WorkerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final WorkerRepository workerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(WorkerRepository workerRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.workerRepository = workerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String authenticate(String username, String password) {
        Worker worker = workerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (passwordEncoder.matches(password, worker.getPasswordHash())) {
            return jwtUtil.generateToken(username);
        }
        throw new RuntimeException("Invalid credentials");
    }

    public void register(Worker worker) {
        worker.setPasswordHash(passwordEncoder.encode(worker.getPasswordHash()));
        workerRepository.save(worker);
    }
}