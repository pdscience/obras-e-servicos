-- Tabela base de usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('usuario', 'profissional', 'lojista')),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select_own" ON usuarios
  FOR SELECT USING (id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "usuarios_insert_own" ON usuarios
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (id = auth.uid());

-- Perfil do cliente final
CREATE TABLE perfis_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255),
  cpf VARCHAR(14),
  telefone VARCHAR(20),
  data_nascimento DATE,
  enderecos JSONB DEFAULT '[]',
  uf VARCHAR(2),
  cidade VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE perfis_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfis_usuario_select_own" ON perfis_usuario
  FOR SELECT USING (usuario_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "perfis_usuario_insert_own" ON perfis_usuario
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "perfis_usuario_update_own" ON perfis_usuario
  FOR UPDATE USING (usuario_id = auth.uid());

-- Perfil do profissional (prestador de servico)
CREATE TABLE perfis_profissional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  anos_experiencia INTEGER DEFAULT 0,
  descricao TEXT,
  especialidades JSONB DEFAULT '[]',
  certificacoes JSONB DEFAULT '[]',
  preco_hora DECIMAL(10,2),
  preco_m2 DECIMAL(10,2),
  verificado BOOLEAN DEFAULT false,
  premium BOOLEAN DEFAULT false,
  disponivel BOOLEAN DEFAULT true,
  tempo_resposta VARCHAR(50),
  uf VARCHAR(2),
  cidade VARCHAR(100),
  portfolio JSONB DEFAULT '[]',
  avaliacao_media DECIMAL(3,2) DEFAULT 0,
  total_avaliacoes INTEGER DEFAULT 0,
  total_servicos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE perfis_profissional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfis_profissional_select_public" ON perfis_profissional
  FOR SELECT USING (true);

CREATE POLICY "perfis_profissional_insert_own" ON perfis_profissional
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "perfis_profissional_update_own" ON perfis_profissional
  FOR UPDATE USING (usuario_id = auth.uid());

-- Perfil do lojista
CREATE TABLE perfis_lojista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  cnpj VARCHAR(18) UNIQUE,
  razao_social VARCHAR(255),
  nome_fantasia VARCHAR(255),
  descricao TEXT,
  categorias JSONB DEFAULT '[]',
  endereco TEXT,
  uf VARCHAR(2),
  cidade VARCHAR(100),
  telefone_comercial VARCHAR(20),
  site VARCHAR(255),
  horario_funcionamento JSONB DEFAULT '{}',
  verificado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE perfis_lojista ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfis_lojista_select_public" ON perfis_lojista
  FOR SELECT USING (true);

CREATE POLICY "perfis_lojista_insert_own" ON perfis_lojista
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "perfis_lojista_update_own" ON perfis_lojista
  FOR UPDATE USING (usuario_id = auth.uid());

-- Produtos do lojista
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id UUID NOT NULL REFERENCES perfis_lojista(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  preco DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(20) DEFAULT 'un',
  estoque INTEGER DEFAULT 0,
  imagens JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'indisponivel')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "produtos_select_public" ON produtos
  FOR SELECT USING (true);

CREATE POLICY "produtos_insert_own" ON produtos
  FOR INSERT WITH CHECK (lojista_id IN (
    SELECT id FROM perfis_lojista WHERE usuario_id = auth.uid()
  ));

CREATE POLICY "produtos_update_own" ON produtos
  FOR UPDATE USING (lojista_id IN (
    SELECT id FROM perfis_lojista WHERE usuario_id = auth.uid()
  ));

CREATE POLICY "produtos_delete_own" ON produtos
  FOR DELETE USING (lojista_id IN (
    SELECT id FROM perfis_lojista WHERE usuario_id = auth.uid()
  ));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_perfis_usuario_updated_at BEFORE UPDATE ON perfis_usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_perfis_profissional_updated_at BEFORE UPDATE ON perfis_profissional FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_perfis_lojista_updated_at BEFORE UPDATE ON perfis_lojista FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
