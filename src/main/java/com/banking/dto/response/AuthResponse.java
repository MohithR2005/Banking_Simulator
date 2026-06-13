package com.banking.dto.response;

public record AuthResponse(
        String token,
        String tokenType,
        String fullName,
        String email,
        String role
) {
}
