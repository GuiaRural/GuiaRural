package br.com.guiarural.backend.info.repository;

import br.com.guiarural.backend.info.model.GuideSpotCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuideSpotCategoryRepository extends JpaRepository<GuideSpotCategoryEntity, Long> {
    List<GuideSpotCategoryEntity> findAllByOrderByPositionAsc();
}
