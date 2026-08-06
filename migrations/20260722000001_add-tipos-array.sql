-- Adicionar coluna tipos como array para suportar múltiplos perfis por usuário
-- Um usuário pode ser cliente, profissional e lojista ao mesmo tempo com o mesmo email

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipos TEXT[] DEFAULT ARRAY['cliente'];

-- Migrar dados existentes: converter tipo único para array
UPDATE usuarios SET tipos = ARRAY[tipo] WHERE tipos IS NULL OR array_length(tipos, 1) IS NULL;

-- Garantir que todo usuário tenha pelo menos 'cliente' no array
UPDATE usuarios SET tipos = array_distinct(array_append(tipos, 'cliente')) WHERE NOT ('cliente' = ANY(tipos));

-- Adicionar constraint para valores válidos
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS validar_tipos;
ALTER TABLE usuarios ADD CONSTRAINT validar_tipos CHECK (
  tipos <@ ARRAY['cliente'::text, 'profissional'::text, 'lojista'::text, 'usuario'::text]
);

-- Criar índice para buscas por tipo
CREATE INDEX IF NOT EXISTS idx_usuarios_tipos ON usuarios USING GIN (tipos);

-- Comentários para documentação
COMMENT ON COLUMN usuarios.tipos IS 'Array de tipos/perfis do usuário: cliente, profissional, lojista, usuario';