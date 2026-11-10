package br.com.guiarural.backend.core.audit;

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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.sql.Timestamp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// UC23 (FA01): desfazer pelo histórico para cardápio, aviso, serviço e local, de ponta a ponta contra o H2.
// Para cada um: desfazer uma edição volta o estado anterior, desfazer uma exclusão recria o registro com a mesma
// identificação (id ou slug) e desfazer uma criação exclui. Cada desfazer grava um novo log "restaurado".
@SpringBootTest
@AutoConfigureMockMvc
class RestoreIntegrationTest {
    private static final String PASSWORD = "senha-so-dos-testes-123";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private JsonMapper jsonMapper;

    private Auth editor;

    @BeforeEach
    void seed() throws Exception {
        jdbc.update("delete from audit_logs");
        jdbc.update("delete from place_photos");
        jdbc.update("delete from place_service");
        jdbc.update("delete from place_courses");
        jdbc.update("delete from contacts");
        jdbc.update("delete from guide_topics");
        jdbc.update("delete from places");
        jdbc.update("delete from services");
        jdbc.update("delete from menus");
        jdbc.update("delete from avisos");
        jdbc.update("delete from admins where id in (41, 42)");
        insertAdmin(41, "Editora do histórico", "editora.historico@ufrpe.br", "editor");
        insertAdmin(42, "Leitora do histórico", "leitora.historico@ufrpe.br", "leitura");
        editor = login("editora.historico@ufrpe.br");
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

    private JsonNode send(MockHttpServletRequestBuilder request, String body, int expected) throws Exception {
        MvcResult result = mvc.perform(editor.write(request).content(body)).andReturn();
        assertEquals(expected, result.getResponse().getStatus(), result.getResponse().getContentAsString());
        String content = result.getResponse().getContentAsString();
        return content.isEmpty() ? null : jsonMapper.readTree(content);
    }

    // Último log de uma entidade e ação.
    private long log(String entity, String action) {
        return jdbc.queryForObject("select max(id) from audit_logs where entity = ? and action = ?", Long.class, entity, action);
    }

    private int restore(long logId) throws Exception {
        return mvc.perform(editor.write(post("/api/admin/audit-logs/" + logId + "/restore"))).andReturn().getResponse().getStatus();
    }

    private int restorations(String entity) {
        return jdbc.queryForObject("select count(*) from audit_logs where entity = ? and action = 'restaurado'", Integer.class, entity);
    }

    private static String menu(String date, String main) {
        return "{\"date\":\"" + date + "\",\"shift\":\"almoco\",\"main\":\"" + main + "\",\"vegetarian\":\"Omelete\"}";
    }

    @Test
    @DisplayName("Cardápio: desfaz edição, exclusão (mesmo id) e criação")
    void restoresMenu() throws Exception {
        long id = send(post("/api/menus"), menu("2030-03-12", "Frango"), 201).get("id").asLong();
        long created = log("cardapio", "criado");

        send(put("/api/menus/" + id), menu("2030-03-12", "Peixe"), 200);
        assertEquals(204, restore(log("cardapio", "editado")));
        mvc.perform(get("/api/menus/" + id)).andExpect(jsonPath("$.main").value("Frango"));

        send(delete("/api/menus/" + id), "", 204);
        assertEquals(204, restore(log("cardapio", "deletado")));
        mvc.perform(get("/api/menus/" + id)).andExpect(status().isOk()).andExpect(jsonPath("$.main").value("Frango"));

        assertEquals(204, restore(created));
        mvc.perform(get("/api/menus/" + id)).andExpect(status().isNotFound());
        assertEquals(3, restorations("cardapio"));
        // Desfazer de novo a criação de algo que já não existe não tem efeito: avisa com 409.
        assertEquals(409, restore(created));
    }

    @Test
    @DisplayName("Cardápio: desfazer a exclusão respeita um cardápio por dia e turno (409)")
    void menuRestoreKeepsOnePerShift() throws Exception {
        long first = send(post("/api/menus"), menu("2030-03-13", "Frango"), 201).get("id").asLong();
        send(delete("/api/menus/" + first), "", 204);
        long deleted = log("cardapio", "deletado");
        send(post("/api/menus"), menu("2030-03-13", "Carne"), 201);

        assertEquals(409, restore(deleted));
        mvc.perform(get("/api/menus/" + first)).andExpect(status().isNotFound());
        assertEquals(0, restorations("cardapio"));
    }

    @Test
    @DisplayName("Aviso: desfazer a exclusão devolve o mesmo id e a data de publicação original")
    void restoresNotice() throws Exception {
        long id = send(post("/api/avisos"), "{\"nome\":\"Matrícula\",\"descricao\":\"Prazo até sexta\"}", 201).get("id").asLong();
        Timestamp published = jdbc.queryForObject("select data from avisos where id = ?", Timestamp.class, id);

        send(put("/api/avisos/" + id), "{\"nome\":\"Matrícula adiada\",\"descricao\":\"Novo prazo\"}", 200);
        assertEquals(204, restore(log("aviso", "editado")));
        assertEquals("Matrícula", jdbc.queryForObject("select nome from avisos where id = ?", String.class, id));

        send(delete("/api/avisos/" + id), "", 204);
        assertEquals(204, restore(log("aviso", "deletado")));
        assertEquals("Prazo até sexta", jdbc.queryForObject("select descricao from avisos where id = ?", String.class, id));
        assertEquals(published, jdbc.queryForObject("select data from avisos where id = ?", Timestamp.class, id));
    }

    private static final String SERVICE = "{\"name\":\"Carteira de Estudante\",\"description\":\"Identificação\","
            + "\"category\":\"Documentos\",\"sector\":\"DCE\",\"steps\":[\"Solicite.\"]}";

    @Test
    @DisplayName("Serviço: desfazer a exclusão devolve o mesmo id, publicado e ligado ao local de antes")
    void restoresService() throws Exception {
        long id = send(post("/api/services"), SERVICE, 201).get("id").asLong();
        send(post("/api/places"), "{\"name\":\"Prédio do DCE\",\"category\":\"apoio\",\"status\":\"publicado\","
                + "\"latitude\":-8.0142,\"longitude\":-34.9508,\"serviceIds\":[" + id + "]}", 201);

        send(put("/api/services/" + id), SERVICE.replace("Carteira de Estudante", "Carteirinha"), 200);
        assertEquals(204, restore(log("servico", "editado")));
        mvc.perform(get("/api/services/" + id)).andExpect(jsonPath("$.name").value("Carteira de Estudante"));

        send(delete("/api/services/" + id), "", 204);
        // No PostgreSQL o vínculo cai em cascata com o serviço; aqui é apagado à mão para o teste valer igual.
        jdbc.update("delete from place_service where service_id = ?", id);
        assertEquals(204, restore(log("servico", "deletado")));
        mvc.perform(get("/api/services/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Carteira de Estudante"))
                .andExpect(jsonPath("$.places[0].slug").value("predio-do-dce"));
    }

    private static final String PLACE = "{\"name\":\"Auditório Novo\",\"category\":\"auditorio\",\"status\":\"rascunho\","
            + "\"hours\":\"08:00-18:00\",\"contacts\":[{\"name\":\"Ana\",\"email\":\"ana@ufrpe.br\"}]}";

    @Test
    @DisplayName("Local: desfaz edição e exclusão pelo slug, com o responsável, e desfaz a criação")
    void restoresPlace() throws Exception {
        send(post("/api/places"), PLACE, 201);
        long created = log("local", "criado");

        send(put("/api/places/auditorio-novo"), PLACE.replace("08:00-18:00", "08:00-22:00").replace("Ana", "Bia"), 200);
        assertEquals(204, restore(log("local", "editado")));
        mvc.perform(get("/api/admin/places/auditorio-novo").session(editor.session()))
                .andExpect(jsonPath("$.hours").value("08:00-18:00"))
                .andExpect(jsonPath("$.contacts[0].name").value("Ana"));

        send(delete("/api/places/auditorio-novo"), "", 204);
        assertEquals(204, restore(log("local", "deletado")));
        mvc.perform(get("/api/admin/places/auditorio-novo").session(editor.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contacts[0].email").value("ana@ufrpe.br"));

        assertEquals(204, restore(created));
        mvc.perform(get("/api/admin/places/auditorio-novo").session(editor.session())).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Desfazer é uma escrita: o perfil leitura recebe 403")
    void readerCannotRestore() throws Exception {
        send(post("/api/avisos"), "{\"nome\":\"x\",\"descricao\":\"y\"}", 201);
        Auth reader = login("leitora.historico@ufrpe.br");
        mvc.perform(reader.write(post("/api/admin/audit-logs/" + log("aviso", "criado") + "/restore")))
                .andExpect(status().isForbidden());
        assertEquals(1, jdbc.queryForObject("select count(*) from avisos", Integer.class));
    }
}
