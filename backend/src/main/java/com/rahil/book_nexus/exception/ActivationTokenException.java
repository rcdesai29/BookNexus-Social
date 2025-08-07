package com.rahil.book_nexus.exception;

public class ActivationTokenException extends RuntimeException {
    public ActivationTokenException() {
    }

    public ActivationTokenException(String message) {
        super(message);
    }

    public ActivationTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}