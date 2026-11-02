package br.com.guiarural.backend.contacts.dto;

import br.com.guiarural.backend.contacts.model.ContactEntity;

public record ContactResponseDTO (
    Long id,
    String name,
    String email,
    String phone,
    Long placeId
) {
    public static ContactResponseDTO fromEntity(ContactEntity contact) {
        return new ContactResponseDTO(
            contact.getId(),
            contact.getName(),
            contact.getEmail(),
            contact.getPhone(),
            contact.getPlaceId()
        );
    }
}
