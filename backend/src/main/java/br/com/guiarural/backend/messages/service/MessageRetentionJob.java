package br.com.guiarural.backend.messages.service;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

// Limpeza diária das mensagens vencidas (15 dias). Além deste job, enviar e listar também apagam as vencidas, porque o
// servidor pode estar parado na hora do job.
@Component
@EnableScheduling
public class MessageRetentionJob {
    private final MessageService messageService;

    public MessageRetentionJob(MessageService messageService) {
        this.messageService = messageService;
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void purge() {
        messageService.purgeExpired();
    }
}
