package com.banking.controller;

import com.banking.dto.request.MoneyRequest;
import com.banking.dto.request.BeneficiaryTransferRequest;
import com.banking.dto.request.TransferRequest;
import com.banking.dto.response.TransactionResponse;
import com.banking.service.TransactionService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public TransactionResponse deposit(Principal principal, @Valid @RequestBody MoneyRequest request) {
        return transactionService.deposit(principal.getName(), request);
    }

    @PostMapping("/withdraw")
    public TransactionResponse withdraw(Principal principal, @Valid @RequestBody MoneyRequest request) {
        return transactionService.withdraw(principal.getName(), request);
    }

    @PostMapping("/transfer")
    public TransactionResponse transfer(Principal principal, @Valid @RequestBody TransferRequest request) {
        return transactionService.transfer(principal.getName(), request);
    }

    @PostMapping("/beneficiary-transfer")
    public TransactionResponse beneficiaryTransfer(Principal principal, @Valid @RequestBody BeneficiaryTransferRequest request) {
        return transactionService.transferToBeneficiary(principal.getName(), request);
    }

    @GetMapping("/account/{accountId}")
    public List<TransactionResponse> getAccountTransactions(Principal principal, @PathVariable Long accountId) {
        return transactionService.getAccountTransactions(principal.getName(), accountId);
    }
}
