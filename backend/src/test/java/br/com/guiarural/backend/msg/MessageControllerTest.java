package br.com.guiarural.backend.msg;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.guiarural.backend.msg.dto.MessageRequestDTO;
import br.com.guiarural.backend.msg.dto.MessageResponseDTO;
import br.com.guiarural.backend.msg.model.Message;
import br.com.guiarural.backend.msg.repository.MessageRepository;
import br.com.guiarural.backend.msg.service.MessageService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MessageControllerTest {
    @Mock
    private MessageRepository repository;

    @InjectMocks
    private MessageService service;

    @Test
    @DisplayName("Deve criar uma mensagem com sucesso")
    void shouldCreateMessageSuccessfully() {
        MessageRequestDTO requestDTO = new MessageRequestDTO(
                "Estudante Teste",
                "teste@ufrpe.br",
                "81999999999",
                "Dúvida sobre localização do restaurante"
        );

        Message savedEntity = new Message(
                "Estudante Teste",
                "teste@ufrpe.br",
                "81999999999",
                "Dúvida sobre localização do restaurante"
        );
        savedEntity.setId(1L);

        when(repository.save(any(Message.class))).thenReturn(savedEntity);

        MessageResponseDTO responseDTO = service.create(requestDTO);

        assertNotNull(responseDTO);
        assertEquals(1L, responseDTO.id());
        assertEquals("Estudante Teste", responseDTO.nome());
        assertEquals("teste@ufrpe.br", responseDTO.email());
        assertEquals("81999999999", responseDTO.telefone());
        assertEquals("Dúvida sobre localização do restaurante", responseDTO.mensagem());

        verify(repository, times(1)).save(any(Message.class));
    }

    @Test
    @DisplayName("Deve listar todas as mensagens com sucesso")
    void shouldFindAllMessagesSuccessfully() {
        Message msg1 = new Message("Maria", "maria@ufrpe.br", "81988888888", "Mensagem 1");
        msg1.setId(1L);
        
        Message msg2 = new Message("João", "joao@ufrpe.br", "81977777777", "Mensagem 2");
        msg2.setId(2L);

        List<Message> entities = List.of(msg1, msg2);

        when(repository.findAll()).thenReturn(entities);

        List<MessageResponseDTO> result = service.findAll();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Maria", result.get(0).nome());
        assertEquals("João", result.get(1).nome());

        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve buscar uma mensagem por ID com sucesso")
    void shouldFindMessageByIdSuccessfully() {
        Long messageId = 1L;
        Message existingEntity = new Message(
                "Carlos",
                "carlos@ufrpe.br",
                "81966666666",
                "Como chego no CEAGO?"
        );
        existingEntity.setId(messageId);

        when(repository.findById(messageId)).thenReturn(Optional.of(existingEntity));

        MessageResponseDTO responseDTO = service.findById(messageId);

        assertNotNull(responseDTO);
        assertEquals(messageId, responseDTO.id());
        assertEquals("Carlos", responseDTO.nome());
        assertEquals("carlos@ufrpe.br", responseDTO.email());

        verify(repository, times(1)).findById(messageId);
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar uma mensagem inexistente")
    void shouldThrowExceptionWhenMessageNotFound() {
        Long messageId = 99L;

        when(repository.findById(messageId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.findById(messageId));
        assertEquals("Mensagem não encontrada", exception.getMessage());

        verify(repository, times(1)).findById(messageId);
    }

    @Test
    @DisplayName("Deve deletar uma mensagem existente por ID com sucesso")
    void shouldDeleteMessageSuccessfully() {
        Long messageId = 1L;

        when(repository.existsById(messageId)).thenReturn(true);
        doNothing().when(repository).deleteById(messageId);

        assertDoesNotThrow(() -> service.delete(messageId));

        verify(repository, times(1)).existsById(messageId);
        verify(repository, times(1)).deleteById(messageId);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar uma mensagem inexistente")
    void shouldThrowExceptionWhenDeletingNonExistentMessage() {
        Long messageId = 99L;

        when(repository.existsById(messageId)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.delete(messageId));
        assertEquals("Mensagem não encontrada para exclusão", exception.getMessage());

        verify(repository, times(1)).existsById(messageId);
        verify(repository, never()).deleteById(anyLong());
    }
}
