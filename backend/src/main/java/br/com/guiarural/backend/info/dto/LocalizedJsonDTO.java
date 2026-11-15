package br.com.guiarural.backend.info.dto;

import tools.jackson.databind.JsonNode;

// Um JSON (lista de blocos ou de links) nos três idiomas; en e es são nulos quando não há tradução.
public record LocalizedJsonDTO(JsonNode pt, JsonNode en, JsonNode es) {
}
