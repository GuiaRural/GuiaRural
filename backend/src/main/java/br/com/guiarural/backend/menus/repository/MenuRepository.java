package br.com.guiarural.backend.menus.repository;

import br.com.guiarural.backend.menus.model.MenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MenuRepository extends JpaRepository<MenuEntity, Long> {
    List<MenuEntity> findAllByOrderByMenuDateAscShiftAsc();

    List<MenuEntity> findByMenuDateBetweenOrderByMenuDateAscShiftAsc(LocalDate from, LocalDate to);

    boolean existsByMenuDateAndShift(LocalDate menuDate, String shift);

    boolean existsByMenuDateAndShiftAndIdNot(LocalDate menuDate, String shift, Long id);
}
