import { createClient } from 'npm:@insforge/sdk'
import {
  asaasEnv,
  asaasFetch,
  buildExternalRef,
  PLANOS_ASAAS,
  PLANOS_VALIDOS,
  proximaDataVencimento,
  type PlanoId,
  type TipoPerfil,
} from './asaas-client.ts'

// Cria um Checkout Asaas com assinatura mensal (Pix + Cartão) para o plano.
// Docs: https://docs.asaas.com/docs/checkout-com-assinatura-recorrente
//
// Body esperado:
// {
//   perfil_id: string, plano: 'bronze'|'prata'|'ouro'|'diamante',
//   tipo_perfil?: 'profissional'|'lojista' (default 'profissional'),
//   usuario_id?: string, nome?: string, email?: string,
//   telefone?: string, cpf?: string, retorno_base?: string
// }
// Resposta: { checkout_url, checkout_id, customer_id, valor, plano }

const CHECKOUT_URL = 'https://asaas.com/checkoutSession/show'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface CriarPagamentoBody {
  perfil_id: string
  plano: string
  tipo_perfil?: string
  usuario_id?: string
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  retorno_base?: string
}

async function buscarOuCriarCustomer(body: CriarPagamentoBody, customerRef: string): Promise<string> {
  // Reutiliza o customer já vinculado ao usuário (evita duplicados — ver guia "Cadastro de clientes").
  const busca = await asaasFetch<{ data?: Array<{ id: string }> }>(
    `/customers?externalReference=${encodeURIComponent(customerRef)}&limit=1`,
  ).catch(() => null)
  const existente = busca?.data?.[0]?.id
  if (existente) return existente

  const criado = await asaasFetch<{ id: string }>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: body.nome || body.email || `Usuário ${body.usuario_id ?? body.perfil_id}`,
      email: body.email || undefined,
      mobilePhone: body.telefone || undefined,
      cpfCnpj: body.cpf || undefined,
      externalReference: customerRef,
      notificationDisabled: false,
    }),
  })
  if (!criado.id) throw new Error('Asaas não retornou o id do customer')
  return criado.id
}

function insforgeClient() {
  const baseUrl = Deno.env.get('INSFORGE_BASE_URL')
  const anonKey = Deno.env.get('INSFORGE_SERVICE_ROLE_KEY') || Deno.env.get('ANON_KEY')
  if (!baseUrl || !anonKey) return null
  return createClient({ baseUrl, anonKey })
}

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const body = (await req.json()) as CriarPagamentoBody
    const { perfil_id, plano } = body
    if (!perfil_id || !plano) return json({ error: 'perfil_id e plano são obrigatórios' }, 400)
    if (!PLANOS_VALIDOS.includes(plano as PlanoId)) return json({ error: 'Plano inválido' }, 400)

    const tipo: TipoPerfil = body.tipo_perfil === 'lojista' ? 'lojista' : 'profissional'
    const usuarioId = body.usuario_id || perfil_id
    const planoInfo = PLANOS_ASAAS[plano as PlanoId]
    const externalRef = buildExternalRef(usuarioId, perfil_id, plano as PlanoId, tipo)
    const customerRef = `${usuarioId}:${perfil_id}`

    const customerId = await buscarOuCriarCustomer(body, customerRef)

    const base = (body.retorno_base || '').replace(/\/$/, '')
    const callback = base
      ? {
          successUrl: `${base}/pagamento/sucesso`,
          cancelUrl: `${base}/pagamento/cancelado`,
          expiredUrl: `${base}/pagamento/expirado`,
        }
      : undefined

    const checkout = await asaasFetch<{ id: string }>('/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        billingTypes: ['PIX', 'CREDIT_CARD'],
        chargeTypes: ['RECURRENT'],
        minutesToExpire: 1440,
        customer: customerId,
        externalReference: externalRef,
        items: [
          {
            name: `Plano ${planoInfo.nome} — Obras & Serviços`,
            description: `Assinatura mensal do plano ${planoInfo.nome} (${tipo})`,
            quantity: 1,
            value: planoInfo.valor,
          },
        ],
        subscription: {
          cycle: 'MONTHLY',
          nextDueDate: proximaDataVencimento(1),
        },
        ...(callback ? { callback } : {}),
      }),
    })
    if (!checkout.id) throw new Error('Asaas não retornou o id do checkout')

    // Registra a tentativa (best-effort: não bloqueia o checkout se a tabela ainda não existir).
    try {
      const client = insforgeClient()
      if (client) {
        await client.database.from('assinaturas').insert({
          usuario_id: usuarioId,
          perfil_id,
          tipo_perfil: tipo,
          plano,
          asaas_customer_id: customerId,
          asaas_checkout_id: checkout.id,
          status: 'pendente',
        })
      }
    } catch (e) {
      console.warn('[criar-pagamento] não foi possível registrar assinatura:', e)
    }

    return json({
      checkout_url: `${CHECKOUT_URL}?id=${checkout.id}`,
      checkout_id: checkout.id,
      customer_id: customerId,
      valor: planoInfo.valor,
      plano,
      ambiente: asaasEnv(),
    })
  } catch (err) {
    console.error('Erro ao criar checkout Asaas:', err)
    const msg = err instanceof Error ? err.message : 'Internal error'
    return json({ error: msg }, 500)
  }
}
