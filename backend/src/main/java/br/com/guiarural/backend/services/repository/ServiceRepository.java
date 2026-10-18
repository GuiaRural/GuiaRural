package br.com.guiarural.backend.services.repository;

import br.com.guiarural.backend.services.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    
}
