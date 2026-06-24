package com.banking.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record TransferRequest(
        @NotNull Long fromAccountId,
        @NotNull Long toAccountId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        String description,
        @NotBlank
        @Pattern(regexp = "\\d{4}|\\d{6}", message = "Transaction PIN must be 4 or 6 digits")
        String transactionPin
) {
}
