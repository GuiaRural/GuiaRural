package br.com.guiarural.backend.map.repository;

import br.com.guiarural.backend.map.model.PlaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<PlaceEntity, Long> {
    List<PlaceEntity> findByStatusOrderByNameAsc(String status);

    List<PlaceEntity> findAllByOrderByNameAsc();

    Optional<PlaceEntity> findBySlugAndStatus(String slug, String status);

    Optional<PlaceEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    // Um serviço do catálogo e um local publicado onde ele é prestado (página /servicos).
    interface ServicePlaceRow {
        Long getServiceId();

        String getSlug();

        String getName();
    }

    @Query("""
            select sid as serviceId, p.slug as slug, p.name as name
            from PlaceEntity p join p.serviceIds sid
            where sid in :serviceIds and p.status = 'publicado'
            order by p.name
            """)
    List<ServicePlaceRow> findPublishedPlacesByServiceIds(@Param("serviceIds") Collection<Long> serviceIds);
}
