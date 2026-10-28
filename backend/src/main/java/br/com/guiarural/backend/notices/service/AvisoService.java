package br.com.guiarural.backend.notices.service;

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

    public AvisoService(AvisoRepository avisoRepository) {
        this.avisoRepository = avisoRepository;
    }

    @Transactional
    public AvisoResponseDTO criarAviso(AvisoRequestDTO dto) {
        AvisoEntity aviso = new AvisoEntity(dto.nome(), dto.descricao());
        AvisoEntity salvo = avisoRepository.save(aviso);
        return AvisoResponseDTO.fromEntity(salvo);
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
            .orElseThrow(() -> new RuntimeException("Aviso não encontrado"));
        return AvisoResponseDTO.fromEntity(aviso);
    }

    @Transactional
    public AvisoResponseDTO atualizarAviso(Long id, AvisoRequestDTO dto) {
        AvisoEntity aviso = avisoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Aviso não encontrado"));
        
        aviso.setNome(dto.nome());
        aviso.setDescricao(dto.descricao());
        // A data de criação permanece a mesma (updatable = false na entidade)
        
        AvisoEntity atualizado = avisoRepository.save(aviso);
        return AvisoResponseDTO.fromEntity(atualizado);
    }

    @Transactional
    public void deletarAviso(Long id) {
        if (!avisoRepository.existsById(id)) {
            throw new RuntimeException("Aviso não encontrado");
        }
        avisoRepository.deleteById(id);
    }
}
