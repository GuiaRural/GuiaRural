package br.com.guiarural.backend.map.service;

import br.com.guiarural.backend.courses.model.CourseEntity;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.repository.CourseRepository;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import br.com.guiarural.backend.map.dto.SearchSuggestionDTO;
import br.com.guiarural.backend.map.dto.SearchType;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SearchService {
    // RN-01.03 do UC01: sugestões só a partir de 3 caracteres.
    public static final int MIN_CHARS = 3;
    // RN-UC38-01: só os resultados mais relevantes, para não poluir a lista.
    public static final int MAX_SUGGESTIONS = 8;

    private record Hit(SearchSuggestionDTO suggestion, int rank) {}

    private final PlaceRepository placeRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;

    public SearchService(PlaceRepository placeRepository,
                         DepartmentRepository departmentRepository,
                         CourseRepository courseRepository) {
        this.placeRepository = placeRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
    }

    // O catálogo do campus é pequeno, então o filtro roda em memória: assim a busca ignora acentos e
    // maiúsculas sem depender de extensão do Postgres (unaccent).
    @Transactional(readOnly = true)
    public List<SearchSuggestionDTO> search(String query) {
        String q = normalize(query);
        if (q.length() < MIN_CHARS) {
            return List.of();
        }

        List<Hit> hits = new ArrayList<>();

        for (PlaceEntity place : placeRepository.findByStatusOrderByNameAsc(PlaceService.PUBLISHED)) {
            int rank = rank(q, place.getName(), place.getShortName());
            if (rank >= 0) {
                hits.add(new Hit(new SearchSuggestionDTO(SearchType.PLACE, place.getId(), place.getSlug(),
                        place.getName(), place.getCategory()), rank));
            }
        }

        for (DepartmentEntity department : departmentRepository.findByActiveTrueOrderByNameAsc()) {
            int rank = rank(q, department.getName(), department.getShortName());
            if (rank >= 0) {
                hits.add(new Hit(new SearchSuggestionDTO(SearchType.DEPARTMENT, department.getId(), null,
                        department.getName(), null), rank));
            }
        }

        List<CourseEntity> courses = courseRepository.findByActiveTrue().stream()
                .filter(course -> rank(q, course.getName()) >= 0)
                .toList();
        Set<Long> departmentIds = courses.stream().map(CourseEntity::getDepartmentId).collect(Collectors.toSet());
        Map<Long, String> departmentNames = new HashMap<>();
        departmentRepository.findAllById(departmentIds)
                .forEach(department -> departmentNames.put(department.getId(), department.getName()));
        for (CourseEntity course : courses) {
            hits.add(new Hit(new SearchSuggestionDTO(SearchType.COURSE, course.getId(), null, course.getName(),
                    departmentNames.get(course.getDepartmentId())), rank(q, course.getName())));
        }

        return hits.stream()
                .sorted(Comparator.comparingInt(Hit::rank)
                        .thenComparing(hit -> hit.suggestion().type())
                        .thenComparing(hit -> hit.suggestion().name(), String.CASE_INSENSITIVE_ORDER))
                .limit(MAX_SUGGESTIONS)
                .map(Hit::suggestion)
                .toList();
    }

    // 0 = algum campo começa com o termo, 1 = algum campo contém o termo, -1 = não casa.
    private int rank(String q, String... fields) {
        int best = -1;
        for (String field : fields) {
            if (field == null) {
                continue;
            }
            String value = normalize(field);
            if (value.startsWith(q)) {
                return 0;
            }
            if (value.contains(q)) {
                best = 1;
            }
        }
        return best;
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }
        return Normalizer.normalize(text.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }
}
