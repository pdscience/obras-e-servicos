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

  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL')!,
    anonKey: Deno.env.get('ANON_KEY')!,
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
    const plano = metadata.plano // 'mensal' | 'anual'

    if (!perfilId || !plano) {
      return new Response(JSON.stringify({ error: 'Metadados incompletos' }), { status: 400 })
    }

    const dias = plano === 'anual' ? 365 : 30
    const expiracao = new Date()
    expiracao.setDate(expiracao.getDate() + dias)

    const { error } = await client.database
      .from('perfis_profissional')
      .update({
        premium: true,
        premium_plano: plano,
        premium_expiracao: expiracao.toISOString(),
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
