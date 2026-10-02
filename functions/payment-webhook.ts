import { createClient } from 'npm:@insforge/sdk'
import {
  asaasFetch,
  expiracaoPremium,
  parseExternalRef,
  PLANOS_ASAAS,
  type PlanoId,
} from './asaas-client.ts'

// Webhook do Asaas: ativa/desativa o premium conforme os eventos.
// Docs: https://docs.asaas.com/docs/receba-eventos-do-asaas-no-seu-endpoint-de-webhook
//
// Formato Asaas: { id, event, payment?, subscription?, checkout? }
// Auth: header `asaas-access-token` == ASAAS_WEBHOOK_TOKEN.
// Responde 200 rápido; idempotente via `webhook_events` (at-least-once).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, asaas-access-token',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Eventos que confirmam dinheiro recebido → ativa/renova o premium.
const EVENTOS_PAGOS = new Set([
  'CHECKOUT_PAID',
  'PAYMENT_CONFIRMED',
  'PAYMENT_RECEIVED',
  'PAYMENT_RECOVERED',
])

// Eventos que indicam perda do plano → desativa o premium.
const EVENTOS_PERDA = new Set([
  'PAYMENT_OVERDUE',
  'PAYMENT_DELETED',
  'PAYMENT_REFUNDED',
  'PAYMENT_CHARGEBACK_REQUESTED',
  'SUBSCRIPTION_DELETED',
  'SUBSCRIPTION_INACTIVATED',
])

function insforgeClient() {
  const baseUrl = Deno.env.get('INSFORGE_BASE_URL')
  const anonKey = Deno.env.get('INSFORGE_SERVICE_ROLE_KEY') || Deno.env.get('ANON_KEY')
  if (!baseUrl || !anonKey) throw new Error('INSFORGE_BASE_URL/KEY não configuradas')
  return createClient({ baseUrl, anonKey })
}

interface AsaasEvent {
  id?: string
  event?: string
  payment?: { id?: string; externalReference?: string; subscription?: string }
  subscription?: { id?: string; externalReference?: string }
  checkout?: { id?: string; externalReference?: string }
}

async function extrairReferencia(evt: AsaasEvent): Promise<string | null> {
  const direta =
    evt.payment?.externalReference ||
    evt.subscription?.externalReference ||
    evt.checkout?.externalReference
  if (direta) return direta

  // Fallback: busca o payment na API para ler o externalReference.
  const paymentId = evt.payment?.id
  if (paymentId) {
    try {
      const pay = await asaasFetch<{ externalReference?: string }>(
        `/payments/${encodeURIComponent(paymentId)}`,
      )
      if (pay.externalReference) return pay.externalReference
    } catch (e) {
      console.warn('[webhook] falha ao consultar payment:', e)
    }
  }
  return null
}

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  // Autenticação: token do webhook Asaas (novo) ou segredo legado.
  const esperado = Deno.env.get('ASAAS_WEBHOOK_TOKEN') || Deno.env.get('PAYMENT_WEBHOOK_SECRET')
  const recebido =
    req.headers.get('asaas-access-token') ||
    req.headers.get('x-webhook-secret') ||
    req.headers.get('authorization')?.replace('Bearer ', '')
  if (esperado && recebido !== esperado) {
    return json({ error: 'Unauthorized webhook request' }, 401)
  }

  let evt: AsaasEvent
  try {
    evt = (await req.json()) as AsaasEvent
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const eventId = evt.id
  const eventType = evt.event
  if (!eventId || !eventType) return json({ error: 'Invalid payload' }, 400)

  let client: ReturnType<typeof createClient>
  try {
    client = insforgeClient()
  } catch (e) {
    console.error('[webhook] config:', e)
    return json({ error: 'Server misconfigured' }, 500)
  }

  // Idempotência: ignora reenvios (best-effort se a tabela ainda não existir).
  try {
    const { error } = await client.database
      .from('webhook_events')
      .insert({ event_id: eventId, event_type: eventType })
    if (error && /duplicate|unique|conflict/i.test(error.message || '')) {
      return json({ received: true, dedup: true })
    }
  } catch (e) {
    console.warn('[webhook] dedup indisponível:', e)
  }

  const ref = await extrairReferencia(evt)
  const ctx = parseExternalRef(ref)
  if (!ctx) {
    console.log(`[webhook] ${eventType} sem externalReference válido — ignorado`)
    return json({ received: true, ignored: true })
  }

  try {
    if (EVENTOS_PAGOS.has(eventType)) {
      await ativarPremium(client, ctx.perfilId, ctx.plano, ctx.tipo, eventId, eventType)
      return json({ received: true, perfil_id: ctx.perfilId, plano: ctx.plano })
    }

    if (EVENTOS_PERDA.has(eventType)) {
      await desativarPremium(client, ctx.perfilId, ctx.tipo)
      return json({ received: true, desativado: true, perfil_id: ctx.perfilId })
    }

    // Demais eventos (CHECKOUT_CREATED, SUBSCRIPTION_CREATED, PAYMENT_CREATED…): só registra.
    await registrarAssinatura(client, ctx, eventType, evt)
    return json({ received: true, ignored: true, event: eventType })
  } catch (err) {
    console.error('[webhook] erro ao processar:', err)
    return json({ error: 'Internal error' }, 500)
  }
}

async function registrarAssinatura(
  client: ReturnType<typeof createClient>,
  ctx: { usuarioId: string; perfilId: string; plano: PlanoId; tipo: string },
  eventType: string,
  evt: AsaasEvent,
) {
  try {
    await client.database.from('assinaturas').insert({
      usuario_id: ctx.usuarioId,
      perfil_id: ctx.perfilId,
      tipo_perfil: ctx.tipo,
      plano: ctx.plano,
      asaas_subscription_id: evt.subscription?.id ?? evt.payment?.subscription ?? null,
      asaas_checkout_id: evt.checkout?.id ?? null,
      status: eventType,
    })
  } catch (e) {
    console.warn('[webhook] registro de assinatura indisponível:', e)
  }
}

async function ativarPremium(
  client: ReturnType<typeof createClient>,
  perfilId: string,
  plano: PlanoId,
  tipo: string,
  eventId: string,
  eventType: string,
) {
  const expiracao = expiracaoPremium(30)
  const agora = new Date().toISOString()
  const tabela = tipo === 'lojista' ? 'perfis_lojista' : 'perfis_profissional'
  const update =
    tipo === 'lojista'
      ? { premium: true, premium_plano: plano, premium_expiracao: expiracao, updated_at: agora }
      : {
          premium: true,
          premium_plano: plano,
          premium_expiracao: expiracao,
          limite_fotos: PLANOS_ASAAS[plano].limiteFotos,
          updated_at: agora,
        }

  const { error } = await client.database.from(tabela).update(update).eq('id', perfilId)
  if (error) {
    console.error('[webhook] erro ao ativar premium:', error)
    throw new Error(error.message)
  }

  try {
    await client.database.from('assinaturas').insert({
      usuario_id: '',
      perfil_id: perfilId,
      tipo_perfil: tipo,
      plano,
      status: `ativo:${eventType}:${eventId}`,
    })
  } catch (e) {
    console.warn('[webhook] registro de ativação indisponível:', e)
  }
}

async function desativarPremium(
  client: ReturnType<typeof createClient>,
  perfilId: string,
  tipo: string,
) {
  const tabela = tipo === 'lojista' ? 'perfis_lojista' : 'perfis_profissional'
  const { error } = await client.database
    .from(tabela)
    .update({ premium: false, premium_expiracao: null, updated_at: new Date().toISOString() })
    .eq('id', perfilId)
  if (error) {
    console.error('[webhook] erro ao desativar premium:', error)
    throw new Error(error.message)
  }
}
