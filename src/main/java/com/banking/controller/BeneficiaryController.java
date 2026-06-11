package com.banking.controller;

import com.banking.dto.request.AddBeneficiaryRequest;
import com.banking.dto.request.BeneficiaryLookupRequest;
import com.banking.dto.response.BeneficiaryLookupResponse;
import com.banking.dto.response.BeneficiaryResponse;
import com.banking.service.BeneficiaryService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/beneficiaries")
@RequiredArgsConstructor
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @PostMapping("/lookup")
    public BeneficiaryLookupResponse lookup(Principal principal, @Valid @RequestBody BeneficiaryLookupRequest request) {
        return beneficiaryService.lookup(principal.getName(), request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse add(Principal principal, @Valid @RequestBody AddBeneficiaryRequest request) {
        return beneficiaryService.add(principal.getName(), request);
    }

    @GetMapping
    public List<BeneficiaryResponse> list(Principal principal) {
        return beneficiaryService.list(principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Principal principal, @PathVariable Long id) {
        beneficiaryService.delete(principal.getName(), id);
    }
}
