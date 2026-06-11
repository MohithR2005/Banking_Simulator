package com.banking.dto.response;

import com.banking.entity.FraudFlag;
import java.time.Instant;

public record FraudFlagResponse(
        Long id,
        Long transactionId,
        String reason,
        boolean resolved,
        Instant createdAt
) {
    public static FraudFlagResponse from(FraudFlag fraudFlag) {
        return new FraudFlagResponse(
                fraudFlag.getId(),
                fraudFlag.getTransaction().getId(),
                fraudFlag.getReason(),
                fraudFlag.isResolved(),
                fraudFlag.getCreatedAt()
        );
    }
}
