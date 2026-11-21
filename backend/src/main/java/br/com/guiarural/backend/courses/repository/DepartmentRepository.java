package br.com.guiarural.backend.courses.repository;

import br.com.guiarural.backend.courses.model.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Long> {
    List<DepartmentEntity> findByActiveTrueOrderByNameAsc();

    Optional<DepartmentEntity> findByIdAndActiveTrue(Long id);

    // Departamentos que funcionam nos locais informados (link do local para o departamento, CT-037.01).
    List<DepartmentEntity> findByPlaceIdInAndActiveTrueOrderByNameAsc(Collection<Long> placeIds);
}
