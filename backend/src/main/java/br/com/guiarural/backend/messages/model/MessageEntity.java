package br.com.guiarural.backend.messages.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

// UC39: mensagem que um visitante deixa para a equipe. Nome e contato são opcionais (RNF04: nada além do que a pessoa digitou).
@Entity
@Table(name = "messages")
public class MessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String nome;

    // E-mail ou telefone, como a pessoa escreveu.
    @Column(length = 150)
    private String contato;

    @Column(nullable = false, length = 1000)
    private String mensagem;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    // Nulo = ainda não lida por nenhum administrador.
    private Instant readAt;

    protected MessageEntity() {
    }

    public MessageEntity(String nome, String contato, String mensagem) {
        this.nome = nome;
        this.contato = contato;
        this.mensagem = mensagem;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getContato() { return contato; }
    public String getMensagem() { return mensagem; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getReadAt() { return readAt; }

    public void markRead(boolean read) {
        // Marcar como lida de novo não muda a data da primeira leitura.
        if (read) {
            if (readAt == null) readAt = Instant.now();
        } else {
            readAt = null;
        }
    }
}
