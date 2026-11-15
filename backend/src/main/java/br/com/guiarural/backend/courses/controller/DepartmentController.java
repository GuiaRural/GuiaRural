package br.com.guiarural.backend.courses.controller;

import br.com.guiarural.backend.courses.dto.DepartmentCoursesResponseDTO;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.courses.dto.DepartmentResponseDTO;
import br.com.guiarural.backend.courses.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }

    @GetMapping
    // ?lang=pt|en|es (padrão pt); nome e descrição sem tradução vêm em português.
    public ResponseEntity<List<DepartmentResponseDTO>> findAll(@RequestParam(required = false) String lang) {
        return ResponseEntity.ok(service.findAll(Language.from(lang)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> findById(@PathVariable Long id, @RequestParam(required = false) String lang) {
        return ResponseEntity.ok(service.findById(id, Language.from(lang)));
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<DepartmentCoursesResponseDTO> findCourses(@PathVariable Long id,
                                                                    @RequestParam(required = false) String lang) {
        return ResponseEntity.ok(service.findCourses(id, Language.from(lang)));
    }
}
