package br.com.guiarural.backend.info.repository;

import br.com.guiarural.backend.info.model.GuideDownloadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuideDownloadRepository extends JpaRepository<GuideDownloadEntity, Long> {
    List<GuideDownloadEntity> findAllByOrderByPositionAsc();
}
