package com.banking.service;

import com.banking.dto.request.MoneyRequest;
import com.banking.dto.request.BeneficiaryTransferRequest;
import com.banking.dto.request.TransferRequest;
import com.banking.dto.response.TransactionResponse;
import com.banking.entity.Account;
import com.banking.entity.AccountStatus;
import com.banking.entity.Beneficiary;
import com.banking.entity.BeneficiaryStatus;
import com.banking.entity.Transaction;
import com.banking.entity.TransactionStatus;
import com.banking.entity.TransactionType;
import com.banking.exception.AccountNotFoundException;
import com.banking.exception.FraudDetectedException;
import com.banking.exception.InsufficientFundsException;
import com.banking.repository.AccountRepository;
import com.banking.repository.BeneficiaryRepository;
import com.banking.repository.TransactionRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;
    private final AuditLogService auditLogService;

    @Transactional
    public TransactionResponse deposit(String email, MoneyRequest request) {
        Account account = getOwnedAndActiveAccountWithLock(request.accountId(), email);
        account.setBalance(account.getBalance().add(request.amount()));

        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setAmount(request.amount());
        transaction.setDestinationAccount(account);
        transaction.setDescription(request.description());

        Transaction saved = transactionRepository.save(transaction);
        auditLogService.record(email, "DEPOSIT", "TRANSACTION", "Deposited " + request.amount() + " into account " + account.getId());
        return TransactionResponse.from(saved);
    }

    @Transactional
    public TransactionResponse withdraw(String email, MoneyRequest request) {
        Account account = getOwnedAndActiveAccountWithLock(request.accountId(), email);
        ensureSufficientFunds(account, request.amount());
        account.setBalance(account.getBalance().subtract(request.amount()));

        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.WITHDRAWAL);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setAmount(request.amount());
        transaction.setSourceAccount(account);
        transaction.setDescription(request.description());

        Transaction saved = transactionRepository.save(transaction);
        auditLogService.record(email, "WITHDRAW", "TRANSACTION", "Withdrew " + request.amount() + " from account " + account.getId());
        return TransactionResponse.from(saved);
    }

    @Transactional(noRollbackFor = FraudDetectedException.class)
    public TransactionResponse transfer(String email, TransferRequest request) {
        if (request.fromAccountId().equals(request.toAccountId())) {
            throw new IllegalArgumentException("Source and destination accounts must be different");
        }

        Account source = getOwnedAndActiveAccountWithLock(request.fromAccountId(), email);
        Account destination = accountRepository.findWithLockById(request.toAccountId())
                .orElseThrow(() -> new AccountNotFoundException("Destination account not found"));
        ensureActive(destination);
        ensureSufficientFunds(source, request.amount());

        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.TRANSFER);
        transaction.setAmount(request.amount());
        transaction.setSourceAccount(source);
        transaction.setDestinationAccount(destination);
        transaction.setDescription(request.description());

        List<String> fraudReasons = fraudDetectionService.evaluate(source, request.amount());
        if (!fraudReasons.isEmpty()) {
            transaction.setStatus(TransactionStatus.FLAGGED);
            Transaction saved = transactionRepository.save(transaction);
            fraudDetectionService.flag(saved, String.join("; ", fraudReasons));
            auditLogService.record(email, "FRAUD_FLAG", "TRANSACTION", "Flagged transfer " + saved.getId());
            throw new FraudDetectedException("Transfer flagged for review: " + String.join("; ", fraudReasons));
        }

        source.setBalance(source.getBalance().subtract(request.amount()));
        destination.setBalance(destination.getBalance().add(request.amount()));
        transaction.setStatus(TransactionStatus.COMPLETED);

        Transaction saved = transactionRepository.save(transaction);
        auditLogService.record(email, "TRANSFER", "TRANSACTION", "Transferred " + request.amount() + " from " + source.getId() + " to " + destination.getId());
        return TransactionResponse.from(saved);
    }

    @Transactional(noRollbackFor = FraudDetectedException.class)
    public TransactionResponse transferToBeneficiary(String email, BeneficiaryTransferRequest request) {
        Beneficiary beneficiary = beneficiaryRepository.findByIdAndOwnerEmail(request.beneficiaryId(), email)
                .orElseThrow(() -> new AccountNotFoundException("Beneficiary not found"));
        if (beneficiary.getStatus() != BeneficiaryStatus.ACTIVE) {
            throw new IllegalArgumentException("Beneficiary is not active");
        }

        TransferRequest transferRequest = new TransferRequest(
                request.fromAccountId(),
                beneficiary.getRecipientAccount().getId(),
                request.amount(),
                request.description()
        );
        return transfer(email, transferRequest);
    }

    public List<TransactionResponse> getAccountTransactions(String email, Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getOwner().getEmail().equals(email)) {
            throw new AccountNotFoundException("Account not found for current user");
        }

        return transactionRepository.findBySourceAccountIdOrDestinationAccountIdOrderByCreatedAtDesc(accountId, accountId)
                .stream()
                .map(TransactionResponse::from)
                .toList();
    }

    private Account getOwnedAndActiveAccountWithLock(Long accountId, String email) {
        Account account = accountRepository.findWithLockById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getOwner().getEmail().equals(email)) {
            throw new AccountNotFoundException("Account not found for current user");
        }
        ensureActive(account);
        return account;
    }

    private void ensureActive(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("Account is not active");
        }
    }

    private void ensureSufficientFunds(Account account, BigDecimal amount) {
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient funds");
        }
    }
}
