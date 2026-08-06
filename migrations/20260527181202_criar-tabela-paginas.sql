CREATE TABLE paginas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  conteudo JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'rascunho')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE paginas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paginas_select_public" ON paginas
  FOR SELECT USING (status = 'ativo');

CREATE POLICY "paginas_all_admin" ON paginas
  USING (true);

CREATE OR REPLACE FUNCTION update_paginas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_paginas_updated_at
  BEFORE UPDATE ON paginas
  FOR EACH ROW
  EXECUTE FUNCTION update_paginas_updated_at();