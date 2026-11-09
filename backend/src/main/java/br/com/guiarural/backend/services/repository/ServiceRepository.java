package br.com.guiarural.backend.services.repository;

import br.com.guiarural.backend.services.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    // Catálogo público (RF03): só serviços publicados.
    List<ServiceEntity> findByActiveTrueOrderByNameAsc();

    Optional<ServiceEntity> findByIdAndActiveTrue(Long id);

    // Visão do painel: todos, na ordem de cadastro.
    List<ServiceEntity> findAllByOrderByIdAsc();
}
