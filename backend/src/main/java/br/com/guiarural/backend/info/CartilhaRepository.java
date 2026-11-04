package br.com.guiarural.backend.info;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartilhaRepository extends JpaRepository<CartilhaEntity, Long> {
    Optional<CartilhaEntity> findByTopicoAndIdioma(String topico, String idioma);
}