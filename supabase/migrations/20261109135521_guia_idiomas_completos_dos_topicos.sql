-- Idiomas (além do português) em que TODOS os textos do tópico estão traduzidos.
-- Mantém o aviso de "texto em português" da cartilha (FE01 do UC09): o texto traduzido vem do servidor já
-- resolvido, então o aplicativo precisa desta marcação para saber quando houve fallback.
-- Quem edita o tópico pelo painel deve manter esta coluna em dia.

alter table public.guide_topics
    add column fully_translated_langs text[] not null default '{}'
        check (fully_translated_langs <@ array['en', 'es']::text[]);

update public.guide_topics set fully_translated_langs = '{en,es}'
where slug in ('boas-vindas', 'conheca-recife');

update public.guide_topics set fully_translated_langs = '{en}'
where slug in ('convivencia', 'comunicacao', 'consentimento', 'vida-academica', 'conflitos', 'visto', 'seguro-saude', 'cpf', 'carteira-vem', 'banco-celular-moradia', 'mobilidade-in', 'primeira-semana', 'vida-academica-regras', 'beneficios', 'chegada-transporte', 'seguranca');

