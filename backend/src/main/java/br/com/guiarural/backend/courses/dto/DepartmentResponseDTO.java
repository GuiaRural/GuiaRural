package br.com.guiarural.backend.courses.dto;

import java.util.List;

public record DepartmentResponseDTO (
    Long id,
    String code,
    String name,
    String shortName,
    String academicCenter,
    String description,
    String address,
    String hours,
    String phone,
    String email,
    Short foundedYear,
    // slug do local onde o departamento funciona; null se não houver local publicado vinculado.
    String placeSlug,
    // Idioma em que name veio (pt quando faltou a tradução), para o atributo lang da página.
    String lang,
    // true quando o texto veio de uma tradução automática que ainda espera revisão humana.
    boolean machineTranslated,
    // Idiomas (en, es) em que o nome tem tradução. O painel usa para avisar que o texto pode defasar.
    List<String> translatedLangs
) {}
