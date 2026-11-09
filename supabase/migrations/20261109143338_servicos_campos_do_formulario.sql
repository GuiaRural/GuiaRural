-- Serviços estudantis (UC19 a UC21): o formulário do painel ganha regras no banco.
-- As colunas category, sector, steps, requirements, url e deadline já existem (migration de 03/11).
--
-- As restrições entram como NOT VALID: valem para toda linha nova ou alterada, sem reprovar linhas antigas
-- (a tabela nasceu com colunas livres, criada pelo Hibernate). Valide depois com
--   alter table public.services validate constraint <nome>;
-- quando não houver mais linhas fora da regra.

-- A descrição de um serviço não cabe em 255 caracteres.
alter table public.services alter column description type text;

-- RN-19.02: todo serviço novo nasce publicado.
alter table public.services alter column active set default true;

alter table public.services
    add constraint services_name_filled        check (name is not null and btrim(name) <> '') not valid,
    add constraint services_description_filled check (description is not null and btrim(description) <> '') not valid,
    add constraint services_category_filled    check (category is not null and btrim(category) <> '') not valid,
    add constraint services_sector_filled      check (sector is not null and btrim(sector) <> '') not valid,
    -- "Como solicitar" precisa de pelo menos um passo.
    add constraint services_steps_not_empty    check (cardinality(steps) > 0) not valid,
    -- Links externos só por HTTPS (RNF02).
    add constraint services_url_https          check (url is null or url ~ '^https://[^[:space:]]+\.[^[:space:]]+$') not valid;
