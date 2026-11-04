package br.com.guiarural.backend.info;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/info")
public class InfoController {

    private final InfoService infoService;

    public InfoController(InfoService infoService) {
        this.infoService = infoService;
    }

    @GetMapping("/cartilha")
    public ResponseEntity<CartilhaDTO> getCartilha(
            @RequestParam String topico,
            @RequestParam(defaultValue = "PT") String idioma) {
        CartilhaDTO cartilha = infoService.obterCartilha(topico, idioma);
        if (cartilha != null) {
            return ResponseEntity.ok(cartilha);
        }
        return ResponseEntity.notFound().build();
    }
}