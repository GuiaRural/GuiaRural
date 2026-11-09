package br.com.guiarural.backend;

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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Fluxo real de segurança (filtros, sessão, CSRF, permissões e auditoria) contra um H2 em memória.
@SpringBootTest
@AutoConfigureMockMvc
class AdminSecurityIntegrationTest {
    // Senha só destes testes, usada para gerar hashes descartáveis no H2.
    private static final String PASSWORD = "senha-so-dos-testes-123";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private PasswordEncoder encoder;

    @BeforeEach
    void seed() {
        jdbc.update("delete from audit_logs");
        jdbc.update("delete from avisos");
        jdbc.update("delete from services");
        jdbc.update("delete from guide_topics");
        jdbc.update("delete from admins");
        insertAdmin(1, "Editora", "editora@ufrpe.br", "editor", "ativo");
        insertAdmin(2, "Leitora", "leitora@ufrpe.br", "leitura", "ativo");
        insertAdmin(3, "Revogado", "revogado@ufrpe.br", "editor", "revogado");
    }

    private void insertAdmin(int id, String name, String email, String permission, String status) {
        jdbc.update("insert into admins (id, name, email, sector, permission, status, password_hash) values (?, ?, ?, ?, ?, ?, ?)",
                id, name, email, "Setor", permission, status, encoder.encode(PASSWORD));
    }

    // Sessão (cookie do servidor) e token CSRF (cookie legível pelo JavaScript), como o navegador os guardaria.
    private record Auth(MockHttpSession session, Cookie xsrf) {
        MockHttpServletRequestBuilder write(MockHttpServletRequestBuilder request) {
            return request.session(session).cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue());
        }
    }

    private MvcResult loginAttempt(String email, String password) throws Exception {
        return mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\",\"remember\":false}")).andReturn();
    }

    private Auth login(String email) throws Exception {
        MvcResult result = loginAttempt(email, PASSWORD);
        assertEquals(200, result.getResponse().getStatus());
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        assertNotNull(session, "o login deve criar a sessão");
        // O cookie CSRF chega em qualquer resposta; /me é só uma leitura leve para obtê-lo.
        MvcResult me = mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk()).andReturn();
        Cookie xsrf = me.getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf, "a resposta deve trazer o cookie XSRF-TOKEN");
        return new Auth(session, xsrf);
    }

    private int count(String sql, Object... args) {
        return jdbc.queryForObject(sql, Integer.class, args);
    }

    @Test
    @DisplayName("Leituras públicas funcionam sem login")
    void publicReadsNeedNoLogin() throws Exception {
        mvc.perform(get("/api/avisos")).andExpect(status().isOk());
        mvc.perform(get("/api/guide/recife")).andExpect(status().isOk());
        mvc.perform(get("/api/guide/topics").param("section", "cultura")).andExpect(status().isOk());
        mvc.perform(get("/api/places")).andExpect(status().isOk());
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("Dados internos exigem login: mensagens, contatos, traduções e histórico")
    void protectedReadsRequireLogin() throws Exception {
        mvc.perform(get("/api/messages")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/contacts")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/guide/translations/topics").param("section", "cultura")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/audit-logs")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("O formulário de contato continua público, sem sessão nem token CSRF")
    void contactFormStaysPublic() throws Exception {
        // Corpo vazio: chega à validação (400), não é barrado por login (401) nem por CSRF (403).
        mvc.perform(post("/api/messages").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Escrever sem login é recusado (401 com token CSRF, 403 sem ele)")
    void writesRequireLogin() throws Exception {
        String body = "{\"nome\":\"Aviso\",\"descricao\":\"Texto\"}";

        // Token CSRF válido, obtido como o navegador obtém: num GET qualquer. Não usamos o csrf() do spring-security-test
        // porque ele troca o repositório de token do filtro para todos os testes seguintes.
        Cookie xsrf = mvc.perform(get("/api/avisos")).andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf);
        mvc.perform(post("/api/avisos").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/avisos").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
        assertEquals(0, count("select count(*) from avisos"));
    }

    @Test
    @DisplayName("Login: e-mail fora do domínio, senha errada e conta revogada recebem respostas distintas e seguras")
    void loginFailures() throws Exception {
        assertEquals(400, loginAttempt("alguem@gmail.com", PASSWORD).getResponse().getStatus());

        MvcResult wrong = loginAttempt("editora@ufrpe.br", "senha-errada");
        assertEquals(401, wrong.getResponse().getStatus());
        MvcResult ghost = loginAttempt("fantasma@ufrpe.br", "qualquer");
        assertEquals(401, ghost.getResponse().getStatus());
        // Mesma resposta para conta inexistente e senha errada.
        assertEquals(wrong.getResponse().getContentAsString(), ghost.getResponse().getContentAsString());

        MvcResult blocked = loginAttempt("revogado@ufrpe.br", PASSWORD);
        assertEquals(403, blocked.getResponse().getStatus());
        assertEquals(true, blocked.getResponse().getContentAsString().contains("blocked"));
    }

    @Test
    @DisplayName("Login correto devolve o administrador, sem hash de senha")
    void loginSucceeds() throws Exception {
        MvcResult result = loginAttempt("Editora@UFRPE.br", PASSWORD);

        assertEquals(200, result.getResponse().getStatus());
        String body = result.getResponse().getContentAsString();
        assertEquals(true, body.contains("\"permission\":\"editor\""));
        assertEquals(false, body.toLowerCase().contains("password"));
        assertEquals(false, body.contains("$2"));
    }

    @Test
    @DisplayName("Depois de 5 erros a conta é barrada com 429 e Retry-After, mesmo com a senha certa")
    void rateLimitsRepeatedFailures() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertEquals(401, loginAttempt("leitora@ufrpe.br", "errada-" + i).getResponse().getStatus());
        }

        MvcResult limited = loginAttempt("leitora@ufrpe.br", PASSWORD);

        assertEquals(429, limited.getResponse().getStatus());
        assertNotNull(limited.getResponse().getHeader("Retry-After"));
    }

    @Test
    @DisplayName("Cada login troca o identificador da sessão (anti fixação de sessão)")
    void loginChangesSessionId() throws Exception {
        MockHttpSession previous = new MockHttpSession();
        String previousId = previous.getId();

        MvcResult result = mvc.perform(post("/api/auth/login").session(previous).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"editora@ufrpe.br\",\"password\":\"" + PASSWORD + "\",\"remember\":true}")).andReturn();

        assertEquals(200, result.getResponse().getStatus());
        assertNotEquals(previousId, result.getRequest().getSession(false).getId());
    }

    @Test
    @DisplayName("Editor cria, edita e exclui aviso com CSRF, e cada escrita fica no histórico")
    void editorWritesAreAudited() throws Exception {
        Auth editor = login("editora@ufrpe.br");

        MvcResult created = mvc.perform(editor.write(post("/api/avisos")).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Manutenção\",\"descricao\":\"Sábado\"}"))
                .andExpect(status().isCreated()).andReturn();
        String id = created.getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        mvc.perform(editor.write(put("/api/avisos/" + id)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Manutenção adiada\",\"descricao\":\"Domingo\"}")).andExpect(status().isOk());
        mvc.perform(editor.write(delete("/api/avisos/" + id))).andExpect(status().isNoContent());

        assertEquals(0, count("select count(*) from avisos"));
        assertEquals(3, count("select count(*) from audit_logs where entity = 'aviso' and entity_id = ? and author = 'Editora' and admin_id = 1", id));
        assertEquals(1, count("select count(*) from audit_logs where action = 'criado' and before_state is null and after_state is not null"));
        assertEquals(1, count("select count(*) from audit_logs where action = 'deletado' and after_state is null and before_state is not null"));
        mvc.perform(editor.write(delete("/api/avisos/" + id))).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Escrita com sessão mas sem o cabeçalho CSRF é recusada")
    void writeWithoutCsrfHeaderIsForbidden() throws Exception {
        Auth editor = login("editora@ufrpe.br");

        mvc.perform(post("/api/avisos").session(editor.session()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"x\",\"descricao\":\"y\"}")).andExpect(status().isForbidden());
        assertEquals(0, count("select count(*) from avisos"));
    }

    @Test
    @DisplayName("Permissão \"leitura\" consulta mas não escreve")
    void readOnlyAdminCannotWrite() throws Exception {
        Auth reader = login("leitora@ufrpe.br");

        mvc.perform(get("/api/admin/audit-logs").session(reader.session())).andExpect(status().isOk());
        mvc.perform(reader.write(post("/api/avisos")).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"x\",\"descricao\":\"y\"}")).andExpect(status().isForbidden());
        mvc.perform(reader.write(post("/api/guide/topics")).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        assertEquals(0, count("select count(*) from audit_logs"));
    }

    @Test
    @DisplayName("Logout encerra a sessão: a mesma sessão deixa de valer")
    void logoutEndsSession() throws Exception {
        Auth editor = login("editora@ufrpe.br");

        mvc.perform(editor.write(post("/api/auth/logout"))).andExpect(status().isNoContent());

        mvc.perform(get("/api/auth/me").session(editor.session())).andExpect(status().isUnauthorized());
    }

    private static final String TOPIC = "{\"section\":\"cultura\",\"stage\":null,"
            + "\"title\":{\"pt\":\"Conheça o campus\",\"en\":\"Know the campus\",\"es\":null},"
            + "\"summary\":{\"pt\":\"Resumo\",\"en\":null,\"es\":null},"
            + "\"blocks\":{\"pt\":[{\"type\":\"p\",\"text\":\"Olá\"}],\"en\":[{\"type\":\"p\",\"text\":\"Hello\"}],\"es\":null},"
            + "\"links\":{\"pt\":[],\"en\":null,\"es\":null},\"source\":{\"pt\":\"Cartilha\",\"en\":null,\"es\":null},"
            + "\"placeSlug\":null,\"fullyTranslatedLangs\":[\"en\"]}";

    @Test
    @DisplayName("Tópico do guia: criar aparece na página pública, excluir some, e desfazer traz de volta")
    void guideTopicLifecycle() throws Exception {
        Auth editor = login("editora@ufrpe.br");

        mvc.perform(editor.write(post("/api/guide/topics")).contentType(MediaType.APPLICATION_JSON).content(TOPIC))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("conheca-o-campus"));
        mvc.perform(get("/api/guide/topics").param("section", "cultura").param("lang", "en"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Know the campus"))
                .andExpect(jsonPath("$[0].fullyTranslated").value(true));
        mvc.perform(editor.write(post("/api/guide/topics")).contentType(MediaType.APPLICATION_JSON)
                .content(TOPIC.replace("{\"section\"", "{\"slug\":\"conheca-o-campus\",\"section\"")))
                .andExpect(status().isConflict());

        mvc.perform(editor.write(delete("/api/guide/topics/conheca-o-campus"))).andExpect(status().isNoContent());
        mvc.perform(get("/api/guide/topics").param("section", "cultura")).andExpect(jsonPath("$").isEmpty());

        Long deleteLog = jdbc.queryForObject(
                "select id from audit_logs where entity = 'acolhimento' and action = 'deletado'", Long.class);
        mvc.perform(editor.write(post("/api/admin/audit-logs/" + deleteLog + "/restore"))).andExpect(status().isNoContent());

        mvc.perform(get("/api/guide/topics/conheca-o-campus").param("lang", "en"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Know the campus"));
        assertEquals(1, count("select count(*) from audit_logs where action = 'restaurado' and entity_id = 'conheca-o-campus'"));
        mvc.perform(get("/api/guide/translations/topics/conheca-o-campus").session(editor.session()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", org.hamcrest.Matchers.containsString("json")))
                .andExpect(jsonPath("$.title.en").value("Know the campus"));
    }

    @Test
    @DisplayName("Desfazer não é suportado para entidades sem restaurador (ex.: aviso)")
    void restoreUnsupportedEntity() throws Exception {
        Auth editor = login("editora@ufrpe.br");
        mvc.perform(editor.write(post("/api/avisos")).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"x\",\"descricao\":\"y\"}")).andExpect(status().isCreated());
        Long id = jdbc.queryForObject("select id from audit_logs where entity = 'aviso'", Long.class);

        mvc.perform(editor.write(post("/api/admin/audit-logs/" + id + "/restore"))).andExpect(status().isBadRequest());
    }

    private static final String SERVICE = "{\"name\":\"Carteira de Estudante\",\"description\":\"Identificação estudantil\","
            + "\"category\":\"Documentos\",\"sector\":\"DCE\",\"steps\":[\"Separe os documentos.\",\"  \",\"Solicite.\"],"
            + "\"requirements\":\"Declaração de vínculo\",\"url\":\"https://dce.example.org\",\"deadline\":null}";

    @Test
    @DisplayName("Serviços: editor cadastra, o público vê só os publicados e o painel vê todos")
    void servicesPublicVersusAdminView() throws Exception {
        Auth editor = login("editora@ufrpe.br");

        mvc.perform(editor.write(post("/api/services")).contentType(MediaType.APPLICATION_JSON).content(SERVICE))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.steps.length()").value(2))
                .andExpect(jsonPath("$.category").value("Documentos"));
        mvc.perform(editor.write(post("/api/services")).contentType(MediaType.APPLICATION_JSON)
                .content(SERVICE.replace("Carteira de Estudante", "Rascunho").replace("\"deadline\":null", "\"active\":false")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.active").value(false));

        mvc.perform(get("/api/services")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Carteira de Estudante"));
        Long draftId = jdbc.queryForObject("select id from services where name = ?", Long.class, "Rascunho");
        mvc.perform(get("/api/services/" + draftId)).andExpect(status().isNotFound());

        mvc.perform(get("/api/admin/services")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/services").session(editor.session())).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        assertEquals(2, count("select count(*) from audit_logs where entity = ? and action = ? and author = ?", "servico", "criado", "Editora"));
    }

    @Test
    @DisplayName("Serviços: o servidor recusa dados inválidos mesmo que o formulário os deixe passar")
    void servicesRejectInvalidInput() throws Exception {
        Auth editor = login("editora@ufrpe.br");

        mvc.perform(editor.write(post("/api/services")).contentType(MediaType.APPLICATION_JSON)
                .content(SERVICE.replace("\"steps\":[\"Separe os documentos.\",\"  \",\"Solicite.\"]", "\"steps\":[]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.steps").exists());
        mvc.perform(editor.write(post("/api/services")).contentType(MediaType.APPLICATION_JSON)
                .content(SERVICE.replace("https://dce.example.org", "http://dce.example.org")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.url").exists());
        mvc.perform(editor.write(post("/api/services")).contentType(MediaType.APPLICATION_JSON)
                .content(SERVICE.replace("\"category\":\"Documentos\"", "\"category\":\"  \"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.category").exists());
        assertEquals(0, count("select count(*) from services"));
    }

    @Test
    @DisplayName("Serviços: perfil leitura consulta o painel mas não cadastra")
    void readOnlyAdminCannotCreateService() throws Exception {
        Auth reader = login("leitora@ufrpe.br");

        mvc.perform(get("/api/admin/services").session(reader.session())).andExpect(status().isOk());
        mvc.perform(reader.write(post("/api/services")).contentType(MediaType.APPLICATION_JSON).content(SERVICE))
                .andExpect(status().isForbidden());
        assertEquals(0, count("select count(*) from services"));
    }
}
