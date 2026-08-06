-- Ensures categorias and profissoes have correct data matching mainCategories
-- Uses ON CONFLICT DO NOTHING to avoid breaking existing data

-- 1. Ensure all 14 categories exist
INSERT INTO categorias (nome, slug, descricao) VALUES
  ('Estrutura e Alvenaria', 'estrutura-e-alvenaria', 'Profissionais responsáveis pela construção da base, paredes e estruturas da obra.'),
  ('Fundação e Terraplanagem', 'fundacao-e-terraplanagem', 'Especialistas em preparo do solo, fundações e movimentação de terra.'),
  ('Acabamento', 'acabamento', 'Profissionais que dão o toque final à obra com revestimentos e acabamentos.'),
  ('Cobertura e Impermeabilização', 'cobertura-e-impermeabilizacao', 'Telhados, calhas, mantas e soluções para proteger a edificação.'),
  ('Instalações Elétricas e Hidráulicas', 'instalacoes-eletricas-e-hidraulicas', 'Eletricistas, encanadores e instaladores de sistemas prediais.'),
  ('Climatização e Refrigeração', 'climatizacao-e-refrigeracao', 'Instalação e manutenção de sistemas de ar-condicionado e ventilação.'),
  ('Automação e Tecnologia', 'automacao-e-tecnologia', 'Casas inteligentes, segurança eletrônica, redes e energia solar.'),
  ('Esquadrias, Vidros e Marcenaria', 'esquadrias-vidros-e-marcenaria', 'Portas, janelas, vidros, marcenaria e divisórias.'),
  ('Limpeza Pós-Obra e Conservação', 'limpeza-pos-obra-e-conservacao', 'Limpeza pesada, fachadas, desentupimento e controle de pragas.'),
  ('Externos, Paisagismo e Lazer', 'externos-paisagismo-e-lazer', 'Jardins, piscinas, decks, playgrounds e áreas externas.'),
  ('Mudanças e Logística', 'mudancas-e-logistica', 'Carregadores, motoristas e içamento para mudanças e obras.'),
  ('Sustentabilidade e Eficiência', 'sustentabilidade-e-eficiencia', 'Reuso de água, telhado verde e certificações ambientais.'),
  ('Segurança do Trabalho', 'seguranca-do-trabalho', 'Técnicos e engenheiros de segurança e bombeiros civis.'),
  ('Técnicos, Projetos e Gestão', 'tecnicos-projetos-e-gestao', 'Arquitetos, engenheiros, designers e gestores de obra.')
ON CONFLICT (nome) DO NOTHING;

-- 2. Ensure all profissoes exist (linked to correct categories)
-- Helper function
CREATE OR REPLACE FUNCTION _seed_get_cat_id(slug_param TEXT) RETURNS UUID LANGUAGE SQL STABLE AS
$$ SELECT id FROM categorias WHERE slug = slug_param $$;

-- Estrutura e Alvenaria
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('estrutura-e-alvenaria'), nome FROM (VALUES
  ('Pedreiro'), ('Servente / Ajudante de obra'), ('Armador (ferreiro)'),
  ('Carpinteiro de fôrmas'), ('Carpinteiro de telhado'), ('Concreteiro'),
  ('Bombeador de concreto'), ('Estruturador metálico'), ('Montador de pré-moldados'),
  ('Montador de andaimes'), ('Demolidor')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Fundação e Terraplanagem
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('fundacao-e-terraplanagem'), nome FROM (VALUES
  ('Topógrafo'), ('Sondador de solo (SPT)'), ('Geotécnico'),
  ('Operador de retroescavadeira / escavadeira / pá-carregadeira'),
  ('Operador de bate-estaca'), ('Operador de rolo compactador'),
  ('Operador de betoneira / caminhão betoneira'), ('Operador de guindaste / munck'),
  ('Operador de grua')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Acabamento
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('acabamento'), nome FROM (VALUES
  ('Pintor'), ('Pintor de epóxi / piso industrial'),
  ('Aplicador de textura, grafiato e massa projetada'), ('Gesseiro'), ('Estucador'),
  ('Azulejista / Ladrilheiro'), ('Aplicador de porcelanato (inclusive grandes formatos)'),
  ('Marmorista / Granitero'), ('Rejuntador'), ('Papeleiro'),
  ('Aplicador de cimento queimado / microcimento'), ('Aplicador de revestimento 3D')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Cobertura e Impermeabilização
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('cobertura-e-impermeabilizacao'), nome FROM (VALUES
  ('Telhadista'), ('Calheiro'), ('Impermeabilizador'),
  ('Aplicador de manta asfáltica / líquida'), ('Instalador de telhas térmicas e sanduíche'),
  ('Instalador de domus e claraboias')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Instalações Elétricas e Hidráulicas
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('instalacoes-eletricas-e-hidraulicas'), nome FROM (VALUES
  ('Eletricista'), ('Eletricista de baixa e alta tensão'), ('Encanador / Bombeiro hidráulico'),
  ('Instalador de gás (GLP / GN)'), ('Instalador de aquecedores (solar, a gás, boiler)'),
  ('Instalador de bombas e pressurizadores'), ('Instalador de caixa d''água e cisterna'),
  ('Poceiro (poço artesiano / semi-artesiano)'), ('Instalador de fossa séptica e biodigestor')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Climatização e Refrigeração
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('climatizacao-e-refrigeracao'), nome FROM (VALUES
  ('Instalador de ar-condicionado (split, multi-split, VRF)'),
  ('Técnico em refrigeração'), ('Instalador de exaustão e ventilação'),
  ('Instalador de dutos e PMOC')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Automação e Tecnologia
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('automacao-e-tecnologia'), nome FROM (VALUES
  ('Instalador de automação residencial (casa inteligente)'),
  ('Programador de automação (KNX, Crestron, Control4, Home Assistant)'),
  ('Instalador de iluminação inteligente / cênica'),
  ('Instalador de cortinas e persianas automatizadas'), ('Instalador de portões automáticos'),
  ('Instalador de fechaduras digitais e biometria'), ('Instalador de interfones e videoporteiros'),
  ('Instalador de CFTV / câmeras IP'), ('Instalador de alarmes e sensores'),
  ('Instalador de cerca elétrica e concertina'), ('Instalador de controle de acesso (catracas, tags, facial)'),
  ('Instalador de redes (cabeamento estruturado, fibra óptica)'), ('Instalador de Wi-Fi e roteadores mesh'),
  ('Instalador de som ambiente e home theater'), ('Instalador de painéis solares fotovoltaicos'),
  ('Técnico em energia solar / banco de baterias'), ('Instalador de carregador de veículo elétrico'),
  ('Instalador de para-raios (SPDA)'), ('Instalador de nobreak e gerador')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Esquadrias, Vidros e Marcenaria
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('esquadrias-vidros-e-marcenaria'), nome FROM (VALUES
  ('Serralheiro'), ('Marceneiro'), ('Vidraceiro'),
  ('Instalador de portas e janelas (madeira, alumínio, PVC)'), ('Instalador de box de banheiro'),
  ('Instalador de divisórias (drywall, eucatex, naval)'), ('Instalador de drywall / steel frame / wood frame'),
  ('Instalador de forros (PVC, gesso, modular)'), ('Instalador de pisos laminados, vinílicos e de madeira'),
  ('Tapeceiro / Estofador')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Limpeza Pós-Obra e Conservação
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('limpeza-pos-obra-e-conservacao'), nome FROM (VALUES
  ('Limpador pós-obra (faxina pesada)'), ('Aplicador de cera e polimento de pisos'),
  ('Cristalizador de mármore e granito'), ('Polidor de porcelanato'),
  ('Limpeza de fachadas (rapel)'), ('Limpeza de vidros em altura'), ('Lavagem de telhados e calhas'),
  ('Hidrojateamento'), ('Desentupidor'), ('Limpa-fossa'),
  ('Dedetizador / Controle de pragas'), ('Descupinizador')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Externos, Paisagismo e Lazer
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('externos-paisagismo-e-lazer'), nome FROM (VALUES
  ('Jardineiro / Paisagista'), ('Piscineiro (construção, manutenção e tratamento)'),
  ('Construtor de spa, ofurô e sauna'), ('Pavimentador (asfalto, bloquete, intertravado)'),
  ('Muralista (construção de muros e arrimo)'), ('Cerquista (alambrado, madeira, concertina)'),
  ('Instalador de grama sintética e natural'), ('Instalador de deck (madeira, WPC)'),
  ('Instalador de pergolado e gazebo'), ('Instalador de playground')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Mudanças e Logística
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('mudancas-e-logistica'), nome FROM (VALUES
  ('Carregador / Ajudante de mudança'), ('Motorista de caminhão de obra'),
  ('Içamento de móveis e equipamentos')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Sustentabilidade e Eficiência
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('sustentabilidade-e-eficiencia'), nome FROM (VALUES
  ('Instalador de reuso de água da chuva'), ('Instalador de telhado verde'),
  ('Consultor de eficiência energética'), ('Consultor de certificação LEED / AQUA')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Segurança do Trabalho
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('seguranca-do-trabalho'), nome FROM (VALUES
  ('Técnico de segurança do trabalho'), ('Engenheiro de segurança'), ('Bombeiro civil')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

-- Técnicos, Projetos e Gestão
INSERT INTO profissoes (categoria_id, nome)
SELECT _seed_get_cat_id('tecnicos-projetos-e-gestao'), nome FROM (VALUES
  ('Arquiteto'), ('Engenheiro civil / elétrico / hidráulico / mecânico'),
  ('Designer de interiores'), ('Decorador'), ('Luminotécnico'),
  ('Acústico (projeto e tratamento)'), ('Paisagista (projeto)'), ('Mestre de obras'),
  ('Encarregado de obra'), ('Orçamentista'), ('Gerente de obra'), ('Fiscal de obra'),
  ('Despachante / Aprovador de projetos')
) AS v(nome)
ON CONFLICT (categoria_id, nome) DO NOTHING;

DROP FUNCTION IF EXISTS _seed_get_cat_id;
