package br.com.guiarural.backend.msg.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.guiarural.backend.msg.dto.MessageRequestDTO;
import br.com.guiarural.backend.msg.dto.MessageResponseDTO;
import br.com.guiarural.backend.msg.model.Message;
import br.com.guiarural.backend.msg.repository.MessageRepository;

import java.util.List;

@Service
public class MessageService {
    private final MessageRepository repository;

    public MessageService(MessageRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public MessageResponseDTO create(MessageRequestDTO requestDTO) {
        Message message = requestDTO.toEntity();
        Message savedMessage = repository.save(message);
        return MessageResponseDTO.fromEntity(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDTO> findAll() {
        return repository.findAll().stream()
            .map(MessageResponseDTO::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public MessageResponseDTO findById(Long id) {
        Message message = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Mensagem não encontrada"));
        return MessageResponseDTO.fromEntity(message);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Mensagem não encontrada para exclusão");
        }
        repository.deleteById(id);
    }
}
