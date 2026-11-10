package br.com.guiarural.backend.login;

import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ConflictException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.login.dto.AdminRequestDTO;
import br.com.guiarural.backend.login.dto.AdminResponseDTO;
import br.com.guiarural.backend.login.dto.AdminUpdateDTO;
import br.com.guiarural.backend.login.model.AdminEntity;
import br.com.guiarural.backend.login.model.AdminPrincipal;
import br.com.guiarural.backend.login.repository.AdminRepository;
import br.com.guiarural.backend.login.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

// UC13: regras do cadastro, da aprovação e da revogação de administradores.
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {
    private static final AdminPrincipal TI = new AdminPrincipal(1L, "Coordenação", "coord.ti@ufrpe.br", "Coordenação de TI", "geral");
    private static final AdminPrincipal PROAC = new AdminPrincipal(2L, "PROAC", "proac@ufrpe.br", "Pró-Reitoria de Assuntos Comunitários", "geral");

    @Mock
    private AdminRepository repository;
    @Mock
    private AuditService auditService;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private AdminService service;

    @BeforeEach
    void setUp() {
        service = new AdminService(repository, encoder, auditService);
    }

    private AdminRequestDTO request(String email) {
        return new AdminRequestDTO(" Maria Silva ", email, "Biblioteca", "editor", "senha-forte-123");
    }

    private AdminEntity stored(long id, String permission, String status) {
        AdminEntity admin = new AdminEntity("Fulana", "fulana@ufrpe.br", "Biblioteca", permission, status, null);
        ReflectionTestUtils.setField(admin, "id", id);
        return admin;
    }

    private void giveIdOnSave() {
        when(repository.saveAndFlush(any(AdminEntity.class))).thenAnswer(inv -> {
            AdminEntity admin = inv.getArgument(0);
            ReflectionTestUtils.setField(admin, "id", 10L);
            return admin;
        });
    }

    @Test
    void create_PelaCoordenacaoDeTi_NasceAtivo_ComHashEAuditoriaSemSenha() {
        giveIdOnSave();
        AdminResponseDTO created = service.create(request("  Maria.Silva@UFRPE.br "), TI);

        assertEquals("ativo", created.status());
        assertEquals("maria.silva@ufrpe.br", created.email());
        assertEquals("Maria Silva", created.name());

        ArgumentCaptor<AdminEntity> saved = ArgumentCaptor.forClass(AdminEntity.class);
        verify(repository).saveAndFlush(saved.capture());
        assertTrue(encoder.matches("senha-forte-123", saved.getValue().getPasswordHash()), "grava o hash BCrypt da senha");

        // O snapshot do histórico é o DTO de resposta, que não tem campo de senha nem de hash.
        verify(auditService).record(eq(AuditService.Entity.ADMINISTRADOR), eq("10"), eq("Maria Silva"),
                eq(AuditService.Action.CRIADO), isNull(), eq(created));
        assertFalse(created.toString().contains("senha-forte-123"));
    }

    @Test
    void create_PorOutroSetor_FicaAguardandoAprovacao() {
        giveIdOnSave();
        assertEquals("aguardando", service.create(request("maria@ufrpe.br"), PROAC).status());
    }

    @Test
    void create_EmailForaDoDominio_Recusa() {
        BadRequestException error = assertThrows(BadRequestException.class, () -> service.create(request("maria@gmail.com"), TI));
        assertEquals("O e-mail deve pertencer ao domínio institucional @ufrpe.br.", error.getMessage());
        assertThrows(BadRequestException.class, () -> service.create(request("maria@ufrpe.br.exemplo.com"), TI));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void create_EmailRepetido_Conflito() {
        when(repository.existsByEmail("maria@ufrpe.br")).thenReturn(true);
        assertThrows(ConflictException.class, () -> service.create(request("maria@ufrpe.br"), TI));
        verifyNoInteractions(auditService);
    }

    @Test
    void create_SenhaAcimaDe72Bytes_Recusa() {
        // 40 caracteres acentuados = 80 bytes: passa no @Size, mas o BCrypt ignoraria o fim.
        AdminRequestDTO dto = new AdminRequestDTO("Maria", "maria@ufrpe.br", "Biblioteca", "editor", "é".repeat(40));
        assertThrows(BadRequestException.class, () -> service.create(dto, TI));
    }

    @Test
    void update_AprovaContaAguardando_EAudita() {
        AdminEntity pending = stored(5, "editor", "aguardando");
        when(repository.findById(5L)).thenReturn(Optional.of(pending));

        AdminResponseDTO after = service.update(5L, new AdminUpdateDTO("ativo", null), TI);

        assertEquals("ativo", after.status());
        verify(auditService).record(eq(AuditService.Entity.ADMINISTRADOR), eq("5"), eq("Fulana"),
                eq(AuditService.Action.EDITADO), any(AdminResponseDTO.class), eq(after));
    }

    @Test
    void update_SemMudanca_NaoAudita() {
        when(repository.findById(5L)).thenReturn(Optional.of(stored(5, "editor", "ativo")));
        service.update(5L, new AdminUpdateDTO("ativo", "editor"), TI);
        verify(repository, never()).saveAndFlush(any());
        verifyNoInteractions(auditService);
    }

    @Test
    void update_PropriaConta_Recusa() {
        when(repository.findById(1L)).thenReturn(Optional.of(stored(1, "geral", "ativo")));
        assertThrows(BadRequestException.class, () -> service.update(1L, new AdminUpdateDTO("revogado", null), TI));
    }

    @Test
    void update_UltimoGeralAtivo_NaoPodeSerRevogadoNemRebaixado() {
        when(repository.findById(5L)).thenReturn(Optional.of(stored(5, "geral", "ativo")));
        when(repository.countByPermissionAndStatus("geral", "ativo")).thenReturn(1L);

        assertThrows(ConflictException.class, () -> service.update(5L, new AdminUpdateDTO("revogado", null), TI));
        assertThrows(ConflictException.class, () -> service.update(5L, new AdminUpdateDTO(null, "editor"), TI));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void update_GeralComOutroGeralAtivo_PodeSerRevogado() {
        when(repository.findById(5L)).thenReturn(Optional.of(stored(5, "geral", "ativo")));
        when(repository.countByPermissionAndStatus("geral", "ativo")).thenReturn(2L);
        assertEquals("revogado", service.update(5L, new AdminUpdateDTO("revogado", null), TI).status());
    }

    @Test
    void update_SemCampos_OuInexistente() {
        assertThrows(BadRequestException.class, () -> service.update(5L, new AdminUpdateDTO(null, null), TI));
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.update(99L, new AdminUpdateDTO("ativo", null), TI));
        verify(auditService, never()).record(any(), anyString(), anyString(), any(), any(), any());
    }
}
