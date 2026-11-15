package br.com.guiarural.backend.courses.controller;

import br.com.guiarural.backend.courses.dto.CourseDetailResponseDTO;
import br.com.guiarural.backend.courses.dto.CourseSummaryDTO;
import br.com.guiarural.backend.courses.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Leitura do painel, inclusive cursos inativos. Fica em /api/admin, e não em /api/courses, porque tudo que é GET
// debaixo de /api/courses é público (SecurityConfig). Exige só estar logado.
@RestController
@RequestMapping("/api/admin/courses")
public class CourseAdminController {
    private final CourseService service;

    public CourseAdminController(CourseService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CourseSummaryDTO>> findAll() {
        return ResponseEntity.ok(service.findAllForAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDetailResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findByIdForAdmin(id));
    }
}
