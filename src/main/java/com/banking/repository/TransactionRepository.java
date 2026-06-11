package com.banking.repository;

import com.banking.entity.Transaction;
import com.banking.entity.TransactionStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySourceAccountIdOrDestinationAccountIdOrderByCreatedAtDesc(Long sourceAccountId, Long destinationAccountId);

    long countBySourceAccountIdAndStatusAndCreatedAtAfter(Long accountId, TransactionStatus status, Instant after);

    @Query("""
            select coalesce(sum(t.amount), 0)
            from Transaction t
            where t.sourceAccount.id = :accountId
              and t.status = :status
              and t.createdAt >= :after
            """)
    BigDecimal sumOutgoingAmountSince(
            @Param("accountId") Long accountId,
            @Param("status") TransactionStatus status,
            @Param("after") Instant after
    );
}
