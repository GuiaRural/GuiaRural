package br.com.guiarural.backend.menus;

import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ConflictException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.menus.dto.MenuRequestDTO;
import br.com.guiarural.backend.menus.dto.MenuResponseDTO;
import br.com.guiarural.backend.menus.model.MenuEntity;
import br.com.guiarural.backend.menus.repository.MenuRepository;
import br.com.guiarural.backend.menus.service.MenuService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {
    private static final LocalDate DAY = LocalDate.of(2026, 11, 12);

    @Mock
    private MenuRepository repository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MenuService service;

    private MenuRequestDTO request(String main, String sides) {
        return new MenuRequestDTO(DAY, "almoco", main, " Omelete de espinafre ", sides, null, "  ", "Suco de caju");
    }

    private MenuEntity saved(Long id) {
        MenuEntity entity = new MenuEntity();
        entity.setId(id);
        entity.setMenuDate(DAY);
        entity.setShift("almoco");
        entity.setMain("Frango grelhado");
        entity.setVegetarian("Omelete de espinafre");
        return entity;
    }

    @Test
    void create_GravaCamposLimposEAudita() {
        when(repository.existsByMenuDateAndShift(DAY, "almoco")).thenReturn(false);
        when(repository.saveAndFlush(any(MenuEntity.class))).thenAnswer(inv -> {
            MenuEntity entity = inv.getArgument(0);
            entity.setId(7L);
            return entity;
        });

        MenuResponseDTO created = service.create(request(" Frango grelhado ", "   "));

        ArgumentCaptor<MenuEntity> captor = ArgumentCaptor.forClass(MenuEntity.class);
        verify(repository).saveAndFlush(captor.capture());
        MenuEntity entity = captor.getValue();
        assertEquals("Frango grelhado", entity.getMain());
        assertEquals("Omelete de espinafre", entity.getVegetarian());
        assertNull(entity.getSides(), "opcional em branco vira nulo");
        assertNull(entity.getDessert());
        assertEquals("Suco de caju", entity.getDrink());
        verify(auditService).record(AuditService.Entity.CARDAPIO, "7", "Cardápio — almoço de 12/11/2026",
                AuditService.Action.CRIADO, null, created);
    }

    @Test
    void create_RecusaSegundoCardapioNoMesmoDiaETurno() {
        when(repository.existsByMenuDateAndShift(DAY, "almoco")).thenReturn(true);

        ConflictException error = assertThrows(ConflictException.class, () -> service.create(request("Frango", null)));

        assertEquals("Já existe um cardápio cadastrado para este dia e turno.", error.getMessage());
        verify(repository, never()).saveAndFlush(any());
        verifyNoInteractions(auditService);
    }

    @Test
    void create_ConstraintDoBancoViraConflito() {
        // Duas abas salvando ao mesmo tempo: a checagem passa nas duas e o banco barra a segunda.
        when(repository.existsByMenuDateAndShift(DAY, "almoco")).thenReturn(false);
        when(repository.saveAndFlush(any(MenuEntity.class))).thenThrow(new DataIntegrityViolationException("menus_date_shift_key"));

        assertThrows(ConflictException.class, () -> service.create(request("Frango", null)));
        verifyNoInteractions(auditService);
    }

    @Test
    void update_AuditaOAntesEODepois() {
        MenuEntity entity = saved(3L);
        when(repository.findById(3L)).thenReturn(Optional.of(entity));
        when(repository.existsByMenuDateAndShiftAndIdNot(DAY, "almoco", 3L)).thenReturn(false);
        when(repository.saveAndFlush(entity)).thenReturn(entity);

        MenuResponseDTO after = service.update(3L, request("Peixe ao molho de coco", null));

        assertEquals("Peixe ao molho de coco", after.main());
        verify(auditService).record(eq(AuditService.Entity.CARDAPIO), eq("3"), eq("Cardápio — almoço de 12/11/2026"),
                eq(AuditService.Action.EDITADO),
                argThat(before -> ((MenuResponseDTO) before).main().equals("Frango grelhado")), eq(after));
    }

    @Test
    void update_RecusaDataETurnoDeOutroCardapio() {
        when(repository.findById(3L)).thenReturn(Optional.of(saved(3L)));
        when(repository.existsByMenuDateAndShiftAndIdNot(DAY, "almoco", 3L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.update(3L, request("Peixe", null)));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void update_CardapioInexistenteDa404() {
        when(repository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update(9L, request("Peixe", null)));
    }

    @Test
    void delete_RemoveEAudita() {
        MenuEntity entity = saved(3L);
        when(repository.findById(3L)).thenReturn(Optional.of(entity));

        service.delete(3L);

        verify(repository).delete(entity);
        verify(auditService).record(eq(AuditService.Entity.CARDAPIO), eq("3"), eq("Cardápio — almoço de 12/11/2026"),
                eq(AuditService.Action.DELETADO), any(MenuResponseDTO.class), isNull());
    }

    @Test
    void delete_NaoAuditaQuandoNaoExiste() {
        when(repository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.delete(9L));
        verifyNoInteractions(auditService);
    }

    @Test
    void findAll_ComPeriodoFiltraSemPeriodoListaTudo() {
        LocalDate monday = LocalDate.of(2026, 11, 9);
        LocalDate sunday = LocalDate.of(2026, 11, 15);
        when(repository.findByMenuDateBetweenOrderByMenuDateAscShiftAsc(monday, sunday)).thenReturn(List.of(saved(1L)));
        when(repository.findAllByOrderByMenuDateAscShiftAsc()).thenReturn(List.of(saved(1L), saved(2L)));

        assertEquals(1, service.findAll(monday, sunday).size());
        assertEquals(2, service.findAll(null, null).size());
    }

    @Test
    void findAll_PeriodoIncompletoOuInvertidoDa400() {
        LocalDate monday = LocalDate.of(2026, 11, 9);

        assertThrows(BadRequestException.class, () -> service.findAll(monday, null));
        assertThrows(BadRequestException.class, () -> service.findAll(monday, monday.minusDays(1)));
        verifyNoInteractions(repository);
    }
}
