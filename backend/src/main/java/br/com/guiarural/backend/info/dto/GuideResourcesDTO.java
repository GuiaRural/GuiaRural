package br.com.guiarural.backend.info.dto;

import java.util.List;

// Tudo que a barra lateral do guia mostra, numa única chamada (menos requisições em 3G).
public record GuideResourcesDTO(List<ContactDTO> support, List<ContactDTO> emergency, List<DownloadDTO> downloads) {
}
