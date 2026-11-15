package br.com.guiarural.backend.core.audit;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {
    // Mais recentes primeiro.
    List<AuditLogEntity> findAllByOrderByOccurredAtDescIdDesc(Pageable pageable);
}
