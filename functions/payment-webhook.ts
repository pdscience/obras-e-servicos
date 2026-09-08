import { createClient } from 'npm:@insforge/sdk'

export default async function (req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const webhookSecret = Deno.env.get('PAYMENT_WEBHOOK_SECRET')
  const incomingSecret = req.headers.get('x-webhook-secret') || req.headers.get('authorization')?.replace('Bearer ', '')

  if (webhookSecret && incomingSecret !== webhookSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized webhook request' }), { status: 401 })
  }

  const serviceRoleKey = Deno.env.get('INSFORGE_SERVICE_ROLE_KEY') || Deno.env.get('ANON_KEY')!
  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL')!,
    anonKey: serviceRoleKey,
  })

  try {
    const body = await req.json()

    const tipoEvento = body.type || body.action
    const paymentId = body.data?.id || body.id

    // Mercado Pago: payment.updated, payment.created
    // Stripe: checkout.session.completed, invoice.paid
    if (!tipoEvento || !paymentId) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
    }

    // Extrair metadados do pagamento
    const metadata = body.data?.metadata || body.metadata || {}
    const perfilId = metadata.perfil_id
    const plano = (metadata.plano || '').toLowerCase()

    const planosValidos = ['bronze', 'prata', 'ouro', 'platina', 'diamante']
    if (!perfilId || !planosValidos.includes(plano)) {
      return new Response(JSON.stringify({ error: 'Metadados inválidos ou plano não suportado' }), { status: 400 })
    }

    const duracaoDias = metadata.duracao_dias ? Number(metadata.duracao_dias) : (metadata.periodo === 'anual' ? 365 : 30)
    const expiracao = new Date()
    expiracao.setDate(expiracao.getDate() + duracaoDias)

    const limitesFotos: Record<string, number> = { bronze: 0, prata: 6, ouro: 12, platina: 12, diamante: 20 }
    const limiteFotos = limitesFotos[plano] ?? 0

    const { error } = await client.database
      .from('perfis_profissional')
      .update({
        premium: true,
        premium_plano: plano,
        premium_expiracao: expiracao.toISOString(),
        limite_fotos: limiteFotos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', perfilId)

    if (error) {
      console.error('Erro ao ativar premium via webhook:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, perfil_id: perfilId, plano, expiracao }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erro no webhook:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}
