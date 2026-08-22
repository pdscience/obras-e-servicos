import { User, Wrench, Store } from '@lucide/vue'

export type AudienceType = 'cliente' | 'professional' | 'lojista'

export interface Audience {
  icon: typeof User
  type: AudienceType
  title: string
  headline: string
  description: string
  bullets: string[]
  cta: string
  color: string
}

export const audiences: Audience[] = [
  {
    icon: User,
    type: 'cliente',
    title: 'Sou Cliente',
    headline: 'Receba orçamentos de quem está perto.',
    description: 'Compare preços, veja avaliações reais e contrate com segurança quem faz o serviço bem feito.',
    bullets: ['Busca por geolocalização', 'Orçamento com status', 'Avaliações e portfólio reais', 'Custo zero para você'],
    cta: 'Quero reformar',
    color: '#3fb950',
  },
  {
    icon: Wrench,
    type: 'professional',
    title: 'Sou Profissional',
    headline: 'Receba orçamentos todos os dias.',
    description: 'Pare de depender de indicação. Crie seu portfólio e deixe os clientes encontrarem você.',
    bullets: ['Perfil com portfólio', 'Solicitações no seu painel', 'Destaque na busca por plano', 'A partir de R$ 9,90/mês'],
    cta: 'Quero receber clientes',
    color: '#d4a017',
  },
  {
    icon: Store,
    type: 'lojista',
    title: 'Sou Lojista',
    headline: 'Sua loja dentro da reforma de quem mora perto.',
    description: 'Divulgue seus produtos e estoque para quem está reformando na sua região.',
    bullets: ['Vitrine digital em tempo real', 'Cliente certo te encontra antes', 'Plano Premium prioritário', 'Contato via WhatsApp'],
    cta: 'Quero divulgar minha loja',
    color: '#7ee8fa',
  },
]
