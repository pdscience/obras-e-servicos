// Helpers compartilhados para a integração Asaas (API v3).
// Docs: https://docs.asaas.com/reference/comece-por-aqui
// Sandbox: https://api-sandbox.asaas.com/v3 | Produção: https://api.asaas.com/v3

export type PlanoId = 'bronze' | 'prata' | 'ouro' | 'diamante'
export type TipoPerfil = 'profissional' | 'lojista'

export const PLANOS_VALIDOS: PlanoId[] = ['bronze', 'prata', 'ouro', 'diamante']

// Fonte única no backend — espelha `src/config/planos.ts` (functions não importam `@/config`).
export const PLANOS_ASAAS: Record<PlanoId, { nome: string; valor: number; limiteFotos: number }> = {
  bronze: { nome: 'Bronze', valor: 9.9, limiteFotos: 0 },
  prata: { nome: 'Prata', valor: 29.9, limiteFotos: 6 },
  ouro: { nome: 'Ouro', valor: 59.9, limiteFotos: 9 },
  diamante: { nome: 'Diamante', valor: 99.9, limiteFotos: 20 },
}

export function asaasEnv(): 'sandbox' | 'production' {
  return Deno.env.get('ASAAS_ENV') === 'production' ? 'production' : 'sandbox'
}

export function asaasBaseUrl(): string {
  return asaasEnv() === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3'
}

export function asaasHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'User-Agent': 'ObrasEServicos/1.0',
    'access_token': Deno.env.get('ASAAS_API_KEY') ?? '',
    ...extra,
  }
}

export async function asaasFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const apiKey = Deno.env.get('ASAAS_API_KEY')
  if (!apiKey) throw new Error('ASAAS_API_KEY não configurada nas variáveis da function')
  const res = await fetch(`${asaasBaseUrl()}${path}`, {
    ...init,
    headers: asaasHeaders(init.headers as Record<string, string> | undefined),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detalhe = (data as { errors?: Array<{ description?: string }> })?.errors
      ?.map((e) => e.description)
      .filter(Boolean)
      .join('; ')
    throw new Error(`Asaas ${res.status} em ${path}: ${detalhe || JSON.stringify(data)}`)
  }
  return data as T
}

/** Vínculo entre Asaas e o sistema: `usuarioId:perfilId:plano:tipoPerfil`. */
export function buildExternalRef(usuarioId: string, perfilId: string, plano: PlanoId, tipo: TipoPerfil): string {
  return `${usuarioId}:${perfilId}:${plano}:${tipo}`
}

export function parseExternalRef(ref: string | null | undefined): {
  usuarioId: string
  perfilId: string
  plano: PlanoId
  tipo: TipoPerfil
} | null {
  if (!ref) return null
  const [usuarioId, perfilId, plano, tipo] = ref.split(':')
  if (!usuarioId || !perfilId || !PLANOS_VALIDOS.includes(plano as PlanoId)) return null
  if (tipo !== 'profissional' && tipo !== 'lojista') return null
  return { usuarioId, perfilId, plano: plano as PlanoId, tipo }
}

export function proximaDataVencimento(diasAFrente = 1): string {
  const d = new Date()
  d.setDate(d.getDate() + diasAFrente)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function expiracaoPremium(dias = 30): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString()
}
