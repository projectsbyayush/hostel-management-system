package com.hostel.exception;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;

public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        List<String> details) {

    public static ApiError of(HttpStatus status, String message) {
        return new ApiError(LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, List.of());
    }

    public static ApiError of(HttpStatus status, String message, List<String> details) {
        return new ApiError(LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, details);
    }
}
