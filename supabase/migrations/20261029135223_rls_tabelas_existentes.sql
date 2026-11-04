-- As tabelas abaixo foram criadas pelo Hibernate (ddl-auto=update) sem RLS e com os grants padrão do
-- Supabase, ou seja, qualquer pessoa com a chave anon lia e alterava todas as linhas pela API do Supabase.
-- O GuiaRural não usa a API do Supabase no cliente: o único caminho de acesso é o backend Spring, que
-- conecta como dono das tabelas e por isso não é afetado pelo RLS. Sem policies, anon e authenticated
-- ficam sem acesso nenhum (RN de segurança da organização: nada exposto ao anon).

alter table public.services enable row level security;
alter table public.avisos   enable row level security;
alter table public.messages enable row level security;
alter table public.contacts enable row level security;

revoke all on table public.services from anon, authenticated;
revoke all on table public.avisos   from anon, authenticated;
revoke all on table public.messages from anon, authenticated;
revoke all on table public.contacts from anon, authenticated;
