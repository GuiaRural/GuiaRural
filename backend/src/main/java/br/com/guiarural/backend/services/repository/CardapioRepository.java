package br.com.guiarural.backend.services.repository;

import br.com.guiarural.backend.services.model.CardapioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface CardapioRepository extends JpaRepository<CardapioEntity, Long> {
    boolean existsByDataAndTurno(LocalDate data, String turno);
}