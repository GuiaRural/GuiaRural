package br.com.guiarural.backend.notices.service;

import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.guiarural.backend.notices.dto.AvisoRequestDTO;
import br.com.guiarural.backend.notices.dto.AvisoResponseDTO;
import br.com.guiarural.backend.notices.model.AvisoEntity;
import br.com.guiarural.backend.notices.repository.AvisoRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AvisoService {

    private final AvisoRepository avisoRepository;

    private final AuditService auditService;

    public AvisoService(AvisoRepository avisoRepository, AuditService auditService) {
        this.avisoRepository = avisoRepository;
        this.auditService = auditService;
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
        AvisoResponseDTO antes = AvisoResponseDTO.fromEntity(aviso);

        aviso.setNome(dto.nome());
        aviso.setDescricao(dto.descricao());
        // A data de criação permanece a mesma (updatable = false na entidade)
        
        AvisoEntity atualizado = avisoRepository.save(aviso);
        AvisoResponseDTO depois = AvisoResponseDTO.fromEntity(atualizado);
        auditService.record(AuditService.Entity.AVISO, String.valueOf(id), depois.nome(),
                AuditService.Action.EDITADO, antes, depois);
        return depois;
    }

    @Transactional
    public void deletarAviso(Long id) {
        AvisoEntity aviso = avisoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Aviso não encontrado"));
        AvisoResponseDTO antes = AvisoResponseDTO.fromEntity(aviso);
        avisoRepository.delete(aviso);
        auditService.record(AuditService.Entity.AVISO, String.valueOf(id), antes.nome(),
                AuditService.Action.DELETADO, antes, null);
    }
}
