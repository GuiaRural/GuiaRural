package br.com.guiarural.backend.info.repository;

import br.com.guiarural.backend.info.model.GuideTopicEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    boolean existsBySlug(String slug);

    // Posição do último tópico da seção (-1 quando está vazia).
    @Query("select coalesce(max(t.position), -1) from GuideTopicEntity t where t.section = :section")
    int findMaxPosition(@org.springframework.data.repository.query.Param("section") String section);

    // Todas as seções, para a busca.
    @EntityGraph(attributePaths = "place")
    List<GuideTopicEntity> findAllBy();
}
