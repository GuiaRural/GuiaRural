package br.com.guiarural.backend.info;

public class CartilhaDTO {
    private String topico;
    private String idioma;
    private String conteudo;

    public CartilhaDTO() {}

    public CartilhaDTO(CartilhaEntity entity) {
        this.topico = entity.getTopico();
        this.idioma = entity.getIdioma();
        this.conteudo = entity.getConteudo();
    }

    // Getters e Setters
    public String getTopico() { return topico; }
    public void setTopico(String topico) { this.topico = topico; }
    public String getIdioma() { return idioma; }
    public void setIdioma(String idioma) { this.idioma = idioma; }
    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }
}