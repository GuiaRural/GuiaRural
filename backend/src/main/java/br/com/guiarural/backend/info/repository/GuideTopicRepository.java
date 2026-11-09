package br.com.guiarural.backend.info.repository;

import br.com.guiarural.backend.info.model.GuideTopicEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuideTopicRepository extends JpaRepository<GuideTopicEntity, Long> {
    // O local vinculado vem junto (um select só): a resposta usa o slug dele.
    @EntityGraph(attributePaths = "place")
    List<GuideTopicEntity> findBySectionOrderByPositionAsc(String section);

    @EntityGraph(attributePaths = "place")
    Optional<GuideTopicEntity> findBySlug(String slug);
}
