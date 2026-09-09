export type UserTipo = 'usuario' | 'profissional' | 'lojista'
export type UserStatus = 'ativo' | 'inativo' | 'bloqueado'
export type Page = 'home' | 'profile' | 'login' | 'register' | 'register-professional' | 'dashboard' | 'categories' | 'how-it-works' | 'lojista' | 'category-detail'

export interface Usuario {
  id: string
  email: string
  nome: string
  telefone: string | null
  tipo: UserTipo
  status: UserStatus
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface PerfilUsuario {
  id: string
  usuario_id: string
  cpf: string | null
  data_nascimento: string | null
  enderecos: Endereco[]
  created_at: string
  updated_at: string
}

export interface WorkExperience {
  id: string
  company: string
  role: string
  startDate: string
  endDate?: string
  current?: boolean
  description: string
}

export interface PortfolioItem {
  id: string
  beforeImage: string
  afterImage: string
  title: string
  description: string
  category: string
}

export interface Review {
  id: string
  clientName: string
  clientAvatar: string
  rating: number
  comment: string
  date: string
  serviceType: string
  photos?: string[]
}

export type PlanoProfissional = 'bronze' | 'prata' | 'ouro' | 'diamante'

export type CorPlano = 'bronze' | 'prata' | 'ouro' | 'diamante'

export interface PlanoConfig {
  id: PlanoProfissional
  nome: string
  preco: number
  foco: string
  publico: 'profissional' | 'lojista'
  limiteFotos: number
  limiteCategorias: number
  destaque: 'normal' | 'prioritario' | 'premium' | 'verificado'
  cor: CorPlano
  beneficios: string[]
}

export interface PerfilProfissional {
  id: string
  usuario_id: string
  nome: string
  avatar: string
  categoria: string
  subcategoria: string
  anos_experiencia: number
  descricao: string
  especialidades: string[]
  certificacoes: string[]
  preco_hora: number
  preco_m2?: number
  verificado: boolean
  premium: boolean
  premium_plano?: PlanoProfissional
  premium_expiracao?: string
  limite_fotos: number
  whatsapp?: string
  instagram?: string
  facebook?: string
  youtube?: string
  linkedin?: string
  x?: string
  banner_url?: string
  data_inicio_gratis?: string
  disponivel: boolean
  tempo_resposta: string
  uf: string
  cidade: string
  lat: number
  lng: number
  portfolio: PortfolioItem[]
  experiencia: WorkExperience[]
  avaliacao_media: number
  total_avaliacoes: number
  total_servicos: number
  reviews: Review[]
  distancia?: number
  created_at: string
  updated_at: string
}

export interface PerfilLojista {
  id: string
  usuario_id: string
  nome: string
  avatar: string
  cnpj: string | null
  razao_social: string | null
  nome_fantasia: string | null
  descricao: string
  categorias: string[]
  endereco: string
  uf: string
  cidade: string
  lat: number
  lng: number
  distancia?: number
  telefone_comercial: string | null
  email: string | null
  site: string | null
  social_facebook?: string
  social_instagram?: string
  social_youtube?: string
  banner_url?: string
  data_inicio_gratis?: string
  horario_funcionamento: Record<string, unknown>
  verificado: boolean
  premium: boolean
  premium_plano?: PlanoProfissional
  premium_expiracao?: string
  avaliacao_media: number
  total_avaliacoes: number
  created_at: string
  updated_at: string
}

export interface Produto {
  id: string
  lojista_id: string
  nome: string
  descricao: string | null
  categoria: string
  preco: number
  unidade: string
  estoque: number
  imagens: string[]
  status: 'ativo' | 'inativo' | 'indisponivel'
  lojista_nome?: string
  created_at: string
  updated_at: string
}

export interface Endereco {
  id: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  principal: boolean
}

export interface Professional {
  id: string
  usuario_id: string
  name: string
  avatar: string
  category: string
  subcategory: string
  mainCategoryId?: string
  rating: number
  reviewCount: number
  completedJobs: number
  location: string
  uf: string
  cidade?: string
  cep?: string
  endereco?: string
  numero?: string
  bairro?: string
  lat: number
  lng: number
  distance?: number
  pricePerHour: number
  pricePerM2?: number
  yearsExperience: number
  verified: boolean
  premium: boolean
  premium_plano?: PlanoProfissional
  limite_fotos: number
  whatsapp?: string
  instagram?: string
  facebook?: string
  youtube?: string
  linkedin?: string
  x?: string
  banner_url?: string
  data_inicio_gratis?: string
  available: boolean
  description: string
  specialties: string[]
  certifications: string[]
  portfolio: PortfolioItem[]
  reviews: Review[]
  experience: WorkExperience[]
  responseTime: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
  subcategories: string[]
  mainCategoryId?: string
}

export interface MainCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  professions: string[]
}

export interface ServiceRequest {
  id: string
  cliente_id: string
  profissional_id: string | null
  cliente_nome: string
  cliente_contato: string
  categoria: string
  subcategoria: string | null
  descricao: string
  endereco: string
  data_preferida: string
  orcamento?: number
  urgencia: 'baixa' | 'media' | 'alta'
  status: 'aberto' | 'em_andamento' | 'concluido' | 'cancelado'
  whatsapp_profissional: string | null
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  timestamp: string
  read: boolean
}

export interface CategoriaDB {
  id: string
  nome: string
  slug: string
  descricao: string | null
  created_at: string
}

export interface ProfissaoDB {
  id: string
  categoria_id: string
  nome: string
  created_at: string
}

export interface ProfissionalCategoriaDB {
  id: string
  profissional_id: string
  categoria_id: string
  profissao_id: string
  created_at: string
}

export interface ProfissionalCategoriaView {
  id: string
  profissional_id: string
  categoria_id: string
  categoria_nome: string
  profissao_id: string
  profissao_nome: string
}

export interface Filters {
  category?: string
  subcategory?: string
  location?: string
  radius?: number
  lat?: number
  lng?: number
  minRating?: number
  maxPrice?: number
  maxPriceM2?: number
  minExperience?: number
  verified?: boolean
  available?: boolean
}
