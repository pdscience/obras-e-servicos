ALTER TABLE perfis_profissional
ADD COLUMN premium_plano VARCHAR(20) CHECK (premium_plano IN ('mensal', 'anual')),
ADD COLUMN premium_expiracao TIMESTAMPTZ;

CREATE INDEX idx_perfis_profissional_premium ON perfis_profissional (premium, premium_expiracao)
  WHERE premium = true;

CREATE OR REPLACE FUNCTION expirar_premium()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.premium = true AND NEW.premium_expiracao IS NOT NULL AND NEW.premium_expiracao <= NOW() THEN
    NEW.premium = false;
    NEW.premium_plano = NULL;
    NEW.premium_expiracao = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expirar_premium
  BEFORE INSERT OR UPDATE ON perfis_profissional
  FOR EACH ROW EXECUTE FUNCTION expirar_premium();
