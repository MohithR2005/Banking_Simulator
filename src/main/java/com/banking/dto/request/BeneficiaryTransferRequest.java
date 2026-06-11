package com.banking.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BeneficiaryTransferRequest(
        @NotNull Long fromAccountId,
        @NotNull Long beneficiaryId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        String description
) {
}
