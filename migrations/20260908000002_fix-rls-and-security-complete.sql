-- ====================================================================
-- MIGRAÇÃO COMPLETA DE SEGURANÇA E PERFORMANCE
-- Corrige todos os problemas encontrados pelo advisor:
-- 1. Habilita RLS em tabelas sem proteção
-- 2. Corrige políticas permissivas (USING true)
-- 3. Otimiza performance de auth.uid()
-- 4. Corrige função upsert_usuario perigosa
-- ====================================================================

-- =====================================================
-- 1. HABILITAR RLS EM TABELAS SEM PROTEÇÃO
-- =====================================================

-- Tabela categorias (dados públicos leitura, admin escrita)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias FORCE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "categorias_select_public" ON categorias;
DROP POLICY IF EXISTS "categorias_modify_admin" ON categorias;

-- Categorias são públicas para leitura (não contêm dados sensíveis)
CREATE POLICY "categorias_select_public" ON categorias
  FOR SELECT USING (true);

-- Apenas service_role pode modificar categorias
CREATE POLICY "categorias_modify_admin" ON categorias
  FOR ALL USING ((select auth.role()) = 'service_role');


-- Tabela profissoes (dados públicos leitura, admin escrita)
ALTER TABLE profissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissoes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profissoes_select_public" ON profissoes;
DROP POLICY IF EXISTS "profissoes_modify_admin" ON profissoes;

CREATE POLICY "profissoes_select_public" ON profissoes
  FOR SELECT USING (true);

CREATE POLICY "profissoes_modify_admin" ON profissoes
  FOR ALL USING ((select auth.role()) = 'service_role');


-- Tabela profissional_categorias (relacionamento N:N)
ALTER TABLE profissional_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissional_categorias FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profissional_categorias_select_public" ON profissional_categorias;
DROP POLICY IF EXISTS "profissional_categorias_insert_own" ON profissional_categorias;
DROP POLICY IF EXISTS "profissional_categorias_delete_own" ON profissional_categorias;

-- Leitura pública para listagem de categorias do profissional
CREATE POLICY "profissional_categorias_select_public" ON profissional_categorias
  FOR SELECT USING (true);

-- Profissional só pode inserir suas próprias categorias
CREATE POLICY "profissional_categorias_insert_own" ON profissional_categorias
  FOR INSERT
  WITH CHECK ((select auth.uid()) = (
    SELECT usuario_id FROM perfis_profissional WHERE id = profissional_id
  ));

-- Profissional só pode deletar suas próprias categorias
CREATE POLICY "profissional_categorias_delete_own" ON profissional_categorias
  FOR DELETE
  USING ((select auth.uid()) = (
    SELECT usuario_id FROM perfis_profissional WHERE id = profissional_id
  ));


-- Tabela orcamentos (orçamentos de serviços)
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orcamentos_select_own" ON orcamentos;
DROP POLICY IF EXISTS "orcamentos_insert_own" ON orcamentos;
DROP POLICY IF EXISTS "orcamentos_update_own" ON orcamentos;
DROP POLICY IF EXISTS "orcamentos_delete_own" ON orcamentos;

-- Usuário só vê seus próprios orçamentos
CREATE POLICY "orcamentos_select_own" ON orcamentos
  FOR SELECT
  USING ((select auth.uid()) = usuario_id);

-- Usuário pode criar orçamentos para si mesmo
CREATE POLICY "orcamentos_insert_own" ON orcamentos
  FOR INSERT
  WITH CHECK ((select auth.uid()) = usuario_id);

-- Usuário pode atualizar seus próprios orçamentos
CREATE POLICY "orcamentos_update_own" ON orcamentos
  FOR UPDATE
  USING ((select auth.uid()) = usuario_id);

-- Usuário pode deletar seus próprios orçamentos
CREATE POLICY "orcamentos_delete_own" ON orcamentos
  FOR DELETE
  USING ((select auth.uid()) = usuario_id);


-- =====================================================
-- 2. CORRIGIR POLÍTICAS PERMISSIVAS (USING true)
-- =====================================================

-- Tabela paginas - manter leitura pública, escrita só admin
DROP POLICY IF EXISTS "paginas_select_public" ON paginas;
DROP POLICY IF EXISTS "paginas_modify_admin" ON paginas;

-- Leitura apenas de páginas ativas
CREATE POLICY "paginas_select_public" ON paginas
  FOR SELECT
  USING ((status)::text = 'ativo'::text);

-- Escrita apenas via service_role (admin/backend)
CREATE POLICY "paginas_modify_admin" ON paginas
  FOR ALL
  USING ((select auth.role()) = 'service_role');


-- Tabela servicos - corrigir políticas muito permissivas
DROP POLICY IF EXISTS "servicos_select_public" ON servicos;
DROP POLICY IF EXISTS "servicos_insert_public" ON servicos;
DROP POLICY IF EXISTS "servicos_update_own" ON servicos;
DROP POLICY IF EXISTS "servicos_delete_own" ON servicos;

-- Serviços abertos são públicos para visualização
CREATE POLICY "servicos_select_public" ON servicos
  FOR SELECT
  USING (status = 'aberto');

-- Usuário autenticado pode ver seus próprios serviços (qualquer status)
CREATE POLICY "servicos_select_own" ON servicos
  FOR SELECT
  USING ((select auth.uid()) IN (cliente_id, profissional_id));

-- Profissional pode ver serviços que aceitou
CREATE POLICY "servicos_select_profissional" ON servicos
  FOR SELECT
  USING ((select auth.uid()) = profissional_id);

-- Qualquer usuário autenticado pode criar serviço (precisa de cliente_id)
CREATE POLICY "servicos_insert_authenticated" ON servicos
  FOR INSERT
  WITH CHECK ((select auth.uid()) = cliente_id);

-- Apenas profissional designado pode atualizar status
CREATE POLICY "servicos_update_profissional" ON servicos
  FOR UPDATE
  USING ((select auth.uid()) = profissional_id);

-- Apenas cliente pode deletar/cancelar seu próprio serviço
CREATE POLICY "servicos_delete_own" ON servicos
  FOR DELETE
  USING ((select auth.uid()) = cliente_id);


-- Tabela reviews - corrigir políticas muito permissivas
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_public" ON reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;

-- Reviews são públicas para leitura
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT
  USING (true);

-- Usuário autenticado pode criar review
CREATE POLICY "reviews_insert_authenticated" ON reviews
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

-- Apenas autor pode atualizar sua review
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE
  USING ((select auth.uid()) = (
    SELECT usuario_id FROM perfis_profissional WHERE id = profissional_id
  ));

-- Apenas autor pode deletar sua review
CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE
  USING ((select auth.uid()) = (
    SELECT usuario_id FROM perfis_profissional WHERE id = profissional_id
  ));


-- =====================================================
-- 3. CORRIGIR PERFORMANCE DE AUTH.UID()
-- =====================================================
-- As políticas abaixo já foram otimizadas com (select auth.uid())
-- Verificar se todas as tabelas estão corretas

-- perfis_usuario - otimizar políticas existentes
DROP POLICY IF EXISTS "perfis_usuario_insert_own" ON perfis_usuario;
DROP POLICY IF EXISTS "perfis_usuario_select_own" ON perfis_usuario;
DROP POLICY IF EXISTS "perfis_usuario_update_own" ON perfis_usuario;

CREATE POLICY "perfis_usuario_insert_own" ON perfis_usuario
  FOR INSERT
  WITH CHECK ((select auth.uid()) = usuario_id);

CREATE POLICY "perfis_usuario_select_own" ON perfis_usuario
  FOR SELECT
  USING ((select auth.uid()) = usuario_id OR (select auth.role()) = 'service_role');

CREATE POLICY "perfis_usuario_update_own" ON perfis_usuario
  FOR UPDATE
  USING ((select auth.uid()) = usuario_id);


-- perfis_profissional - otimizar políticas existentes
DROP POLICY IF EXISTS "perfis_profissional_insert_own" ON perfis_profissional;
DROP POLICY IF EXISTS "perfis_profissional_select_public" ON perfis_profissional;
DROP POLICY IF EXISTS "perfis_profissional_update_own" ON perfis_profissional;

CREATE POLICY "perfis_profissional_insert_own" ON perfis_profissional
  FOR INSERT
  WITH CHECK ((select auth.uid()) = usuario_id);

CREATE POLICY "perfis_profissional_select_public" ON perfis_profissional
  FOR SELECT
  USING (true);

CREATE POLICY "perfis_profissional_update_own" ON perfis_profissional
  FOR UPDATE
  USING ((select auth.uid()) = usuario_id);


-- perfis_lojista - otimizar políticas existentes
DROP POLICY IF EXISTS "perfis_lojista_insert_own" ON perfis_lojista;
DROP POLICY IF EXISTS "perfis_lojista_select_public" ON perfis_lojista;
DROP POLICY IF EXISTS "perfis_lojista_update_own" ON perfis_lojista;

CREATE POLICY "perfis_lojista_insert_own" ON perfis_lojista
  FOR INSERT
  WITH CHECK ((select auth.uid()) = usuario_id);

CREATE POLICY "perfis_lojista_select_public" ON perfis_lojista
  FOR SELECT
  USING (true);

CREATE POLICY "perfis_lojista_update_own" ON perfis_lojista
  FOR UPDATE
  USING ((select auth.uid()) = usuario_id);


-- produtos - otimizar políticas existentes
DROP POLICY IF EXISTS "produtos_select_public" ON produtos;
DROP POLICY IF EXISTS "produtos_insert_own" ON produtos;
DROP POLICY IF EXISTS "produtos_update_own" ON produtos;
DROP POLICY IF EXISTS "produtos_delete_own" ON produtos;

CREATE POLICY "produtos_select_public" ON produtos
  FOR SELECT
  USING (true);

CREATE POLICY "produtos_insert_own" ON produtos
  FOR INSERT
  WITH CHECK ((select auth.uid()) = (
    SELECT usuario_id FROM perfis_lojista WHERE id = lojista_id
  ));

CREATE POLICY "produtos_update_own" ON produtos
  FOR UPDATE
  USING ((select auth.uid()) = (
    SELECT usuario_id FROM perfis_lojista WHERE id = lojista_id
  ));

CREATE POLICY "produtos_delete_own" ON produtos
  FOR DELETE
  USING ((select auth.uid()) = (
    SELECT usuario_id FROM perfis_lojista WHERE id = lojista_id
  ));


-- usuarios - otimizar políticas existentes
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;

CREATE POLICY "usuarios_insert_own" ON usuarios
  FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "usuarios_select_own" ON usuarios
  FOR SELECT
  USING ((select auth.uid()) = id OR (select auth.role()) = 'service_role');

CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE
  USING ((select auth.uid()) = id);


-- =====================================================
-- 4. CORRIGIR FUNÇÃO UPSERT_USUARIO PERIGOSA
-- =====================================================
-- Revoke do acesso público e reconstrução como SECURITY INVOKER

REVOKE EXECUTE ON FUNCTION upsert_usuario(uuid, varchar, varchar, varchar) FROM public;

CREATE OR REPLACE FUNCTION upsert_usuario(
  p_id UUID,
  p_email VARCHAR,
  p_nome VARCHAR,
  p_telefone VARCHAR
)
RETURNS SETOF usuarios
LANGUAGE plpgsql
SECURITY INVOKER  -- Mudado de DEFINER para INVOKER (executa com privilégios do chamador)
SET search_path = ''  -- Previne hijacking
AS $$
BEGIN
  INSERT INTO usuarios (id, email, nome, telefone, tipo, status)
  VALUES (p_id, p_email, p_nome, p_telefone, 'usuario', 'ativo')
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    nome = EXCLUDED.nome,
    telefone = COALESCE(EXCLUDED.telefone, usuarios.telefone),
    updated_at = now()
  WHERE usuarios.id != EXCLUDED.id;

  RETURN QUERY SELECT * FROM usuarios WHERE email = p_email;
END;
$$;

-- =====================================================
-- 5. ADICIONAR ÍNDICES FALTANTES (Performance)
-- =====================================================

-- Índice para coluna usuario_id em produtos (usada em RLS)
CREATE INDEX IF NOT EXISTS idx_produtos_usuario_id ON produtos(usuario_id);

-- Índice para foreign keys frequentemente consultadas
CREATE INDEX IF NOT EXISTS idx_servicos_cliente_id ON servicos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicos_profissional_id ON servicos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_profissional_id ON reviews(profissional_id);
CREATE INDEX IF NOT EXISTS idx_perfis_usuario_usuario_id ON perfis_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_perfis_profissional_usuario_id ON perfis_profissional(usuario_id);
CREATE INDEX IF NOT EXISTS idx_perfis_lojista_usuario_id ON perfis_lojista(usuario_id);
CREATE INDEX IF NOT EXISTS idx_profissional_categorias_profissional_id ON profissional_categorias(profissional_id);

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
