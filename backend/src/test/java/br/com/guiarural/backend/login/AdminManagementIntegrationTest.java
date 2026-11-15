package br.com.guiarural.backend.login;

import br.com.guiarural.backend.core.exception.ConflictException;
import br.com.guiarural.backend.login.dto.AdminUpdateDTO;
import br.com.guiarural.backend.login.model.AdminEntity;
import br.com.guiarural.backend.login.model.AdminPrincipal;
import br.com.guiarural.backend.login.repository.AdminRepository;
import br.com.guiarural.backend.login.service.AdminService;
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
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// UC13 de ponta a ponta contra o H2: quem pode cadastrar, o status inicial, a senha definida no cadastro valendo no
// login, e a revogação ou troca de perfil valendo na sessão que já estava aberta.
@SpringBootTest
@AutoConfigureMockMvc
class AdminManagementIntegrationTest {
    private static final String PASSWORD = "senha-so-dos-testes-123";
    private static final String NEW_PASSWORD = "outra-senha-dos-testes";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private AdminService adminService;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private TransactionTemplate transactionTemplate;

    @BeforeEach
    void seed() {
        jdbc.update("delete from audit_logs");
        jdbc.update("delete from admins");
        insertAdmin(31, "Coordenação de TI", "geral.ti@ufrpe.br", "Coordenação de TI", "geral");
        insertAdmin(32, "PROAC", "geral.proac@ufrpe.br", "Pró-Reitoria de Assuntos Comunitários", "geral");
        insertAdmin(33, "Editora", "editora.adm@ufrpe.br", "Biblioteca", "editor");
        insertAdmin(34, "Leitora", "leitora.adm@ufrpe.br", "Biblioteca", "leitura");
    }

    private void insertAdmin(int id, String name, String email, String sector, String permission) {
        jdbc.update("insert into admins (id, name, email, sector, permission, status, password_hash) values (?, ?, ?, ?, ?, ?, ?)",
                id, name, email, sector, permission, "ativo", encoder.encode(PASSWORD));
    }

    private record Auth(MockHttpSession session, Cookie xsrf) {
        MockHttpServletRequestBuilder write(MockHttpServletRequestBuilder request) {
            return request.session(session).cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                    .contentType(MediaType.APPLICATION_JSON);
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
        assertNotNull(session);
        Cookie xsrf = mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk())
                .andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf);
        return new Auth(session, xsrf);
    }

    private String newAdmin(String email) {
        return "{\"name\":\"Nova Pessoa\",\"email\":\"" + email + "\",\"sector\":\"Biblioteca\",\"permission\":\"editor\","
                + "\"password\":\"" + NEW_PASSWORD + "\"}";
    }

    private long idOf(String email) {
        return jdbc.queryForObject("select id from admins where email = ?", Long.class, email);
    }

    @Test
    @DisplayName("Listar exige login; cadastrar e alterar exigem o perfil geral")
    void onlyGeneralWrites() throws Exception {
        mvc.perform(get("/api/admin/admins")).andExpect(status().isUnauthorized());
        Auth reader = login("leitora.adm@ufrpe.br");
        mvc.perform(get("/api/admin/admins").session(reader.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4));

        Auth editor = login("editora.adm@ufrpe.br");
        mvc.perform(editor.write(post("/api/admin/admins")).content(newAdmin("nova@ufrpe.br"))).andExpect(status().isForbidden());
        mvc.perform(editor.write(patch("/api/admin/admins/34")).content("{\"status\":\"revogado\"}")).andExpect(status().isForbidden());
        assertEquals(4, jdbc.queryForObject("select count(*) from admins", Integer.class));
    }

    @Test
    @DisplayName("Cadastro pela Coordenação de TI nasce ativo, entra com a senha definida e o histórico não guarda senha")
    void createdByItCanLogIn() throws Exception {
        Auth ti = login("geral.ti@ufrpe.br");

        MvcResult created = mvc.perform(ti.write(post("/api/admin/admins")).content(newAdmin(" Nova@UFRPE.br ")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("nova@ufrpe.br"))
                .andExpect(jsonPath("$.status").value("ativo"))
                .andReturn();
        String body = created.getResponse().getContentAsString();
        assertFalse(body.toLowerCase().contains("password"));
        assertFalse(body.contains("$2"));

        assertEquals(200, loginAttempt("nova@ufrpe.br", NEW_PASSWORD).getResponse().getStatus());

        String snapshot = jdbc.queryForObject("select after_state from audit_logs where entity = 'administrador'", String.class);
        assertFalse(snapshot.toLowerCase().contains("password"));
        assertFalse(snapshot.contains("$2"));
        assertFalse(snapshot.contains(NEW_PASSWORD));
    }

    @Test
    @DisplayName("RN-UC13.01: cadastro por outro setor aguarda aprovação e só entra depois de aprovado")
    void otherSectorNeedsApproval() throws Exception {
        Auth proac = login("geral.proac@ufrpe.br");
        mvc.perform(proac.write(post("/api/admin/admins")).content(newAdmin("pendente@ufrpe.br")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("aguardando"));
        assertEquals(403, loginAttempt("pendente@ufrpe.br", NEW_PASSWORD).getResponse().getStatus());

        mvc.perform(proac.write(patch("/api/admin/admins/" + idOf("pendente@ufrpe.br"))).content("{\"status\":\"ativo\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ativo"));
        assertEquals(200, loginAttempt("pendente@ufrpe.br", NEW_PASSWORD).getResponse().getStatus());
    }

    @Test
    @DisplayName("Erros do formulário: domínio, campos em branco e e-mail repetido")
    void formErrors() throws Exception {
        Auth ti = login("geral.ti@ufrpe.br");
        mvc.perform(ti.write(post("/api/admin/admins")).content(newAdmin("alguem@gmail.com"))).andExpect(status().isBadRequest());
        mvc.perform(ti.write(post("/api/admin/admins")).content("{\"name\":\"\",\"email\":\"x@ufrpe.br\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.name").exists())
                .andExpect(jsonPath("$.fields.password").exists());
        mvc.perform(ti.write(post("/api/admin/admins")).content(newAdmin("editora.adm@ufrpe.br"))).andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Revogar encerra a sessão já aberta da conta revogada")
    void revokingEndsOpenSession() throws Exception {
        Auth editor = login("editora.adm@ufrpe.br");
        Auth ti = login("geral.ti@ufrpe.br");

        mvc.perform(ti.write(patch("/api/admin/admins/33")).content("{\"status\":\"revogado\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("revogado"));

        mvc.perform(get("/api/auth/me").session(editor.session())).andExpect(status().isUnauthorized());
        assertEquals(403, loginAttempt("editora.adm@ufrpe.br", PASSWORD).getResponse().getStatus());
    }

    @Test
    @DisplayName("Trocar o perfil vale na sessão aberta, sem novo login")
    void permissionChangeAppliesToOpenSession() throws Exception {
        Auth editor = login("editora.adm@ufrpe.br");
        Auth ti = login("geral.ti@ufrpe.br");

        mvc.perform(ti.write(patch("/api/admin/admins/33")).content("{\"permission\":\"leitura\"}")).andExpect(status().isOk());

        mvc.perform(get("/api/auth/me").session(editor.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.permission").value("leitura"));
        mvc.perform(editor.write(post("/api/avisos")).content("{\"nome\":\"Aviso\",\"descricao\":\"Texto\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Ninguém altera o próprio acesso; outro geral pode ser revogado")
    void cannotChangeOwnAccess() throws Exception {
        Auth ti = login("geral.ti@ufrpe.br");
        mvc.perform(ti.write(patch("/api/admin/admins/31")).content("{\"status\":\"revogado\"}")).andExpect(status().isBadRequest());
        mvc.perform(ti.write(patch("/api/admin/admins/31")).content("{\"permission\":\"leitura\"}")).andExpect(status().isBadRequest());

        mvc.perform(ti.write(patch("/api/admin/admins/32")).content("{\"status\":\"revogado\"}")).andExpect(status().isOk());
        mvc.perform(ti.write(patch("/api/admin/admins/999")).content("{\"status\":\"ativo\"}")).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("A consulta que trava os gerais ativos roda no banco e devolve só eles, em ordem de id")
    void locksActiveGeneralsOrderedById() {
        insertAdmin(30, "Outro geral", "outro.geral@ufrpe.br", "Biblioteca", "geral");
        jdbc.update("update admins set status = 'aguardando' where id = 30");
        insertAdmin(35, "Geral novo", "geral.novo@ufrpe.br", "Biblioteca", "geral");

        // PESSIMISTIC_WRITE exige transação: fora dela o JPA recusa a consulta.
        List<Long> ids = transactionTemplate.execute(tx -> adminRepository.lockActiveGenerals().stream().map(AdminEntity::getId).toList());

        assertEquals(List.of(31L, 32L, 35L), ids);
    }

    @Test
    @DisplayName("Com um só geral ativo, revogá-lo ou rebaixá-lo é recusado (regra com trava, chamada direto no serviço)")
    void lastActiveGeneralIsProtected() {
        // Pela API isso só acontece em corrida (quem pede é geral ativo e não altera a própria conta); aqui o 31 deixa
        // de ser geral para o 32 ficar sozinho.
        jdbc.update("update admins set permission = 'editor' where id = 31");
        AdminPrincipal author = new AdminPrincipal(31L, "Coordenação de TI", "geral.ti@ufrpe.br", "Coordenação de TI", "geral");

        assertThrows(ConflictException.class, () -> adminService.update(32L, new AdminUpdateDTO("revogado", null), author));
        assertThrows(ConflictException.class, () -> adminService.update(32L, new AdminUpdateDTO(null, "editor"), author));

        assertEquals("ativo", jdbc.queryForObject("select status from admins where id = 32", String.class));
        assertEquals("geral", jdbc.queryForObject("select permission from admins where id = 32", String.class));
        assertEquals(0, jdbc.queryForObject("select count(*) from audit_logs", Integer.class));
    }
}
