package com.banking.exception;

public class FraudDetectedException extends RuntimeException {

    public FraudDetectedException(String message) {
        super(message);
    }
}
