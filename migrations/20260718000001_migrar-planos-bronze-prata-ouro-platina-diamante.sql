-- Migração para os novos planos do OS - Obras & Serviços
-- Planos: bronze, prata, ouro, platina, diamante
-- Substitui os planos antigos (profissional, essencial, basico, premium)
-- Obs: o DROP da constraint deve vir ANTES dos UPDATEs, pois a constraint
-- antiga ainda proíbe os novos valores.

-- 1. Remove a constraint antiga antes de alterar os dados
ALTER TABLE perfis_profissional DROP CONSTRAINT IF EXISTS perfis_profissional_premium_plano_check;

-- 2. Mapeia os planos antigos para os novos
UPDATE perfis_profissional SET premium_plano = 'bronze' WHERE premium_plano IN ('profissional', 'essencial');
UPDATE perfis_profissional SET premium_plano = 'prata' WHERE premium_plano = 'basico';
UPDATE perfis_profissional SET premium_plano = 'ouro' WHERE premium_plano IN ('premium', 'mensal', 'anual');
UPDATE perfis_profissional SET premium_plano = 'bronze' WHERE premium_plano IS NULL OR premium_plano NOT IN ('bronze', 'prata', 'ouro', 'platina', 'diamante');

-- 3. Reaplica a nova constraint
ALTER TABLE perfis_profissional ADD CONSTRAINT perfis_profissional_premium_plano_check
  CHECK (premium_plano IN ('bronze', 'prata', 'ouro', 'platina', 'diamante'));

-- 4. Reajusta o limite de fotos conforme o novo plano
UPDATE perfis_profissional SET limite_fotos = CASE
  WHEN premium_plano = 'diamante' THEN 12
  WHEN premium_plano = 'platina' THEN 12
  WHEN premium_plano = 'ouro' THEN 12
  WHEN premium_plano = 'prata' THEN 6
  ELSE 0
END;
