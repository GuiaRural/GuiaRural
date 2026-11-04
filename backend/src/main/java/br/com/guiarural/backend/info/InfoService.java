package br.com.guiarural.backend.info;

import org.springframework.stereotype.Service;

@Service
public class InfoService {

    private final CartilhaRepository cartilhaRepository;

    public InfoService(CartilhaRepository cartilhaRepository) {
        this.cartilhaRepository = cartilhaRepository;
    }

    public CartilhaDTO obterCartilha(String topico, String idioma) {
        return cartilhaRepository.findByTopicoAndIdioma(topico, idioma)
                .map(CartilhaDTO::new)
                .orElse(null); // Adicione a lógica Null Object aqui depois
    }
}