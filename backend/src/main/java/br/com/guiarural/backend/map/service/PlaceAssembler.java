package br.com.guiarural.backend.map.service;

import br.com.guiarural.backend.contacts.model.ContactEntity;
import br.com.guiarural.backend.contacts.repository.ContactRepository;
import br.com.guiarural.backend.courses.model.CourseEntity;
import br.com.guiarural.backend.courses.repository.CourseRepository;
import br.com.guiarural.backend.map.dto.PlaceContactDTO;
import br.com.guiarural.backend.map.dto.PlaceLinkDTO;
import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.repository.PlacePhotoRepository;
import br.com.guiarural.backend.services.model.ServiceEntity;
import br.com.guiarural.backend.services.repository.ServiceRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

// Monta o PlaceResponseDTO com tudo o que vem de outras tabelas (responsáveis, serviços, cursos e foto).
// Faz uma consulta por tipo para a lista inteira, em vez de uma por local.
@Component
public class PlaceAssembler {
    private final ContactRepository contactRepository;
    private final ServiceRepository serviceRepository;
    private final CourseRepository courseRepository;
    private final PlacePhotoRepository photoRepository;

    public PlaceAssembler(ContactRepository contactRepository,
                          ServiceRepository serviceRepository,
                          CourseRepository courseRepository,
                          PlacePhotoRepository photoRepository) {
        this.contactRepository = contactRepository;
        this.serviceRepository = serviceRepository;
        this.courseRepository = courseRepository;
        this.photoRepository = photoRepository;
    }

    // publicView: na leitura pública, serviços e cursos despublicados não aparecem; no painel aparecem todos.
    public List<PlaceResponseDTO> assemble(List<PlaceEntity> places, boolean publicView) {
        if (places.isEmpty()) {
            return List.of();
        }
        List<Long> ids = places.stream().map(PlaceEntity::getId).toList();

        Map<Long, List<PlaceContactDTO>> contacts = contactRepository.findByPlaceIdInOrderByIdAsc(ids).stream()
                .collect(Collectors.groupingBy(ContactEntity::getPlaceId,
                        Collectors.mapping(c -> new PlaceContactDTO(c.getName(), c.getEmail()), Collectors.toList())));

        Set<Long> serviceIds = new LinkedHashSet<>();
        Set<Long> courseIds = new LinkedHashSet<>();
        for (PlaceEntity place : places) {
            serviceIds.addAll(place.getServiceIds());
            courseIds.addAll(place.getCourseIds());
        }
        Map<Long, ServiceEntity> services = byId(serviceRepository.findAllById(serviceIds), ServiceEntity::getId);
        Map<Long, CourseEntity> courses = byId(courseRepository.findAllById(courseIds), CourseEntity::getId);

        Map<Long, Long> photoVersions = new HashMap<>();
        photoRepository.findVersionsByPlaceIds(ids)
                .forEach(v -> photoVersions.put(v.getPlaceId(), v.getUpdatedAt().toEpochMilli()));

        return places.stream().map(place -> {
            List<PlaceLinkDTO> serviceLinks = links(place.getServiceIds(), services, ServiceEntity::getName,
                    s -> !publicView || Boolean.TRUE.equals(s.getActive()));
            List<PlaceLinkDTO> courseLinks = links(place.getCourseIds(), courses, CourseEntity::getName,
                    c -> !publicView || Boolean.TRUE.equals(c.getActive()));
            Long version = photoVersions.get(place.getId());
            String photoUrl = version == null ? null : "/api/places/" + place.getSlug() + "/photo?v=" + version;
            return new PlaceResponseDTO(
                    place.getId(),
                    place.getSlug(),
                    place.getName(),
                    place.getShortName(),
                    place.getCategory(),
                    place.getStatus(),
                    place.getLatitude(),
                    place.getLongitude(),
                    place.getCoordinatesSource(),
                    place.getAddress(),
                    place.getHours(),
                    place.getDescription(),
                    place.getPhone(),
                    place.getEmail(),
                    contacts.getOrDefault(place.getId(), List.of()),
                    serviceLinks,
                    courseLinks,
                    photoUrl
            );
        }).toList();
    }

    public PlaceResponseDTO assemble(PlaceEntity place, boolean publicView) {
        return assemble(List.of(place), publicView).get(0);
    }

    private <T> Map<Long, T> byId(Collection<T> items, Function<T, Long> id) {
        return items.stream().collect(Collectors.toMap(id, Function.identity()));
    }

    // Ordem alfabética pelo nome; vínculo cujo item não existe mais é ignorado.
    private <T> List<PlaceLinkDTO> links(Set<Long> ids, Map<Long, T> items, Function<T, String> name, Predicate<T> visible) {
        List<PlaceLinkDTO> links = new ArrayList<>();
        for (Long id : ids) {
            T item = items.get(id);
            if (item != null && visible.test(item)) {
                links.add(new PlaceLinkDTO(id, name.apply(item)));
            }
        }
        links.sort(Comparator.comparing(PlaceLinkDTO::name, String.CASE_INSENSITIVE_ORDER));
        return links;
    }
}
