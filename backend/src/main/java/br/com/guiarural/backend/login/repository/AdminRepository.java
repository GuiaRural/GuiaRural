package br.com.guiarural.backend.login.repository;

import br.com.guiarural.backend.login.model.AdminEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<AdminEntity, Long> {
    // O e-mail é gravado sempre em minúsculas (check da tabela).
    Optional<AdminEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    List<AdminEntity> findAllByOrderByNameAscIdAsc();

    // Trava (select ... for update) os gerais ativos até o fim da transação: duas revogações simultâneas não conseguem,
    // juntas, deixar o painel sem geral. A ordem fixa por id faz as transações travarem as linhas na mesma sequência,
    // sem deadlock por ordem cruzada. Só funciona dentro de uma transação.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from AdminEntity a where a.permission = 'geral' and a.status = 'ativo' order by a.id")
    List<AdminEntity> lockActiveGenerals();
}
