package br.com.guiarural.backend.messages;

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

import java.time.Duration;
import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// UC39 de ponta a ponta (filtros, CSRF, permissões e validação) contra o H2 em memória.
@SpringBootTest
@AutoConfigureMockMvc
class MessageIntegrationTest {
    private static final String PASSWORD = "senha-so-dos-testes-123";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private PasswordEncoder encoder;

    @BeforeEach
    void seed() {
        jdbc.update("delete from messages");
        jdbc.update("delete from audit_logs");
        jdbc.update("delete from admins");
        insertAdmin(1, "Editora", "editora@ufrpe.br", "editor");
        insertAdmin(2, "Leitora", "leitora@ufrpe.br", "leitura");
    }

    private void insertAdmin(int id, String name, String email, String permission) {
        jdbc.update("insert into admins (id, name, email, sector, permission, status, password_hash) values (?, ?, ?, ?, ?, ?, ?)",
                id, name, email, "Setor", permission, "ativo", encoder.encode(PASSWORD));
    }

    private record Auth(MockHttpSession session, Cookie xsrf) {
        MockHttpServletRequestBuilder write(MockHttpServletRequestBuilder request) {
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

    private int count() {
        return jdbc.queryForObject("select count(*) from messages", Integer.class);
    }

    private void send(String json, int expectedStatus) throws Exception {
        // Sem sessão e sem token CSRF: é assim que chega o visitante.
        mvc.perform(post("/api/messages").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus));
    }

    @Test
    @DisplayName("CT-039.01/03: visitante envia com nome e telefone ou e-mail, sem login nem CSRF")
    void visitorSendsWithContact() throws Exception {
        send("{\"nome\":\"Ana\",\"contato\":\"(81) 99999-9999\",\"mensagem\":\"O mapa demora a carregar.\"}", 204);
        send("{\"nome\":\"Bia\",\"contato\":\"bia@exemplo.com\",\"mensagem\":\"Dúvida sobre o RU.\"}", 204);
        assertEquals(2, count());
    }

    @Test
    @DisplayName("Nome e contato são opcionais; em branco é gravado como nulo")
    void nameAndContactAreOptional() throws Exception {
        send("{\"mensagem\":\"Só a mensagem.\"}", 204);
        send("{\"nome\":\"  \",\"contato\":\"\",\"mensagem\":\"  Com espaços.  \"}", 204);
        assertEquals(2, count());
        assertEquals(2, jdbc.queryForObject("select count(*) from messages where nome is null and contato is null", Integer.class));
        assertEquals(1, jdbc.queryForObject("select count(*) from messages where mensagem = 'Com espaços.'", Integer.class));
    }

    @Test
    @DisplayName("CT-039.02/04: mensagem obrigatória e contato com formato inválido são recusados com erro por campo")
    void invalidInputIsRejected() throws Exception {
        mvc.perform(post("/api/messages").contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Ana\",\"mensagem\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.mensagem").exists());
        mvc.perform(post("/api/messages").contentType(MediaType.APPLICATION_JSON).content("{\"contato\":\"joao@\",\"mensagem\":\"Oi\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.contato").exists());
        send("{\"contato\":\"abc\",\"mensagem\":\"Oi\"}", 400);
        send("{\"contato\":\"12345\",\"mensagem\":\"Oi\"}", 400);
        send("{\"mensagem\":\"" + "x".repeat(1001) + "\"}", 400);
        send("{\"nome\":\"" + "n".repeat(101) + "\",\"mensagem\":\"Oi\"}", 400);
        assertEquals(0, count());
    }

    @Test
    @DisplayName("Só o POST é público: listar e marcar como lida exigem login")
    void readingRequiresLogin() throws Exception {
        send("{\"mensagem\":\"Oi\"}", 204);
        mvc.perform(get("/api/messages")).andExpect(status().isUnauthorized());
        Long id = jdbc.queryForObject("select id from messages", Long.class);
        mvc.perform(patch("/api/messages/" + id).contentType(MediaType.APPLICATION_JSON).content("{\"read\":true}"))
                .andExpect(status().isForbidden());
        assertNull(jdbc.queryForObject("select read_at from messages", java.sql.Timestamp.class));
    }

    @Test
    @DisplayName("Administradores veem as mensagens, mais recentes primeiro; só geral e editor marcam como lida")
    void adminListsAndMarksRead() throws Exception {
        send("{\"nome\":\"Primeira\",\"mensagem\":\"A\"}", 204);
        send("{\"nome\":\"Segunda\",\"mensagem\":\"B\"}", 204);

        Auth editor = login("editora@ufrpe.br");
        MvcResult list = mvc.perform(get("/api/messages").session(editor.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nome").value("Segunda"))
                .andExpect(jsonPath("$[0].read").value(false))
                .andReturn();
        assertNotNull(list);
        Long id = jdbc.queryForObject("select id from messages where nome = 'Segunda'", Long.class);

        // Perfil "leitura" consulta, mas não altera.
        Auth reader = login("leitora@ufrpe.br");
        mvc.perform(get("/api/messages").session(reader.session())).andExpect(status().isOk());
        mvc.perform(reader.write(patch("/api/messages/" + id)).contentType(MediaType.APPLICATION_JSON).content("{\"read\":true}"))
                .andExpect(status().isForbidden());

        mvc.perform(editor.write(patch("/api/messages/" + id)).contentType(MediaType.APPLICATION_JSON).content("{\"read\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true))
                .andExpect(jsonPath("$.readAt").exists());
        mvc.perform(editor.write(patch("/api/messages/" + id)).contentType(MediaType.APPLICATION_JSON).content("{\"read\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(false));
        mvc.perform(editor.write(patch("/api/messages/999999")).contentType(MediaType.APPLICATION_JSON).content("{\"read\":true}"))
                .andExpect(status().isNotFound());
        mvc.perform(editor.write(patch("/api/messages/" + id)).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    private void insertAged(String text, int days) {
        jdbc.update("insert into messages (mensagem, created_at) values (?, ?)", text, OffsetDateTime.now().minus(Duration.ofDays(days)));
    }

    @Test
    @DisplayName("Retenção: mensagens com mais de 15 dias somem da listagem e do banco")
    void listingPurgesMessagesOlderThanFifteenDays() throws Exception {
        insertAged("velha", 16);
        insertAged("recente", 14);

        Auth editor = login("editora@ufrpe.br");
        mvc.perform(get("/api/messages").session(editor.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].mensagem").value("recente"));
        assertEquals(1, count());
    }

    @Test
    @DisplayName("Retenção: enviar uma mensagem também apaga as vencidas")
    void sendingPurgesMessagesOlderThanFifteenDays() throws Exception {
        insertAged("velha", 20);
        send("{\"mensagem\":\"Nova\"}", 204);
        assertEquals(1, count());
        assertEquals(0, jdbc.queryForObject("select count(*) from messages where mensagem = 'velha'", Integer.class));
    }
}
