package br.com.guiarural.backend.core.audit;

import tools.jackson.databind.JsonNode;

import java.time.Instant;

public record AuditLogResponseDTO(
        Long id,
        Instant at,
        String author,
        String entity,
        String entityId,
        String entityName,
        String action,
        JsonNode before,
        JsonNode after
) {
}
