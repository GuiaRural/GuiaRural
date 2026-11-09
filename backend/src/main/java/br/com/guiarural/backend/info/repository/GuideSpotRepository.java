package br.com.guiarural.backend.info.repository;

import br.com.guiarural.backend.info.model.GuideSpotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuideSpotRepository extends JpaRepository<GuideSpotEntity, Long> {
    List<GuideSpotEntity> findAllByOrderByPositionAsc();
}
