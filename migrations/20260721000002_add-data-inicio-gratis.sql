-- Adiciona campo para controlar período gratuito de 60 dias (inauguração)
-- Quando preenchido, significa que o profissional está no período gratuito

ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS data_inicio_gratis TIMESTAMP WITH TIME ZONE;
ALTER TABLE perfis_lojista ADD COLUMN IF NOT EXISTS data_inicio_gratis TIMESTAMP WITH TIME ZONE;
