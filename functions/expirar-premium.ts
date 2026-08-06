import { createClient } from 'npm:@insforge/sdk'

export default async function (_req: Request): Promise<Response> {
  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL')!,
    anonKey: Deno.env.get('ANON_KEY')!,
  })

  const { data, error } = await client.database
    .from('perfis_profissional')
    .update({
      premium: false,
      premium_plano: null,
      premium_expiracao: null,
      updated_at: new Date().toISOString(),
    })
    .eq('premium', true)
    .lt('premium_expiracao', new Date().toISOString())

  if (error) {
    console.error('Erro ao expirar premiums:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const count = Array.isArray(data) ? data.length : 0
  console.log(`Premium expirados: ${count}`)

  return new Response(JSON.stringify({ expirados: count }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
