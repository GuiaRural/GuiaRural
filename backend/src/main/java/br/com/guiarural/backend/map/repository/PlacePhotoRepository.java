package br.com.guiarural.backend.map.repository;

import br.com.guiarural.backend.map.model.PlacePhotoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface PlacePhotoRepository extends JpaRepository<PlacePhotoEntity, Long> {
    // Só a versão (sem os bytes): serve para montar a URL da foto de vários locais numa consulta só.
    interface PhotoVersion {
        Long getPlaceId();

        Instant getUpdatedAt();
    }

    @Query("select p.placeId as placeId, p.updatedAt as updatedAt from PlacePhotoEntity p where p.placeId in :ids")
    List<PhotoVersion> findVersionsByPlaceIds(@Param("ids") Collection<Long> ids);
}
