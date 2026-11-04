package br.com.guiarural.backend.services.controller;

import br.com.guiarural.backend.services.dto.CardapioRequestDTO;
import br.com.guiarural.backend.services.model.CardapioEntity;
import br.com.guiarural.backend.services.service.CardapioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services/cardapio")
public class CardapioController {

    private final CardapioService cardapioService;

    public CardapioController(CardapioService cardapioService) {
        this.cardapioService = cardapioService;
    }

    @PostMapping
    public ResponseEntity<CardapioEntity> criarCardapio(@RequestBody CardapioRequestDTO dto) {
        CardapioEntity novoCardapio = cardapioService.criarCardapio(dto);
        return new ResponseEntity<>(novoCardapio, HttpStatus.CREATED);
    }
}