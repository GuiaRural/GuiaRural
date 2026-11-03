-- Colunas de tradução (RF04) e campos que o site já mostra mas o banco ainda não guardava.
-- Nas tabelas que já existem, a coluna sem sufixo continua sendo o português (não renomeamos nada);
-- as traduções entram como <coluna>_en e <coluna>_es, sempre opcionais (o aplicativo cai para o português).
-- Só adiciona colunas anuláveis ou com default: não mexe nos dados atuais.

-- Locais -----------------------------------------------------------------------------------------------
alter table public.places
    add column description_en text,
    add column description_es text,
    add column accessibility  text[] not null default '{}',
    -- URL da imagem (JPG/PNG até 5 MB, RNF01). O armazenamento do arquivo ainda não foi decidido:
    -- nada de base64 no banco.
    add column photo_url text,
    add constraint places_accessibility_values check (
        accessibility <@ array['rampa', 'elevador', 'piso_tatil', 'banheiro', 'portas', 'libras', 'vaga']::text[]
    );

-- Departamentos, cursos e matriz ------------------------------------------------------------------------
alter table public.departments
    add column name_en        text,
    add column name_es        text,
    add column description_en text,
    add column description_es text;

alter table public.courses
    add column name_en        text,
    add column name_es        text,
    add column description_en text,
    add column description_es text;

alter table public.curriculum_subjects
    add column name_en     text,
    add column name_es     text,
    add column syllabus_en text,
    add column syllabus_es text;

-- Serviços: campos do formulário do painel (UC19) que a entidade ainda não guardava ------------------------
alter table public.services
    add column category        text,
    add column sector          text,
    -- "Como solicitar": passos na ordem em que o estudante deve seguir.
    add column steps           text[] not null default '{}',
    add column requirements    text,
    add column url             text,
    -- só para serviços disponíveis por um período (ex.: "Inscrições até 28/02").
    add column deadline        text,
    add column name_en         text,
    add column name_es         text,
    add column description_en  text,
    add column description_es  text,
    add column steps_en        text[],
    add column steps_es        text[],
    add column requirements_en text,
    add column requirements_es text;
