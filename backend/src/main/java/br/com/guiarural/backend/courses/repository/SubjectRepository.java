package br.com.guiarural.backend.courses.repository;

import br.com.guiarural.backend.courses.model.SubjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<SubjectEntity, Long> {
    List<SubjectEntity> findByCourseId(Long courseId);

    // UC36: apaga a matriz antes do curso. No Postgres o "on delete cascade" já faria isso; aqui o comportamento
    // não depende do banco (o H2 dos testes não tem a FK).
    @Modifying
    @Query("delete from SubjectEntity s where s.courseId = :courseId")
    int deleteByCourseId(@Param("courseId") Long courseId);
}
