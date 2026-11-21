package br.com.guiarural.backend.messages.repository;

import br.com.guiarural.backend.messages.model.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    List<MessageEntity> findAllByOrderByCreatedAtDescIdDesc();

    // Retenção: apaga as mensagens enviadas antes do limite. Devolve quantas foram apagadas.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from MessageEntity m where m.createdAt < :limit")
    int deleteOlderThan(@Param("limit") Instant limit);
}
