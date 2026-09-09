-- Adiciona campos de endereço ao perfil do profissional
-- Usados para exibir a localização no perfil público (município, UF, bairro)
-- e preenchidos via busca automática de CEP (ViaCEP) nas configurações

ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS cep VARCHAR(10);
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS endereco VARCHAR(255);
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS numero VARCHAR(20);
ALTER TABLE perfis_profissional ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);