package br.com.guiarural.backend.courses.repository;

import br.com.guiarural.backend.courses.model.SubjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<SubjectEntity, Long> {
    List<SubjectEntity> findByCourseId(Long courseId);
}
