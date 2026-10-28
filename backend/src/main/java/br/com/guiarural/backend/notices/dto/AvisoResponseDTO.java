package br.com.guiarural.backend.notices.dto;

import java.time.LocalDateTime;
import br.com.guiarural.backend.notices.model.AvisoEntity;

public record AvisoResponseDTO(
    Long id, 
    String nome, 
    String descricao, 
    LocalDateTime data
) {
    public static AvisoResponseDTO fromEntity(AvisoEntity aviso) {
        return new AvisoResponseDTO(
            aviso.getId(), 
            aviso.getNome(), 
            aviso.getDescricao(), 
            aviso.getData()
        );
    }
}
