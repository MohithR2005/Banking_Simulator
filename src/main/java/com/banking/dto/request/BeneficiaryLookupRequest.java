package com.banking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BeneficiaryLookupRequest(
        @NotBlank @Size(min = 6, max = 20) String accountNumber
) {
}
