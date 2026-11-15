-- Fase 6 (RF04), locais e departamentos: o que faltava para traduzir como os cursos.
-- places só tinha description_en/description_es; ganha o nome traduzido (name_en/name_es). Endereço, horário e
-- sigla ficam em português por decisão: não têm tradução.
-- Nas duas tabelas entra o marcador de tradução automática (idiomas en/es que esperam revisão humana),
-- igual ao de courses (20261115130328) e ao do Guia de Recife.
-- Só adiciona colunas anuláveis ou com default: não mexe nos dados atuais.
alter table public.places
    add column name_en text,
    add column name_es text,
    add column machine_translated_langs text[] not null default '{}'
        check (machine_translated_langs <@ array['en', 'es']::text[]);

alter table public.departments
    add column machine_translated_langs text[] not null default '{}'
        check (machine_translated_langs <@ array['en', 'es']::text[]);
