package br.com.guiarural.backend.menus.service;

import br.com.guiarural.backend.core.audit.AuditLogEntity;
import br.com.guiarural.backend.core.audit.AuditRestorer;
import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ConflictException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.menus.dto.MenuRequestDTO;
import br.com.guiarural.backend.menus.dto.MenuResponseDTO;
import br.com.guiarural.backend.menus.model.MenuEntity;
import br.com.guiarural.backend.menus.repository.MenuRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class MenuService implements AuditRestorer {
    static final String DUPLICATE_MESSAGE = "Já existe um cardápio cadastrado para este dia e turno.";
    private static final DateTimeFormatter BR_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final MenuRepository repository;
    private final AuditService auditService;
    private final JsonMapper jsonMapper;

    public MenuService(MenuRepository repository, AuditService auditService, JsonMapper jsonMapper) {
        this.repository = repository;
        this.auditService = auditService;
        this.jsonMapper = jsonMapper;
    }

    // Sem período, devolve todos (painel); com período, só os dias dentro dele (página pública da semana).
    @Transactional(readOnly = true)
    public List<MenuResponseDTO> findAll(LocalDate from, LocalDate to) {
        if ((from == null) != (to == null)) {
            throw new BadRequestException("Informe as duas datas do período (from e to) ou nenhuma.");
        }
        if (from != null && from.isAfter(to)) {
            throw new BadRequestException("A data inicial do período não pode ser depois da final.");
        }
        List<MenuEntity> menus = from == null
                ? repository.findAllByOrderByMenuDateAscShiftAsc()
                : repository.findByMenuDateBetweenOrderByMenuDateAscShiftAsc(from, to);
        return menus.stream().map(this::mapToResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public MenuResponseDTO findById(Long id) {
        return mapToResponseDTO(find(id));
    }

    @Transactional
    public MenuResponseDTO create(MenuRequestDTO dto) {
        return create(dto, null, AuditService.Action.CRIADO);
    }

    @Transactional
    public MenuResponseDTO update(Long id, MenuRequestDTO dto) {
        return update(find(id), dto, AuditService.Action.EDITADO);
    }

    // UC27: exclusão definitiva; o histórico guarda o cardápio removido.
    @Transactional
    public void delete(Long id) {
        delete(find(id), AuditService.Action.DELETADO);
    }

    @Override
    public AuditService.Entity entity() {
        return AuditService.Entity.CARDAPIO;
    }

    // UC23: desfaz a mudança do log. Criação -> exclui; edição ou exclusão -> volta ao estado anterior (recriando com
    // o id original, se o cardápio não existe mais). A regra de um cardápio por dia e turno continua valendo (409).
    @Override
    @Transactional
    public void restore(AuditLogEntity log) {
        Long id = Long.valueOf(log.getEntityId());
        MenuEntity current = repository.findById(id).orElse(null);
        if (log.getBeforeState() == null) {
            if (current == null) {
                throw new ConflictException("Este cardápio já foi excluído; não há o que desfazer.");
            }
            delete(current, AuditService.Action.RESTAURADO);
            return;
        }
        MenuResponseDTO previous = jsonMapper.readValue(log.getBeforeState(), MenuResponseDTO.class);
        MenuRequestDTO target = new MenuRequestDTO(previous.date(), previous.shift(), previous.main(),
                previous.vegetarian(), previous.sides(), previous.salad(), previous.dessert(), previous.drink());
        if (current == null) {
            create(target, id, AuditService.Action.RESTAURADO);
        } else {
            update(current, target, AuditService.Action.RESTAURADO);
        }
    }

    // originalId: só no desfazer de uma exclusão, para o cardápio voltar com o mesmo id.
    private MenuResponseDTO create(MenuRequestDTO dto, Long originalId, AuditService.Action action) {
        // RN-03: um cardápio por dia e turno.
        if (repository.existsByMenuDateAndShift(dto.date(), dto.shift())) {
            throw new ConflictException(DUPLICATE_MESSAGE);
        }
        MenuEntity entity = new MenuEntity();
        apply(entity, dto);
        entity = save(entity);
        if (originalId != null) {
            repository.restoreId(entity.getId(), originalId);
            entity = find(originalId);
        }
        MenuResponseDTO created = mapToResponseDTO(entity);
        auditService.record(AuditService.Entity.CARDAPIO, String.valueOf(created.id()), labelOf(created),
                action, null, created);
        return created;
    }

    private MenuResponseDTO update(MenuEntity entity, MenuRequestDTO dto, AuditService.Action action) {
        Long id = entity.getId();
        if (repository.existsByMenuDateAndShiftAndIdNot(dto.date(), dto.shift(), id)) {
            throw new ConflictException("Já existe outro cardápio cadastrado para este dia e turno.");
        }
        MenuResponseDTO before = mapToResponseDTO(entity);
        apply(entity, dto);
        MenuResponseDTO after = mapToResponseDTO(save(entity));
        auditService.record(AuditService.Entity.CARDAPIO, String.valueOf(id), labelOf(after), action, before, after);
        return after;
    }

    private void delete(MenuEntity entity, AuditService.Action action) {
        MenuResponseDTO before = mapToResponseDTO(entity);
        repository.delete(entity);
        auditService.record(AuditService.Entity.CARDAPIO, String.valueOf(entity.getId()), labelOf(before),
                action, before, null);
    }

    private MenuEntity find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cardápio não encontrado com ID: " + id));
    }

    // Duas abas salvando o mesmo dia e turno ao mesmo tempo passam pela checagem acima; a constraint do banco barra a segunda.
    private MenuEntity save(MenuEntity entity) {
        try {
            return repository.saveAndFlush(entity);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException(DUPLICATE_MESSAGE);
        }
    }

    // Copia os campos do formulário, sem espaços nas pontas; opcional em branco vira nulo.
    private void apply(MenuEntity entity, MenuRequestDTO dto) {
        entity.setMenuDate(dto.date());
        entity.setShift(dto.shift());
        entity.setMain(dto.main().trim());
        entity.setVegetarian(dto.vegetarian().trim());
        entity.setSides(blankToNull(dto.sides()));
        entity.setSalad(blankToNull(dto.salad()));
        entity.setDessert(blankToNull(dto.dessert()));
        entity.setDrink(blankToNull(dto.drink()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    // Nome legível no histórico, ex.: "Cardápio — almoço de 12/11/2026".
    private String labelOf(MenuResponseDTO menu) {
        String shift = "jantar".equals(menu.shift()) ? "jantar" : "almoço";
        return "Cardápio — " + shift + " de " + menu.date().format(BR_DATE);
    }

    private MenuResponseDTO mapToResponseDTO(MenuEntity entity) {
        return new MenuResponseDTO(
                entity.getId(),
                entity.getMenuDate(),
                entity.getShift(),
                entity.getMain(),
                entity.getVegetarian(),
                entity.getSides(),
                entity.getSalad(),
                entity.getDessert(),
                entity.getDrink()
        );
    }
}
