package br.com.guiarural.backend.map.dto;

import java.util.List;

// Mesmo formato na leitura pública (só locais publicados) e no painel (todos). Também é o retrato (antes/depois)
// gravado no histórico de auditoria. A foto não vem em bytes: photoUrl aponta para GET /api/places/{slug}/photo.
public record PlaceResponseDTO(
        Long id,
        String slug,
        String name,
        String shortName,
        String category,
        String status,
        Double latitude,
        Double longitude,
        String coordinatesSource,
        String address,
        String hours,
        String description,
        String phone,
        String email,
        List<PlaceContactDTO> contacts,
        List<PlaceLinkDTO> services,
        List<PlaceLinkDTO> courses,
        String photoUrl
) {
}
