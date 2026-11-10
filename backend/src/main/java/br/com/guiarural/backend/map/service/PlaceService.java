package br.com.guiarural.backend.map.service;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.model.PlacePhotoEntity;
import br.com.guiarural.backend.map.repository.PlacePhotoRepository;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Leituras de locais. As escritas do painel ficam no PlaceAdminService.
@Service
public class PlaceService {
    // RN-UC14.02: só locais publicados aparecem no mapa e na busca.
    public static final String PUBLISHED = "publicado";

    private final PlaceRepository repository;
    private final PlacePhotoRepository photoRepository;
    private final PlaceAssembler assembler;

    public PlaceService(PlaceRepository repository, PlacePhotoRepository photoRepository, PlaceAssembler assembler) {
        this.repository = repository;
        this.photoRepository = photoRepository;
        this.assembler = assembler;
    }

    @Transactional(readOnly = true)
    public List<PlaceResponseDTO> findPublished() {
        return assembler.assemble(repository.findByStatusOrderByNameAsc(PUBLISHED), true);
    }

    @Transactional(readOnly = true)
    public PlaceResponseDTO findBySlug(String slug) {
        PlaceEntity entity = repository.findBySlugAndStatus(slug, PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Local não encontrado: " + slug));
        return assembler.assemble(entity, true);
    }

    // Painel: todos os locais, inclusive rascunhos e inativos.
    @Transactional(readOnly = true)
    public List<PlaceResponseDTO> findAllForAdmin() {
        return assembler.assemble(repository.findAllByOrderByNameAsc(), false);
    }

    @Transactional(readOnly = true)
    public PlaceResponseDTO findBySlugForAdmin(String slug) {
        PlaceEntity entity = repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Local não encontrado: " + slug));
        return assembler.assemble(entity, false);
    }

    // A foto de um local que não está publicado não sai pela rota pública.
    @Transactional(readOnly = true)
    public PlacePhotoEntity findPublishedPhoto(String slug) {
        PlaceEntity place = repository.findBySlugAndStatus(slug, PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Local não encontrado: " + slug));
        return photoRepository.findById(place.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Este local não tem foto."));
    }
}
