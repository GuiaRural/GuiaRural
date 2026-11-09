package br.com.guiarural.backend.info.repository;

import br.com.guiarural.backend.info.model.GuideSupportBannerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuideSupportBannerRepository extends JpaRepository<GuideSupportBannerEntity, Long> {
    Optional<GuideSupportBannerEntity> findBySlug(String slug);
}
