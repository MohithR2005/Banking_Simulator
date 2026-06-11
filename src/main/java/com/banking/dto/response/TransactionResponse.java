package com.banking.dto.response;

import com.banking.entity.Transaction;
import com.banking.entity.TransactionStatus;
import com.banking.entity.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
        Long id,
        TransactionType type,
        TransactionStatus status,
        BigDecimal amount,
        Long sourceAccountId,
        Long destinationAccountId,
        String description,
        Instant createdAt
) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getStatus(),
                transaction.getAmount(),
                transaction.getSourceAccount() == null ? null : transaction.getSourceAccount().getId(),
                transaction.getDestinationAccount() == null ? null : transaction.getDestinationAccount().getId(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }
}
