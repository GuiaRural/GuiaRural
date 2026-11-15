package br.com.guiarural.backend.menus.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

// Cardápio do RU (UC25 a UC27): um por data e turno (constraint menus_date_shift_key na migration).
@Entity
@Table(name = "menus")
public class MenuEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate menuDate;

    // "almoco" ou "jantar" (check da migration).
    @Column(nullable = false)
    private String shift;

    @Column(nullable = false)
    private String main;

    private String vegetarian;
    private String sides;
    private String salad;
    private String dessert;
    private String drink;

    public MenuEntity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getMenuDate() {
        return menuDate;
    }

    public void setMenuDate(LocalDate menuDate) {
        this.menuDate = menuDate;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public String getMain() {
        return main;
    }

    public void setMain(String main) {
        this.main = main;
    }

    public String getVegetarian() {
        return vegetarian;
    }

    public void setVegetarian(String vegetarian) {
        this.vegetarian = vegetarian;
    }

    public String getSides() {
        return sides;
    }

    public void setSides(String sides) {
        this.sides = sides;
    }

    public String getSalad() {
        return salad;
    }

    public void setSalad(String salad) {
        this.salad = salad;
    }

    public String getDessert() {
        return dessert;
    }

    public void setDessert(String dessert) {
        this.dessert = dessert;
    }

    public String getDrink() {
        return drink;
    }

    public void setDrink(String drink) {
        this.drink = drink;
    }
}
