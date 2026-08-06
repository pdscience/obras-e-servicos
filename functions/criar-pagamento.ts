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

  try {
    const { perfil_id, plano } = await req.json() as {
      perfil_id: string
      plano: 'bronze' | 'prata' | 'ouro' | 'platina' | 'diamante'
    }

    if (!perfil_id || !plano) {
      return new Response(JSON.stringify({ error: 'perfil_id e plano são obrigatórios' }), { status: 400 })
    }

    const precos: Record<string, number> = { bronze: 990, prata: 2990, ouro: 5990, platina: 7990, diamante: 9990 }
    const valor = precos[plano]
    if (!valor) {
      return new Response(JSON.stringify({ error: 'Plano inválido' }), { status: 400 })
    }

    // Aqui você integraria com Mercado Pago / Stripe para criar a preferência de pagamento
    // Exemplo com Mercado Pago:
    //
    // const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     items: [{ title: `Plano ${plano} - Obras & Serviços`, quantity: 1, unit_price: valor / 100 }],
    //     back_urls: { success: url, failure: url, pending: url },
    //     notification_url: `${baseUrl}/functions/payment-webhook`,
    //     metadata: { perfil_id, plano },
    //   }),
    // })
    // const mpData = await mpResponse.json()
    // const checkoutUrl = mpData.init_point

    const checkoutUrl = '' // Placeholder — integrar com gateway real

    return new Response(JSON.stringify({
      checkout_url: checkoutUrl,
      valor,
      plano,
      perfil_id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erro ao criar pagamento:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}
