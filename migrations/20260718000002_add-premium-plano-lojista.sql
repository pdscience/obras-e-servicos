-- Adiciona coluna premium_plano à tabela de lojistas
-- O plano Diamante é exclusivo para lojistas/fornecedores
ALTER TABLE perfis_lojista ADD COLUMN IF NOT EXISTS premium_plano VARCHAR(20);
ALTER TABLE perfis_lojista DROP CONSTRAINT IF EXISTS perfis_lojista_premium_plano_check;
ALTER TABLE perfis_lojista ADD CONSTRAINT perfis_lojista_premium_plano_check
  CHECK (premium_plano IN ('bronze', 'prata', 'ouro', 'platina', 'diamante'));
