package com.banking.dto.request;

import com.banking.entity.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateAccountRequest(
        @NotNull AccountType accountType,
        @NotBlank
        @Pattern(regexp = "\\d{4}|\\d{6}", message = "Transaction PIN must be 4 or 6 digits")
        String transactionPin
) {
}
