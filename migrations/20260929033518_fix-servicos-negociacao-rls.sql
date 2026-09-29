-- =====================================================
-- Corrige a negociação/aceitação de serviços (RLS)
-- Problema: profissional_id guarda o ID do PERFIL
-- (perfis_profissional.id), mas as políticas comparavam
-- auth.uid() (usuario_id) com profissional_id, e a única
-- política de UPDATE exigia auth.uid() = profissional_id
-- (nulo em serviços abertos) -> 0 linhas atualizadas ->
-- "Serviço não encontrado ou não está mais disponível".
-- =====================================================

-- Helper: o perfil profissional pertence ao usuário logado?
-- SECURITY DEFINER evita recursão de RLS ao consultar perfis_profissional.
CREATE OR REPLACE FUNCTION public.eh_dono_do_perfil(perfil_id TEXT, uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis_profissional p
    WHERE p.id::TEXT = perfil_id AND p.usuario_id = uid
  );
$$;

GRANT EXECUTE ON FUNCTION public.eh_dono_do_perfil(TEXT, UUID) TO anon, authenticated;

-- SELECT: cliente vê os próprios serviços; profissional vê os que assumiu
DROP POLICY IF EXISTS "servicos_select_own" ON public.servicos;
CREATE POLICY "servicos_select_own" ON public.servicos
  FOR SELECT
  USING (
    (select auth.uid())::text = cliente_id
    OR public.eh_dono_do_perfil(profissional_id, (select auth.uid()))
  );

-- UPDATE:
--  * cliente altera o próprio serviço (cancelar/concluir);
--  * profissional pode ASSUMIR serviço aberto ainda sem dono
--    (aceitar/negociar: grava profissional_id + status + whatsapp);
--  * profissional altera os serviços que já assumiu.
DROP POLICY IF EXISTS "servicos_update_profissional" ON public.servicos;
DROP POLICY IF EXISTS "servicos_update_participantes" ON public.servicos;
CREATE POLICY "servicos_update_participantes" ON public.servicos
  FOR UPDATE
  USING (
    (select auth.uid())::text = cliente_id
    OR public.eh_dono_do_perfil(profissional_id, (select auth.uid()))
    OR (status = 'aberto' AND (profissional_id IS NULL OR profissional_id = ''))
  )
  WITH CHECK (
    (select auth.uid())::text = cliente_id
    OR public.eh_dono_do_perfil(profissional_id, (select auth.uid()))
  );
