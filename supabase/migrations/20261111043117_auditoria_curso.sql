-- UC35/UC36 (RNF06): a escrita de cursos pelo painel passa a ser auditada.
-- Só troca o check de audit_logs.entity, acrescentando 'curso'; os logs existentes continuam válidos.
-- Sem tabela, view ou função nova: RLS e grants de audit_logs não mudam. Curso não tem desfazer (RN-UC36-01).
-- O nome audit_logs_entity_check é o que o Postgres gera para o check declarado na coluna (migration
-- 20261103195135); confira no banco antes de aplicar.

alter table public.audit_logs drop constraint audit_logs_entity_check;

alter table public.audit_logs add constraint audit_logs_entity_check
    check (entity in ('local', 'servico', 'cardapio', 'aviso', 'acolhimento', 'administrador', 'curso'));
