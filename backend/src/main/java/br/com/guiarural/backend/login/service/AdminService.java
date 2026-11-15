package br.com.guiarural.backend.login.service;

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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

// Cadastro, aprovação, troca de perfil e revogação de administradores (UC13). Toda escrita é auditada na mesma
// transação, com o snapshot sem senha nem hash. Não há desfazer para administradores (D5).
@Service
public class AdminService {
    // RN-UC13.01: cadastros feitos pela Coordenação de TI já nascem ativos; os demais aguardam um administrador geral.
    static final String IT_SECTOR = "Coordenação de TI";
    static final String GERAL = "geral";
    static final String ACTIVE = "ativo";
    static final String PENDING = "aguardando";
    // Mesma regra do check da tabela admins.
    private static final Pattern INSTITUTIONAL_EMAIL = Pattern.compile("^[^@\\s]+@ufrpe\\.br$");
    // O BCrypt só considera os primeiros 72 bytes; acentos ocupam mais de um.
    private static final int MAX_PASSWORD_BYTES = 72;

    private final AdminRepository repository;
    private final PasswordEncoder encoder;
    private final AuditService auditService;

    public AdminService(AdminRepository repository, PasswordEncoder encoder, AuditService auditService) {
        this.repository = repository;
        this.encoder = encoder;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<AdminResponseDTO> findAll() {
        return repository.findAllByOrderByNameAscIdAsc().stream().map(AdminResponseDTO::from).toList();
    }

    @Transactional
    public AdminResponseDTO create(AdminRequestDTO dto, AdminPrincipal author) {
        String email = dto.email().trim().toLowerCase(Locale.ROOT);
        if (!INSTITUTIONAL_EMAIL.matcher(email).matches()) {
            throw new BadRequestException("O e-mail deve pertencer ao domínio institucional @ufrpe.br.");
        }
        if (repository.existsByEmail(email)) {
            throw new ConflictException("Já existe um administrador com este e-mail.");
        }
        if (dto.password().getBytes(StandardCharsets.UTF_8).length > MAX_PASSWORD_BYTES) {
            throw new BadRequestException("A senha é longa demais.");
        }
        String status = IT_SECTOR.equals(author.sector()) ? ACTIVE : PENDING;
        AdminEntity admin = new AdminEntity(dto.name().trim(), email, dto.sector().trim(), dto.permission(), status,
                encoder.encode(dto.password()));
        try {
            repository.saveAndFlush(admin);
        } catch (DataIntegrityViolationException e) {
            // Dois cadastros simultâneos com o mesmo e-mail: o índice único decide. Outra violação (ex.: sequência do id
            // atrás de uma linha inserida à mão) não é culpa de quem cadastrou e segue como erro do servidor.
            String cause = String.valueOf(e.getMostSpecificCause().getMessage());
            if (cause.contains("admins_email_key")) {
                throw new ConflictException("Já existe um administrador com este e-mail.");
            }
            throw e;
        }
        AdminResponseDTO created = AdminResponseDTO.from(admin);
        auditService.record(AuditService.Entity.ADMINISTRADOR, String.valueOf(admin.getId()), admin.getName(),
                AuditService.Action.CRIADO, null, created);
        return created;
    }

    @Transactional
    public AdminResponseDTO update(Long id, AdminUpdateDTO dto, AdminPrincipal author) {
        if (dto.status() == null && dto.permission() == null) {
            throw new BadRequestException("Informe o status ou a permissão.");
        }
        AdminEntity admin = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrador não encontrado: " + id));
        // Evita que alguém se tranque fora do painel por engano.
        if (admin.getId().equals(author.id())) {
            throw new BadRequestException("Você não pode alterar o seu próprio acesso.");
        }
        AdminResponseDTO before = AdminResponseDTO.from(admin);
        String status = dto.status() != null ? dto.status() : admin.getStatus();
        String permission = dto.permission() != null ? dto.permission() : admin.getPermission();
        if (status.equals(admin.getStatus()) && permission.equals(admin.getPermission())) {
            return before;
        }

        // A trava segura os gerais ativos até o commit: numa revogação simultânea, a outra transação espera e, ao ler
        // de novo, já não conta quem acabou de ser revogado.
        if (isActiveGeneral(admin.getStatus(), admin.getPermission()) && !isActiveGeneral(status, permission)
                && repository.lockActiveGenerals().size() <= 1) {
            throw new ConflictException("O painel precisa de pelo menos um administrador geral ativo.");
        }

        admin.setStatus(status);
        admin.setPermission(permission);
        repository.saveAndFlush(admin);
        AdminResponseDTO after = AdminResponseDTO.from(admin);
        auditService.record(AuditService.Entity.ADMINISTRADOR, String.valueOf(id), admin.getName(),
                AuditService.Action.EDITADO, before, after);
        return after;
    }

    private static boolean isActiveGeneral(String status, String permission) {
        return ACTIVE.equals(status) && GERAL.equals(permission);
    }
}
