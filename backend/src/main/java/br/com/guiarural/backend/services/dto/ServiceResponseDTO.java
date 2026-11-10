package br.com.guiarural.backend.services.dto;

import java.util.List;

public record ServiceResponseDTO(
        Long id,
        String category,
        String name,
        String sector,
        String description,
        List<String> steps,
        String requirements,
        String url,
        String deadline,
        String locationReference,
        Boolean active,
        // Locais publicados que oferecem o serviço (vínculo feito no formulário de local, no painel).
        List<ServicePlaceDTO> places
) {
}
