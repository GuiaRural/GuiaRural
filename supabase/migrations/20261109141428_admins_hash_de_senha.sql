-- Login real do painel administrativo (UC12): o backend confere a senha contra um hash BCrypt guardado aqui.
-- Nunca se grava a senha em texto: só o hash. Conta sem hash (nula) existe no cadastro, mas não consegue entrar.
-- O primeiro administrador é inserido à mão no banco (a senha não passa por código, migration ou chat).

alter table public.admins
    add column password_hash text
        check (password_hash ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$');

comment on column public.admins.password_hash is
    'Hash BCrypt da senha (Spring BCryptPasswordEncoder). Nulo = a conta não consegue entrar. Nunca expor pela API.';
