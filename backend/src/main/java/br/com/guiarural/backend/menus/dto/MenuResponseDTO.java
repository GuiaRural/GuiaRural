package br.com.guiarural.backend.menus.dto;

import java.time.LocalDate;

public record MenuResponseDTO(
        Long id,
        LocalDate date,
        String shift,
        String main,
        String vegetarian,
        String sides,
        String salad,
        String dessert,
        String drink
) {
}
