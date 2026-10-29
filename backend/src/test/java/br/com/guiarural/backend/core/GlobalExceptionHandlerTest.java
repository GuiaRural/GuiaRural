package br.com.guiarural.backend.core;

import br.com.guiarural.backend.core.exception.GlobalExceptionHandler;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    record Body(@NotBlank(message = "O nome é obrigatório.") String name) {}

    @RestController
    static class StubController {
        @GetMapping("/stub/{id}")
        String find(@PathVariable Long id) {
            throw new ResourceNotFoundException("Item não encontrado com ID: " + id);
        }

        @PostMapping("/stub")
        String create(@Valid @RequestBody Body body) {
            return body.name();
        }
    }

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new StubController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Deve responder 404 quando o recurso não existe")
    void shouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/stub/7"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Item não encontrado com ID: 7"));
    }

    @Test
    @DisplayName("Deve responder 400 com os campos inválidos")
    void shouldReturnBadRequestWithFieldErrors() throws Exception {
        mockMvc.perform(post("/stub").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\" \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.name").value("O nome é obrigatório."));
    }

    @Test
    @DisplayName("Deve responder 400 para ID que não é número")
    void shouldReturnBadRequestForInvalidId() throws Exception {
        mockMvc.perform(get("/stub/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve responder 400 para JSON malformado")
    void shouldReturnBadRequestForMalformedJson() throws Exception {
        mockMvc.perform(post("/stub").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest());
    }
}
