package br.com.guiarural.backend.map;

import org.springframework.stereotype.Service;

@Service
public class MapService {

    public RotaDTO tracarRota(String origem, String destino) {
        // Implemente a lógica de roteamento aqui
        RotaDTO rota = new RotaDTO();
        rota.setDistancia(0.0);
        rota.setTempoAproximado(0);
        return rota;
    }
}