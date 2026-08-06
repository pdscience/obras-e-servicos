import type { Professional, PerfilLojista, Produto, Review } from '../types'
import { calcularDistancia } from './distance'

export interface MatchScore {
  professional: Professional
  score: number
  reputacao: number
  motivo: string[]
}

function calcularReputacao(pro: Professional): number {
  const mediaNota = pro.rating
  const volume = Math.min(pro.reviewCount / 500, 1)
  const qtdReviews = pro.reviews.length
  const recencia = qtdReviews > 0 ? Math.min(qtdReviews / 10, 1) : 0

  return (mediaNota / 5) * 0.6 + volume * 0.25 + recencia * 0.15
}

export function calcularMatchProfissional(
  pro: Professional,
  criterios: {
    categoria?: string
    uf?: string
    lat?: number
    lng?: number
    raio?: number
    precoMax?: number
    termo?: string
  }
): MatchScore {
  const motivos: string[] = []
  let score = 0
  const reputacao = calcularReputacao(pro)

  if (criterios.categoria && pro.category === criterios.categoria) {
    score += 25
    motivos.push(`Especialista em ${pro.category}`)
  }

  if (criterios.uf && pro.uf === criterios.uf) {
    score += 15
    motivos.push(`Atende na sua região (${pro.uf})`)
  }

  if (criterios.lat != null && criterios.lng != null) {
    const dist = calcularDistancia(criterios.lat, criterios.lng, pro.lat, pro.lng)
    if (dist <= 5) { score += 20; motivos.push(`Muito próximo (${dist.toFixed(1)} km)`) }
    else if (dist <= 25) { score += 10; motivos.push(`Próximo (${dist.toFixed(1)} km)`) }
  }

  if (criterios.precoMax && pro.pricePerHour <= criterios.precoMax) {
    score += 8
    motivos.push(`Dentro do orçamento (R$ ${pro.pricePerHour}/h)`)
  }

  if (pro.verified) { score += 8; motivos.push('Verificado') }
  if (pro.available) { score += 5; motivos.push('Disponível agora') }
  if (pro.yearsExperience >= 10) { score += 5; motivos.push(`${pro.yearsExperience} anos de experiência`) }

  score += Math.round(reputacao * 20)

  return { professional: pro, score, reputacao, motivo: motivos }
}

export function rankingProfissionais(
  profissionais: Professional[],
  criterios: {
    categoria?: string
    uf?: string
    lat?: number
    lng?: number
    raio?: number
    precoMax?: number
    termo?: string
  }
): MatchScore[] {
  const ranked = profissionais
    .map(p => calcularMatchProfissional(p, criterios))
    .sort((a, b) => b.score - a.score)

  // Separa em tiers
  const premiumElite = ranked.filter(p => p.professional.premium && p.reputacao >= 0.85)
  const premiumMedio = ranked.filter(p => p.professional.premium && p.reputacao < 0.85)
  const basicoElite = ranked.filter(p => !p.professional.premium && p.reputacao >= 0.8)
  const basicoMedio = ranked.filter(p => !p.professional.premium && p.reputacao >= 0.5 && p.reputacao < 0.8)
  const basicoIniciante = ranked.filter(p => !p.professional.premium && p.reputacao < 0.5)

  // Monta resultado: Topo Premium, depois mix, depois Basic
  const resultado: MatchScore[] = []

  resultado.push(...premiumElite)
  resultado.push(...premiumMedio)
  resultado.push(...basicoElite)
  resultado.push(...basicoMedio)
  resultado.push(...basicoIniciante)

  return resultado
}

export function sugerirLojistas(
  lojistas: PerfilLojista[],
  categoria: string,
  uf: string
): PerfilLojista[] {
  return lojistas
    .filter(l => l.verificado)
    .filter(l =>
      l.uf === uf &&
      l.categorias.some(c => c.toLowerCase().includes(categoria.toLowerCase()))
    )
    .sort((a, b) => b.avaliacao_media - a.avaliacao_media)
}

export function sugerirProdutos(
  produtos: Produto[],
  categoria: string
): Produto[] {
  return produtos
    .filter(p => p.status === 'ativo')
    .filter(p => p.categoria.toLowerCase().includes(categoria.toLowerCase()))
    .sort((a, b) => b.preco - a.preco)
}
