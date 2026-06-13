package com.banking.service;

import com.banking.dto.request.LoginRequest;
import com.banking.dto.request.RegisterRequest;
import com.banking.dto.response.AuthResponse;
import com.banking.entity.Role;
import com.banking.entity.User;
import com.banking.repository.UserRepository;
import com.banking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(userRepository.count() == 0 ? Role.ADMIN : Role.USER);
        userRepository.save(user);

        auditLogService.record(user.getEmail(), "REGISTER", "USER", "Created user with role " + user.getRole());
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());
        return new AuthResponse(token, "Bearer", user.getFullName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password())
        );

        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());
        auditLogService.record(user.getEmail(), "LOGIN", "USER", "User logged in");
        return new AuthResponse(token, "Bearer", user.getFullName(), user.getEmail(), user.getRole().name());
    }
}
