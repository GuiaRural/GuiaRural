package br.com.guiarural.backend.courses.controller;

import br.com.guiarural.backend.courses.dto.CourseDetailResponseDTO;
import br.com.guiarural.backend.courses.dto.CourseRequestDTO;
import br.com.guiarural.backend.courses.dto.CourseSummaryDTO;
import br.com.guiarural.backend.courses.service.CourseService;
import br.com.guiarural.backend.info.model.Language;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Leitura pública (só cursos ativos). Criar, editar e excluir exigem perfil geral ou editor (SecurityConfig).
@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseService service;

    public CourseController(CourseService service) {
        this.service = service;
    }

    // ?lang=pt|en|es (padrão pt); sem tradução, o texto vem em português.
    @GetMapping
    public ResponseEntity<List<CourseSummaryDTO>> findAll(@RequestParam(required = false) String lang) {
        return ResponseEntity.ok(service.findAll(Language.from(lang)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDetailResponseDTO> findById(@PathVariable Long id,
                                                            @RequestParam(required = false) String lang) {
        return ResponseEntity.ok(service.findById(id, Language.from(lang)));
    }

    @PostMapping
    public ResponseEntity<CourseDetailResponseDTO> create(@Valid @RequestBody CourseRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // UC35
    @PutMapping("/{id}")
    public ResponseEntity<CourseDetailResponseDTO> update(@PathVariable Long id, @Valid @RequestBody CourseRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // UC36: exclusão definitiva, junto com a matriz curricular.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
