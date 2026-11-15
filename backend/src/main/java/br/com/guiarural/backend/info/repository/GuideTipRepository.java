package br.com.guiarural.backend.info.repository;

import br.com.guiarural.backend.info.model.GuideTipEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuideTipRepository extends JpaRepository<GuideTipEntity, Long> {
    List<GuideTipEntity> findAllByOrderByPositionAsc();
}
