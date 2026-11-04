package br.com.guiarural.backend.map;

import java.util.List;

public class RotaDTO {
    private Double distancia;
    private Integer tempoAproximado;
    private List<String> coordenadas; // Simplificado para List<String> no momento

    // Getters e Setters
    public Double getDistancia() { return distancia; }
    public void setDistancia(Double distancia) { this.distancia = distancia; }
    public Integer getTempoAproximado() { return tempoAproximado; }
    public void setTempoAproximado(Integer tempoAproximado) { this.tempoAproximado = tempoAproximado; }
    public List<String> getCoordenadas() { return coordenadas; }
    public void setCoordenadas(List<String> coordenadas) { this.coordenadas = coordenadas; }
}