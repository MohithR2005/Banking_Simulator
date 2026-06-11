package com.banking.dto.response;

import com.banking.entity.Beneficiary;
import com.banking.entity.BeneficiaryStatus;
import java.time.Instant;

public record BeneficiaryResponse(
        Long id,
        String nickname,
        String recipientName,
        String accountNumber,
        String maskedAccountNumber,
        String accountType,
        BeneficiaryStatus status,
        Instant createdAt
) {
    public static BeneficiaryResponse from(Beneficiary beneficiary) {
        String accountNumber = beneficiary.getRecipientAccount().getAccountNumber();
        return new BeneficiaryResponse(
                beneficiary.getId(),
                beneficiary.getNickname(),
                beneficiary.getRecipientAccount().getOwner().getFullName(),
                accountNumber,
                mask(accountNumber),
                beneficiary.getRecipientAccount().getAccountType().name(),
                beneficiary.getStatus(),
                beneficiary.getCreatedAt()
        );
    }

    private static String mask(String accountNumber) {
        int visible = Math.min(4, accountNumber.length());
        return "****" + accountNumber.substring(accountNumber.length() - visible);
    }
}
