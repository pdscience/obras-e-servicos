-- ====================================================================
-- MIGRAÇÃO DE SEGURANÇA E INTEGRIDADE
-- 1. Proteção de colunas sensíveis em perfis_profissional
-- 2. Correção de RLS permissivo em paginas
-- 3. Trigger automática para cálculo de avaliações em perfis_profissional
-- ====================================================================

-- 1. CORREÇÃO DE RLS EM PAGINAS
-- Revoga o acesso administrativo irrestrito concedido a qualquer usuário/visitante
DROP POLICY IF EXISTS "paginas_all_admin" ON paginas;

CREATE POLICY "paginas_modify_admin" ON paginas
  FOR ALL USING (auth.role() = 'service_role');

-- 2. PROTEÇÃO DE CAMPOS RESTRITOS EM PERFIS_PROFISSIONAL
-- Usuários comuns autenticados só podem atualizar dados básicos do perfil (nome, descrição, preços, etc).
-- Campos monetários, de reputação e verificação só podem ser alterados via service_role (backend/webhooks).
CREATE OR REPLACE FUNCTION check_perfis_profissional_restricted_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a alteração não for feita por um processo de backend com chave service_role
  IF (auth.role() IS NULL OR auth.role() != 'service_role') THEN
    -- Impede adulteração do status premium e planos
    IF (NEW.premium IS DISTINCT FROM OLD.premium) THEN
      RAISE EXCEPTION 'Acesso negado: alteração de status premium é restrita ao sistema.';
    END IF;
    IF (NEW.premium_plano IS DISTINCT FROM OLD.premium_plano) THEN
      RAISE EXCEPTION 'Acesso negado: alteração de plano premium é restrita ao sistema.';
    END IF;
    IF (NEW.premium_expiracao IS DISTINCT FROM OLD.premium_expiracao) THEN
      RAISE EXCEPTION 'Acesso negado: alteração de expiração premium é restrita ao sistema.';
    END IF;

    -- Impede auto-atribuição de selo de verificação
    IF (NEW.verificado IS DISTINCT FROM OLD.verificado) THEN
      RAISE EXCEPTION 'Acesso negado: verificação de perfil é restrita a administradores.';
    END IF;

    -- Impede adulteração manual de notas e estatísticas de reviews
    IF (NEW.avaliacao_media IS DISTINCT FROM OLD.avaliacao_media) THEN
      RAISE EXCEPTION 'Acesso negado: média de avaliações é calculada automaticamente.';
    END IF;
    IF (NEW.total_avaliacoes IS DISTINCT FROM OLD.total_avaliacoes) THEN
      RAISE EXCEPTION 'Acesso negado: total de avaliações é calculado automaticamente.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_perfis_profissional ON perfis_profissional;

CREATE TRIGGER trg_protect_perfis_profissional
  BEFORE UPDATE ON perfis_profissional
  FOR EACH ROW
  EXECUTE FUNCTION check_perfis_profissional_restricted_fields();

-- 3. TRIGGER AUTOMÁTICA PARA CÁLCULO DE AVALIAÇÕES (REVIEWS)
-- Recalcula nota média e total de avaliações sempre que uma review for inserida, alterada ou deletada
CREATE OR REPLACE FUNCTION update_profissional_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_pro_id UUID;
  v_media DECIMAL(3,2);
  v_total INTEGER;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_pro_id := OLD.profissional_id;
  ELSE
    v_pro_id := NEW.profissional_id;
  END IF;

  SELECT
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0),
    COUNT(*)
  INTO v_media, v_total
  FROM reviews
  WHERE profissional_id = v_pro_id;

  UPDATE perfis_profissional
  SET
    avaliacao_media = v_media,
    total_avaliacoes = v_total,
    updated_at = now()
  WHERE id = v_pro_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_reviews_update_rating ON reviews;

CREATE TRIGGER trg_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profissional_rating();

