import { createClient } from '@insforge/sdk'

const baseUrl = 'https://dab322a4.us-east.insforge.app'
const anonKey = 'ik_ce8b09eeb3a5486c6f6973c0702f2305'

if (!baseUrl || !anonKey) {
  console.error('Faltando VITE_INSFORGE_URL ou VITE_INSFORGE_ANON_KEY')
  process.exit(1)
}

const insforge = createClient({ baseUrl, anonKey })

const TEST_PASSWORD = 'Teste@123456'
const casos = [
  { sufixo: 'bronze', email: 'teste.bronze@obras-test.com', plano: 'bronze', tipo: 'profissional' },
  { sufixo: 'ouro', email: 'teste.ouro@obras-test.com', plano: 'ouro', tipo: 'profissional' },
  { sufixo: 'diamante', email: 'teste.diamante@obras-test.com', plano: 'diamante', tipo: 'lojista' },
]

async function criarUsuario(id, email, nome, tipo) {
  const { error } = await insforge.database
    .from('usuarios')
    .upsert({ id, email, nome, tipo, status: 'ativo' }, { onConflict: 'id' })
  if (error) throw error
}

async function criarPerfilProfissional(usuarioId, nome, plano) {
  const limiteFotos = { bronze: 0, prata: 6, ouro: 12, platina: 12, diamante: 12 }[plano] ?? 0
  const { data, error } = await insforge.database
    .from('perfis_profissional')
    .upsert({
      usuario_id: usuarioId,
      nome,
      categoria: 'Geral',
      especialidades: [],
      premium: false,
      premium_plano: plano,
      limite_fotos: limiteFotos,
      verificado: false,
      disponivel: true,
      tempo_resposta: 'em algumas horas',
    }, { onConflict: 'usuario_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

async function criarPerfilLojista(usuarioId, nome, plano) {
  const { data, error } = await insforge.database
    .from('perfis_lojista')
    .upsert({
      usuario_id: usuarioId,
      nome,
      nome_fantasia: nome,
      descricao: 'Loja teste',
      categorias: [],
      premium_plano: plano,
    }, { onConflict: 'usuario_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

async function verificar(usuarioId, tipo, planoEsperado) {
  const tabela = tipo === 'lojista' ? 'perfis_lojista' : 'perfis_profissional'
  const cols = tipo === 'lojista' ? 'premium_plano' : 'premium_plano, limite_fotos'
  const { data, error } = await insforge.database
    .from(tabela)
    .select(cols)
    .eq('usuario_id', usuarioId)
    .single()
  if (error) throw error
  const ok = data.premium_plano === planoEsperado
  const extra = tipo === 'lojista' ? '' : ` limite_fotos=${data.limite_fotos}`
  console.log(
    `  [${tipo}] ${planoEsperado.toUpperCase()}: premium_plano=${data.premium_plano}${extra} => ${ok ? 'OK' : 'FALHOU'}`
  )
  return ok
}

const LIMITE_CATS = { bronze: 1, prata: 1, ouro: 3, platina: 3, diamante: 3 }

async function testarLimiteCategorias(usuarioId, plano) {
  const max = LIMITE_CATS[plano] ?? 1
  // Cria categorias dummy e tenta vincular max+1
  const { data: cat } = await insforge.database
    .from('categorias')
    .insert({ nome: `CatTeste_${plano}_${Date.now()}`, slug: `cat-teste-${plano}-${Date.now()}`, descricao: 'teste' })
    .select()
    .single()
  const profissoes = []
  for (let i = 0; i < max + 1; i++) {
    const { data: p } = await insforge.database
      .from('profissoes')
      .insert({ categoria_id: cat.id, nome: `ProfTeste_${plano}_${i}_${Date.now()}` })
      .select()
      .single()
    profissoes.push(p)
  }

  const itens = profissoes.map(p => ({ categoria_id: cat.id, profissao_id: p.id }))

  // Limpa vínculos anteriores
  await insforge.database.from('profissional_categorias').delete().eq('profissional_id', usuarioId)

  const { error: insErr } = await insforge.database
    .from('profissional_categorias')
    .insert(itens)
  const excedeu = !insErr // true se conseguiu inserir tudo (incluindo o excesso)

  // Valida contagem real no banco
  const { data: contagem } = await insforge.database
    .from('profissional_categorias')
    .select('*', { count: 'exact', head: true })
    .eq('profissional_id', usuarioId)

  const countReal = contagem?.count ?? 0
  const respeitouLimite = countReal <= max
  console.log(
    `  [categorias] ${plano.toUpperCase()}: tentou ${itens.length}, gravou ${countReal}, limite ${max} => ${respeitouLimite ? 'OK' : 'FALHOU'}`
  )
  if (!respeitouLimite) falhou++

  // limpeza
  await insforge.database.from('profissional_categorias').delete().eq('profissional_id', usuarioId)
  await insforge.database.from('profissoes').delete().eq('categoria_id', cat.id)
  await insforge.database.from('categorias').delete().eq('id', cat.id)
}

async function limpar(usuarioId, tipo) {
  if (tipo === 'lojista') {
    await insforge.database.from('perfis_lojista').delete().eq('usuario_id', usuarioId)
  } else {
    await insforge.database.from('perfis_profissional').delete().eq('usuario_id', usuarioId)
  }
  await insforge.database.from('usuarios').delete().eq('id', usuarioId)
}

async function main() {
  let passou = 0
  let falhou = 0

  for (const c of casos) {
    const nome = `Teste ${c.plano}`
    process.stdout.write(`\n▶ Testando ${c.tipo} / plano ${c.plano.toUpperCase()} (${c.email})... `)
    try {
      let authData = null
      let authErr = null
      const signup = await insforge.auth.signUp({
        email: c.email,
        password: TEST_PASSWORD,
        name: nome,
      })
      if (signup.error && /already exists/i.test(signup.error.message || '')) {
        const login = await insforge.auth.signInWithPassword({ email: c.email, password: TEST_PASSWORD })
        authData = login.data
        authErr = login.error
      } else {
        authData = signup.data
        authErr = signup.error
      }
      if (authErr) throw authErr
      const userId = authData?.user?.id
      if (!userId) throw new Error('auth não retornou id de usuário')

      await criarUsuario(userId, c.email, nome, c.tipo === 'lojista' ? 'lojista' : 'profissional')

      if (c.tipo === 'lojista') {
        await criarPerfilLojista(userId, nome, c.plano)
      } else {
        await criarPerfilProfissional(userId, nome, c.plano)
      }

      const ok = await verificar(userId, c.tipo, c.plano)
      ok ? passou++ : falhou++

      await limpar(userId, c.tipo)
    } catch (e) {
      falhou++
      console.log(`\n  ERRO: ${(e && e.message) || e}`)
    }
  }

  console.log(`\n=== RESULTADO: ${passou} passou, ${falhou} falhou ===`)
  process.exit(falhou > 0 ? 1 : 0)
}

main()
