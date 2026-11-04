package br.com.guiarural.backend.contacts;

import br.com.guiarural.backend.contacts.model.ContactEntity;
import br.com.guiarural.backend.contacts.dto.ContactRequestDTO;
import br.com.guiarural.backend.contacts.dto.ContactResponseDTO;
import br.com.guiarural.backend.contacts.repository.ContactRepository;
import br.com.guiarural.backend.contacts.service.ContactService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContactServiceTest {
    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    private ContactService contactService;

    private ContactEntity mockContact;
    private ContactRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        mockContact = new ContactEntity("João Silva", "joao@email.com", "81999999999", 1L);
        mockContact.setId(10L);

        requestDTO = new ContactRequestDTO("João Silva", "joao@email.com", "81999999999", 1L);
    }

    @Test
    void create_ShouldReturnContactResponseDTO() {
        when(contactRepository.save(any(ContactEntity.class))).thenReturn(mockContact);

        ContactResponseDTO response = contactService.create(requestDTO);

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals("João Silva", response.name());
        assertEquals(1L, response.placeId());
        
        verify(contactRepository, times(1)).save(any(ContactEntity.class));
    }

    @Test
    void update_ShouldUpdateAndReturnContact_WhenExists() {
        when(contactRepository.findById(10L)).thenReturn(Optional.of(mockContact));
        when(contactRepository.save(any(ContactEntity.class))).thenReturn(mockContact);

        ContactRequestDTO updateDTO = new ContactRequestDTO("Nome Alterado", "novo@email.com", "81888888888", 1L);

        ContactResponseDTO response = contactService.update(10L, updateDTO);

        assertNotNull(response);
        assertEquals("Nome Alterado", mockContact.getName());
        verify(contactRepository, times(1)).save(mockContact);
    }

    @Test
    void findById_ShouldThrowException_WhenNotFound() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> contactService.findById(99L));
            
        assertEquals("Contato não encontrado com o ID fornecido.", exception.getMessage());
    }
}
