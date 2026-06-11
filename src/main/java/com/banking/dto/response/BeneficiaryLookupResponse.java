package com.banking.dto.response;

import com.banking.entity.Account;
import com.banking.entity.AccountType;

public record BeneficiaryLookupResponse(
        String accountNumber,
        String holderName,
        AccountType accountType
) {
    public static BeneficiaryLookupResponse from(Account account) {
        return new BeneficiaryLookupResponse(
                account.getAccountNumber(),
                account.getOwner().getFullName(),
                account.getAccountType()
        );
    }
}
