package br.com.guiarural.backend.contacts.repository;

import br.com.guiarural.backend.contacts.model.ContactEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<ContactEntity, Long> {
    List<ContactEntity> findByPlaceId(Long placeId);

    List<ContactEntity> findByPlaceIdInOrderByIdAsc(Collection<Long> placeIds);

    void deleteByPlaceId(Long placeId);
}
