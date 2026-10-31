package br.com.guiarural.backend.map;

import br.com.guiarural.backend.courses.model.CourseEntity;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.repository.CourseRepository;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import br.com.guiarural.backend.map.dto.SearchSuggestionDTO;
import br.com.guiarural.backend.map.dto.SearchType;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import br.com.guiarural.backend.map.service.SearchService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {
    @Mock
    private PlaceRepository placeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private SearchService service;

    private PlaceEntity place(Long id, String slug, String name, String shortName, String category) {
        PlaceEntity place = new PlaceEntity();
        place.setId(id);
        place.setSlug(slug);
        place.setName(name);
        place.setShortName(shortName);
        place.setCategory(category);
        place.setStatus("publicado");
        return place;
    }

    private DepartmentEntity department(Long id, String name, String shortName) {
        DepartmentEntity department = new DepartmentEntity();
        department.setId(id);
        department.setName(name);
        department.setShortName(shortName);
        department.setActive(true);
        return department;
    }

    private CourseEntity course(Long id, Long departmentId, String name) {
        CourseEntity course = new CourseEntity();
        course.setId(id);
        course.setDepartmentId(departmentId);
        course.setName(name);
        course.setActive(true);
        return course;
    }

    @Test
    @DisplayName("Não deve buscar com menos de 3 caracteres")
    void shouldReturnEmptyWhenQueryIsTooShort() {
        assertTrue(service.search("di").isEmpty());
        assertTrue(service.search("  ").isEmpty());
        assertTrue(service.search(null).isEmpty());

        verifyNoInteractions(placeRepository, departmentRepository, courseRepository);
    }

    @Test
    @DisplayName("Deve ignorar acentos e maiúsculas e reunir locais, departamentos e cursos")
    void shouldMatchAcrossKindsIgnoringAccentsAndCase() {
        when(placeRepository.findByStatusOrderByNameAsc("publicado")).thenReturn(List.of(
                place(1L, "dc", "CEAGRI II / DC (Departamento de Computação)", "DC", "departamento"),
                place(2L, "biblioteca", "Biblioteca Central", "Biblioteca", "biblioteca")));
        when(departmentRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(
                department(10L, "Departamento de Computação", "DC")));
        when(courseRepository.findByActiveTrue()).thenReturn(List.of(
                course(20L, 10L, "Ciência da Computação")));
        when(departmentRepository.findAllById(anyIterable())).thenReturn(List.of(
                department(10L, "Departamento de Computação", "DC")));

        List<SearchSuggestionDTO> result = service.search("COMPUTACAO");

        assertEquals(3, result.size());
        assertTrue(result.stream().anyMatch(s -> s.type() == SearchType.PLACE && "dc".equals(s.slug())));
        assertTrue(result.stream().anyMatch(s -> s.type() == SearchType.DEPARTMENT && s.id() == 10L));
        SearchSuggestionDTO course = result.stream().filter(s -> s.type() == SearchType.COURSE).findFirst().orElseThrow();
        assertEquals(20L, course.id());
        assertEquals("Departamento de Computação", course.detail());
    }

    @Test
    @DisplayName("Deve listar primeiro os nomes que começam com o termo")
    void shouldRankPrefixMatchesFirst() {
        when(placeRepository.findByStatusOrderByNameAsc("publicado")).thenReturn(List.of(
                place(1L, "biblioteca-setorial", "Biblioteca Setorial", null, "biblioteca"),
                place(2L, "casa", "Casa da Biblioteca Velha", null, "apoio")));
        when(departmentRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of());
        when(courseRepository.findByActiveTrue()).thenReturn(List.of());

        List<SearchSuggestionDTO> result = service.search("biblio");

        assertEquals(List.of("Biblioteca Setorial", "Casa da Biblioteca Velha"),
                result.stream().map(SearchSuggestionDTO::name).toList());
    }

    @Test
    @DisplayName("Deve limitar a quantidade de sugestões")
    void shouldLimitSuggestions() {
        when(placeRepository.findByStatusOrderByNameAsc("publicado")).thenReturn(
                IntStream.rangeClosed(1, 20)
                        .mapToObj(i -> place((long) i, "sala-" + i, "Sala " + String.format("%02d", i), null, "sala"))
                        .toList());
        when(departmentRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of());
        when(courseRepository.findByActiveTrue()).thenReturn(List.of());

        List<SearchSuggestionDTO> result = service.search("sala");

        assertEquals(SearchService.MAX_SUGGESTIONS, result.size());
    }

    @Test
    @DisplayName("Deve devolver lista vazia quando nada corresponde (FE-38.01)")
    void shouldReturnEmptyWhenNothingMatches() {
        when(placeRepository.findByStatusOrderByNameAsc("publicado")).thenReturn(List.of(
                place(1L, "biblioteca", "Biblioteca Central", null, "biblioteca")));
        when(departmentRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of());
        when(courseRepository.findByActiveTrue()).thenReturn(List.of());
        when(departmentRepository.findAllById(Set.of())).thenReturn(List.of());

        assertTrue(service.search("xadrez").isEmpty());
    }
}
