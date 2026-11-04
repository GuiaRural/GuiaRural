package br.com.guiarural.backend.core.audit.service;

import br.com.guiarural.backend.core.audit.model.LogMudancaEntity;
import br.com.guiarural.backend.core.audit.repository.LogMudancaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    private final LogMudancaRepository logMudancaRepository;

    public AuditLogService(LogMudancaRepository logMudancaRepository) {
        this.logMudancaRepository = logMudancaRepository;
    }

    public List<LogMudancaEntity> listarLogs() {
        return logMudancaRepository.findAll();
    }
}