package com.banking.service;

import com.banking.dto.request.CreateAccountRequest;
import com.banking.dto.response.AccountResponse;
import com.banking.entity.Account;
import com.banking.entity.AccountStatus;
import com.banking.entity.User;
import com.banking.exception.AccountNotFoundException;
import com.banking.repository.AccountRepository;
import com.banking.repository.UserRepository;
import java.security.SecureRandom;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public AccountResponse createAccount(String email, CreateAccountRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Account account = new Account();
        account.setOwner(user);
        account.setAccountType(request.accountType());
        account.setStatus(AccountStatus.ACTIVE);
        account.setAccountNumber(generateAccountNumber());

        Account saved = accountRepository.save(account);
        auditLogService.record(email, "CREATE_ACCOUNT", "ACCOUNT", "Created account " + saved.getAccountNumber());
        return AccountResponse.from(saved);
    }

    public List<AccountResponse> getMyAccounts(String email) {
        return accountRepository.findByOwnerEmail(email).stream()
                .map(AccountResponse::from)
                .toList();
    }

    public Account getOwnedAccount(Long accountId, String email) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getOwner().getEmail().equals(email)) {
            throw new AccountNotFoundException("Account not found for current user");
        }
        return account;
    }

    private String generateAccountNumber() {
        String accountNumber;
        do {
            accountNumber = "10" + secureRandom.nextLong(1000000000L, 9999999999L);
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }
}
