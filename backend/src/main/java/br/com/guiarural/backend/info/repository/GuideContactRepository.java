package br.com.guiarural.backend.info.repository;

import br.com.guiarural.backend.info.model.GuideContactEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuideContactRepository extends JpaRepository<GuideContactEntity, Long> {
    List<GuideContactEntity> findByKindOrderByPositionAsc(String kind);
}
