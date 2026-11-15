-- UC25 (RN-01): a opção vegetariana é obrigatória, como o prato principal. O formulário do painel e o
-- MenuRequestDTO já exigem; o banco passa a recusar também.
--
-- Entra como NOT VALID (mesmo padrão da migration de serviços de 09/11): vale para toda linha nova ou alterada,
-- sem reprovar linhas antigas. Até aqui o cardápio só existia no navegador, então a tabela deve estar vazia;
-- confira e valide com
--   alter table public.menus validate constraint menus_vegetarian_filled;
alter table public.menus
    add constraint menus_vegetarian_filled check (vegetarian is not null and btrim(vegetarian) <> '') not valid;
