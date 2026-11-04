package br.com.guiarural.backend.contacts.model;

import jakarta.persistence.*;

@Entity
@Table(name = "contacts")
public class ContactEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    // Mapeado como Long conforme solicitado. 
    // No banco de dados (Supabase), esta coluna deve ter a constraint de Foreign Key para a tabela 'places'.
    @Column(name = "place_id", nullable = false)
    private Long placeId;

    public ContactEntity() {}

    public ContactEntity(String name, String email, String phone, Long placeId) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.placeId = placeId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public Long getPlaceId() { return placeId; }
    public void setPlaceId(Long placeId) { this.placeId = placeId; }
}
