package br.com.guiarural.backend.map;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.dto.DepartmentResponseDTO;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import br.com.guiarural.backend.courses.service.CourseService;
import br.com.guiarural.backend.courses.service.DepartmentService;
import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import br.com.guiarural.backend.map.service.PlaceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlaceServiceTest {
    @Mock
    private PlaceRepository placeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private CourseService courseService;

    private PlaceEntity place(Long id, String slug, String status) {
        PlaceEntity place = new PlaceEntity();
        place.setId(id);
        place.setSlug(slug);
        place.setName("Local " + slug);
        place.setCategory("sala");
        place.setStatus(status);
        place.setLatitude(-8.0142355);
        place.setLongitude(-34.9508648);
        return place;
    }

    @Test
    @DisplayName("Deve listar só os locais publicados")
    void shouldListPublishedPlaces() {
        when(placeRepository.findByStatusOrderByNameAsc("publicado")).thenReturn(List.of(place(1L, "reitoria", "publicado")));

        List<PlaceResponseDTO> result = new PlaceService(placeRepository).findPublished();

        assertEquals(1, result.size());
        assertEquals("reitoria", result.get(0).slug());
        assertEquals(-8.0142355, result.get(0).latitude());
    }

    @Test
    @DisplayName("Deve lançar 404 para local que não está publicado")
    void shouldThrowWhenPlaceIsNotPublished() {
        when(placeRepository.findBySlugAndStatus("ceu", "publicado")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> new PlaceService(placeRepository).findBySlug("ceu"));
    }

    @Test
    @DisplayName("Deve expor o slug do local só quando ele está publicado")
    void shouldExposePlaceSlugOnlyForPublishedPlaces() {
        DepartmentEntity withPublished = new DepartmentEntity();
        withPublished.setId(1L);
        withPublished.setName("Departamento de Computação");
        withPublished.setPlaceId(10L);
        DepartmentEntity withDraft = new DepartmentEntity();
        withDraft.setId(2L);
        withDraft.setName("Departamento de Educação Física");
        withDraft.setPlaceId(11L);
        DepartmentEntity withoutPlace = new DepartmentEntity();
        withoutPlace.setId(3L);
        withoutPlace.setName("Departamento sem local");

        when(departmentRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(withPublished, withDraft, withoutPlace));
        when(placeRepository.findAllById(anyList())).thenReturn(List.of(place(10L, "dc", "publicado"), place(11L, "def", "rascunho")));

        List<DepartmentResponseDTO> result = new DepartmentService(departmentRepository, placeRepository, courseService).findAll();

        assertEquals("dc", result.get(0).placeSlug());
        assertNull(result.get(1).placeSlug());
        assertNull(result.get(2).placeSlug());
    }
}
