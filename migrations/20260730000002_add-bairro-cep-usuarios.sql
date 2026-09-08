-- Adicionar campos bairro e cep na tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cep VARCHAR(10);
