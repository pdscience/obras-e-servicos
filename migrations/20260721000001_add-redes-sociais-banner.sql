-- Adiciona campos de redes sociais extras e banner para planos superiores
-- Ouro+: youtube, linkedin, x (twitter)
-- Diamante: banner_url para promoção da loja

-- perfis_profissional
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS youtube VARCHAR(200);
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS linkedin VARCHAR(200);
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS x VARCHAR(200);
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- perfis_lojista
ALTER TABLE perfis_lojista ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT false;
ALTER TABLE perfis_lojista ADD COLUMN IF NOT EXISTS premium_expiracao TIMESTAMP WITH TIME ZONE;
ALTER TABLE perfis_lojista ADD COLUMN IF NOT EXISTS banner_url TEXT;
