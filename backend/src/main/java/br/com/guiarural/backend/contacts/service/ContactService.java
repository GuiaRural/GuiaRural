package br.com.guiarural.backend.contacts.service;

import br.com.guiarural.backend.contacts.model.ContactEntity;
import br.com.guiarural.backend.contacts.dto.ContactRequestDTO;
import br.com.guiarural.backend.contacts.dto.ContactResponseDTO;
import br.com.guiarural.backend.contacts.repository.ContactRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {
    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @Transactional(readOnly = true)
    public List<ContactResponseDTO> findAll() {
        return contactRepository.findAll().stream()
            .map(ContactResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContactResponseDTO findById(Long id) {
        ContactEntity contact = contactRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Contato não encontrado com o ID fornecido."));
        return ContactResponseDTO.fromEntity(contact);
    }

    @Transactional
    public ContactResponseDTO create(ContactRequestDTO dto) {
        ContactEntity contact = new ContactEntity(dto.name(), dto.email(), dto.phone(), dto.placeId());
        ContactEntity savedContact = contactRepository.save(contact);
        return ContactResponseDTO.fromEntity(savedContact);
    }

    @Transactional
    public ContactResponseDTO update(Long id, ContactRequestDTO dto) {
        ContactEntity contact = contactRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Contato não encontrado para atualização."));
            
        contact.setName(dto.name());
        contact.setEmail(dto.email());
        contact.setPhone(dto.phone());
        contact.setPlaceId(dto.placeId());

        ContactEntity updatedContact = contactRepository.save(contact);
        return ContactResponseDTO.fromEntity(updatedContact);
    }

    @Transactional
    public void delete(Long id) {
        if (!contactRepository.existsById(id)) {
            throw new IllegalArgumentException("Contato não encontrado para exclusão.");
        }
        contactRepository.deleteById(id);
    }    
}
