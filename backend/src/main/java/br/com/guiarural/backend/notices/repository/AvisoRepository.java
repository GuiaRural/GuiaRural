package br.com.guiarural.backend.notices.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import br.com.guiarural.backend.notices.model.AvisoEntity;

import java.time.LocalDateTime;

@Repository
public interface AvisoRepository extends JpaRepository<AvisoEntity, Long> {
    // Desfazer uma exclusão (UC23) devolve o aviso com o id e a data de publicação originais. O JPA não insere id
    // escolhido numa coluna identity (e a data não é atualizável pela entidade): a linha nasce nova e é corrigida aqui.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "update avisos set id = :original, data = :data where id = :current", nativeQuery = true)
    void restoreIdAndDate(@Param("current") Long current, @Param("original") Long original, @Param("data") LocalDateTime data);
}
