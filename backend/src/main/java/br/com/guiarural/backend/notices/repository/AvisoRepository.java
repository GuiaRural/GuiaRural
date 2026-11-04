package br.com.guiarural.backend.notices.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import br.com.guiarural.backend.notices.model.AvisoEntity;

@Repository
public interface AvisoRepository extends JpaRepository<AvisoEntity, Long> {
}
