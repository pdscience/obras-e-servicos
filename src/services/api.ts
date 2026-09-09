import { createClient } from '@insforge/sdk'
import type { PerfilLojista, Produto, Professional, ServiceRequest, CategoriaDB, ProfissaoDB, ProfissionalCategoriaView, PlanoProfissional } from '../types'
import { limiteFotosPlano, limiteCategoriasPlano } from '../config/planos'

const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL as string,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY as string,
})

const PORTFOLIO_BUCKET = 'portfolio'

export async function uploadPortfolioImage(
  file: File,
  profissionalId: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${profissionalId}/${crypto.randomUUID()}.${ext}`
  const { error } = await insforge.storage
    .from(PORTFOLIO_BUCKET)
    .upload(path, file)
  if (error) throw new Error(`Erro ao enviar imagem: ${error.message}`)
  const { data } = insforge.storage
    .from(PORTFOLIO_BUCKET)
    .getPublicUrl(path)
  return data?.publicUrl ?? ''
}

export async function listarPaginasAtivas() {
  const { data, error } = await insforge.database
    .from('paginas')
    .select('*')
    .eq('status', 'ativo')
    .order('titulo', { ascending: true })
  if (error) throw error
  return data
}

export async function obterPagina(slug: string) {
  const { data, error } = await insforge.database
    .from('paginas')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function criarPagina(pagina: {
  slug: string; titulo: string; descricao?: string
  conteudo?: Record<string, unknown>; status?: 'ativo' | 'inativo' | 'rascunho'
}) {
  const { data, error } = await insforge.database
    .from('paginas')
    .insert({ slug: pagina.slug, titulo: pagina.titulo, descricao: pagina.descricao ?? null, conteudo: pagina.conteudo ?? {}, status: pagina.status ?? 'rascunho' })
    .select().single()
  if (error) throw error
  return data
}

export async function atualizarPagina(id: string, atualizacao: Partial<{ slug: string; titulo: string; descricao: string; conteudo: Record<string, unknown>; status: 'ativo' | 'inativo' | 'rascunho' }>) {
  const { data, error } = await insforge.database.from('paginas').update(atualizacao).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deletarPagina(id: string) {
  const { error } = await insforge.database.from('paginas').delete().eq('id', id)
  if (error) throw error
}

// ─── Quadro de Serviços (Orçamento Aberto) ───

function mapServico(row: Record<string, unknown>, maskSensitive?: boolean): ServiceRequest {
  const contato = maskSensitive && row.status === 'aberto'
    ? 'Disponível após aceitar'
    : (row.cliente_contato as string)

  return {
    id: row.id as string,
    cliente_id: row.cliente_id as string,
    profissional_id: row.profissional_id as string | null,
    cliente_nome: row.cliente_nome as string,
    cliente_contato: contato,
    categoria: row.categoria as string,
    subcategoria: row.subcategoria as string | null,
    descricao: row.descricao as string,
    endereco: row.endereco as string,
    data_preferida: row.data_preferida as string,
    orcamento: row.orcamento ? Number(row.orcamento) : undefined,
    urgencia: row.urgencia as 'baixa' | 'media' | 'alta',
    status: row.status as 'aberto' | 'em_andamento' | 'concluido' | 'cancelado',
    whatsapp_profissional: row.whatsapp_profissional as string | null,
    created_at: row.created_at as string,
  }
}

export async function criarServico(servico: {
  cliente_id: string
  cliente_nome: string
  cliente_contato: string
  categoria: string
  subcategoria?: string
  descricao: string
  endereco: string
  data_preferida: string
  orcamento?: number
  urgencia: 'baixa' | 'media' | 'alta'
  profissional_id?: string
}) {
  const { data, error } = await insforge.database
    .from('servicos')
    .insert({
      cliente_id: servico.cliente_id,
      cliente_nome: servico.cliente_nome,
      cliente_contato: servico.cliente_contato,
      categoria: servico.categoria,
      subcategoria: servico.subcategoria ?? null,
      descricao: servico.descricao,
      endereco: servico.endereco,
      data_preferida: servico.data_preferida,
      orcamento: servico.orcamento ?? null,
      urgencia: servico.urgencia,
      profissional_id: servico.profissional_id ?? null,
      whatsapp_profissional: null,
      status: servico.profissional_id ? 'em_andamento' : 'aberto',
    })
    .select()
    .single()
  if (error) throw error
  return mapServico(data)
}

export async function listarServicosAbertos(filtros?: {
  categoria?: string
  uf?: string
}) {
  let query = insforge.database
    .from('servicos')
    .select('*')
    .eq('status', 'aberto')
    .order('created_at', { ascending: false })
  if (filtros?.categoria) {
    query = query.eq('categoria', filtros.categoria)
  }
  const { data, error } = await query
  if (error) throw error
  let result = (data ?? []).map(r => mapServico(r, true))
  const ufFilter = filtros?.uf
  if (ufFilter) {
    result = result.filter(s => s.endereco.includes(`- ${ufFilter}`) || s.endereco.endsWith(ufFilter))
  }
  return result
}

export async function aceitarServico(servicoId: string, profissionalId: string) {
  const { data, error } = await insforge.database
    .from('servicos')
    .update({ profissional_id: profissionalId, status: 'em_andamento' })
    .eq('id', servicoId)
    .eq('status', 'aberto')
    .select()
    .single()
  if (error) throw new Error('Serviço não encontrado ou não está mais disponível')
  return mapServico(data)
}

export async function concluirServico(servicoId: string) {
  const { data, error } = await insforge.database
    .from('servicos')
    .update({ status: 'concluido' })
    .eq('id', servicoId)
    .select()
    .single()
  if (error) throw new Error('Serviço não encontrado')
  return mapServico(data)
}

export async function cancelarServico(servicoId: string) {
  const { data, error } = await insforge.database
    .from('servicos')
    .update({ status: 'cancelado' })
    .eq('id', servicoId)
    .select()
    .single()
  if (error) throw new Error('Serviço não encontrado')
  return mapServico(data)
}

export async function negociarServico(servicoId: string, profissionalId: string, whatsapp: string) {
  const { data, error } = await insforge.database
    .from('servicos')
    .update({ profissional_id: profissionalId, status: 'em_andamento', whatsapp_profissional: whatsapp })
    .eq('id', servicoId)
    .select()
    .single()
  if (error) throw new Error('Serviço não encontrado ou não está mais disponível')
  return mapServico(data)
}

export async function atualizarStatusServico(servicoId: string, status: 'concluido' | 'cancelado') {
  const { data, error } = await insforge.database
    .from('servicos')
    .update({ status })
    .eq('id', servicoId)
    .select()
    .single()
  if (error) throw new Error('Serviço não encontrado')
  return mapServico(data)
}

export async function listarServicosDoProfissional(profissionalId: string) {
  const { data, error } = await insforge.database
    .from('servicos')
    .select('*')
    .eq('profissional_id', profissionalId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => mapServico(row))
}

export async function listarServicosDoCliente(clienteId: string) {
  const { data, error } = await insforge.database
    .from('servicos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => mapServico(row))
}

// ─── Avaliações / Reviews ───

export interface ReviewDB {
  id: string
  profissional_id: string
  servico_id?: string | null
  cliente_nome: string
  cliente_avatar: string | null
  rating: number
  comment: string
  service_type: string
  created_at: string
}

function mapReview(row: Record<string, unknown>): ReviewDB {
  return {
    id: row.id as string,
    profissional_id: row.profissional_id as string,
    servico_id: row.servico_id as string | null | undefined,
    cliente_nome: row.cliente_nome as string,
    cliente_avatar: row.cliente_avatar as string | null,
    rating: row.rating as number,
    comment: row.comment as string,
    service_type: row.service_type as string,
    created_at: row.created_at as string,
  }
}

export async function criarReview(review: Omit<ReviewDB, 'id' | 'created_at'>) {
  const { data, error } = await insforge.database
    .from('reviews')
    .insert({
      profissional_id: review.profissional_id,
      servico_id: review.servico_id ?? null,
      cliente_nome: review.cliente_nome,
      cliente_avatar: review.cliente_avatar ?? null,
      rating: review.rating,
      comment: review.comment,
      service_type: review.service_type,
    })
    .select()
    .single()
  if (error) throw error

  return mapReview(data)
}

export async function listarReviews(profissionalId: string) {
  const { data, error } = await insforge.database
    .from('reviews')
    .select('*')
    .eq('profissional_id', profissionalId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapReview)
}

// ─── Perfil Profissional ───

export interface PerfilProfissionalDB {
  id: string
  usuario_id: string
  nome: string | null
  avatar_url: string | null
  categoria: string
  subcategoria: string | null
  anos_experiencia: number | null
  descricao: string | null
  especialidades: string[]
  certificacoes: string[]
  preco_hora: number | null
  preco_m2: number | null
  verificado: boolean
  premium: boolean
  premium_plano: PlanoProfissional | null
  premium_expiracao: string | null
  limite_fotos: number
  whatsapp: string | null
  instagram: string | null
  facebook: string | null
  youtube: string | null
  linkedin: string | null
  x: string | null
  banner_url: string | null
  data_inicio_gratis: string | null
  disponivel: boolean
  tempo_resposta: string | null
  uf: string | null
  cidade: string | null
  cep: string | null
  endereco: string | null
  numero: string | null
  bairro: string | null
  portfolio: Record<string, unknown>[]
  avaliacao_media: number
  total_avaliacoes: number
  total_servicos: number
  created_at: string
  updated_at: string
}

function parseStringOrArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw) {
    const trimmed = raw.trim()
    if (trimmed.startsWith('[')) {
      try { return JSON.parse(trimmed) } catch { /* fallthrough */ }
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

function mapPerfilProfissional(row: Record<string, unknown>): PerfilProfissionalDB {
  return {
    id: row.id as string,
    usuario_id: row.usuario_id as string,
    nome: row.nome as string | null,
    avatar_url: row.avatar_url as string | null,
    categoria: row.categoria as string,
    subcategoria: row.subcategoria as string | null,
    anos_experiencia: row.anos_experiencia as number | null,
    descricao: row.descricao as string | null,
    especialidades: parseStringOrArray(row.especialidades),
    certificacoes: parseStringOrArray(row.certificacoes),
    preco_hora: row.preco_hora as number | null,
    preco_m2: row.preco_m2 as number | null,
    verificado: row.verificado as boolean,
    premium: row.premium as boolean,
    premium_plano: row.premium_plano as PlanoProfissional | null,
    premium_expiracao: row.premium_expiracao as string | null,
    limite_fotos: (row.limite_fotos as number) ?? 0,
    whatsapp: row.whatsapp as string | null,
    instagram: row.instagram as string | null,
    facebook: row.facebook as string | null,
    youtube: row.youtube as string | null,
    linkedin: row.linkedin as string | null,
    x: row.x as string | null,
    banner_url: row.banner_url as string | null,
    data_inicio_gratis: row.data_inicio_gratis as string | null,
    disponivel: row.disponivel as boolean,
    tempo_resposta: row.tempo_resposta as string | null,
    uf: row.uf as string | null,
    cidade: row.cidade as string | null,
    cep: (row.cep as string | null) ?? null,
    endereco: (row.endereco as string | null) ?? null,
    numero: (row.numero as string | null) ?? null,
    bairro: (row.bairro as string | null) ?? null,
    portfolio: (row.portfolio as Record<string, unknown>[]) ?? [],
    avaliacao_media: row.avaliacao_media as number,
    total_avaliacoes: row.total_avaliacoes as number,
    total_servicos: row.total_servicos as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export async function criarUsuario(usuario: {
  id: string
  email: string
  nome: string
  telefone?: string
  tipo?: string
  tipos?: string[]
}) {
  try {
    const tiposArray = usuario.tipos ?? (usuario.tipo ? [usuario.tipo] : ['cliente'])
    // Formato PostgreSQL array literal: {item1,item2}
    const tiposPg = `{${tiposArray.join(',')}}`

    let tipoFinal = usuario.tipo
    if (!tipoFinal) {
      const existente = await obterUsuario(usuario.id).catch(() => null)
      tipoFinal = existente?.tipo
        ?? (tiposArray.includes('lojista') ? 'lojista'
           : tiposArray.includes('profissional') ? 'profissional'
           : tiposArray.includes('cliente') ? 'cliente' : 'usuario')
    }

    const { error } = await insforge.database
      .from('usuarios')
      .upsert({
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        telefone: usuario.telefone ?? null,
        tipo: tipoFinal,
        tipos: tiposPg,
        status: 'ativo',
      }, { onConflict: 'id' })
    if (error) {
      console.error('[criarUsuario] Erro:', error)
      throw error
    }
  } catch (e) {
    console.error('[criarUsuario] Exception:', e)
    return null
  }
}

export async function obterUsuario(usuarioId: string) {
  const { data, error } = await insforge.database
    .from('usuarios')
    .select('*')
    .eq('id', usuarioId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function obterUsuarioPorEmail(email: string) {
  const { data, error } = await insforge.database
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function criarPerfilUsuario(perfil: {
  usuario_id: string
  nome?: string
  cpf?: string
  data_nascimento?: string
  telefone?: string
  endereco?: string
  cidade?: string
  uf?: string
}) {
  const { error } = await insforge.database
    .from('perfis_usuario')
    .insert({
      usuario_id: perfil.usuario_id,
      nome: perfil.nome ?? null,
      cpf: perfil.cpf ?? null,
      data_nascimento: perfil.data_nascimento ?? null,
      telefone: perfil.telefone ?? null,
      uf: perfil.uf ?? null,
      cidade: perfil.cidade ?? null,
      enderecos: perfil.endereco ? [{ logradouro: perfil.endereco, cidade: perfil.cidade, uf: perfil.uf }] : null,
    })
    .maybeSingle()
  if (error && !error.message?.toLowerCase().includes('duplicate') && (error as any).statusCode !== 409) throw error
}

export async function obterPerfilUsuario(usuarioId: string) {
  const { data: usuario, error: errUsuario } = await insforge.database
    .from('usuarios')
    .select('*')
    .eq('id', usuarioId)
    .maybeSingle()
  if (errUsuario) throw errUsuario

  const { data: perfil } = await insforge.database
    .from('perfis_usuario')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()

  if (!usuario && !perfil) return null
  return {
    ...usuario,
    cpf: (usuario as any)?.cpf || (perfil as any)?.cpf || null,
    data_nascimento: (usuario as any)?.data_nascimento || (perfil as any)?.data_nascimento || null,
    telefone: (usuario as any)?.telefone || (perfil as any)?.telefone || null,
    uf: (usuario as any)?.uf || (perfil as any)?.uf || null,
    cidade: (usuario as any)?.cidade || (perfil as any)?.cidade || null,
    endereco: (usuario as any)?.endereco || ((perfil as any)?.enderecos?.[0]?.logradouro ?? null),
  }
}

export async function atualizarPerfilUsuario(usuarioId: string, atualizacao: Partial<{
  nome: string
  telefone: string
  cpf: string
  data_nascimento: string
  uf: string
  cidade: string
  endereco: string
  bairro: string
  cep: string
}>) {
  const str = (v: string | undefined) => v !== undefined ? (v.trim() === '' ? null : v.trim()) : undefined

  const updateData: Record<string, unknown> = {}
  if (atualizacao.nome !== undefined) updateData.nome = str(atualizacao.nome)
  if (atualizacao.telefone !== undefined) updateData.telefone = str(atualizacao.telefone)
  if (atualizacao.cpf !== undefined) updateData.cpf = str(atualizacao.cpf)
  if (atualizacao.data_nascimento !== undefined) updateData.data_nascimento = str(atualizacao.data_nascimento)
  if (atualizacao.uf !== undefined) updateData.uf = str(atualizacao.uf)
  if (atualizacao.cidade !== undefined) updateData.cidade = str(atualizacao.cidade)
  if (atualizacao.endereco !== undefined) updateData.endereco = str(atualizacao.endereco)
  if (atualizacao.bairro !== undefined) updateData.bairro = str(atualizacao.bairro)
  if (atualizacao.cep !== undefined) updateData.cep = str(atualizacao.cep)

  if (Object.keys(updateData).length === 0) return

  const { error } = await insforge.database
    .from('usuarios')
    .update(updateData)
    .eq('id', usuarioId)
  if (error) throw error

  // Mantém perfis_usuario sincronizado
  try {
    await insforge.database
    .from('perfis_usuario')
    .upsert({
      usuario_id: usuarioId,
      nome: updateData.nome,
      cpf: updateData.cpf,
      data_nascimento: updateData.data_nascimento,
      telefone: updateData.telefone,
      uf: updateData.uf,
      cidade: updateData.cidade,
      enderecos: updateData.endereco ? [{ logradouro: updateData.endereco, cidade: updateData.cidade, uf: updateData.uf }] : undefined,
    }, { onConflict: 'usuario_id' })
  } catch (e) {
    // Sincronização secundaria - falhas sao ignoradas
  }
}

export async function criarPerfilProfissional(perfil: {
  usuario_id: string
  nome: string
  avatar_url?: string
  categoria: string
  subcategoria?: string
  especialidades?: string[]
  uf?: string
  cidade?: string
  premium_plano?: PlanoProfissional
  whatsapp?: string
  instagram?: string
  facebook?: string
  youtube?: string
  linkedin?: string
  x?: string
  banner_url?: string
  data_inicio_gratis?: string
}) {
  const plano = perfil.premium_plano ?? 'bronze'
  const limiteFotos = limiteFotosPlano(plano)
  const { data, error } = await insforge.database
    .from('perfis_profissional')
    .upsert({
      usuario_id: perfil.usuario_id,
      nome: perfil.nome,
      avatar_url: perfil.avatar_url ?? null,
      categoria: perfil.categoria,
      subcategoria: perfil.subcategoria ?? null,
      especialidades: perfil.especialidades ?? [],
      uf: perfil.uf ?? null,
      cidade: perfil.cidade ?? null,
      premium: false,
      premium_plano: plano,
      limite_fotos: limiteFotos,
      whatsapp: perfil.whatsapp ?? null,
      instagram: perfil.instagram ?? null,
      facebook: perfil.facebook ?? null,
      youtube: perfil.youtube ?? null,
      linkedin: perfil.linkedin ?? null,
      x: perfil.x ?? null,
      banner_url: perfil.banner_url ?? null,
      data_inicio_gratis: perfil.data_inicio_gratis ?? null,
      verificado: false,
      disponivel: true,
      tempo_resposta: 'em algumas horas',
    }, { onConflict: 'usuario_id' })
    .select()
    .single()
  if (error) throw error
  return mapPerfilProfissional(data)
}

export async function obterPerfilProfissional(usuarioId: string) {
  const { data, error } = await insforge.database
    .from('perfis_profissional')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return mapPerfilProfissional(data)
}

export async function atualizarPerfilProfissional(id: string, atualizacao: Partial<{
  premium: boolean
  premium_plano: PlanoProfissional
  premium_expiracao: string
  limite_fotos: number
  nome: string
  categoria: string
  descricao: string
  especialidades: string[]
  certificacoes: string[]
  anos_experiencia: number
  preco_hora: number
  preco_m2: number
  disponivel: boolean
  uf: string
  cidade: string
  cep: string
  endereco: string
  numero: string
  bairro: string
  avatar_url: string
  whatsapp: string
  instagram: string
  facebook: string
  youtube: string
  linkedin: string
  x: string
  banner_url: string
  portfolio: Record<string, unknown>[]
}>) {
  const payload = { ...atualizacao, updated_at: new Date().toISOString() }
  let { data, error } = await insforge.database
    .from('perfis_profissional')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  // Fallback: se as colunas de endereço ainda não existirem no banco
  // (migration 20260908000001_add-endereco-perfil-profissional.sql pendente),
  // tenta salvar novamente sem os novos campos para não bloquear o perfil.
  if (error) {
    const msg = (error.message || '').toLowerCase()
    const colunaFaltando = msg.includes('pgrst204') || msg.includes('column') || msg.includes('schema cache')
    if (colunaFaltando && ('cep' in payload || 'endereco' in payload || 'numero' in payload || 'bairro' in payload)) {
      console.warn('[api] Colunas de endereço ausentes — aplique a migration 20260908000001. Salvando sem os campos de endereço.')
      const { cep: _cep, endereco: _endereco, numero: _numero, bairro: _bairro, ...resto } = payload
      const retry = await insforge.database
        .from('perfis_profissional')
        .update(resto)
        .eq('id', id)
        .select()
        .single()
      data = retry.data
      error = retry.error
    }
  }

  if (error) throw error
  return mapPerfilProfissional(data)
}

// ─── Premium / Planos ───

export async function ativarPremium(
  _perfilId: string,
  _plano: PlanoProfissional,
  _diasExpiracao: number
) {
  console.warn('[Segurança] A ativação de planos é processada exclusivamente no backend via webhook de pagamento.')
  throw new Error('A ativação de planos é processada exclusivamente via confirmação de pagamento.')
}

export async function verificarPremium(perfilId: string) {
  const { data, error } = await insforge.database
    .from('perfis_profissional')
    .select('premium, premium_plano, premium_expiracao')
    .eq('id', perfilId)
    .single()
  if (error) throw error
  return {
    premium: data.premium as boolean,
    plano: data.premium_plano as PlanoProfissional | null,
    expiracao: data.premium_expiracao as string | null,
  }
}

// ─── Listagem pública de profissionais ───

export async function obterPerfilProfissionalPorId(id: string): Promise<Professional | null> {
  try {
    let { data, error } = await insforge.database
      .from('perfis_profissional')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (!error && data) return mapPerfilToProfessional(mapPerfilProfissional(data as Record<string, unknown>))
    
    let { data: dataByUsuario, error: errorByUsuario } = await insforge.database
      .from('perfis_profissional')
      .select('*')
      .eq('usuario_id', id)
      .maybeSingle()
    if (!errorByUsuario && dataByUsuario) return mapPerfilToProfessional(mapPerfilProfissional(dataByUsuario as Record<string, unknown>))
  } catch { /* ignore */ }
  return null
}

export async function obterProfissionalPorId(id: string): Promise<Professional | null> {
  return obterPerfilProfissionalPorId(id)
}

export async function listarProfissionais() {
  const { data, error } = await insforge.database
    .from('perfis_profissional')
    .select('*')
    .order('premium', { ascending: false })
    .order('avaliacao_media', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapPerfilProfissional)
}

export function mapPerfilToProfessional(p: PerfilProfissionalDB): Professional {
  return {
    id: p.id,
    usuario_id: p.usuario_id,
    name: p.nome ?? 'Profissional',
    avatar: p.avatar_url ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    category: p.categoria,
    subcategory: p.subcategoria ?? '',
    rating: p.avaliacao_media,
    reviewCount: p.total_avaliacoes,
    completedJobs: p.total_servicos,
    location: [p.cidade, p.uf].filter(Boolean).join(', ') || 'Localização não informada',
    uf: p.uf ?? '',
    cidade: p.cidade ?? '',
    cep: p.cep ?? undefined,
    endereco: p.endereco ?? undefined,
    numero: p.numero ?? undefined,
    bairro: p.bairro ?? undefined,
    lat: 0,
    lng: 0,
    pricePerHour: p.preco_hora ?? 0,
    pricePerM2: p.preco_m2 ?? undefined,
    yearsExperience: p.anos_experiencia ?? 0,
    verified: p.verificado,
    premium: p.premium,
    premium_plano: p.premium_plano ?? undefined,
    limite_fotos: p.limite_fotos,
    whatsapp: p.whatsapp ?? undefined,
    instagram: p.instagram ?? undefined,
    facebook: p.facebook ?? undefined,
    youtube: p.youtube ?? undefined,
    linkedin: p.linkedin ?? undefined,
    x: p.x ?? undefined,
    banner_url: p.banner_url ?? undefined,
    data_inicio_gratis: p.data_inicio_gratis ?? undefined,
    available: p.disponivel,
    description: p.descricao ?? '',
    specialties: p.especialidades,
    certifications: p.certificacoes,
    portfolio: (p.portfolio ?? []).map(item => ({
      id: String(item.id ?? crypto.randomUUID()),
      beforeImage: String(item.beforeImage ?? ''),
      afterImage: String(item.afterImage ?? ''),
      title: String(item.title ?? ''),
      description: String(item.description ?? ''),
      category: String(item.category ?? ''),
    })),
    reviews: [],
    experience: [],
    responseTime: p.tempo_resposta ?? 'em algumas horas',
    createdAt: p.created_at,
  }
}

// ─── Lojistas ───

export interface LojistaDB {
  id: string
  usuario_id: string
  nome: string
  avatar: string | null
  cnpj: string | null
  razao_social: string | null
  nome_fantasia: string | null
  descricao: string | null
  categorias: string[]
  endereco: string | null
  uf: string | null
  cidade: string | null
  lat: number
  lng: number
  telefone_comercial: string | null
  email: string | null
  site: string | null
  social_facebook: string | null
  social_instagram: string | null
  social_youtube: string | null
  banner_url: string | null
  data_inicio_gratis: string | null
  horario_funcionamento: Record<string, unknown>
  verificado: boolean
  premium: boolean
  premium_plano: PlanoProfissional | null
  premium_expiracao: string | null
  avaliacao_media: number
  total_avaliacoes: number
  created_at: string
  updated_at: string
}

function mapLojista(row: Record<string, unknown>): LojistaDB {
  return {
    id: row.id as string,
    usuario_id: row.usuario_id as string,
    nome: row.nome as string,
    avatar: row.avatar as string | null,
    cnpj: row.cnpj as string | null,
    razao_social: row.razao_social as string | null,
    nome_fantasia: row.nome_fantasia as string | null,
    descricao: row.descricao as string | null,
    categorias: (row.categorias as string[]) ?? [],
    endereco: row.endereco as string | null,
    uf: row.uf as string | null,
    cidade: row.cidade as string | null,
    lat: (row.lat as number) ?? 0,
    lng: (row.lng as number) ?? 0,
    telefone_comercial: row.telefone_comercial as string | null,
    email: row.email as string | null,
    site: row.site as string | null,
    social_facebook: row.social_facebook as string | null,
    social_instagram: row.social_instagram as string | null,
    social_youtube: row.social_youtube as string | null,
    banner_url: row.banner_url as string | null,
    data_inicio_gratis: row.data_inicio_gratis as string | null,
    horario_funcionamento: (row.horario_funcionamento as Record<string, unknown>) ?? {},
    verificado: row.verificado as boolean,
    premium: (row.premium as boolean) ?? false,
    premium_plano: row.premium_plano as PlanoProfissional | null,
    premium_expiracao: row.premium_expiracao as string | null,
    avaliacao_media: (row.avaliacao_media as number) ?? 0,
    total_avaliacoes: (row.total_avaliacoes as number) ?? 0,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export async function obterPerfilLojista(usuarioId: string) {
  const { data, error } = await insforge.database
    .from('perfis_lojista')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return mapLojistaToPerfil(data)
}

export async function obterPerfilLojistaPorId(id: string) {
  const { data, error } = await insforge.database
    .from('perfis_lojista')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return mapLojistaToPerfil(data)
}

export async function criarPerfilLojista(perfil: {
  usuario_id: string
  nome: string
  nome_fantasia?: string
  razao_social?: string
  cnpj?: string
  descricao?: string
  categorias?: string[]
  endereco?: string
  cidade?: string
  uf?: string
  telefone_comercial?: string
  email?: string
  site?: string
  horario_funcionamento?: Record<string, unknown>
  social_facebook?: string
  social_instagram?: string
  social_youtube?: string
  banner_url?: string
  data_inicio_gratis?: string
  premium_plano?: PlanoProfissional
}) {
  const { data, error } = await insforge.database
    .from('perfis_lojista')
    .insert({
      usuario_id: perfil.usuario_id,
      nome: perfil.nome,
      nome_fantasia: perfil.nome_fantasia ?? null,
      razao_social: perfil.razao_social ?? null,
      cnpj: perfil.cnpj ?? null,
      descricao: perfil.descricao ?? null,
      categorias: perfil.categorias ?? [],
      endereco: perfil.endereco ?? null,
      cidade: perfil.cidade ?? null,
      uf: perfil.uf ?? null,
      telefone_comercial: perfil.telefone_comercial ?? null,
      email: perfil.email ?? null,
      site: perfil.site ?? null,
      horario_funcionamento: perfil.horario_funcionamento ?? {},
      social_facebook: perfil.social_facebook ?? null,
      social_instagram: perfil.social_instagram ?? null,
      social_youtube: perfil.social_youtube ?? null,
      banner_url: perfil.banner_url ?? null,
      data_inicio_gratis: perfil.data_inicio_gratis ?? null,
      premium_plano: perfil.premium_plano ?? null,
    })
    .select()
    .single()
  if (error && !error.message?.toLowerCase().includes('duplicate')) throw error
  if (error) return null
  return mapLojista(data)
}

export async function atualizarPerfilLojista(id: string, atualizacao: Partial<{
  nome: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  descricao: string
  categorias: string[]
  endereco: string
  cidade: string
  uf: string
  telefone_comercial: string
  email: string
  site: string
  horario_funcionamento: Record<string, unknown>
  social_facebook: string
  social_instagram: string
  social_youtube: string
  banner_url: string
  premium: boolean
  premium_plano: PlanoProfissional
  premium_expiracao: string
}>) {
  const { data, error } = await insforge.database
    .from('perfis_lojista')
    .update({ ...atualizacao, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapLojista(data)
}

export async function criarProduto(produto: {
  lojista_id: string
  nome: string
  descricao?: string
  categoria?: string
  preco: number
  unidade?: string
  estoque?: number
  imagens?: string[]
}) {
  const { data, error } = await insforge.database
    .from('produtos')
    .insert({
      lojista_id: produto.lojista_id,
      nome: produto.nome,
      descricao: produto.descricao ?? null,
      categoria: produto.categoria ?? null,
      preco: produto.preco,
      unidade: produto.unidade ?? null,
      estoque: produto.estoque ?? 0,
      imagens: produto.imagens ?? [],
      status: 'ativo',
    })
    .select()
    .single()
  if (error) throw error
  return mapProdutoToProduto(data)
}

export async function atualizarProduto(id: string, atualizacao: Partial<{
  nome: string
  descricao: string
  categoria: string
  preco: number
  unidade: string
  estoque: number
  imagens: string[]
  status: 'ativo' | 'inativo' | 'indisponivel'
}>) {
  const { data, error } = await insforge.database
    .from('produtos')
    .update({ ...atualizacao, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapProdutoToProduto(data)
}

export async function deletarProduto(id: string) {
  const { error } = await insforge.database.from('produtos').delete().eq('id', id)
  if (error) throw error
}

export async function listarLojistas() {
  const { data, error } = await insforge.database
    .from('perfis_lojista')
    .select('*')
    .order('avaliacao_media', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapLojista)
}

export function mapLojistaToPerfil(l: LojistaDB): PerfilLojista {
  return {
    id: l.id,
    usuario_id: l.usuario_id,
    nome: l.nome,
    avatar: l.avatar ?? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
    cnpj: l.cnpj,
    razao_social: l.razao_social,
    nome_fantasia: l.nome_fantasia,
    descricao: l.descricao ?? '',
    categorias: l.categorias,
    endereco: l.endereco ?? '',
    uf: l.uf ?? '',
    cidade: l.cidade ?? '',
    lat: l.lat,
    lng: l.lng,
    telefone_comercial: l.telefone_comercial,
    email: l.email,
    site: l.site,
    social_facebook: l.social_facebook ?? undefined,
    social_instagram: l.social_instagram ?? undefined,
    social_youtube: l.social_youtube ?? undefined,
    banner_url: l.banner_url ?? undefined,
    data_inicio_gratis: l.data_inicio_gratis ?? undefined,
    horario_funcionamento: l.horario_funcionamento,
    verificado: l.verificado,
    premium: l.premium,
    premium_plano: l.premium_plano ?? undefined,
    premium_expiracao: l.premium_expiracao ?? undefined,
    avaliacao_media: l.avaliacao_media,
    total_avaliacoes: l.total_avaliacoes,
    created_at: l.created_at,
    updated_at: l.updated_at,
  }
}

// ─── Produtos ───

export interface ProdutoDB {
  id: string
  lojista_id: string
  nome: string
  descricao: string | null
  categoria: string | null
  preco: number
  unidade: string | null
  estoque: number | null
  imagens: string[]
  status: string | null
  lojista_nome: string | null
  created_at: string
  updated_at: string
}

function mapProduto(row: Record<string, unknown>): ProdutoDB {
  return {
    id: row.id as string,
    lojista_id: row.lojista_id as string,
    nome: row.nome as string,
    descricao: row.descricao as string | null,
    categoria: row.categoria as string | null,
    preco: (row.preco as number) ?? 0,
    unidade: row.unidade as string | null,
    estoque: row.estoque as number | null,
    imagens: (row.imagens as string[]) ?? [],
    status: row.status as string | null,
    lojista_nome: row.lojista_nome as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export async function listarProdutos(lojistaId?: string) {
  let query = insforge.database.from('produtos').select('*')
  if (lojistaId) {
    query = query.eq('lojista_id', lojistaId)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapProduto)
}

export function mapProdutoToProduto(p: ProdutoDB): Produto {
  return {
    id: p.id,
    lojista_id: p.lojista_id,
    nome: p.nome,
    descricao: p.descricao,
    categoria: p.categoria ?? '',
    preco: p.preco,
    unidade: p.unidade ?? '',
    estoque: p.estoque ?? 0,
    imagens: p.imagens,
    status: (p.status as 'ativo' | 'inativo' | 'indisponivel') ?? 'ativo',
    lojista_nome: p.lojista_nome ?? undefined,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

export async function listarCategorias(): Promise<CategoriaDB[]> {
  const { data, error } = await insforge.database
    .from('categorias')
    .select('*')
    .order('nome')
  if (error) throw error
  return data ?? []
}

export async function listarProfissoes(categoriaId: string): Promise<ProfissaoDB[]> {
  const { data, error } = await insforge.database
    .from('profissoes')
    .select('*')
    .eq('categoria_id', categoriaId)
    .order('nome')
  if (error) throw error
  return data ?? []
}

export async function listarTodasProfissoes(): Promise<ProfissaoDB[]> {
  const { data, error } = await insforge.database
    .from('profissoes')
    .select('*')
    .order('nome')
  if (error) throw error
  return data ?? []
}

export async function listarCategoriasProfissional(profissionalId: string): Promise<ProfissionalCategoriaView[]> {
  const { data, error } = await insforge.database
    .from('profissional_categorias')
    .select(`
      id,
      profissional_id,
      categoria_id,
      profissao_id,
      categorias(nome),
      profissoes(nome)
    `)
    .eq('profissional_id', profissionalId)
  if (error) throw error
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    profissional_id: row.profissional_id as string,
    categoria_id: row.categoria_id as string,
    categoria_nome: ((row.categorias as Record<string, unknown>).nome as string),
    profissao_id: row.profissao_id as string,
    profissao_nome: ((row.profissoes as Record<string, unknown>).nome as string),
  }))
}

export async function salvarCategoriasProfissional(
  profissionalId: string,
  items: Array<{ categoria_id: string; profissao_id: string }>,
  plano: PlanoProfissional | null | undefined
): Promise<void> {
  const maxItems = limiteCategoriasPlano(plano)
  if (items.length > maxItems) {
    throw new Error(`Limite de ${maxItems} ${maxItems > 1 ? 'categorias' : 'categoria'} para seu plano.`)
  }
  if (items.length === 0) {
    await insforge.database
      .from('profissional_categorias')
      .delete()
      .eq('profissional_id', profissionalId)
    return
  }
  const inserts = items.map(i => ({
    profissional_id: profissionalId,
    categoria_id: i.categoria_id,
    profissao_id: i.profissao_id,
  }))

  const { error: delError } = await insforge.database
    .from('profissional_categorias')
    .delete()
    .eq('profissional_id', profissionalId)
  if (delError) throw delError

  const { error: insError } = await insforge.database
    .from('profissional_categorias')
    .insert(inserts)
  if (insError) throw insError

  const firstCat = items[0]
  const { data: catData } = await insforge.database
    .from('categorias')
    .select('nome')
    .eq('id', firstCat.categoria_id)
    .single()
  if (catData) {
    const { error: updateError } = await insforge.database
      .from('perfis_profissional')
      .update({ categoria: (catData as { nome: string }).nome, updated_at: new Date().toISOString() })
      .eq('id', profissionalId)
    if (updateError) throw updateError
  }
}

export async function contarProfissionaisPorCategoria(uf?: string | null, cidade?: string | null): Promise<Record<string, number>> {
  let query = insforge.database
    .from('perfis_profissional')
    .select('id, categoria')
    .eq('disponivel', true)
  if (uf) query = query.eq('uf', uf)
  if (cidade) query = query.eq('cidade', cidade)
  const { data: perfis, error } = await query
  if (error) throw error

  const counts: Record<string, number> = {}
  const seen = new Set<string>()
  for (const p of (perfis ?? []) as { id: string; categoria: string }[]) {
    const key = `${p.id}:${p.categoria}`
    if (seen.has(key)) continue
    seen.add(key)
    counts[p.categoria] = (counts[p.categoria] ?? 0) + 1
  }
  return counts
}

export async function listarProfissionaisPorCategoria(categoriaNome: string) {
  const { data, error } = await insforge.database
    .from('perfis_profissional')
    .select('*')
    .eq('categoria', categoriaNome)
    .eq('disponivel', true)
    .order('premium', { ascending: false })
    .order('avaliacao_media', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapPerfilToProfessional)
}

const SEED_CATEGORIAS = [
  { nome: 'Estrutura e Alvenaria', slug: 'estrutura-e-alvenaria', descricao: 'Profissionais responsaveis pela construcao da base, paredes e estruturas da obra.' },
  { nome: 'Fundacao e Terraplanagem', slug: 'fundacao-e-terraplanagem', descricao: 'Especialistas em preparo do solo, fundacoes e movimentacao de terra.' },
  { nome: 'Acabamento', slug: 'acabamento', descricao: 'Profissionais que dao o toque final a obra com revestimentos e acabamentos.' },
  { nome: 'Cobertura e Impermeabilizacao', slug: 'cobertura-e-impermeabilizacao', descricao: 'Telhados, calhas, mantas e solucoes para proteger a edificacao.' },
  { nome: 'Instalacoes Eletricas e Hidraulicas', slug: 'instalacoes-eletricas-e-hidraulicas', descricao: 'Eletricistas, encanadores e instaladores de sistemas prediais.' },
  { nome: 'Climatizacao e Refrigeracao', slug: 'climatizacao-e-refrigeracao', descricao: 'Instalacao e manutencao de sistemas de ar-condicionado e ventilacao.' },
  { nome: 'Automacao e Tecnologia', slug: 'automacao-e-tecnologia', descricao: 'Casas inteligentes, seguranca eletronica, redes e energia solar.' },
  { nome: 'Esquadrias, Vidros e Marcenaria', slug: 'esquadrias-vidros-e-marcenaria', descricao: 'Portas, janelas, vidros, marcenaria e divisorias.' },
  { nome: 'Limpeza Pos-Obra e Conservacao', slug: 'limpeza-pos-obra-e-conservacao', descricao: 'Limpeza pesada, fachadas, desentupimento e controle de pragas.' },
  { nome: 'Externos, Paisagismo e Lazer', slug: 'externos-paisagismo-e-lazer', descricao: 'Jardins, piscinas, decks, playgrounds e areas externas.' },
  { nome: 'Mudancas e Logistica', slug: 'mudancas-e-logistica', descricao: 'Carregadores, motoristas e içamento para mudancas e obras.' },
  { nome: 'Sustentabilidade e Eficiencia', slug: 'sustentabilidade-e-eficiencia', descricao: 'Reuso de agua, telhado verde e certificacoes ambientais.' },
  { nome: 'Seguranca do Trabalho', slug: 'seguranca-do-trabalho', descricao: 'Tecnicos e engenheiros de seguranca e bombeiros civis.' },
  { nome: 'Tecnicos, Projetos e Gestao', slug: 'tecnicos-projetos-e-gestao', descricao: 'Arquitetos, engenheiros, designers e gestores de obra.' },
]

const SEED_PROFISSOES: Record<string, string[]> = {
  'Estrutura e Alvenaria': ['Pedreiro', 'Servente / Ajudante de obra', 'Armador (ferreiro)', 'Carpinteiro de formas', 'Carpinteiro de telhado', 'Concreteiro', 'Bombeador de concreto', 'Estruturador metalico', 'Montador de pre-moldados', 'Montador de andaimes', 'Demolidor'],
  'Fundacao e Terraplanagem': ['Topografo', 'Sondador de solo (SPT)', 'Geotecnico', 'Operador de retroescavadeira / escavadeira / pa-carregadeira', 'Operador de bate-estaca', 'Operador de rolo compactador', 'Operador de betoneira / caminhao betoneira', 'Operador de guindaste / munck', 'Operador de grua'],
  'Acabamento': ['Pintor', 'Pintor de epoxi / piso industrial', 'Aplicador de textura, grafiato e massa projetada', 'Gesseiro', 'Estucador', 'Azulejista / Ladrilheiro', 'Aplicador de porcelanato (inclusive grandes formatos)', 'Marmorista / Granitero', 'Rejuntador', 'Papeleiro', 'Aplicador de cimento queimado / microcimento', 'Aplicador de revestimento 3D'],
  'Cobertura e Impermeabilizacao': ['Telhadista', 'Calheiro', 'Impermeabilizador', 'Aplicador de manta asfaltica / liquida', 'Instalador de telhas termicas e sanduiche', 'Instalador de domus e claraboias'],
  'Instalacoes Eletricas e Hidraulicas': ['Eletricista', 'Eletricista de baixa e alta tensao', 'Encanador / Bombeiro hidraulico', 'Instalador de gas (GLP / GN)', 'Instalador de aquecedores (solar, a gas, boiler)', 'Instalador de bombas e pressurizadores', 'Instalador de caixa dagua e cisterna', 'Poceiro (poco artesiano / semi-artesiano)', 'Instalador de fossa septica e biodigestor'],
  'Climatizacao e Refrigeracao': ['Instalador de ar-condicionado (split, multi-split, VRF)', 'Tecnico em refrigeracao', 'Instalador de exaustao e ventilacao', 'Instalador de dutos e PMOC'],
  'Automacao e Tecnologia': ['Instalador de automacao residencial (casa inteligente)', 'Programador de automacao (KNX, Crestron, Control4, Home Assistant)', 'Instalador de iluminacao inteligente / cenica', 'Instalador de cortinas e persianas automatizadas', 'Instalador de portoes automaticos', 'Instalador de fechaduras digitais e biometria', 'Instalador de interfones e videoporteiros', 'Instalador de CFTV / cameras IP', 'Instalador de alarmes e sensores', 'Instalador de cerca eletrica e concertina', 'Instalador de controle de acesso (catracas, tags, facial)', 'Instalador de redes (cabeamento estruturado, fibra optica)', 'Instalador de Wi-Fi e roteadores mesh', 'Instalador de som ambiente e home theater', 'Instalador de paineis solares fotovoltaicos', 'Tecnico em energia solar / banco de baterias', 'Instalador de carregador de veiculo eletrico', 'Instalador de para-raios (SPDA)', 'Instalador de nobreak e gerador'],
  'Esquadrias, Vidros e Marcenaria': ['Serralheiro', 'Marceneiro', 'Vidraceiro', 'Instalador de portas e janelas (madeira, aluminio, PVC)', 'Instalador de box de banheiro', 'Instalador de divisorias (drywall, eucatex, naval)', 'Instalador de drywall / steel frame / wood frame', 'Instalador de forros (PVC, gesso, modular)', 'Instalador de pisos laminados, vinilicos e de madeira', 'Tapeceiro / Estofador'],
  'Limpeza Pos-Obra e Conservacao': ['Limpador pos-obra (faxina pesada)', 'Aplicador de cera e polimento de pisos', 'Cristalizador de marmore e granito', 'Polidor de porcelanato', 'Limpeza de fachadas (rapel)', 'Limpeza de vidros em altura', 'Lavagem de telhados e calhas', 'Hidrojateamento', 'Desentupidor', 'Limpa-fossa', 'Dedetizador / Controle de pragas', 'Descupinizador'],
  'Externos, Paisagismo e Lazer': ['Jardineiro / Paisagista', 'Piscineiro (construcao, manutencao e tratamento)', 'Construtor de spa, ofuro e sauna', 'Pavimentador (asfalto, bloquete, intertravado)', 'Muralista (construcao de muros e arrimo)', 'Cerquista (alambrado, madeira, concertina)', 'Instalador de grama sintetica e natural', 'Instalador de deck (madeira, WPC)', 'Instalador de pergolado e gazebo', 'Instalador de playground'],
  'Mudancas e Logistica': ['Carregador / Ajudante de mudanca', 'Motorista de caminhao de obra', 'Icamento de moveis e equipamentos'],
  'Sustentabilidade e Eficiencia': ['Instalador de reuso de agua da chuva', 'Instalador de telhado verde', 'Consultor de eficiencia energetica', 'Consultor de certificacao LEED / AQUA'],
  'Seguranca do Trabalho': ['Tecnico de seguranca do trabalho', 'Engenheiro de seguranca', 'Bombeiro civil'],
  'Tecnicos, Projetos e Gestao': ['Arquiteto', 'Engenheiro civil / eletrico / hidraulico / mecanico', 'Designer de interiores', 'Decorador', 'Luminotecnico', 'Acustico (projeto e tratamento)', 'Paisagista (projeto)', 'Mestre de obras', 'Encarregado de obra', 'Orcamentista', 'Gerente de obra', 'Fiscal de obra', 'Despachante / Aprovador de projetos'],
}

let seedExecuted = false

export async function seedCategoriasProfissoes(): Promise<void> {
  if (seedExecuted) return

  const { data: existing } = await insforge.database
    .from('categorias')
    .select('id')
    .limit(1)

  if (existing && existing.length > 0) {
    seedExecuted = true
    return
  }

  for (const cat of SEED_CATEGORIAS) {
    const { data: inserted } = await insforge.database
      .from('categorias')
      .upsert(cat, { onConflict: 'nome' })
      .select('id, nome')
      .single()

    if (!inserted) continue

    const profissoes = SEED_PROFISSOES[cat.nome] ?? []
    if (profissoes.length > 0) {
      const rows = profissoes.map(nome => ({
        categoria_id: inserted.id,
        nome,
      }))
      await insforge.database
        .from('profissoes')
        .upsert(rows, { onConflict: 'categoria_id,nome' })
    }
  }

  seedExecuted = true
}

let migracaoPlanosExecutada = false

const MAPA_PLANOS_ANTIGOS: Record<string, PlanoProfissional> = {
  profissional: 'bronze',
  essencial: 'bronze',
  basico: 'prata',
  premium: 'ouro',
  mensal: 'ouro',
  anual: 'ouro',
}

export async function migrarPlanos(): Promise<void> {
  if (migracaoPlanosExecutada) return

  try {
    const { data: rows } = await insforge.database
      .from('perfis_profissional')
      .select('id, premium, premium_plano')
      .or('premium_plano.eq.mensal,premium_plano.eq.anual,premium_plano.eq.profissional,premium_plano.eq.essencial,premium_plano.eq.basico,premium_plano.eq.premium,premium_plano.is.null')

    if (!rows || rows.length === 0) {
      migracaoPlanosExecutada = true
      return
    }

    for (const row of rows) {
      const antigo = row.premium_plano as string | null
      const novoPlano = (antigo && MAPA_PLANOS_ANTIGOS[antigo]) || (row.premium ? 'ouro' : 'bronze')
      const novoPremium = row.premium ?? (novoPlano !== 'bronze')
      const limiteFotos = limiteFotosPlano(novoPlano)
      await insforge.database
        .from('perfis_profissional')
        .update({
          premium_plano: novoPlano,
          premium: novoPremium,
          limite_fotos: limiteFotos,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
    }

    migracaoPlanosExecutada = true
  } catch (e) {
    console.warn('[api] Migração de planos:', e)
  }
}

export default insforge
