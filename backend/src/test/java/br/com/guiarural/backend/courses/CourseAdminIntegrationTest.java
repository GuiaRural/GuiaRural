package br.com.guiarural.backend.courses;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Fase 5a (UC35, UC36 e cadastro) de ponta a ponta contra o H2: quem pode escrever, leitura do painel com inativos,
// regras do serviço e histórico.
@SpringBootTest
@AutoConfigureMockMvc
class CourseAdminIntegrationTest {
    private static final String PASSWORD = "senha-so-dos-testes-123";
    private static final long DEPARTMENT = 501;
    private static final long INACTIVE_DEPARTMENT = 502;

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private JsonMapper jsonMapper;

    @BeforeEach
    void seed() {
        jdbc.update("delete from audit_logs");
        jdbc.update("delete from curriculum_subjects");
        jdbc.update("delete from courses");
        jdbc.update("delete from departments where id in (?, ?)", DEPARTMENT, INACTIVE_DEPARTMENT);
        jdbc.update("insert into departments (id, name, active) values (?, ?, ?)", DEPARTMENT, "Departamento de Computação", true);
        jdbc.update("insert into departments (id, name, active) values (?, ?, ?)", INACTIVE_DEPARTMENT, "Departamento extinto", false);
        jdbc.update("delete from admins where id in (51, 52, 53)");
        insertAdmin(51, "Geral de cursos", "geral.cursos@ufrpe.br", "geral");
        insertAdmin(52, "Editor de cursos", "editor.cursos@ufrpe.br", "editor");
        insertAdmin(53, "Leitor de cursos", "leitor.cursos@ufrpe.br", "leitura");
    }

    private void insertAdmin(int id, String name, String email, String permission) {
        jdbc.update("insert into admins (id, name, email, sector, permission, status, password_hash) values (?, ?, ?, ?, ?, ?, ?)",
                id, name, email, "Setor", permission, "ativo", encoder.encode(PASSWORD));
    }

    private record Auth(MockHttpSession session, Cookie xsrf) {
        MockHttpServletRequestBuilder write(MockHttpServletRequestBuilder request) {
            return request.session(session).cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                    .contentType(MediaType.APPLICATION_JSON);
        }
    }

    private Auth login(String email) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\",\"remember\":false}")).andReturn();
        assertEquals(200, result.getResponse().getStatus());
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        assertNotNull(session);
        Cookie xsrf = mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk())
                .andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf);
        return new Auth(session, xsrf);
    }

    private static String course(long departmentId, String name, String level, String type, boolean active) {
        return "{\"departmentId\":" + departmentId + ",\"name\":\"" + name + "\",\"level\":\"" + level + "\",\"type\":\""
                + type + "\",\"modality\":\"Presencial\",\"shift\":\"  \",\"coordinatorName\":\"Profa. Coordenadora\","
                + "\"email\":\"coord.cc@ufrpe.br\",\"active\":" + active + "}";
    }

    private static String course(String name) {
        return course(DEPARTMENT, name, "GRADUACAO", "BACHARELADO", true);
    }

    private long create(Auth auth, String body) throws Exception {
        String json = mvc.perform(auth.write(post("/api/courses")).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return jsonMapper.readTree(json).get("id").asLong();
    }

    private int count(String sql, Object... args) {
        return jdbc.queryForObject(sql, Integer.class, args);
    }

    @Test
    @DisplayName("Sem login: escrita e leitura do painel dão 401; a leitura pública continua aberta")
    void anonymousCannotWrite() throws Exception {
        Cookie xsrf = mvc.perform(get("/api/courses")).andExpect(status().isOk()).andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf);

        mvc.perform(post("/api/courses").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                .contentType(MediaType.APPLICATION_JSON).content(course("Curso"))).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/courses/1").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                .contentType(MediaType.APPLICATION_JSON).content(course("Curso"))).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/courses/1").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue()))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/courses")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/courses/1")).andExpect(status().isUnauthorized());
        assertEquals(0, count("select count(*) from courses"));
    }

    @Test
    @DisplayName("Perfil leitura: consulta o painel, mas criar, editar e excluir dão 403")
    void readerCannotWrite() throws Exception {
        long id = create(login("editor.cursos@ufrpe.br"), course("Agronomia"));
        Auth reader = login("leitor.cursos@ufrpe.br");

        mvc.perform(reader.write(post("/api/courses")).content(course("Outro"))).andExpect(status().isForbidden());
        mvc.perform(reader.write(put("/api/courses/" + id)).content(course("Renomeado"))).andExpect(status().isForbidden());
        mvc.perform(reader.write(delete("/api/courses/" + id))).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/courses").session(reader.session())).andExpect(status().isOk());
        assertEquals("Agronomia", jdbc.queryForObject("select name from courses where id = ?", String.class, id));
    }

    @Test
    @DisplayName("Editor cria, edita e exclui; cada passo vai para o histórico como 'curso'")
    void editorWritesAndAudits() throws Exception {
        Auth editor = login("editor.cursos@ufrpe.br");

        long id = create(editor, course("Ciência da Computação"));
        mvc.perform(get("/api/courses/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ciência da Computação"))
                .andExpect(jsonPath("$.shift").doesNotExist())
                .andExpect(jsonPath("$.coordination.email").value("coord.cc@ufrpe.br"))
                .andExpect(jsonPath("$.departmentName").value("Departamento de Computação"));

        mvc.perform(editor.write(put("/api/courses/" + id)).content(course("Ciência da Computação (noturno)")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ciência da Computação (noturno)"));

        mvc.perform(editor.write(delete("/api/courses/" + id))).andExpect(status().isNoContent());
        mvc.perform(get("/api/courses/" + id)).andExpect(status().isNotFound());
        mvc.perform(editor.write(delete("/api/courses/" + id))).andExpect(status().isNotFound());

        assertEquals(1, count("select count(*) from audit_logs where entity = 'curso' and action = 'criado' and before_state is null"));
        assertEquals(1, count("select count(*) from audit_logs where entity = 'curso' and action = 'editado'"));
        assertEquals(1, count("select count(*) from audit_logs where entity = 'curso' and action = 'deletado' and after_state is null"));
    }

    @Test
    @DisplayName("Geral também escreve; o painel vê o curso inativo que a rota pública esconde")
    void generalWritesAndAdminSeesInactive() throws Exception {
        Auth general = login("geral.cursos@ufrpe.br");

        long id = create(general, course(DEPARTMENT, "Licenciatura em Computação", "GRADUACAO", "LICENCIATURA", false));

        mvc.perform(get("/api/courses/" + id)).andExpect(status().isNotFound());
        mvc.perform(get("/api/admin/courses/" + id).session(general.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
        mvc.perform(get("/api/admin/courses").session(general.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].active").value(false));
    }

    @Test
    @DisplayName("400: nome em branco, nível × tipo incompatíveis e departamento inexistente ou inativo; 404 ao editar inexistente")
    void rejectsInvalidCourses() throws Exception {
        Auth editor = login("editor.cursos@ufrpe.br");

        mvc.perform(editor.write(post("/api/courses")).content(course(" ")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.name").exists());
        mvc.perform(editor.write(post("/api/courses")).content(course(DEPARTMENT, "Mestrado", "POS", "BACHARELADO", true)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("Nível e tipo incompatíveis")));
        mvc.perform(editor.write(post("/api/courses")).content(course(INACTIVE_DEPARTMENT, "Curso", "GRADUACAO", "BACHARELADO", true)))
                .andExpect(status().isBadRequest());
        mvc.perform(editor.write(post("/api/courses")).content(course(999, "Curso", "GRADUACAO", "BACHARELADO", true)))
                .andExpect(status().isBadRequest());
        mvc.perform(editor.write(put("/api/courses/999")).content(course("Curso"))).andExpect(status().isNotFound());
        assertEquals(0, count("select count(*) from courses"));
        assertEquals(0, count("select count(*) from audit_logs"));
    }

    @Test
    @DisplayName("UC36: excluir o curso apaga a matriz curricular junto")
    void deleteRemovesCurriculum() throws Exception {
        Auth editor = login("editor.cursos@ufrpe.br");
        long id = create(editor, course("Zootecnia"));
        jdbc.update("insert into curriculum_subjects (course_id, period, code, name, workload_hours, nature) values (?, ?, ?, ?, ?, ?)",
                id, 1, "ZOO101", "Introdução à Zootecnia", 60, "OBRIGATORIA");
        jdbc.update("insert into curriculum_subjects (course_id, period, code, name, workload_hours, nature) values (?, ?, ?, ?, ?, ?)",
                id, null, "ZOO900", "Optativa", 30, "OPTATIVA");

        mvc.perform(editor.write(delete("/api/courses/" + id))).andExpect(status().isNoContent());

        assertEquals(0, count("select count(*) from curriculum_subjects where course_id = ?", id));
        assertEquals(0, count("select count(*) from courses where id = ?", id));
    }
}
