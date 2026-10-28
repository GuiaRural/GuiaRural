package br.com.guiarural.backend.msg.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.guiarural.backend.msg.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
}
