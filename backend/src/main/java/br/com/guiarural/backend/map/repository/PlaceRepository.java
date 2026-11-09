package br.com.guiarural.backend.map.repository;

import br.com.guiarural.backend.map.model.PlaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<PlaceEntity, Long> {
    List<PlaceEntity> findByStatusOrderByNameAsc(String status);

    Optional<PlaceEntity> findBySlugAndStatus(String slug, String status);

    Optional<PlaceEntity> findBySlug(String slug);
}
