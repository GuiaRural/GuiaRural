-- UC39: o visitante manda uma mensagem para a equipe (tela pública) e os administradores a leem no painel.
-- Reverte a decisão D6 (11/11/2026), que tinha removido o módulo de mensagens: a tabela `messages` foi mantida
-- no banco e volta a ser usada. Ela nunca teve uso em produção, mas esta migration preserva qualquer linha antiga.
--
-- Mudanças em relação ao formato antigo (nome, email e mensagem obrigatórios; telefone separado):
--   * nome e contato passam a ser opcionais; o contato é um só campo (e-mail OU telefone), validado no backend;
--   * mensagem sobe de 500 para 1000 caracteres;
--   * entram a data de envio e a data de leitura (nula = não lida).
alter table public.messages
    add column contato text,
    add column created_at timestamptz not null default now(),
    add column read_at timestamptz;

-- Linhas antigas: o e-mail (obrigatório antes) vira o contato; sem e-mail, o telefone.
update public.messages
set contato = coalesce(nullif(btrim(email), ''), nullif(btrim(telefone), ''));

alter table public.messages
    drop column email,
    drop column telefone,
    alter column nome drop not null,
    alter column mensagem type varchar(1000);

-- Limites iguais aos do DTO do backend; texto em branco vira nulo antes de gravar, então não é aceito aqui.
alter table public.messages
    add constraint messages_nome_check check (nome is null or (btrim(nome) <> '' and char_length(nome) <= 100)),
    add constraint messages_contato_check check (contato is null or (btrim(contato) <> '' and char_length(contato) <= 150)),
    add constraint messages_mensagem_check check (btrim(mensagem) <> '');

-- Caixa de entrada: mais recentes primeiro.
create index messages_created_at_idx on public.messages (created_at desc);

-- Segurança (CLAUDE.md §9): RLS sem policies e nada para anon/authenticated; só o backend (dono) acessa.
-- Já estava assim desde 20261029135223; repetido para a migration ser autossuficiente (idempotente).
alter table public.messages enable row level security;
revoke all on table public.messages from anon, authenticated;
