-- Corrigir CHECK constraint da coluna tipo para aceitar 'cliente'
-- A constraint original so permitia: usuario, profissional, lojista
-- Agora aceita tambem: cliente (necessario para o sistema multi-role)

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_tipo_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_tipo_check
  CHECK (tipo IN ('usuario', 'profissional', 'lojista', 'cliente'));
