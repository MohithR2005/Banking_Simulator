package com.banking.dto.request;

import com.banking.entity.AccountType;
import jakarta.validation.constraints.NotNull;

public record CreateAccountRequest(@NotNull AccountType accountType) {
}
