-- Fase 6 (RF04), cursos: marcador de tradução automática, como no Guia de Recife.
-- As colunas name_en/name_es/description_en/description_es de courses e name_en/name_es/syllabus_en/syllabus_es
-- de curriculum_subjects já existem (migration 20261103195141). Faltava dizer quais idiomas foram traduzidos
-- automaticamente e esperam revisão humana. A marca vale para o curso e para as disciplinas da matriz dele.
-- Só adiciona uma coluna com default: não mexe nos dados atuais.
alter table public.courses
    add column machine_translated_langs text[] not null default '{}'
        check (machine_translated_langs <@ array['en', 'es']::text[]);
