package br.com.guiarural.backend.info.dto;

// Um texto nos três idiomas; en e es são nulos quando não há tradução.
public record LocalizedTextDTO(String pt, String en, String es) {
}
