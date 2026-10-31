package br.com.guiarural.backend.map.service;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlaceService {
    // RN-UC14.02: só locais publicados aparecem no mapa e na busca.
    public static final String PUBLISHED = "publicado";

    private final PlaceRepository repository;

    public PlaceService(PlaceRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PlaceResponseDTO> findPublished() {
        return repository.findByStatusOrderByNameAsc(PUBLISHED)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlaceResponseDTO findBySlug(String slug) {
        PlaceEntity entity = repository.findBySlugAndStatus(slug, PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Local não encontrado: " + slug));
        return mapToResponseDTO(entity);
    }

    private PlaceResponseDTO mapToResponseDTO(PlaceEntity entity) {
        return new PlaceResponseDTO(
                entity.getId(),
                entity.getSlug(),
                entity.getName(),
                entity.getShortName(),
                entity.getCategory(),
                entity.getLatitude(),
                entity.getLongitude(),
                entity.getAddress(),
                entity.getHours(),
                entity.getDescription(),
                entity.getPhone(),
                entity.getEmail()
        );
    }
}
