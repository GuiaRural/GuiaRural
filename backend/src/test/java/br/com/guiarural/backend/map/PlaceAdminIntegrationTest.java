package br.com.guiarural.backend.map;

import br.com.guiarural.backend.courses.model.CourseEntity;
import br.com.guiarural.backend.courses.repository.CourseRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.AbstractMockHttpServletRequestBuilder;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// CRUD de locais pelo painel (UC14 a UC16) de ponta a ponta contra o H2: segurança, regras do UC14, vínculos com
// serviços e cursos, responsável, foto e histórico de auditoria.
@SpringBootTest
@AutoConfigureMockMvc
class PlaceAdminIntegrationTest {
    private static final String PASSWORD = "senha-so-dos-testes-123";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private CourseRepository courseRepository;

    @BeforeEach
    void seed() {
        // Ordem: tabelas que apontam para outras primeiro.
        jdbc.update("delete from audit_logs");
        jdbc.update("delete from place_photos");
        jdbc.update("delete from place_service");
        jdbc.update("delete from place_courses");
        jdbc.update("delete from contacts");
        jdbc.update("delete from guide_topics");
        jdbc.update("delete from places");
        jdbc.update("delete from services");
        jdbc.update("delete from courses");
        jdbc.update("delete from admins where id in (21, 22)");
        insertAdmin(21, "Editor de locais", "editor.locais@ufrpe.br", "editor");
        insertAdmin(22, "Leitor de locais", "leitor.locais@ufrpe.br", "leitura");
    }

    private void insertAdmin(int id, String name, String email, String permission) {
        jdbc.update("insert into admins (id, name, email, sector, permission, status, password_hash) values (?, ?, ?, ?, ?, ?, ?)",
                id, name, email, "Setor", permission, "ativo", encoder.encode(PASSWORD));
    }

    private record Auth(MockHttpSession session, Cookie xsrf) {
        // Genérico: a requisição multipart tem outro tipo de builder que a comum (Spring 7).
        <B extends AbstractMockHttpServletRequestBuilder<B>> B write(B request) {
            return request.session(session).cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue());
        }
    }

    private Auth login(String email) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\",\"remember\":false}")).andReturn();
        assertEquals(200, result.getResponse().getStatus());
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        assertNotNull(session);
        MvcResult me = mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk()).andReturn();
        Cookie xsrf = me.getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf);
        return new Auth(session, xsrf);
    }

    private int count(String sql, Object... args) {
        return jdbc.queryForObject(sql, Integer.class, args);
    }

    private String place(String name, String status, String extra) {
        String coordinates = "publicado".equals(status) ? "\"latitude\":-8.0142,\"longitude\":-34.9508," : "";
        return "{\"name\":\"" + name + "\",\"category\":\"sala\",\"status\":\"" + status + "\"," + coordinates
                + (extra == null ? "" : extra + ",") + "\"description\":\"Descrição\"}";
    }

    private byte[] png() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(40, 30, BufferedImage.TYPE_INT_RGB), "png", out);
        return out.toByteArray();
    }

    @Test
    @DisplayName("Criar, editar e excluir local exige login e perfil geral ou editor")
    void writesNeedLoginAndPermission() throws Exception {
        String body = place("Auditório", "rascunho", null);
        Cookie xsrf = mvc.perform(get("/api/places")).andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf);

        mvc.perform(post("/api/places").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnauthorized());

        Auth reader = login("leitor.locais@ufrpe.br");
        mvc.perform(reader.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
        mvc.perform(reader.write(delete("/api/places/auditorio"))).andExpect(status().isForbidden());
        // O perfil "leitura" consulta, mas a lista do painel exige só estar logado.
        mvc.perform(get("/api/admin/places").session(reader.session())).andExpect(status().isOk());
        mvc.perform(get("/api/admin/places")).andExpect(status().isUnauthorized());
        assertEquals(0, count("select count(*) from places"));
    }

    @Test
    @DisplayName("Cria com slug gerado do nome, grava o histórico e mostra rascunho só no painel")
    void createsPlaceAndAudits() throws Exception {
        Auth editor = login("editor.locais@ufrpe.br");

        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                        .content(place("Prédio de Letras e Artes", "rascunho", "\"hours\":\"08:00-18:00\"")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("predio-de-letras-e-artes"))
                .andExpect(jsonPath("$.status").value("rascunho"))
                .andExpect(jsonPath("$.hours").value("08:00-18:00"));

        assertEquals(1, count("select count(*) from audit_logs where entity = 'local' and action = 'criado' and entity_id = ?",
                "predio-de-letras-e-artes"));
        // Rascunho não aparece na leitura pública nem na página do local; aparece no painel.
        mvc.perform(get("/api/places")).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/places/predio-de-letras-e-artes")).andExpect(status().isNotFound());
        mvc.perform(get("/api/admin/places").session(editor.session())).andExpect(jsonPath("$.length()").value(1));

        // Mesmo nome de novo: o slug ganha sufixo em vez de falhar.
        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                        .content(place("Prédio de Letras e Artes", "rascunho", null)))
                .andExpect(jsonPath("$.slug").value("predio-de-letras-e-artes-2"));
    }

    @Test
    @DisplayName("Regras do UC14: publicar exige coordenadas, slug informado não se repete e slug não muda")
    void enforcesPlaceRules() throws Exception {
        Auth editor = login("editor.locais@ufrpe.br");

        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Sem posição\",\"category\":\"sala\",\"status\":\"publicado\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Só latitude\",\"category\":\"sala\",\"status\":\"rascunho\",\"latitude\":-8.0}"))
                .andExpect(status().isBadRequest());
        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Categoria ruim\",\"category\":\"laboratorio\",\"status\":\"rascunho\"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                .content(place("Biblioteca", "publicado", "\"slug\":\"biblioteca\""))).andExpect(status().isCreated());
        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                .content(place("Outra", "publicado", "\"slug\":\"biblioteca\""))).andExpect(status().isConflict());
        mvc.perform(editor.write(put("/api/places/biblioteca")).contentType(MediaType.APPLICATION_JSON)
                .content(place("Biblioteca", "publicado", "\"slug\":\"novo-endereco\""))).andExpect(status().isBadRequest());
        mvc.perform(editor.write(put("/api/places/nao-existe")).contentType(MediaType.APPLICATION_JSON)
                .content(place("X", "rascunho", null))).andExpect(status().isNotFound());
        assertEquals(1, count("select count(*) from places"));
    }

    @Test
    @DisplayName("Vincula serviços, cursos e responsável; o serviço mostra os locais publicados em /api/services")
    void linksServicesCoursesAndContacts() throws Exception {
        jdbc.update("insert into services (id, name, description, category, sector, steps, active) values (1, 'Atendimento psicológico', 'd', 'Saúde', 'PRAE', ?, true)",
                (Object) new String[]{"Agendar"});
        CourseEntity course = new CourseEntity();
        course.setName("Ciência da Computação");
        course.setDepartmentId(1L);
        course.setActive(true);
        Long courseId = courseRepository.save(course).getId();
        Auth editor = login("editor.locais@ufrpe.br");

        String extra = "\"serviceIds\":[1],\"courseIds\":[" + courseId + "],"
                + "\"contacts\":[{\"name\":\"Maria Souza\",\"email\":\"maria@ufrpe.br\"}]";
        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                        .content(place("Prédio da PRAE", "publicado", "\"slug\":\"prae\"," + extra)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.services[0].name").value("Atendimento psicológico"))
                .andExpect(jsonPath("$.courses[0].name").value("Ciência da Computação"))
                .andExpect(jsonPath("$.contacts[0].email").value("maria@ufrpe.br"));

        mvc.perform(get("/api/places/prae"))
                .andExpect(jsonPath("$.services[0].id").value(1))
                .andExpect(jsonPath("$.contacts[0].name").value("Maria Souza"));
        mvc.perform(get("/api/services"))
                .andExpect(jsonPath("$[0].places[0].slug").value("prae"))
                .andExpect(jsonPath("$[0].places[0].name").value("Prédio da PRAE"));

        // Despublicar o local tira o vínculo da página pública de serviços; o painel continua vendo.
        mvc.perform(editor.write(put("/api/places/prae")).contentType(MediaType.APPLICATION_JSON)
                        .content(place("Prédio da PRAE", "rascunho", extra)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/services")).andExpect(jsonPath("$[0].places.length()").value(0));

        // Editar sem os vínculos remove serviços, cursos e responsável.
        mvc.perform(editor.write(put("/api/places/prae")).contentType(MediaType.APPLICATION_JSON)
                        .content(place("Prédio da PRAE", "rascunho", "\"serviceIds\":[],\"courseIds\":[],\"contacts\":[]")))
                .andExpect(jsonPath("$.services.length()").value(0))
                .andExpect(jsonPath("$.contacts.length()").value(0));
        assertEquals(0, count("select count(*) from place_service"));
        assertEquals(0, count("select count(*) from contacts"));

        // Serviço ou curso que não existe é recusado.
        mvc.perform(editor.write(put("/api/places/prae")).contentType(MediaType.APPLICATION_JSON)
                        .content(place("Prédio da PRAE", "rascunho", "\"serviceIds\":[999]")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Foto: envia, aparece na URL versionada, só é pública com o local publicado e some ao excluir")
    void managesPhoto() throws Exception {
        Auth editor = login("editor.locais@ufrpe.br");
        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                .content(place("RU", "publicado", "\"slug\":\"ru\""))).andExpect(status().isCreated());
        mvc.perform(get("/api/places/ru/photo")).andExpect(status().isNotFound());

        mvc.perform(editor.write(multipart(HttpMethod.PUT, "/api/places/ru/photo")
                        .file(new MockMultipartFile("file", "foto.png", "image/png", png()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.photoUrl").value(org.hamcrest.Matchers.startsWith("/api/places/ru/photo?v=")));
        mvc.perform(get("/api/places/ru/photo"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"));
        mvc.perform(get("/api/places")).andExpect(jsonPath("$[0].photoUrl").exists());

        // Arquivo que não é imagem é recusado e a foto anterior continua.
        mvc.perform(editor.write(multipart(HttpMethod.PUT, "/api/places/ru/photo")
                        .file(new MockMultipartFile("file", "foto.png", "image/png", "texto".getBytes()))))
                .andExpect(status().isBadRequest());
        assertEquals(1, count("select count(*) from place_photos"));

        // Despublicado, o local não entrega a foto pela rota pública.
        mvc.perform(editor.write(put("/api/places/ru")).contentType(MediaType.APPLICATION_JSON)
                .content(place("RU", "rascunho", null))).andExpect(status().isOk());
        mvc.perform(get("/api/places/ru/photo")).andExpect(status().isNotFound());

        mvc.perform(editor.write(delete("/api/places/ru/photo")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.photoUrl").doesNotExist());
        assertEquals(0, count("select count(*) from place_photos"));
        // Trocar e remover a foto também entram no histórico (criação + duas edições de foto + uma edição de status).
        assertEquals(4, count("select count(*) from audit_logs where entity = 'local' and entity_id = 'ru'"));
    }

    @Test
    @DisplayName("Excluir o local apaga contatos e foto e registra o histórico com o estado anterior")
    void deletesPlaceWithItsData() throws Exception {
        Auth editor = login("editor.locais@ufrpe.br");
        mvc.perform(editor.write(post("/api/places")).contentType(MediaType.APPLICATION_JSON)
                .content(place("Casa", "publicado", "\"slug\":\"casa\",\"contacts\":[{\"name\":\"Ana\",\"email\":\"ana@ufrpe.br\"}]")))
                .andExpect(status().isCreated());
        mvc.perform(editor.write(multipart(HttpMethod.PUT, "/api/places/casa/photo")
                .file(new MockMultipartFile("file", "f.png", "image/png", png())))).andExpect(status().isOk());

        mvc.perform(editor.write(delete("/api/places/casa"))).andExpect(status().isNoContent());

        assertEquals(0, count("select count(*) from places"));
        assertEquals(0, count("select count(*) from contacts"));
        assertEquals(0, count("select count(*) from place_photos"));
        assertEquals(1, count("select count(*) from audit_logs where entity = 'local' and action = 'deletado' and before_state is not null and after_state is null"));
        mvc.perform(editor.write(delete("/api/places/casa"))).andExpect(status().isNotFound());
    }
}
