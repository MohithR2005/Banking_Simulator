package com.banking.service;

import com.banking.entity.Account;
import com.banking.entity.FraudFlag;
import com.banking.entity.Transaction;
import com.banking.entity.TransactionStatus;
import com.banking.repository.FraudFlagRepository;
import com.banking.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final TransactionRepository transactionRepository;
    private final FraudFlagRepository fraudFlagRepository;

    @Value("${app.fraud.large-transfer-threshold}")
    private BigDecimal largeTransferThreshold;

    @Value("${app.fraud.daily-transfer-threshold}")
    private BigDecimal dailyTransferThreshold;

    @Value("${app.fraud.max-daily-transfer-count}")
    private long maxDailyTransferCount;

    public List<String> evaluate(Account sourceAccount, BigDecimal amount) {
        List<String> reasons = new ArrayList<>();
        if (amount.compareTo(largeTransferThreshold) > 0) {
            reasons.add("Amount exceeds large transfer threshold of " + largeTransferThreshold);
        }

        Instant startOfWindow = Instant.now().minus(24, ChronoUnit.HOURS);
        long dailyCount = transactionRepository.countBySourceAccountIdAndStatusAndCreatedAtAfter(
                sourceAccount.getId(),
                TransactionStatus.COMPLETED,
                startOfWindow
        );
        if (dailyCount >= maxDailyTransferCount) {
            reasons.add("Daily outgoing transfer count exceeds " + maxDailyTransferCount);
        }

        BigDecimal outgoing = transactionRepository.sumOutgoingAmountSince(
                sourceAccount.getId(),
                TransactionStatus.COMPLETED,
                startOfWindow
        );
        if (outgoing.add(amount).compareTo(dailyTransferThreshold) > 0) {
            reasons.add("Daily outgoing amount exceeds threshold of " + dailyTransferThreshold);
        }

        return reasons;
    }

    public FraudFlag flag(Transaction transaction, String reason) {
        FraudFlag fraudFlag = new FraudFlag();
        fraudFlag.setTransaction(transaction);
        fraudFlag.setReason(reason);
        return fraudFlagRepository.save(fraudFlag);
    }

    public List<FraudFlag> unresolvedFlags() {
        return fraudFlagRepository.findByResolvedFalseOrderByCreatedAtDesc();
    }
}
