package com.banking.service;

import com.banking.dto.request.AddBeneficiaryRequest;
import com.banking.dto.request.BeneficiaryLookupRequest;
import com.banking.dto.response.BeneficiaryLookupResponse;
import com.banking.dto.response.BeneficiaryResponse;
import com.banking.entity.Account;
import com.banking.entity.AccountStatus;
import com.banking.entity.Beneficiary;
import com.banking.entity.User;
import com.banking.exception.AccountNotFoundException;
import com.banking.repository.AccountRepository;
import com.banking.repository.BeneficiaryRepository;
import com.banking.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public BeneficiaryLookupResponse lookup(String email, BeneficiaryLookupRequest request) {
        Account account = findActiveAccountByNumber(request.accountNumber());
        if (account.getOwner().getEmail().equals(email)) {
            throw new IllegalArgumentException("You cannot add your own account as a beneficiary");
        }
        return BeneficiaryLookupResponse.from(account);
    }

    @Transactional
    public BeneficiaryResponse add(String email, AddBeneficiaryRequest request) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Account recipient = findActiveAccountByNumber(request.accountNumber());
        if (recipient.getOwner().getEmail().equals(email)) {
            throw new IllegalArgumentException("You cannot add your own account as a beneficiary");
        }
        if (beneficiaryRepository.existsByOwnerEmailAndRecipientAccountId(email, recipient.getId())) {
            throw new IllegalArgumentException("Beneficiary already exists");
        }

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setOwner(owner);
        beneficiary.setRecipientAccount(recipient);
        beneficiary.setNickname(request.nickname().trim());
        Beneficiary saved = beneficiaryRepository.save(beneficiary);
        auditLogService.record(email, "ADD_BENEFICIARY", "BENEFICIARY", "Added beneficiary account " + recipient.getAccountNumber());
        return BeneficiaryResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> list(String email) {
        return beneficiaryRepository.findByOwnerEmailOrderByCreatedAtDesc(email).stream()
                .map(BeneficiaryResponse::from)
                .toList();
    }

    @Transactional
    public void delete(String email, Long id) {
        Beneficiary beneficiary = beneficiaryRepository.findByIdAndOwnerEmail(id, email)
                .orElseThrow(() -> new AccountNotFoundException("Beneficiary not found"));
        beneficiaryRepository.delete(beneficiary);
        auditLogService.record(email, "DELETE_BENEFICIARY", "BENEFICIARY", "Deleted beneficiary " + id);
    }

    private Account findActiveAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber.trim())
                .orElseThrow(() -> new AccountNotFoundException("Recipient account not found"));
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("Recipient account is not active");
        }
        return account;
    }
}
