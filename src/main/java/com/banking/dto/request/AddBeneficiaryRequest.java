package com.banking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddBeneficiaryRequest(
        @NotBlank @Size(min = 6, max = 20) String accountNumber,
        @NotBlank @Size(max = 80) String nickname
) {
}
