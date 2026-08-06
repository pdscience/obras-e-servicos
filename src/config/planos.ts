import type { PlanoProfissional, PlanoConfig } from '../types'

export type PublicoPlano = 'profissional' | 'lojista'

export const PLANOS: Record<PlanoProfissional, PlanoConfig> = {
  bronze: {
    id: 'bronze',
    nome: 'Bronze',
    preco: 9.90,
    foco: 'Ajudante Geral / Servente',
    publico: 'profissional',
    limiteFotos: 0,
    limiteCategorias: 1,
    destaque: 'normal',
    cor: 'bronze',
    beneficios: [
      'Cadastro de 1 tipo de serviço',
      'Destaque no Painel de Buscas',
      'Profissionais novos',
      'Ideal para quem precisa ser achado pelo cliente da vizinhança rapidamente',
      'Cadastro de WhatsApp para contato direto',
    ],
  },
  prata: {
    id: 'prata',
    nome: 'Prata',
    preco: 29.90,
    foco: 'Autônomos em crescimento',
    publico: 'profissional',
    limiteFotos: 6,
    limiteCategorias: 2,
    destaque: 'prioritario',
    cor: 'prata',
    beneficios: [
      'Cadastro de até 2 tipos de serviços',
      'Destaque prioritário no Painel de Buscas',
      'Portfólio com até 6 fotos',
      'Link de redes Sociais (Instagram, Facebook)',
      'Link de WhatsApp direto no perfil',
    ],
  },
  ouro: {
    id: 'ouro',
    nome: 'Ouro',
    preco: 59.90,
    foco: 'Profissionais e empresas de alto valor',
    publico: 'profissional',
    limiteFotos: 9,
    limiteCategorias: 3,
    destaque: 'premium',
    cor: 'ouro',
    beneficios: [
      'Cadastro de até 3 tipos de serviços',
      'Destaque Premium no Painel de Buscas',
      'Portfólio com até 9 fotos',
      'Link de Redes sociais (Instagram, Facebook, Youtube, LinkedIn, X)',
      'Link de WhatsApp direto no perfil',
      'Exclusivo: Alertas em tempo real de novos projetos e obras cadastrados',
    ],
  },
  diamante: {
    id: 'diamante',
    nome: 'Diamante',
    preco: 99.90,
    foco: 'Lojistas e Materiais de Construção',
    publico: 'lojista',
    limiteFotos: 20,
    limiteCategorias: 3,
    destaque: 'verificado',
    cor: 'diamante',
    beneficios: [
      'Perfil exclusivo como "Fornecedor"',
      'Vitrine de produtos/catálogo (20 fotos)',
      'Opção de fazer upload de banner de promoção da loja',
      'Geolocalização otimizada para clientes da região',
      'Leads qualificados de obras em andamento na sua área',
    ],
  },
}

export const PLANOS_LISTA: PlanoConfig[] = [
  PLANOS.bronze,
  PLANOS.prata,
  PLANOS.ouro,
  PLANOS.diamante,
]

export const PLANOS_PROFISSIONAIS: PlanoConfig[] = PLANOS_LISTA.filter(p => p.publico === 'profissional')

export const PLANOS_LOJISTA: PlanoConfig[] = PLANOS_LISTA.filter(p => p.publico === 'lojista')

export const PLANO_PADRAO: PlanoProfissional = 'bronze'

export function limiteFotosPlano(plano: PlanoProfissional | null | undefined): number {
  if (!plano) return 0
  return PLANOS[plano].limiteFotos
}

export function limiteCategoriasPlano(plano: PlanoProfissional | null | undefined): number {
  if (!plano) return 1
  return PLANOS[plano].limiteCategorias
}

export function planoPorId(id: PlanoProfissional): PlanoConfig {
  return PLANOS[id]
}

export const DIAS_PERIODO_GRATIS = 60

export function verificarPeriodoGratis(dataInicioGratis: string | null | undefined): {
  emGratis: boolean
  diasRestantes: number
  dataExpiracao: Date | null
} {
  if (!dataInicioGratis) {
    return { emGratis: false, diasRestantes: 0, dataExpiracao: null }
  }
  
  const inicio = new Date(dataInicioGratis)
  const expiracao = new Date(inicio)
  expiracao.setDate(expiracao.getDate() + DIAS_PERIODO_GRATIS)
  
  const agora = new Date()
  const emGratis = agora < expiracao
  
  const diffMs = expiracao.getTime() - agora.getTime()
  const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  
  return { emGratis, diasRestantes, dataExpiracao: expiracao }
}

export function obterPlanoEficaz(
  premiumPlano: PlanoProfissional | null | undefined,
  premium: boolean | undefined,
  dataInicioGratis: string | null | undefined
): { plano: PlanoProfissional; isGratis: boolean; diasRestantes: number } {
  const { emGratis, diasRestantes } = verificarPeriodoGratis(dataInicioGratis)
  
  if (emGratis) {
    return { plano: 'ouro', isGratis: true, diasRestantes }
  }
  
  return { plano: premiumPlano ?? 'bronze', isGratis: false, diasRestantes: 0 }
}

export const CORES_PLANO: Record<string, { from: string; to: string; badge: string; ring: string; text: string }> = {
  bronze: { from: '#cd7f32', to: '#a85f1e', badge: '#cd7f32', ring: 'rgba(205,127,50,0.35)', text: '#cd7f32' },
  prata: { from: '#9ca3af', to: '#6b7280', badge: '#9ca3af', ring: 'rgba(156,163,175,0.35)', text: '#9ca3af' },
  ouro: { from: '#f0a500', to: '#c97f00', badge: '#f0a500', ring: 'rgba(240,165,0,0.35)', text: '#f0a500' },
  diamante: { from: '#34d399', to: '#059669', badge: '#10b981', ring: 'rgba(16,185,129,0.35)', text: '#10b981' },
}

