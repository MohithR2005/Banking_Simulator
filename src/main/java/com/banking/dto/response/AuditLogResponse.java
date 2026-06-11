package com.banking.dto.response;

import com.banking.entity.AuditLog;
import java.time.Instant;

public record AuditLogResponse(
        Long id,
        String actorEmail,
        String action,
        String resource,
        String details,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLog auditLog) {
        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getActorEmail(),
                auditLog.getAction(),
                auditLog.getResource(),
                auditLog.getDetails(),
                auditLog.getCreatedAt()
        );
    }
}
