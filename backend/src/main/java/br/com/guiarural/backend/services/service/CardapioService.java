package br.com.guiarural.backend.services.service;

import br.com.guiarural.backend.services.dto.CardapioRequestDTO;
import br.com.guiarural.backend.services.model.CardapioEntity;
import br.com.guiarural.backend.services.repository.CardapioRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;


@Service
public class CardapioService {

    private final CardapioRepository cardapioRepository;

    public CardapioService(CardapioRepository cardapioRepository) {
        this.cardapioRepository = cardapioRepository;
    }

    public CardapioEntity criarCardapio(CardapioRequestDTO dto) {
        if (cardapioRepository.existsByDataAndTurno(dto.data(), dto.turno())) {
            throw new RuntimeException("Já existe um cardápio registrado para este turno nesta data.");
        }

        CardapioEntity cardapio = new CardapioEntity();
        cardapio.setData(dto.data());
        cardapio.setTurno(dto.turno());
        cardapio.setPratoPrincipal(dto.pratoPrincipal());
        cardapio.setOpcaoVegetariana(dto.opcaoVegetariana());

        return cardapioRepository.save(cardapio);
    }
}