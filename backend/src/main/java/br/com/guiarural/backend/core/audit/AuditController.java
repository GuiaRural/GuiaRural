package br.com.guiarural.backend.core.audit;

import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Locale;

// Histórico de mudanças do painel (UC23). Leitura para qualquer administrador; desfazer é uma escrita
// (exige permissão "geral" ou "editor", como as demais).
@RestController
@RequestMapping("/api/admin/audit-logs")
public class AuditController {
    private static final int MAX_LIMIT = 500;

    private final AuditLogRepository repository;
    private final List<AuditRestorer> restorers;
    private final JsonMapper jsonMapper;

    public AuditController(AuditLogRepository repository, List<AuditRestorer> restorers, JsonMapper jsonMapper) {
        this.repository = repository;
        this.restorers = restorers;
        this.jsonMapper = jsonMapper;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<AuditLogResponseDTO>> findRecent(@RequestParam(defaultValue = "200") int limit) {
        int size = Math.min(Math.max(limit, 1), MAX_LIMIT);
        return ResponseEntity.ok(repository.findAllByOrderByOccurredAtDescIdDesc(PageRequest.of(0, size)).stream()
                .map(this::toResponse)
                .toList());
    }

    @PostMapping("/{id}/restore")
    @Transactional
    public ResponseEntity<Void> restore(@PathVariable Long id) {
        AuditLogEntity log = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de histórico não encontrado: " + id));
        AuditRestorer restorer = restorers.stream()
                .filter(r -> r.entity().name().toLowerCase(Locale.ROOT).equals(log.getEntity()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Desfazer não é suportado para: " + log.getEntity()));
        restorer.restore(log);
        return ResponseEntity.noContent().build();
    }

    private AuditLogResponseDTO toResponse(AuditLogEntity log) {
        return new AuditLogResponseDTO(
                log.getId(), log.getOccurredAt(), log.getAuthor(), log.getEntity(), log.getEntityId(),
                log.getEntityName(), log.getAction(), json(log.getBeforeState()), json(log.getAfterState()));
    }

    private JsonNode json(String raw) {
        return raw == null ? null : jsonMapper.readTree(raw);
    }
}
