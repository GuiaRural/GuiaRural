package br.com.guiarural.backend.core.audit.controller;

import br.com.guiarural.backend.core.audit.model.LogMudancaEntity;
import br.com.guiarural.backend.core.audit.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/logs")
    public ResponseEntity<List<LogMudancaEntity>> getLogs() {
        return ResponseEntity.ok(auditLogService.listarLogs());
    }
}