package br.com.guiarural.backend.map.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

// Uma foto por local, já reduzida e em JPEG (ver PhotoProcessor). Mora em tabela própria para a lista do mapa
// nunca carregar os bytes: só o endpoint da foto os lê.
@Entity
@Table(name = "place_photos")
public class PlacePhotoEntity {
    @Id
    @Column(name = "place_id")
    private Long placeId;

    @Column(nullable = false)
    private String contentType;

    // VARBINARY explícito, com o maior length que o H2 dos testes aceita (1 MB): acima disso o Hibernate escolhe BLOB,
    // que o H2 não conhece, e sem length ele limitaria a coluna a 255 bytes. No PostgreSQL a coluna é bytea e o length
    // é ignorado. O limite de verdade é o check da migration (5 MB) e o do PhotoProcessor, que ainda reduz a imagem
    // (uma foto de 1280 px em JPEG fica em algumas centenas de KB).
    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(nullable = false, length = 1_048_576)
    private byte[] bytes;

    @Column(nullable = false)
    private Instant updatedAt;

    public PlacePhotoEntity() {
    }

    public PlacePhotoEntity(Long placeId, String contentType, byte[] bytes, Instant updatedAt) {
        this.placeId = placeId;
        this.contentType = contentType;
        this.bytes = bytes;
        this.updatedAt = updatedAt;
    }

    public Long getPlaceId() {
        return placeId;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getBytes() {
        return bytes;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
