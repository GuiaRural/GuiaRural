package br.com.guiarural.backend.core.audit.repository;

import br.com.guiarural.backend.core.audit.model.LogMudancaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogMudancaRepository extends JpaRepository<LogMudancaEntity, Long> {
}