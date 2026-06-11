package com.banking.service;

import com.banking.entity.AuditLog;
import com.banking.repository.AuditLogRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void record(String actorEmail, String action, String resource, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setActorEmail(actorEmail);
        auditLog.setAction(action);
        auditLog.setResource(resource);
        auditLog.setDetails(details);
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> latest() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc();
    }
}
