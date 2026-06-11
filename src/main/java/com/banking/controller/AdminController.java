package com.banking.controller;

import com.banking.dto.response.AuditLogResponse;
import com.banking.dto.response.FraudFlagResponse;
import com.banking.service.AuditLogService;
import com.banking.service.FraudDetectionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final FraudDetectionService fraudDetectionService;
    private final AuditLogService auditLogService;

    @GetMapping("/fraud-flags")
    public List<FraudFlagResponse> fraudFlags() {
        return fraudDetectionService.unresolvedFlags().stream()
                .map(FraudFlagResponse::from)
                .toList();
    }

    @GetMapping("/audit-logs")
    public List<AuditLogResponse> auditLogs() {
        return auditLogService.latest().stream()
                .map(AuditLogResponse::from)
                .toList();
    }
}
