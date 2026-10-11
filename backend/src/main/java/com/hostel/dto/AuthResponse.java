package com.hostel.dto;

public record AuthResponse(String token, UserInfo user) {

    public record UserInfo(Long id, String username, String email, String role) {
    }
}
