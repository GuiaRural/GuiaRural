package br.com.guiarural.backend.map;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.dto.DepartmentResponseDTO;
import br.com.guiarural.backend.courses.model.CourseEntity;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import br.com.guiarural.backend.courses.service.CourseService;
import br.com.guiarural.backend.courses.service.DepartmentService;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.contacts.model.ContactEntity;
import br.com.guiarural.backend.contacts.repository.ContactRepository;
import br.com.guiarural.backend.courses.repository.CourseRepository;
import br.com.guiarural.backend.map.repository.PlacePhotoRepository;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import br.com.guiarural.backend.map.service.PlaceAssembler;
import br.com.guiarural.backend.map.service.PlaceService;
import br.com.guiarural.backend.services.model.ServiceEntity;
import br.com.guiarural.backend.services.repository.ServiceRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private PlacePhotoRepository photoRepository;

    private PlaceService placeService() {
        return new PlaceService(placeRepository, photoRepository,
                new PlaceAssembler(contactRepository, serviceRepository, courseRepository, photoRepository));
    }

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

        List<PlaceResponseDTO> result = placeService().findPublished(Language.PT);

        assertEquals(1, result.size());
        assertEquals("reitoria", result.get(0).slug());
        assertEquals(-8.0142355, result.get(0).latitude());
    }

    @Test
    @DisplayName("Fase 6: o local sai no idioma pedido, com o português quando falta, e marca tradução automática")
    void shouldResolvePlaceInRequestedLanguage() {
        PlaceEntity place = place(1L, "reitoria", "publicado");
        place.setName("Prédio Central");
        place.setDescription("Sede da administração.");
        place.setNameEn("Central Building");
        place.setDescriptionEn("Administration headquarters.");
        place.setNameEs("Edificio Central");
        place.setMachineTranslatedLangs(new String[]{"en"});
        when(placeRepository.findByStatusOrderByNameAsc("publicado")).thenReturn(List.of(place));

        PlaceResponseDTO en = placeService().findPublished(Language.EN).get(0);
        assertEquals("Central Building", en.name());
        assertEquals("Administration headquarters.", en.description());
        assertEquals("en", en.lang());
        assertTrue(en.machineTranslated());

        // Em espanhol só o nome foi traduzido: a descrição cai para o português e a marca não vale (não está marcado).
        PlaceResponseDTO es = placeService().findPublished(Language.ES).get(0);
        assertEquals("Edificio Central", es.name());
        assertEquals("Sede da administração.", es.description());
        assertEquals("es", es.lang());
        assertFalse(es.machineTranslated());

        PlaceResponseDTO pt = placeService().findPublished(Language.PT).get(0);
        assertEquals("Prédio Central", pt.name());
        assertEquals("pt", pt.lang());
        assertFalse(pt.machineTranslated());
        assertEquals(List.of("en", "es"), pt.translatedLangs());
    }

    @Test
    @DisplayName("Fase 6: local sem tradução volta em português com lang pt, e os cursos ligados saem traduzidos")
    void shouldFallBackToPortugueseAndTranslateLinkedCourses() {
        PlaceEntity place = place(1L, "dc", "publicado");
        place.setCourseIds(new java.util.LinkedHashSet<>(List.of(7L)));
        CourseEntity course = new CourseEntity();
        course.setId(7L);
        course.setName("Ciência da Computação");
        course.setNameEn("Computer Science");
        course.setActive(true);
        when(placeRepository.findBySlugAndStatus("dc", "publicado")).thenReturn(Optional.of(place));
        when(courseRepository.findAllById(any())).thenReturn(List.of(course));

        PlaceResponseDTO en = placeService().findBySlug("dc", Language.EN);

        assertEquals("Local dc", en.name());
        assertEquals("pt", en.lang());
        assertEquals("Computer Science", en.courses().get(0).name());
        assertEquals("Ciência da Computação", placeService().findBySlug("dc", Language.PT).courses().get(0).name());
    }

    @Test
    @DisplayName("Fase 6: departamento por idioma, com fallback e marcador")
    void shouldResolveDepartmentInRequestedLanguage() {
        DepartmentEntity department = new DepartmentEntity();
        department.setId(1L);
        department.setName("Departamento de Computação");
        department.setDescription("Ensino e pesquisa.");
        department.setNameEn("Department of Computing");
        department.setMachineTranslatedLangs(new String[]{"en", "es"});
        when(departmentRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(department));
        when(placeRepository.findAllById(anyList())).thenReturn(List.of());
        DepartmentService service = new DepartmentService(departmentRepository, placeRepository, courseService);

        DepartmentResponseDTO en = service.findAll(Language.EN).get(0);
        assertEquals("Department of Computing", en.name());
        assertEquals("Ensino e pesquisa.", en.description());
        assertEquals("en", en.lang());
        assertTrue(en.machineTranslated());

        // Espanhol está marcado, mas não há texto: sai português, então não é tradução automática.
        DepartmentResponseDTO es = service.findAll(Language.ES).get(0);
        assertEquals("Departamento de Computação", es.name());
        assertEquals("pt", es.lang());
        assertFalse(es.machineTranslated());
        assertEquals(List.of("en"), service.findAll(Language.PT).get(0).translatedLangs());
    }

    @Test
    @DisplayName("Deve lançar 404 para local que não está publicado")
    void shouldThrowWhenPlaceIsNotPublished() {
        when(placeRepository.findBySlugAndStatus("ceu", "publicado")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> placeService().findBySlug("ceu", Language.PT));
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

        List<DepartmentResponseDTO> result = new DepartmentService(departmentRepository, placeRepository, courseService).findAll(Language.PT);

        assertEquals("dc", result.get(0).placeSlug());
        assertNull(result.get(1).placeSlug());
        assertNull(result.get(2).placeSlug());
    }

    private ServiceEntity service(Long id, String name, boolean active) {
        ServiceEntity service = new ServiceEntity();
        service.setId(id);
        service.setName(name);
        service.setActive(active);
        return service;
    }

    @Test
    @DisplayName("Deve montar responsável, serviços ativos em ordem alfabética e a URL versionada da foto")
    void shouldAssembleContactsServicesAndPhoto() {
        PlaceEntity reitoria = place(1L, "reitoria", "publicado");
        reitoria.setServiceIds(new java.util.LinkedHashSet<>(List.of(20L, 10L, 30L)));
        when(placeRepository.findByStatusOrderByNameAsc("publicado")).thenReturn(List.of(reitoria));
        when(serviceRepository.findAllById(any())).thenReturn(List.of(
                service(10L, "Protocolo", true), service(20L, "Atendimento", true), service(30L, "Despublicado", false)));
        when(contactRepository.findByPlaceIdInOrderByIdAsc(any()))
                .thenReturn(List.of(new ContactEntity("Maria", "maria@ufrpe.br", null, 1L)));
        PlacePhotoRepository.PhotoVersion version = mock(PlacePhotoRepository.PhotoVersion.class);
        when(version.getPlaceId()).thenReturn(1L);
        when(version.getUpdatedAt()).thenReturn(java.time.Instant.ofEpochMilli(1234L));
        when(photoRepository.findVersionsByPlaceIds(any())).thenReturn(List.of(version));

        PlaceResponseDTO dto = placeService().findPublished(Language.PT).get(0);

        assertEquals(List.of("Atendimento", "Protocolo"), dto.services().stream().map(l -> l.name()).toList());
        assertEquals("maria@ufrpe.br", dto.contacts().get(0).email());
        assertEquals("/api/places/reitoria/photo?v=1234", dto.photoUrl());
    }

    @Test
    @DisplayName("No painel, serviço despublicado continua aparecendo no vínculo do local")
    void shouldKeepInactiveServicesInAdminView() {
        PlaceEntity reitoria = place(1L, "reitoria", "rascunho");
        reitoria.setServiceIds(new java.util.LinkedHashSet<>(List.of(30L)));
        when(placeRepository.findAllByOrderByNameAsc()).thenReturn(List.of(reitoria));
        when(serviceRepository.findAllById(any())).thenReturn(List.of(service(30L, "Despublicado", false)));

        PlaceResponseDTO dto = placeService().findAllForAdmin().get(0);

        assertEquals(1, dto.services().size());
        assertNull(dto.photoUrl());
    }

    @Test
    @DisplayName("Foto de local que não está publicado dá 404 na rota pública")
    void shouldNotServePhotoOfUnpublishedPlace() {
        when(placeRepository.findBySlugAndStatus("ceu", "publicado")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> placeService().findPublishedPhoto("ceu"));
    }
}
