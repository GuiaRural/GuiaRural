package br.com.guiarural.backend.courses.repository;

import br.com.guiarural.backend.courses.model.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    List<CourseEntity> findByActiveTrue();

    List<CourseEntity> findByDepartmentIdAndActiveTrue(Long departmentId);

    Optional<CourseEntity> findByIdAndActiveTrue(Long id);
}
