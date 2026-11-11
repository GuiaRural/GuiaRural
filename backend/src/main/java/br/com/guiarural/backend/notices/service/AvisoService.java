package br.com.guiarural.backend.notices.service;

import br.com.guiarural.backend.core.audit.AuditLogEntity;
import br.com.guiarural.backend.core.audit.AuditRestorer;
import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.ConflictException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.guiarural.backend.notices.dto.AvisoRequestDTO;
import br.com.guiarural.backend.notices.dto.AvisoResponseDTO;
import br.com.guiarural.backend.notices.model.AvisoEntity;
import br.com.guiarural.backend.notices.repository.AvisoRepository;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AvisoService implements AuditRestorer {

    private final AvisoRepository avisoRepository;

    private final AuditService auditService;

    private final JsonMapper jsonMapper;

    public AvisoService(AvisoRepository avisoRepository, AuditService auditService, JsonMapper jsonMapper) {
        this.avisoRepository = avisoRepository;
        this.auditService = auditService;
        this.jsonMapper = jsonMapper;
    }

    @Transactional
    public AvisoResponseDTO criarAviso(AvisoRequestDTO dto) {
        AvisoEntity aviso = new AvisoEntity(dto.nome(), dto.descricao());
        AvisoEntity salvo = avisoRepository.save(aviso);
        AvisoResponseDTO criado = AvisoResponseDTO.fromEntity(salvo);
        auditService.record(AuditService.Entity.AVISO, String.valueOf(salvo.getId()), salvo.getNome(),
                AuditService.Action.CRIADO, null, criado);
        return criado;
    }

    @Transactional(readOnly = true)
    public List<AvisoResponseDTO> listarAvisos() {
        return avisoRepository.findAll().stream()
            .map(AvisoResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AvisoResponseDTO buscarPorId(Long id) {
        AvisoEntity aviso = avisoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Aviso não encontrado"));
        return AvisoResponseDTO.fromEntity(aviso);
    }

    @Transactional
    public AvisoResponseDTO atualizarAviso(Long id, AvisoRequestDTO dto) {
        AvisoEntity aviso = avisoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Aviso não encontrado"));
        return atualizar(aviso, dto.nome(), dto.descricao(), AuditService.Action.EDITADO);
    }

    @Transactional
    public void deletarAviso(Long id) {
        AvisoEntity aviso = avisoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Aviso não encontrado"));
        deletar(aviso, AuditService.Action.DELETADO);
    }

    @Override
    public AuditService.Entity entity() {
        return AuditService.Entity.AVISO;
    }

    // UC23: desfaz a mudança do log. Criação -> exclui; edição ou exclusão -> volta ao estado anterior (recriando com
    // o id e a data originais, se o aviso não existe mais).
    @Override
    @Transactional
    public void restore(AuditLogEntity log) {
        Long id = Long.valueOf(log.getEntityId());
        AvisoEntity atual = avisoRepository.findById(id).orElse(null);
        if (log.getBeforeState() == null) {
            if (atual == null) {
                throw new ConflictException("Este aviso já foi excluído; não há o que desfazer.");
            }
            deletar(atual, AuditService.Action.RESTAURADO);
            return;
        }
        AvisoResponseDTO anterior = jsonMapper.readValue(log.getBeforeState(), AvisoResponseDTO.class);
        if (atual != null) {
            atualizar(atual, anterior.nome(), anterior.descricao(), AuditService.Action.RESTAURADO);
            return;
        }
        AvisoEntity recriado = avisoRepository.saveAndFlush(new AvisoEntity(anterior.nome(), anterior.descricao()));
        avisoRepository.restoreIdAndDate(recriado.getId(), id,
                anterior.data() != null ? anterior.data() : recriado.getData());
        AvisoResponseDTO depois = AvisoResponseDTO.fromEntity(avisoRepository.findById(id).orElseThrow());
        auditService.record(AuditService.Entity.AVISO, String.valueOf(id), depois.nome(),
                AuditService.Action.RESTAURADO, null, depois);
    }

    private AvisoResponseDTO atualizar(AvisoEntity aviso, String nome, String descricao, AuditService.Action acao) {
        AvisoResponseDTO antes = AvisoResponseDTO.fromEntity(aviso);

        aviso.setNome(nome);
        aviso.setDescricao(descricao);
        // A data de criação permanece a mesma (updatable = false na entidade)

        AvisoEntity atualizado = avisoRepository.save(aviso);
        AvisoResponseDTO depois = AvisoResponseDTO.fromEntity(atualizado);
        auditService.record(AuditService.Entity.AVISO, String.valueOf(aviso.getId()), depois.nome(), acao, antes, depois);
        return depois;
    }

    private void deletar(AvisoEntity aviso, AuditService.Action acao) {
        AvisoResponseDTO antes = AvisoResponseDTO.fromEntity(aviso);
        avisoRepository.delete(aviso);
        auditService.record(AuditService.Entity.AVISO, String.valueOf(aviso.getId()), antes.nome(), acao, antes, null);
    }
}
