-- NOTE: Esta migração foi aplicada manualmente antes do rastreamento de migrations.
-- Efeitos já presentes no banco: colunas whatsapp/instagram/facebook/limite_fotos.
-- A constraint de premium_plano agora é gerenciada pela migração
-- 20260718000001 (planos bronze/prata/ouro/platina/diamante), portanto
-- NÃO reaplicamos a constraint antiga aqui para evitar conflito.
-- Arquivo mantido apenas para registro no histórico de migrations.

ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS instagram VARCHAR(100);
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS facebook VARCHAR(100);
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS limite_fotos INTEGER DEFAULT 0;
