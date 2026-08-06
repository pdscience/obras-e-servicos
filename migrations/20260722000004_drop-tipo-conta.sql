-- Remover coluna tipo_conta da tabela usuarios (não utilizada)
-- O plano do profissional é controlado por premium_plano em perfis_profissional

ALTER TABLE usuarios DROP COLUMN IF EXISTS tipo_conta;
