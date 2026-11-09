package br.com.guiarural.backend.login.repository;

import br.com.guiarural.backend.login.model.AdminEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<AdminEntity, Long> {
    // O e-mail é gravado sempre em minúsculas (check da tabela).
    Optional<AdminEntity> findByEmail(String email);
}
