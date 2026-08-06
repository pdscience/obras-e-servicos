import { Professional, Category, MainCategory, PerfilLojista, Produto, Usuario } from '../types';

export const mainCategories: MainCategory[] = [
  { id: 'mc-1', name: 'Estrutura e Alvenaria', icon: 'Hammer', color: '#f0a500', description: 'Profissionais responsáveis pela construção da base, paredes e estruturas da obra.', professions: ['Pedreiro', 'Servente / Ajudante de obra', 'Armador (ferreiro)', 'Carpinteiro de fôrmas', 'Carpinteiro de telhado', 'Concreteiro', 'Bombeador de concreto', 'Estruturador metálico', 'Montador de pré-moldados', 'Montador de andaimes', 'Demolidor'] },
  { id: 'mc-2', name: 'Fundação e Terraplanagem', icon: 'Shovel', color: '#d97706', description: 'Especialistas em preparo do solo, fundações e movimentação de terra.', professions: ['Topógrafo', 'Sondador de solo (SPT)', 'Geotécnico', 'Operador de retroescavadeira / escavadeira / pá-carregadeira', 'Operador de bate-estaca', 'Operador de rolo compactador', 'Operador de betoneira / caminhão betoneira', 'Operador de guindaste / munck', 'Operador de grua'] },
  { id: 'mc-3', name: 'Acabamento', icon: 'Paintbrush', color: '#e11d48', description: 'Profissionais que dão o toque final à obra com revestimentos e acabamentos.', professions: ['Pintor', 'Pintor de epóxi / piso industrial', 'Aplicador de textura, grafiato e massa projetada', 'Gesseiro', 'Estucador', 'Azulejista / Ladrilheiro', 'Aplicador de porcelanato (inclusive grandes formatos)', 'Marmorista / Granitero', 'Rejuntador', 'Papeleiro', 'Aplicador de cimento queimado / microcimento', 'Aplicador de revestimento 3D'] },
  { id: 'mc-4', name: 'Cobertura e Impermeabilização', icon: 'House', color: '#7c3aed', description: 'Telhados, calhas, mantas e soluções para proteger a edificação.', professions: ['Telhadista', 'Calheiro', 'Impermeabilizador', 'Aplicador de manta asfáltica / líquida', 'Instalador de telhas térmicas e sanduíche', 'Instalador de domus e claraboias'] },
  { id: 'mc-5', name: 'Instalações Elétricas e Hidráulicas', icon: 'Zap', color: '#f0b429', description: 'Eletricistas, encanadores e instaladores de sistemas prediais.', professions: ['Eletricista', 'Eletricista de baixa e alta tensão', 'Encanador / Bombeiro hidráulico', 'Instalador de gás (GLP / GN)', 'Instalador de aquecedores (solar, a gás, boiler)', 'Instalador de bombas e pressurizadores', 'Instalador de caixa d\'água e cisterna', 'Poceiro (poço artesiano / semi-artesiano)', 'Instalador de fossa séptica e biodigestor'] },
  { id: 'mc-6', name: 'Climatização e Refrigeração', icon: 'Wind', color: '#0ea5e9', description: 'Instalação e manutenção de sistemas de ar-condicionado e ventilação.', professions: ['Instalador de ar-condicionado (split, multi-split, VRF)', 'Técnico em refrigeração', 'Instalador de exaustão e ventilação', 'Instalador de dutos e PMOC'] },
  { id: 'mc-7', name: 'Automação e Tecnologia', icon: 'Cpu', color: '#22c55e', description: 'Casas inteligentes, segurança eletrônica, redes e energia solar.', professions: ['Instalador de automação residencial (casa inteligente)', 'Programador de automação (KNX, Crestron, Control4, Home Assistant)', 'Instalador de iluminação inteligente / cênica', 'Instalador de cortinas e persianas automatizadas', 'Instalador de portões automáticos', 'Instalador de fechaduras digitais e biometria', 'Instalador de interfones e videoporteiros', 'Instalador de CFTV / câmeras IP', 'Instalador de alarmes e sensores', 'Instalador de cerca elétrica e concertina', 'Instalador de controle de acesso (catracas, tags, facial)', 'Instalador de redes (cabeamento estruturado, fibra óptica)', 'Instalador de Wi-Fi e roteadores mesh', 'Instalador de som ambiente e home theater', 'Instalador de painéis solares fotovoltaicos', 'Técnico em energia solar / banco de baterias', 'Instalador de carregador de veículo elétrico', 'Instalador de para-raios (SPDA)', 'Instalador de nobreak e gerador'] },
  { id: 'mc-8', name: 'Esquadrias, Vidros e Marcenaria', icon: 'Frame', color: '#a16207', description: 'Portas, janelas, vidros, marcenaria e divisórias.', professions: ['Serralheiro', 'Marceneiro', 'Vidraceiro', 'Instalador de portas e janelas (madeira, alumínio, PVC)', 'Instalador de box de banheiro', 'Instalador de divisórias (drywall, eucatex, naval)', 'Instalador de drywall / steel frame / wood frame', 'Instalador de forros (PVC, gesso, modular)', 'Instalador de pisos laminados, vinílicos e de madeira', 'Tapeceiro / Estofador'] },
  { id: 'mc-9', name: 'Limpeza Pós-Obra e Conservação', icon: 'Sparkles', color: '#06b6d4', description: 'Limpeza pesada, fachadas, desentupimento e controle de pragas.', professions: ['Limpador pós-obra (faxina pesada)', 'Aplicador de cera e polimento de pisos', 'Cristalizador de mármore e granito', 'Polidor de porcelanato', 'Limpeza de fachadas (rapel)', 'Limpeza de vidros em altura', 'Lavagem de telhados e calhas', 'Hidrojateamento', 'Desentupidor', 'Limpa-fossa', 'Dedetizador / Controle de pragas', 'Descupinizador'] },
  { id: 'mc-10', name: 'Externos, Paisagismo e Lazer', icon: 'Trees', color: '#16a34a', description: 'Jardins, piscinas, decks, playgrounds e áreas externas.', professions: ['Jardineiro / Paisagista', 'Piscineiro (construção, manutenção e tratamento)', 'Construtor de spa, ofurô e sauna', 'Pavimentador (asfalto, bloquete, intertravado)', 'Muralista (construção de muros e arrimo)', 'Cerquista (alambrado, madeira, concertina)', 'Instalador de grama sintética e natural', 'Instalador de deck (madeira, WPC)', 'Instalador de pergolado e gazebo', 'Instalador de playground'] },
  { id: 'mc-11', name: 'Mudanças e Logística', icon: 'Truck', color: '#ea580c', description: 'Carregadores, motoristas e içamento para mudanças e obras.', professions: ['Carregador / Ajudante de mudança', 'Motorista de caminhão de obra', 'Içamento de móveis e equipamentos'] },
  { id: 'mc-12', name: 'Sustentabilidade e Eficiência', icon: 'Leaf', color: '#15803d', description: 'Reuso de água, telhado verde e certificações ambientais.', professions: ['Instalador de reuso de água da chuva', 'Instalador de telhado verde', 'Consultor de eficiência energética', 'Consultor de certificação LEED / AQUA'] },
  { id: 'mc-13', name: 'Segurança do Trabalho', icon: 'Shield', color: '#dc2626', description: 'Técnicos e engenheiros de segurança e bombeiros civis.', professions: ['Técnico de segurança do trabalho', 'Engenheiro de segurança', 'Bombeiro civil'] },
  { id: 'mc-14', name: 'Técnicos, Projetos e Gestão', icon: 'Building2', color: '#7ee8fa', description: 'Arquitetos, engenheiros, designers e gestores de obra.', professions: ['Arquiteto', 'Engenheiro civil / elétrico / hidráulico / mecânico', 'Designer de interiores', 'Decorador', 'Luminotécnico', 'Acústico (projeto e tratamento)', 'Paisagista (projeto)', 'Mestre de obras', 'Encarregado de obra', 'Orçamentista', 'Gerente de obra', 'Fiscal de obra', 'Despachante / Aprovador de projetos'] }
];

export const categories: Category[] = [
  { id: '1', name: 'Eletricista', icon: 'Zap', count: 1, subcategories: ['Instalação Residencial', 'Instalação Comercial', 'Manutenção', 'Automação', 'Energia Solar'], mainCategoryId: 'mc-5' },
  { id: '2', name: 'Encanador', icon: 'Droplets', count: 1, subcategories: ['Hidráulica', 'Esgoto', 'Aquecimento', 'Caixa d\'água', 'Desentupimento'], mainCategoryId: 'mc-5' },
  { id: '3', name: 'Pedreiro', icon: 'Hammer', count: 0, subcategories: ['Alvenaria', 'Reboco', 'Contrapiso', 'Fundação', 'Reforma Geral'], mainCategoryId: 'mc-1' },
  { id: '4', name: 'Pintor', icon: 'Paintbrush', count: 0, subcategories: ['Pintura Interna', 'Pintura Externa', 'Textura', 'Efeitos Decorativos', 'Impermeabilização'], mainCategoryId: 'mc-3' },
  { id: '5', name: 'Gesseiro', icon: 'Square', count: 0, subcategories: ['Forro', 'Drywall', 'Sancas', 'Molduras', 'Reparos'], mainCategoryId: 'mc-3' },
  { id: '6', name: 'Marceneiro', icon: 'Armchair', count: 0, subcategories: ['Móveis Planejados', 'Portas', 'Armários', 'Restauração', 'Deck de Madeira'], mainCategoryId: 'mc-8' },
  { id: '7', name: 'Serralheiro', icon: 'Shield', count: 0, subcategories: ['Portões', 'Grades', 'Escadas', 'Estruturas Metálicas', 'Manutenção'], mainCategoryId: 'mc-8' },
  { id: '8', name: 'Azulejista', icon: 'Grid3x3', count: 0, subcategories: ['Piso Cerâmico', 'Porcelanato', 'Pastilhas', 'Mosaico', 'Rejunte'], mainCategoryId: 'mc-3' },
  { id: '9', name: 'Vidraceiro', icon: 'AppWindow', count: 0, subcategories: ['Box de Banheiro', 'Janelas', 'Espelhos', 'Fachadas', 'Vidros Temperados'], mainCategoryId: 'mc-8' },
  { id: '10', name: 'Jardineiro', icon: 'Flower2', count: 0, subcategories: ['Paisagismo', 'Manutenção', 'Poda', 'Irrigação', 'Hortas'], mainCategoryId: 'mc-10' },
  { id: '11', name: 'Ar Condicionado', icon: 'Wind', count: 0, subcategories: ['Instalação', 'Manutenção', 'Limpeza', 'Conserto', 'Split/Central'], mainCategoryId: 'mc-6' },
  { id: '12', name: 'Arquiteto', icon: 'Building2', count: 0, subcategories: ['Projeto Residencial', 'Projeto Comercial', 'Interiores', 'Reforma', 'Laudo Técnico'], mainCategoryId: 'mc-14' }
];

export const professionals: Professional[] = [];

export const lojistas: PerfilLojista[] = [
  {
    id: 'loj-1', usuario_id: 'usr-loj-1', nome: 'Material de Construção ABC',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
    cnpj: '12.345.678/0001-90', razao_social: 'ABC Materiais para Construção Ltda', nome_fantasia: 'ABC Materiais',
    descricao: 'Distribuidora de materiais de construção com mais de 20 anos de mercado. Entregamos em toda a região metropolitana.',
    categorias: ['Cimento e Argamassa', 'Tintas', 'Hidráulica', 'Elétrica', 'Ferramentas'],
    endereco: 'Av. Paulista, 1000', uf: 'SP', cidade: 'São Paulo',
    lat: -23.5505, lng: -46.6333,
    telefone_comercial: '(11) 3000-1234', site: 'https://abcmateriais.com.br',
    social_facebook: 'https://facebook.com/abcmateriais', social_instagram: 'https://instagram.com/abc_materiais', social_youtube: 'https://youtube.com/@abcmateriais',
    horario_funcionamento: { seg_sex: '07:00-18:00', sab: '07:00-13:00' },
    verificado: true, avaliacao_media: 4.7, total_avaliacoes: 312,
    created_at: '2022-03-10T08:00:00Z', updated_at: '2026-05-01T10:00:00Z'
  }
];

export const stats = {
  professionals: professionals.length,
  completedJobs: professionals.length,
  happyClients: lojistas.length,
  cities: new Set(professionals.map(p => p.location.split(',')[0].trim())).size
};

export const produtos: Produto[] = [
  { id: 'prod-1', lojista_id: 'loj-1', nome: 'Cimento CP-32 50kg', descricao: 'Cimento Portland CP-32, saco 50kg. Ideal para assentamento de blocos, contrapisos e estruturas.', categoria: 'Cimento e Argamassa', preco: 42.90, unidade: 'saco', estoque: 500, imagens: [], status: 'ativo', lojista_nome: 'ABC Materiais', created_at: '2026-01-10T08:00:00Z', updated_at: '2026-05-20T10:00:00Z' },
  { id: 'prod-2', lojista_id: 'loj-1', nome: 'Tinta Acrílica Premium Branco 18L', descricao: 'Tinta acrílica fosca premium, alto rendimento. Cobre até 300m² por demão.', categoria: 'Tintas', preco: 189.90, unidade: 'galão', estoque: 120, imagens: [], status: 'ativo', lojista_nome: 'ABC Materiais', created_at: '2026-02-05T08:00:00Z', updated_at: '2026-05-18T10:00:00Z' },
  { id: 'prod-3', lojista_id: 'loj-1', nome: 'Tubo PVC Esgoto 100mm x 3m', descricao: 'Tubo PVC para esgoto predial, ponta e bolsa, 100mm de diâmetro.', categoria: 'Hidráulica', preco: 34.50, unidade: 'un', estoque: 300, imagens: [], status: 'ativo', lojista_nome: 'ABC Materiais', created_at: '2026-01-15T08:00:00Z', updated_at: '2026-05-10T10:00:00Z' }
];

export const usuarios: Usuario[] = [
  { id: 'usr-1', email: 'carlos@email.com', nome: 'Carlos Almeida', telefone: '(11) 98765-4321', tipo: 'usuario', status: 'ativo', avatar_url: null, created_at: '2025-06-10T10:00:00Z', updated_at: '2026-05-20T10:00:00Z' },
  { id: 'usr-prof-1', email: 'carlos.silva@email.com', nome: 'Carlos Silva', telefone: '(11) 91234-5678', tipo: 'profissional', status: 'ativo', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', created_at: '2019-03-15T10:00:00Z', updated_at: '2026-05-25T10:00:00Z' },
  { id: 'usr-prof-2', email: 'roberto.oliveira@email.com', nome: 'Roberto Oliveira', telefone: '(11) 92345-6789', tipo: 'profissional', status: 'ativo', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', created_at: '2020-06-20T10:00:00Z', updated_at: '2026-04-15T10:00:00Z' },
  { id: 'usr-loj-1', email: 'contato@abcmateriais.com.br', nome: 'ABC Materiais', telefone: '(11) 3000-1234', tipo: 'lojista', status: 'ativo', avatar_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop', created_at: '2022-03-10T08:00:00Z', updated_at: '2026-05-01T10:00:00Z' }
];
