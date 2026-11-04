package br.com.guiarural.backend.map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/map")
public class MapController {

    private final MapService mapService;

    public MapController(MapService mapService) {
        this.mapService = mapService;
    }

    @GetMapping("/rota")
    public ResponseEntity<RotaDTO> calcularRota(@RequestParam String origem, @RequestParam String destino) {
        RotaDTO rota = mapService.tracarRota(origem, destino);
        return ResponseEntity.ok(rota);
    }
}