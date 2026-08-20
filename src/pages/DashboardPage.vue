<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  LayoutDashboard, Briefcase, MessageCircle, Star, Settings,
  Calendar, DollarSign, Clock,
  CheckCircle2, XCircle, AlertCircle,
  Eye, Crown, Camera,
  Search, MapPin, User, X, Shield
} from '@lucide/vue'
import insforge, { listarServicosDoProfissional, listarServicosAbertos, concluirServico, cancelarServico, negociarServico, obterPerfilProfissional, criarPerfilProfissional, atualizarPerfilProfissional, obterPerfilUsuario, atualizarPerfilUsuario, listarReviews, ativarPremium, listarCategorias, listarTodasProfissoes, listarCategoriasProfissional, salvarCategoriasProfissional, uploadPortfolioImage } from '../services/api'
import { getCitiesByUf } from '../data/cities'
import type { ServiceRequest, CategoriaDB, ProfissaoDB, ProfissionalCategoriaView, PlanoProfissional, PortfolioItem } from '../types'
import { PLANOS_PROFISSIONAIS, limiteCategoriasPlano, limiteFotosPlano, PLANOS, obterPlanoEficaz } from '../config/planos'
import { useAuthStore } from '../stores/auth'
import { usePeriodoGratis } from '../composables/usePeriodoGratis'

defineEmits<{ back: [] }>()

const auth = useAuthStore()
const activeTab = ref('overview')
const meusServicos = ref<ServiceRequest[]>([])
const servicosAbertos = ref<ServiceRequest[]>([])
const loading = ref(true)

const proNome = ref(auth.user?.nome ?? 'Profissional')
const proAvatar = ref(auth.user?.avatar_url ?? '')
const proCategoria = ref('')
const proPremium = ref(false)
const proPremiumPlano = ref<PlanoProfissional | null>(null)
const proPremiumExpiracao = ref('')
const proRating = computed(() => {
  if (proReviews.value.length === 0) return 0
  const sum = proReviews.value.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / proReviews.value.length) * 10) / 10
})
const proReviews = ref<{ clientName: string; clientAvatar: string; rating: number; comment: string; date: string; serviceType: string }[]>([])
const proId = ref('')
const proDataInicioGratis = ref<string | null>(null)
const proProfissoes = ref<string[]>([])

const { emPeriodoGratis, diasRestantes, textoDiasRestantes, percentualRestante, expirado: periodoGratisExpirado } = usePeriodoGratis(proDataInicioGratis)

const premiumDiasRestantes = computed(() => {
  if (!proPremiumExpiracao.value) return 0
  const diff = new Date(proPremiumExpiracao.value).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
})

const premiumExpirado = computed(() => {
  if (!proPremium.value || !proPremiumExpiracao.value) return false
  return new Date(proPremiumExpiracao.value) <= new Date()
})

const editTelefone = ref('')
const editCpf = ref('')
const editDataNascimento = ref('')
const editUf = ref('')

function maskTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}
const editCidade = ref('')
const editCidades = ref<string[]>([])
const editWhatsapp = ref('')
const whatsappModal = ref(false)
const whatsappLoading = ref(false)
const servicoParaNegociar = ref<string | null>(null)
const editInstagram = ref('')
const editFacebook = ref('')

const showDetalhesModal = ref(false)
const servicoDetalhes = ref<ServiceRequest | null>(null)

watch(editUf, async (newUf, oldUf) => {
  if (newUf !== oldUf) editCidade.value = ''
  editCidades.value = await getCitiesByUf(newUf)
})

const editDescricao = ref('')
const editCertificacoes = ref('')
const editAnosExperiencia = ref(0)
const editPrecoHora = ref(0)
const editPrecoM2 = ref(0)
const editDisponivel = ref(true)

const categoriasDB = ref<CategoriaDB[]>([])
const profissoesDB = ref<ProfissaoDB[]>([])
const editCategorias = ref<ProfissionalCategoriaView[]>([])
const editPortfolio = ref<PortfolioItem[]>([])
const selectedProfissaoId = ref('')

function handlePortfolioUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (!files || !proId.value) return
    const remaining = maxFotos.value - editPortfolio.value.length
    const toAdd = Array.from(files).slice(0, remaining)
    for (const file of toAdd) {
      try {
        const url = await uploadPortfolioImage(file, proId.value)
        editPortfolio.value.push({
          id: crypto.randomUUID(),
          beforeImage: url,
          afterImage: '',
          title: '',
          description: '',
          category: proCategoria.value,
        })
      } catch {
        console.error('Upload failed')
      }
    }
  }
  input.click()
}

function removerPortfolio(index: number) {
  editPortfolio.value.splice(index, 1)
}

const planOptions = PLANOS_PROFISSIONAIS.map(p => ({
  id: p.id,
  name: p.nome,
  price: p.preco,
  description: p.foco,
  features: p.beneficios,
  popular: p.id === 'ouro',
}))

const planoEficaz = computed(() => obterPlanoEficaz(proPremiumPlano.value, proPremium.value, proDataInicioGratis.value))

const maxCategorias = computed(() => limiteCategoriasPlano(planoEficaz.value.plano))
const podeAdicionar = computed(() => editCategorias.value.length < maxCategorias.value)

const maxFotos = computed(() => limiteFotosPlano(planoEficaz.value.plano))

async function carregarProfissoes() {
  categoriasDB.value = await listarCategorias()
  profissoesDB.value = await listarTodasProfissoes()
}

async function adicionarCategoria() {
  if (!selectedProfissaoId.value) return
  const prof = profissoesDB.value.find(p => p.id === selectedProfissaoId.value)
  if (!prof) return
  if (editCategorias.value.some(e => e.profissao_id === selectedProfissaoId.value)) return
  if (editCategorias.value.length >= maxCategorias.value) return
  const cat = categoriasDB.value.find(c => c.id === prof.categoria_id)
  editCategorias.value.push({
    id: '',
    profissional_id: '',
    categoria_id: prof.categoria_id,
    categoria_nome: cat?.nome ?? prof.nome,
    profissao_id: prof.id,
    profissao_nome: prof.nome,
  })
  selectedProfissaoId.value = ''
}

function removerCategoria(index: number) {
  editCategorias.value.splice(index, 1)
}

const ufList = [
  { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' },
]

function buildPro() {
  return {
    id: proId.value || '',
    name: proNome.value,
    avatar: proAvatar.value || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    category: proCategoria.value,
    profissoes: proProfissoes.value,
    rating: proRating.value,
    reviewCount: proReviews.value.length,
    premium: proPremium.value && !premiumExpirado.value,
    premium_plano: proPremiumPlano.value,
    premium_expiracao: proPremiumExpiracao.value,
    reviews: proReviews.value,
  }
}
const pro = computed(buildPro)

function nomePlano(): string {
  return PLANOS[planoEficaz.value.plano].nome
}

const stats = computed(() => {
  const pendentes = meusServicos.value.filter(s => s.status === 'aberto' || s.status === 'em_andamento').length
  const concluidos = meusServicos.value.filter(s => s.status === 'concluido').length
  const faturamento = meusServicos.value
    .filter(s => s.status === 'concluido')
    .reduce((sum, s) => sum + (s.orcamento || 0), 0)
  return [
    { label: 'Serviços Ativos', value: pendentes.toString(), change: '', icon: Briefcase, color: '#f0a500' },
    { label: 'Serviços Concluídos', value: concluidos.toString(), change: '', icon: CheckCircle2, color: '#3fb950' },
    { label: 'Avaliação Média', value: pro.value.rating.toString(), change: '', icon: Star, color: '#f0b429' },
    { label: 'Faturamento', value: `R$ ${faturamento.toLocaleString('pt-BR')}`, change: '', icon: DollarSign, color: '#7ee8fa' }
  ]
})

const menuItems = computed(() => [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'requests', label: 'Meus Pedidos', icon: Briefcase, badge: meusServicos.value.filter(s => s.status === 'aberto' || s.status === 'em_andamento').length || undefined },
  { id: 'job-board', label: 'Quadro de Serviços', icon: Briefcase },
  { id: 'reviews', label: 'Avaliações', icon: Star },
  { id: 'settings', label: 'Configurações', icon: Settings }
])

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    aberto: 'bg-[color-mix(in srgb,var(--accent-amber) 10%,transparent)] text-[var(--accent-amber)]',
    em_andamento: 'bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)]',
    concluido: 'bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)] text-[var(--accent-green)]',
    cancelado: 'bg-[color-mix(in srgb,var(--accent-red) 10%,transparent)] text-[var(--accent-red)]'
  }
  const labels: Record<string, string> = {
    aberto: 'Aberto',
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado'
  }
  return { style: styles[status] || '', label: labels[status] || status }
}

const monthlyStats = computed(() => {
  const concluidos = meusServicos.value.filter(s => s.status === 'concluido').length
  const andamento = meusServicos.value.filter(s => s.status === 'em_andamento').length
  const abertos = meusServicos.value.filter(s => s.status === 'aberto').length
  const cancelados = meusServicos.value.filter(s => s.status === 'cancelado').length
  return [
    { label: 'Concluídos', value: concluidos.toString(), icon: CheckCircle2, color: '#3fb950' },
    { label: 'Em andamento', value: andamento.toString(), icon: Clock, color: '#f0a500' },
    { label: 'Abertos', value: abertos.toString(), icon: AlertCircle, color: '#f0b429' },
    { label: 'Cancelados', value: cancelados.toString(), icon: XCircle, color: '#f85149' }
  ]
})

const ultimaReview = computed(() => {
  const r = pro.value.reviews[0]
  if (!r) return null
  return r
})

const searchCategoria = ref('')

const categorias = computed(() => {
  const cats = new Set(servicosAbertos.value.map(s => s.categoria))
  return [...cats].sort()
})

const servicosAbertosFiltrados = computed(() => {
  if (!searchCategoria.value) return servicosAbertos.value
  return servicosAbertos.value.filter(s => s.categoria === searchCategoria.value)
})

const urgenciaLabel = (u: string) => {
  const map: Record<string, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta' }
  return map[u] || u
}

const urgenciaColor = (u: string) => {
  const map: Record<string, string> = {
    baixa: 'bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)] text-[var(--accent-green)]',
    media: 'bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)]',
    alta: 'bg-[color-mix(in srgb,var(--accent-red) 10%,transparent)] text-[var(--accent-red)]'
  }
  return map[u] || ''
}

const diasAtras = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  return `${days} dias atrás`
}

async function carregar() {
  loading.value = true
  try {
    await carregarProfissoes()
    if (auth.user) {
      editNome.value = auth.user.nome
      const perfil = await obterPerfilProfissional(auth.user.id)
      if (perfil) {
        proNome.value = auth.user.nome
        proAvatar.value = auth.user.avatar_url ?? ''
        proCategoria.value = perfil.categoria
        proPremium.value = perfil.premium
        proPremiumPlano.value = perfil.premium_plano ?? null
        proPremiumExpiracao.value = perfil.premium_expiracao ?? ''
        proDataInicioGratis.value = perfil.data_inicio_gratis ?? null
        proId.value = perfil.id
        editUf.value = perfil.uf ?? ''
        editCidade.value = perfil.cidade ?? ''
        editWhatsapp.value = perfil.whatsapp ?? ''
        editInstagram.value = perfil.instagram ?? ''
        editFacebook.value = perfil.facebook ?? ''
        editCategorias.value = await listarCategoriasProfissional(perfil.id)
        proProfissoes.value = [...new Set(editCategorias.value.map(c => c.profissao_nome))].sort()
        editPortfolio.value = (perfil.portfolio ?? []).map((p: Record<string, unknown>) => ({
          id: p.id as string,
          beforeImage: p.beforeImage as string,
          afterImage: p.afterImage as string,
          title: p.title as string,
          description: p.description as string,
          category: p.category as string,
        }))
        editDescricao.value = perfil.descricao ?? ''
        editCertificacoes.value = (perfil.certificacoes ?? []).join(', ')
        editAnosExperiencia.value = perfil.anos_experiencia ?? 0
        editPrecoHora.value = perfil.preco_hora ?? 0
        editPrecoM2.value = perfil.preco_m2 ?? 0
        editDisponivel.value = perfil.disponivel ?? true
      }
      const perfilUsuario = await obterPerfilUsuario(auth.user.id)
      if (perfilUsuario) {
        editTelefone.value = perfilUsuario.telefone ?? ''
        editCpf.value = perfilUsuario.cpf ?? ''
        editDataNascimento.value = perfilUsuario.data_nascimento ?? ''
        if (!editUf.value) editUf.value = perfilUsuario.uf ?? ''
        if (!editCidade.value) editCidade.value = perfilUsuario.cidade ?? ''
      }
    }
    meusServicos.value = await listarServicosDoProfissional(pro.value.id)
    if (proCategoria.value) {
      servicosAbertos.value = await listarServicosAbertos()
    }
    if (proId.value) {
      const reviewsData = await listarReviews(proId.value)
      proReviews.value = reviewsData.map((r: { cliente_nome: string; cliente_avatar: string | null; comment: string; created_at: string; service_type: string; rating: number }) => ({
        clientName: r.cliente_nome,
        clientAvatar: r.cliente_avatar ?? '',
        rating: r.rating,
        comment: r.comment,
        date: new Date(r.created_at).toLocaleDateString('pt-BR'),
        serviceType: r.service_type,
      }))
    }
  } finally {
    loading.value = false
  }
}

async function handleConcluir(servicoId: string) {
  await concluirServico(servicoId)
  await carregar()
}

async function handleCancelar(servicoId: string) {
  await cancelarServico(servicoId)
  await carregar()
}

function abrirNegociacao(servicoId: string) {
  servicoParaNegociar.value = servicoId
  whatsappModal.value = true
}

function abrirDetalhes(servico: ServiceRequest) {
  servicoDetalhes.value = servico
  showDetalhesModal.value = true
}

function fecharDetalhes() {
  showDetalhesModal.value = false
  servicoDetalhes.value = null
}

async function handleNegociar() {
  if (!servicoParaNegociar.value || !whatsappNumber.value.trim()) return
  whatsappLoading.value = true
  try {
    await negociarServico(servicoParaNegociar.value, pro.value.id, whatsappNumber.value.trim())
    whatsappModal.value = false
    whatsappNumber.value = ''
    await carregar()
  } catch (e: unknown) {
    alert((e as Error).message)
  } finally {
    whatsappLoading.value = false
  }
}

function fecharNegociacao() {
  whatsappModal.value = false
  whatsappNumber.value = ''
  servicoParaNegociar.value = null
}

const whatsappNumber = ref('')

const editNome = ref('')
const saving = ref(false)

async function salvarPerfil() {
  if (!editNome.value.trim()) return
  if (saving.value) return
  saving.value = true
  try {
    const nome = editNome.value.trim()
    proNome.value = nome
    await auth.setProfile?.({ name: nome }).catch(() => {})
    if (!proId.value && auth.user) {
      const novoPerfil = await criarPerfilProfissional({
        usuario_id: auth.user.id,
        nome,
        categoria: editCategorias.value[0]?.categoria_nome || 'Geral',
        subcategoria: editCategorias.value[0]?.profissao_nome || undefined,
        uf: editUf.value || undefined,
        cidade: editCidade.value || undefined,
      })
      if (novoPerfil) {
        proId.value = novoPerfil.id
      }
    }
    if (proId.value) {
      const especialidades = editCategorias.value.map(c => c.profissao_nome)
      await atualizarPerfilProfissional(proId.value, {
        nome,
        descricao: editDescricao.value,
        especialidades,
        certificacoes: editCertificacoes.value.split(',').map(s => s.trim()).filter(Boolean),
        anos_experiencia: editAnosExperiencia.value,
        preco_hora: editPrecoHora.value,
        preco_m2: editPrecoM2.value,
        disponivel: editDisponivel.value,
        uf: editUf.value,
        cidade: editCidade.value,
        whatsapp: editWhatsapp.value || undefined,
        instagram: editInstagram.value || undefined,
        facebook: editFacebook.value || undefined,
        portfolio: editPortfolio.value.map(p => ({
          id: p.id,
          beforeImage: p.beforeImage,
          afterImage: p.afterImage,
          title: p.title,
          description: p.description,
          category: p.category,
        })),
      })
      if (editCategorias.value.length > 0) {
        await salvarCategoriasProfissional(
          proId.value,
          editCategorias.value.map(c => ({ categoria_id: c.categoria_id, profissao_id: c.profissao_id })),
          planoEficaz.value.plano
        )
        proCategoria.value = editCategorias.value[0].categoria_nome
      }
    }
    if (auth.user) {
      await atualizarPerfilUsuario(auth.user.id, {
        nome,
        telefone: editTelefone.value,
        cpf: editCpf.value,
        data_nascimento: editDataNascimento.value,
        uf: editUf.value,
        cidade: editCidade.value,
      })
    }
    notificarSucesso()
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Erro ao salvar perfil. Tente novamente.'
    console.error('[Dashboard] Erro ao salvar perfil:', e)
    notificarErro(msg)
  } finally {
    saving.value = false
  }
}

const showPlansModal = ref(false)
const showSuccess = ref(false)
const showError = ref('')

function notificarSucesso() {
  showSuccess.value = true
  setTimeout(() => { showSuccess.value = false }, 4000)
}

function notificarErro(msg: string) {
  showError.value = msg
  setTimeout(() => { showError.value = '' }, 8000)
}

async function handleUpgrade(plano: PlanoProfissional) {
  if (!proId.value) return
  loading.value = true
  try {
    const { data, error } = await insforge.functions.invoke('criar-pagamento', {
      body: { perfil_id: proId.value, plano },
    })
    if (error) throw new Error(error.message)
    const url = (data as { checkout_url?: string })?.checkout_url
    if (url) {
      window.open(url, '_blank')
    } else {
      const dias = 30
      await ativarPremium(proId.value, plano, dias)
      proPremium.value = true
      proPremiumPlano.value = plano
      const exp = new Date()
      exp.setDate(exp.getDate() + dias)
      proPremiumExpiracao.value = exp.toISOString()
    }
    showPlansModal.value = false
  } catch (err: any) {
    console.error('Erro ao ativar plano:', err)
  } finally {
    loading.value = false
  }
}

async function handleAvatarUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file || !auth.user) return
    loading.value = true
    try {
      const ext = file.name.split('.').pop()
      const path = `${auth.user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await insforge.storage.from('avatars').upload(path, file)
      if (uploadError) throw uploadError
      const { data: urlData, error: urlError } = insforge.storage.from('avatars').getPublicUrl(path)
      if (urlError || !urlData) throw urlError || new Error('Falha ao obter URL pública')
      const publicUrl = urlData.publicUrl
      proAvatar.value = publicUrl
      await auth.setProfile({ avatar_url: publicUrl })
      if (proId.value) {
        await atualizarPerfilProfissional(proId.value, { avatar_url: publicUrl })
      }
    } catch (err: any) {
      console.error('Erro ao enviar avatar:', err)
    } finally {
      loading.value = false
    }
  }
  input.click()
}

onMounted(carregar)
</script>

<template>
  <div class="min-h-screen" style="background:var(--bg-page)">
    <aside class="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-[var(--bg-card)] border-r border-[var(--border-default)] hidden lg:block">
      <div class="p-4">
        <div class="flex items-center gap-3 p-3 bg-[var(--bg-raised)] rounded-xl mb-6">
          <div class="relative group cursor-pointer" @click="handleAvatarUpload">
            <img :src="pro.avatar" :alt="pro.name" class="w-12 h-12 rounded-full object-cover" />
            <div class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera class="w-5 h-5 text-white" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-[var(--text-secondary)] truncate">{{ pro.name }}</p>
            <p v-if="pro.premium && !premiumExpirado" class="text-xs text-[var(--accent-gold)]">Plano {{ PLANOS[planoEficaz.plano].nome }}</p>
            <p v-else-if="emPeriodoGratis" class="text-xs text-[var(--accent-green)]">Período Gratuito</p>
          </div>
        </div>
        <nav class="space-y-1">
          <button v-for="item in menuItems" :key="item.id" @click="activeTab = item.id" :class="['w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors', activeTab === item.id ? 'bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-raised)]']">
            <div class="flex items-center gap-3"><component :is="item.icon" class="w-5 h-5" /><span class="font-medium">{{ item.label }}</span></div>
            <span v-if="item.badge" class="w-5 h-5 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-xs rounded-full flex items-center justify-center">{{ item.badge }}</span>
          </button>
        </nav>
      </div>
      <div class="absolute bottom-4 left-4 right-4">
        <!-- Período Gratuito Ativo -->
        <div v-if="emPeriodoGratis" class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <h4 class="font-semibold mb-1 flex items-center gap-2"><Crown class="w-4 h-4" />Plano Ouro - Gratuito</h4>
          <p class="text-white/80 text-xs mb-2">{{ textoDiasRestantes }}</p>
          <div class="w-full bg-white/20 rounded-full h-2 mb-2">
            <div class="bg-white rounded-full h-2 transition-all" :style="{ width: percentualRestante + '%' }"></div>
          </div>
          <p class="text-white/70 text-xs">Após 60 dias, escolha um plano pago.</p>
        </div>
        <!-- Período Gratuito Expirado -->
        <div v-else-if="periodoGratisExpirado" class="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <h4 class="font-semibold mb-1 flex items-center gap-2"><AlertCircle class="w-4 h-4" />Período Gratuito Expirado</h4>
          <p class="text-white/80 text-sm mb-3">Seu período de 60 dias gratuitos expirou. Escolha um plano para continuar com destaque.</p>
          <button @click="showPlansModal = true" class="w-full py-2 bg-white text-orange-600 font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors">Escolher Plano</button>
        </div>
        <!-- Plano Pago Ativo -->
        <div v-else-if="pro.premium && !premiumExpirado" class="bg-[var(--accent-green)] rounded-xl p-4 text-white">
          <h4 class="font-semibold mb-1 flex items-center gap-2"><Crown class="w-4 h-4" />Plano {{ nomePlano() }}</h4>
          <p class="text-white/70 text-xs mb-1">Seu perfil está em destaque!</p>
          <p v-if="premiumDiasRestantes > 0" class="text-white/80 text-xs">Restam {{ premiumDiasRestantes }} dias</p>
          <p v-else class="text-white/80 text-xs">Expirado — faça um novo plano</p>
        </div>
        <!-- Sem Plano -->
        <div v-else class="bg-[var(--accent-gold)] rounded-xl p-4 text-[var(--text-on-accent)]">
          <h4 class="font-semibold mb-1">Aumente sua Visibilidade</h4>
          <p class="text-[var(--text-on-accent)]/70 text-sm mb-3">Assine Ouro ou superior e receba 3x mais clientes</p>
          <button @click="showPlansModal = true" class="w-full py-2 bg-white text-[var(--text-on-accent)] font-medium rounded-lg text-sm hover:bg-[var(--bg-page)] transition-colors">Ver Planos</button>
        </div>
      </div>
    </aside>

    <main class="lg:ml-64 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
         <div>
           <h1 class="text-2xl font-bold text-[var(--text-primary)]">Bem-vindo, {{ pro.name.split(' ')[0] }}!</h1>
           <p class="text-[var(--text-muted)]">Aqui está o resumo da sua atividade</p>
         </div>
       </div>

      <div v-if="loading" class="text-center py-16">
        <div class="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-[var(--text-muted)]">Carregando...</p>
      </div>

      <template v-else>
        <!-- Overview -->
        <template v-if="activeTab === 'overview'">
          <div class="kpi-grid max-w-5xl px-4 sm:px-6 lg:px-8">
          <div v-for="(stat, i) in stats" :key="i" class="kpi-card" :style="{ borderLeftColor: stat.color }">
            <component :is="stat.icon" class="kpi-icon" :style="{ color: stat.color }" />
            <div class="kpi-content"><h3>{{ stat.value }}</h3><p>{{ stat.label }}</p></div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl px-4 sm:px-6 lg:px-8">
          <div class="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-sm">
            <div class="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
              <h2 class="font-semibold text-[var(--text-secondary)]">Meus Serviços</h2>
              <button class="text-[var(--accent-gold)] text-sm font-medium hover:text-[var(--accent-teal)]">Ver Todos</button>
            </div>
            <div v-if="meusServicos.length === 0" class="p-8 text-center">
              <p class="text-[var(--text-subtle)]">Nenhum serviço ainda. Os serviços aparecerão aqui quando você aceitar.</p>
            </div>
            <div v-else class="divide-y divide-[var(--border-default)]">
              <div v-for="servico in meusServicos" :key="servico.id" class="p-5 hover:bg-[var(--bg-raised)] transition-colors">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-full bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] flex items-center justify-center shrink-0">
                      <span class="text-[var(--accent-gold)] font-bold text-sm">{{ servico.cliente_nome.charAt(0) }}</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-medium text-[var(--text-secondary)]">{{ servico.cliente_nome }}</h3>
                        <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusBadge(servico.status).style]">{{ getStatusBadge(servico.status).label }}</span>
                      </div>
                      <p class="text-sm text-[var(--text-muted)]">{{ servico.descricao.slice(0, 80) }}{{ servico.descricao.length > 80 ? '...' : '' }}</p>
                      <p class="text-sm text-white mt-1">{{ servico.endereco }} • {{ new Date(servico.created_at).toLocaleDateString('pt-BR') }}</p>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <p v-if="servico.orcamento" class="font-semibold text-[var(--text-primary)]">R$ {{ servico.orcamento.toLocaleString('pt-BR') }}</p>
                    <div class="flex items-center gap-1 mt-2">
                      <button
                        v-if="servico.status === 'aberto'"
                        @click="abrirNegociacao(servico.id)"
                        class="px-3 py-1.5 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-xs rounded-lg font-medium hover:bg-[color-mix(in_srgb,var(--accent-gold)_85%,black)]"
                      >
                        Negociar
                      </button>
                      <button
                        v-if="servico.status === 'em_andamento'"
                        @click="handleConcluir(servico.id)"
                        class="px-3 py-1.5 bg-[var(--accent-green)] text-[var(--text-on-accent)] text-xs rounded-lg font-medium hover:bg-[color-mix(in_srgb,var(--accent-green)_85%,black)]"
                      >
                        Concluir
                      </button>
                      <button
                        v-if="servico.status === 'aberto' || servico.status === 'em_andamento'"
                        @click="handleCancelar(servico.id)"
                        class="p-1.5 hover:bg-[var(--border-default)] rounded transition-colors"
                        title="Cancelar"
                      >
                        <XCircle class="w-4 h-4 text-[var(--accent-red)]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-sm">
              <div class="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
                <h2 class="font-semibold text-[var(--text-secondary)]">Serviços Disponíveis</h2>
                <span class="text-xs text-[var(--accent-gold)]">{{ servicosAbertos.length }} abertos</span>
              </div>
              <div class="p-5 space-y-3">
                <div v-if="servicosAbertos.length === 0" class="text-center py-4">
                  <p class="text-[var(--text-subtle)] text-sm">Nenhum serviço disponível no momento</p>
                </div>
                <div v-for="servico in servicosAbertos.slice(0, 3)" :key="servico.id" class="flex items-start gap-3 p-3 bg-[var(--bg-raised)] rounded-lg">
                  <div class="w-10 h-10 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase class="w-5 h-5 text-[var(--accent-gold)]" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-[var(--text-secondary)] text-sm truncate">{{ servico.descricao.slice(0, 50) }}{{ servico.descricao.length > 50 ? '...' : '' }}</h4>
                    <p class="text-xs text-[var(--text-muted)]">{{ servico.cliente_nome }} • {{ servico.endereco.split(',')[0] }}</p>
                    <p v-if="servico.orcamento" class="text-xs text-[var(--accent-green)] mt-1">R$ {{ servico.orcamento.toLocaleString('pt-BR') }}</p>
                  </div>
                  <button @click="abrirNegociacao(servico.id)" class="px-2.5 py-1 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-xs rounded-lg font-medium whitespace-nowrap hover:bg-[var(--accent-dark-gold)]">Negociar</button>
                </div>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-sm p-5">
              <h2 class="font-semibold text-[var(--text-secondary)] mb-4">Resumo</h2>
              <div class="space-y-4">
                <div v-for="(item, i) in monthlyStats" :key="i" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="{ background: item.color + '18' }"><component :is="item.icon" class="w-4 h-4" :style="{ color: item.color }" /></div>
                    <span class="text-sm text-[var(--text-muted)]">{{ item.label }}</span>
                  </div>
                  <span class="font-semibold text-[var(--text-primary)]">{{ item.value }}</span>
                </div>
              </div>
            </div>

            <div v-if="ultimaReview" class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-sm">
              <div class="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
                <h2 class="font-semibold text-[var(--text-secondary)]">Última Avaliação</h2>
                <div class="flex items-center gap-1"><Star class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" /><span class="font-semibold text-[var(--text-primary)]">{{ pro.rating }}</span></div>
              </div>
              <div class="p-5">
                <div class="flex items-start gap-3">
                  <img :src="ultimaReview.clientAvatar" alt="Client" class="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div class="flex items-center gap-2 mb-1"><span class="font-medium text-[var(--text-secondary)] text-sm">{{ ultimaReview.clientName }}</span><div class="flex items-center gap-0.5"><Star v-for="i in 5" :key="i" class="w-3 h-3 text-[var(--accent-amber)] fill-[var(--accent-amber)]" /></div></div>
                    <p class="text-sm text-[var(--text-muted)]">"{{ ultimaReview.comment }}"</p>
                    <p class="text-xs text-[var(--text-subtle)] mt-1">{{ ultimaReview.serviceType }} • {{ new Date(ultimaReview.date).toLocaleDateString('pt-BR') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </template>

        <!-- Requests -->
        <div v-if="activeTab === 'requests'" class="mt-6">
          <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-sm overflow-hidden">
            <div class="p-6 border-b border-[var(--border-default)]/60 flex items-center justify-between">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Histórico de Pedidos</h2>
              <span class="px-3 py-1 bg-[var(--bg-raised)] text-[var(--text-muted)] text-xs font-medium rounded-full">{{ meusServicos.length }} pedidos</span>
            </div>
            <div v-if="meusServicos.length === 0" class="p-12 text-center">
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-raised)] flex items-center justify-center">
                <Briefcase class="w-8 h-8 text-[var(--text-subtle)]" />
              </div>
              <p class="text-[var(--text-muted)] font-medium">Nenhum serviço ainda</p>
              <p class="text-[var(--text-subtle)] text-sm mt-1">Os serviços aparecerão aqui quando você aceitar.</p>
            </div>
            <div v-else class="divide-y divide-[var(--border-default)]/60">
              <div v-for="servico in meusServicos" :key="servico.id" class="group p-6 hover:bg-[var(--bg-raised)]/50 transition-all duration-200">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-start gap-4 flex-1 min-w-0">
                    <!-- Avatar -->
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--accent-gold)]/5 flex items-center justify-center shrink-0 ring-1 ring-[var(--accent-gold)]/15 group-hover:ring-[var(--accent-gold)]/30 transition-all duration-300">
                      <span class="text-[var(--accent-gold)] font-bold text-base">{{ servico.cliente_nome.charAt(0) }}</span>
                    </div>
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2.5 mb-1.5">
                        <h3 class="font-semibold text-[var(--text-secondary)]">{{ servico.cliente_nome }}</h3>
                        <span :class="['px-3 py-1 rounded-full text-xs font-semibold tracking-wide', getStatusBadge(servico.status).style]">{{ getStatusBadge(servico.status).label }}</span>
                      </div>
                      <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ servico.descricao }}</p>
                      <div class="flex items-center gap-3 mt-2 text-sm text-white">
                        <span class="flex items-center gap-1.5"><MapPin class="w-4 h-4" /> {{ servico.endereco }}</span>
                        <span class="flex items-center gap-1.5"><Calendar class="w-4 h-4" /> {{ new Date(servico.created_at).toLocaleDateString('pt-BR') }}</span>
                      </div>
                    </div>
                  </div>
                  <!-- Right side: Budget + Actions -->
                  <div class="text-right shrink-0 flex flex-col items-end gap-3">
                    <p v-if="servico.orcamento" class="font-bold text-lg text-[var(--text-primary)] font-mono">R$ {{ servico.orcamento.toLocaleString('pt-BR') }}</p>
                    <div class="flex items-center gap-2">
                      <button v-if="servico.status === 'aberto'" @click="abrirNegociacao(servico.id)" class="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-sm rounded-xl font-semibold hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(212,160,23,0.25)] active:scale-[0.98] transition-all duration-200">
                        <MessageCircle class="w-3.5 h-3.5" />
                        Negociar
                      </button>
                      <button v-if="servico.status === 'em_andamento'" @click="handleConcluir(servico.id)" class="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-green)] text-[var(--text-on-accent)] text-sm rounded-xl font-semibold hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(63,185,80,0.25)] active:scale-[0.98] transition-all duration-200">
                        <CheckCircle2 class="w-3.5 h-3.5" />
                        Concluir
                      </button>
                      <button v-if="servico.status === 'aberto' || servico.status === 'em_andamento'" @click="handleCancelar(servico.id)" class="p-2 hover:bg-[var(--accent-red)]/10 rounded-xl transition-all duration-200" title="Cancelar">
                        <XCircle class="w-4 h-4 text-[var(--accent-red)]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quadro de Serviços -->
        <div v-if="activeTab === 'job-board'" class="mt-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 class="text-xl font-bold text-[var(--text-primary)]">Quadro de Serviços</h2>
              <p class="text-sm text-[var(--text-muted)]">Serviços disponíveis para profissionais da região</p>
            </div>
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <select v-model="searchCategoria" class="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] appearance-none cursor-pointer">
                <option value="">Todas as categorias</option>
                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
          <div v-if="!servicosAbertos || servicosAbertos.length === 0" class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-12 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-raised)] flex items-center justify-center">
              <Briefcase class="w-8 h-8 text-[var(--text-subtle)]" />
            </div>
            <p class="text-[var(--text-muted)] font-medium">Nenhum serviço disponível</p>
            <p class="text-[var(--text-subtle)] text-sm mt-1">Novos serviços aparecerão aqui quando publicados.</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="servico in servicosAbertosFiltrados" :key="servico.id" class="group relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 hover:border-[var(--accent-gold)]/30 hover:shadow-[0_8px_30px_rgba(212,160,23,0.08)] transition-all duration-300 ease-out">
              <div class="flex flex-col lg:flex-row lg:items-start gap-5">
                <div class="flex-1 min-w-0">
                  <!-- Header -->
                  <div class="flex items-start gap-4 mb-3">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--accent-gold)]/5 flex items-center justify-center shrink-0 ring-1 ring-[var(--accent-gold)]/15 group-hover:ring-[var(--accent-gold)]/30 transition-all duration-300">
                      <User class="w-5 h-5 text-[var(--accent-gold)]" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2.5 flex-wrap">
                        <h3 class="font-semibold text-[var(--text-primary)] truncate text-base">{{ servico.cliente_nome }}</h3>
                        <span :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide', urgenciaColor(servico.urgencia)]">
                          <AlertCircle class="w-3 h-3" /> {{ urgenciaLabel(servico.urgencia) }}
                        </span>
                      </div>
                      <p class="text-sm text-[var(--accent-gold)] font-semibold mt-0.5">{{ servico.categoria }}</p>
                    </div>
                  </div>
                  <!-- Description -->
                  <p class="text-[var(--text-secondary)] text-sm leading-relaxed mb-4 ml-15">{{ servico.descricao }}</p>
                  <!-- Details -->
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white ml-15">
                    <span class="flex items-center gap-1.5"><MapPin class="w-4 h-4" /> {{ servico.endereco }}</span>
                    <span class="flex items-center gap-1.5"><Calendar class="w-4 h-4" /> {{ new Date(servico.data_preferida).toLocaleDateString('pt-BR') }}</span>
                    <span class="flex items-center gap-1.5"><Clock class="w-4 h-4" /> {{ diasAtras(servico.created_at) }}</span>
                  </div>
                </div>
                <!-- CTA -->
                <div class="flex flex-row lg:flex-col items-center lg:items-stretch gap-3 lg:min-w-[150px]">
                  <span v-if="servico.orcamento" class="flex items-center gap-1.5 font-bold text-lg text-[var(--accent-green)]">
                    <DollarSign class="w-5 h-5" /> R$ {{ servico.orcamento.toLocaleString('pt-BR') }}
                  </span>
                  <button @click="abrirDetalhes(servico)" class="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-secondary)] rounded-xl text-sm font-semibold hover:border-[var(--accent-gold)]/50 hover:text-[var(--accent-gold)] active:scale-[0.98] transition-all duration-200">
                    <Eye class="w-4 h-4" />
                    Ver Detalhes
                  </button>
                  <button @click="abrirNegociacao(servico.id)" class="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] rounded-xl text-sm font-bold hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(212,160,23,0.3)] active:scale-[0.98] transition-all duration-200">
                    <MessageCircle class="w-4 h-4" />
                    Negociar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Avaliações -->
        <div v-if="activeTab === 'reviews'" class="mt-6">
          <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-sm">
            <div class="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
              <h2 class="font-semibold text-[var(--text-secondary)]">Avaliações Recebidas</h2>
              <span class="text-xs text-[var(--text-muted)]">{{ proReviews.length }} avaliações</span>
            </div>
            <div v-if="proReviews.length === 0" class="p-8 text-center">
              <Star class="w-12 h-12 text-[var(--border-default)] mx-auto mb-3" />
              <p class="text-[var(--text-subtle)]">Você ainda não recebeu avaliações.</p>
            </div>
            <div v-else class="divide-y divide-[var(--border-default)]">
              <div v-for="(review, i) in proReviews" :key="i" class="p-5 hover:bg-[var(--bg-raised)] transition-colors">
                <div class="flex items-start gap-3">
                  <img :src="review.clientAvatar" :alt="review.clientName" class="w-10 h-10 rounded-full object-cover" />
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <h4 class="font-medium text-[var(--text-secondary)] text-sm">{{ review.clientName }}</h4>
                      <span class="text-xs text-[var(--text-subtle)]">{{ review.date }}</span>
                    </div>
                    <p class="text-xs text-[var(--text-muted)] mb-2">{{ review.serviceType }}</p>
                    <p class="text-sm text-[var(--text-muted)]">"{{ review.comment }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configurações -->
        <div v-if="activeTab === 'settings' && !loading" class="w-full mt-6">
          <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6">
            <h2 class="text-xl font-bold text-[var(--text-primary)] mb-6">Configurações do Perfil</h2>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Nome do Perfil</label>
                <input v-model="editNome" :placeholder="proNome" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
              </div>

              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Telefone</label>
                <input :value="editTelefone" @input="editTelefone = maskTelefone(($event.target as HTMLInputElement).value)" type="tel" placeholder="(11) 99999-9999" maxlength="15" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">CPF</label>
                  <input :value="editCpf" @input="editCpf = maskCpf(($event.target as HTMLInputElement).value)" type="text" placeholder="000.000.000-00" maxlength="14" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Data de Nascimento</label>
                  <input v-model="editDataNascimento" type="date" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">UF</label>
                  <select v-model="editUf" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] appearance-none cursor-pointer">
                    <option value="">Selecione</option>
                    <option v-for="uf in ufList" :key="uf.sigla" :value="uf.sigla">{{ uf.sigla }} - {{ uf.nome }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Cidade</label>
                  <select v-model="editCidade" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]">
                    <option value="">Selecione a cidade</option>
                    <option v-for="cid in editCidades" :key="cid" :value="cid">{{ cid }}</option>
                  </select>
                </div>
              </div>

              <hr class="border-[var(--border-default)]" />

              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Profissões
                  <span class="text-[var(--text-subtle)] font-normal">({{ editCategorias.length }}/{{ maxCategorias }})</span>
                </label>

                <div v-if="editCategorias.length > 0" class="space-y-2 mb-3">
                  <div v-for="(item, index) in editCategorias" :key="index"
                    class="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-[var(--text-secondary)]">{{ item.profissao_nome }}</p>
                    </div>
                    <button @click="removerCategoria(index)" class="p-1 hover:bg-[var(--border-default)] rounded-lg transition-colors text-[var(--accent-red)] text-sm">✕</button>
                  </div>
                </div>

                <div v-if="podeAdicionar" class="space-y-2">
                  <select v-model="selectedProfissaoId" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] appearance-none cursor-pointer">
                    <option value="">Selecione a profissão</option>
                    <option v-for="prof in profissoesDB" :key="prof.id" :value="prof.id">{{ prof.nome }}</option>
                  </select>
                  <div class="flex gap-2">
                    <button @click="adicionarCategoria" :disabled="!selectedProfissaoId"
                      class="px-4 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:bg-[var(--accent-dark-gold)] transition-all text-sm disabled:opacity-50">
                      + Adicionar
                    </button>
                  </div>
                </div>
                <p class="text-xs text-[var(--text-muted)] mt-2">
                  Plano {{ PLANOS[planoEficaz.plano].nome }}: até {{ limiteCategoriasPlano(planoEficaz.plano) }} Profissional(is). {{ planoEficaz.plano === 'bronze' ? 'Faça upgrade para Ouro ou superior e adicione até 3.' : '' }}
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-[var(--text-secondary)] mb-4">Informações Profissionais</h3>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Descrição</label>
                    <textarea v-model="editDescricao" placeholder="Descreva sua experiência e serviços..." rows="4" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] resize-none placeholder-[var(--text-subtle)]"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Certificações <span class="text-[var(--text-subtle)]">(separadas por vírgula)</span></label>
                    <input v-model="editCertificacoes" placeholder="NR-10, CREA, SEP, ..." class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                  </div>

                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Anos de Experiência</label>
                      <input v-model.number="editAnosExperiencia" type="number" min="0" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Preço / Hora (R$)</label>
                      <input v-model.number="editPrecoHora" type="number" min="0" step="0.01" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Preço / m² (R$)</label>
                      <input v-model.number="editPrecoM2" type="number" min="0" step="0.01" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="editDisponivel" type="checkbox" class="sr-only peer" />
                      <div class="w-11 h-6 bg-[var(--border-default)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-green)]"></div>
                    </label>
                    <span class="text-sm text-[var(--text-muted)]">{{ editDisponivel ? 'Disponível para novos serviços' : 'Indisponível' }}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-semibold text-[var(--text-secondary)] mb-4">Contato e Redes Sociais</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">WhatsApp</label>
                    <input v-model="editWhatsapp" type="tel" placeholder="(11) 99999-9999" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Instagram</label>
                    <input v-model="editInstagram" type="text" placeholder="@seuperfil" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Facebook</label>
                    <input v-model="editFacebook" type="text" placeholder="https://facebook.com/seuperfil" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-semibold text-[var(--text-secondary)] mb-4">
                  Portfólio
                  <span class="text-[var(--text-subtle)] font-normal">({{ editPortfolio.length }}/{{ maxFotos }} fotos — plano {{ PLANOS[planoEficaz.plano].nome }})</span>
                </h3>

                <div v-if="editPortfolio.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div v-for="(item, index) in editPortfolio" :key="item.id"
                    class="relative group rounded-xl overflow-hidden border border-[var(--border-raised)] bg-[var(--bg-raised)]">
                    <img :src="item.beforeImage" :alt="item.title" class="w-full h-32 object-cover" />
                    <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="removerPortfolio(index)" class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm">✕</button>
                    </div>
                  </div>
                </div>

                <button v-if="editPortfolio.length < maxFotos" @click="handlePortfolioUpload"
                  class="w-full px-4 py-8 border-2 border-dashed border-[var(--border-raised)] rounded-xl text-[var(--text-subtle)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all flex flex-col items-center gap-2">
                  <Camera class="w-8 h-8" />
                  <span class="text-sm font-medium">Clique para adicionar fotos</span>
                  <span class="text-xs">Máximo de {{ maxFotos }} fotos ({{ maxFotos - editPortfolio.length }} restantes)</span>
                </button>
              </div>

              <div class="flex gap-3 pt-2 items-center">
                <button @click="salvarPerfil" :disabled="saving" class="px-6 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">{{ saving ? 'Salvando...' : 'Salvar Alterações' }}</button>
                <div v-if="showSuccess"
                  class="flex items-center gap-2 px-4 py-3 bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)] border border-[color-mix(in_srgb,var(--accent-gold)_27%,transparent)] rounded-xl text-[var(--accent-green)] text-sm font-medium animate-fade-in">
                  <CheckCircle2 class="w-4 h-4" /> Dados atualizados com sucesso!
                </div>
                <div v-if="showError"
                  class="flex items-center gap-2 px-4 py-3 bg-[color-mix(in srgb,var(--accent-red) 10%,transparent)] border border-[var(--accent-red)] rounded-xl text-[var(--accent-red)] text-sm font-medium animate-fade-in">
                  <AlertCircle class="w-4 h-4" /> {{ showError }}
                </div>
              </div>

              <hr class="border-[var(--border-default)]" />

              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Foto do Perfil</label>
                <div class="flex items-center gap-4">
                  <div class="relative">
                    <img :src="pro.avatar" class="w-20 h-20 rounded-full object-cover" />
                  </div>
                  <button @click="handleAvatarUpload" class="px-4 py-2 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--border-default)] transition-colors flex items-center gap-2">
                    <Camera class="w-4 h-4" /> Trocar Foto
                  </button>
                </div>
              </div>

              <hr class="border-[var(--border-default)]" />

              <div>
                <h3 class="font-semibold text-[var(--text-secondary)] mb-3">Plano</h3>
                <!-- Período Gratuito Ativo -->
                <div v-if="emPeriodoGratis" class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white mb-3">
                  <div class="flex items-center gap-2 mb-1">
                    <Crown class="w-5 h-5" />
                    <span class="font-semibold">Plano Ouro - Gratuito (Inauguração)</span>
                  </div>
                  <p class="text-white/80 text-sm mb-2">{{ textoDiasRestantes }}</p>
                  <div class="w-full bg-white/20 rounded-full h-2">
                    <div class="bg-white rounded-full h-2 transition-all" :style="{ width: percentualRestante + '%' }"></div>
                  </div>
                  <div class="bg-white/10 rounded-xl p-3 mt-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-white/90 text-sm font-medium">Plano {{ PLANOS[planoEficaz.plano].nome }}</p>
                        <p class="text-white/70 text-xs">Gratuito por {{ diasRestantes }} {{ diasRestantes === 1 ? 'dia' : 'dias' }}</p>
                      </div>
                      <button disabled class="px-4 py-2 bg-white/20 text-white/50 rounded-lg text-sm font-semibold cursor-not-allowed">Upgrade</button>
                    </div>
                  </div>
                </div>
                <!-- Período Gratuito Expirado -->
                <div v-else-if="periodoGratisExpirado" class="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white mb-3">
                  <div class="flex items-center gap-2 mb-1">
                    <AlertCircle class="w-5 h-5" />
                    <span class="font-semibold">Período Gratuito Expirado</span>
                  </div>
                  <p class="text-white/80 text-sm mb-3">Seu período de 60 dias gratuitos expirou. Escolha um plano para continuar com destaque.</p>
                  <button @click="showPlansModal = true" class="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors">Escolher Plano</button>
                </div>
                <!-- Plano Pago Ativo -->
                <div v-if="proPremium && !premiumExpirado && !emPeriodoGratis" class="bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)] border border-[color-mix(in_srgb,var(--accent-gold)_27%,transparent)] rounded-xl p-4">
                  <div class="flex items-center gap-2 mb-1">
                    <Crown class="w-5 h-5 text-[var(--accent-green)]" />
                    <span class="font-semibold text-[var(--text-primary)]">{{ PLANOS[planoEficaz.plano].nome }}</span>
                  </div>
                  <p v-if="premiumDiasRestantes > 0" class="text-[var(--text-muted)] text-sm">Restam {{ premiumDiasRestantes }} dias — seu perfil está em destaque.</p>
                  <p v-else class="text-[var(--accent-red)] text-sm">Plano expirado. Renove agora.</p>
                </div>
                <!-- Gerenciar/Assinar Plano -->
                <div v-if="!emPeriodoGratis" class="bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] border border-[var(--accent-gold)] rounded-xl p-4" :class="{ 'mt-3': proPremium && !premiumExpirado }">
                  <div class="flex items-center gap-2 mb-1">
                    <Crown class="w-5 h-5 text-[var(--accent-gold)]" />
                    <span class="font-semibold text-[var(--text-primary)]">{{ PLANOS[planoEficaz.plano].nome }}</span>
                  </div>
                  <p class="text-[var(--text-muted)] text-sm mb-3">{{ proPremium && !premiumExpirado ? 'Altere ou cancele seu plano quando quiser.' : 'Apareça em destaque e receba mais clientes.' }}</p>
                  <button @click="showPlansModal = true" class="px-4 py-2 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] text-[var(--text-on-accent)] font-semibold rounded-lg text-sm hover:shadow-lg transition-all">{{ proPremium && !premiumExpirado ? 'Ver Planos' : 'Tornar-se Premium' }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Plano Card -->
        <div v-if="activeTab === 'settings' && !loading" class="w-full mt-4">
          <!-- Período Gratuito Ativo -->
          <div v-if="emPeriodoGratis" class="bg-[var(--accent-green)] rounded-2xl p-6 text-white">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Crown class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-semibold">Plano Ouro</h3>
                <p class="text-white/70 text-xs">Seu perfil está em destaque!</p>
              </div>
            </div>
            <div class="bg-white/10 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">Período Gratuito</span>
                <span class="text-sm font-bold">{{ diasRestantes }} {{ diasRestantes === 1 ? 'dia' : 'dias' }}</span>
              </div>
              <div class="w-full bg-white/20 rounded-full h-2">
                <div class="bg-white rounded-full h-2 transition-all" :style="{ width: percentualRestante + '%' }"></div>
              </div>
              <p class="text-white/60 text-xs mt-2">Após o término, escolha um plano pago para continuar em destaque.</p>
            </div>
          </div>

          <!-- Período Gratuito Expirado -->
          <div v-else-if="periodoGratisExpirado" class="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertCircle class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-semibold">Período Gratuito Expirado</h3>
                <p class="text-white/70 text-xs">Escolha um plano para continuar em destaque.</p>
              </div>
            </div>
            <button @click="showPlansModal = true" class="w-full py-3 bg-white text-orange-600 font-semibold rounded-xl text-sm hover:bg-gray-100 transition-colors">Escolher Plano</button>
          </div>

          <!-- Plano Pago Ativo -->
          <div v-else-if="proPremium && !premiumExpirado" class="bg-[var(--accent-green)] rounded-2xl p-6 text-white">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Crown class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-semibold">Plano {{ PLANOS[planoEficaz.plano].nome }}</h3>
                <p class="text-white/70 text-xs">Seu perfil está em destaque!</p>
              </div>
            </div>
            <div class="bg-white/10 rounded-xl p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Status</span>
                <span v-if="premiumDiasRestantes > 0" class="text-sm font-bold">Restam {{ premiumDiasRestantes }} dias</span>
                <span v-else class="text-sm font-bold">Expirado</span>
              </div>
            </div>
          </div>

          <!-- Sem Plano / Plano Expirado -->
          <div v-else class="bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] border border-[var(--accent-gold)] rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/20 flex items-center justify-center">
                <Crown class="w-5 h-5 text-[var(--accent-gold)]" />
              </div>
              <div>
                <h3 class="font-semibold text-[var(--text-primary)]">Torne-se Premium</h3>
                <p class="text-[var(--text-muted)] text-xs">Apareça em destaque e receba mais clientes.</p>
              </div>
            </div>
            <button @click="showPlansModal = true" class="w-full py-3 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl text-sm hover:shadow-lg transition-all">Ver Planos</button>
          </div>
        </div>

        <!-- Profissões Card -->
        <div v-if="activeTab === 'settings' && !loading && proProfissoes.length > 0" class="w-full mt-4">
          <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--accent-gold)]/5 flex items-center justify-center ring-1 ring-[var(--accent-gold)]/15">
                <Briefcase class="w-5 h-5 text-[var(--accent-gold)]" />
              </div>
              <div>
                <h3 class="font-semibold text-[var(--text-primary)]">Profissões</h3>
                <p class="text-xs text-[var(--text-muted)]">Especialidades cadastradas</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(prof, index) in proProfissoes"
                :key="index"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-sm font-medium text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/50 transition-colors"
              >
                <Shield class="w-3.5 h-3.5" />
                {{ prof }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- Planos Modal -->
    <Teleport to="body">
      <div v-if="showPlansModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="showPlansModal = false">
        <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-[var(--text-primary)]">Escolha seu Plano</h2>
            <button @click="showPlansModal = false" class="p-1 hover:bg-[var(--border-default)] rounded-lg transition-colors text-[var(--text-muted)]">✕</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              v-for="plan in planOptions"
              :key="plan.id"
              @click="handleUpgrade(plan.id)"
              :disabled="loading || proPremiumPlano === plan.id"
              class="p-5 bg-[var(--bg-raised)] border rounded-xl hover:border-[var(--accent-gold)] transition-all text-left disabled:opacity-50 group relative"
              :class="plan.id === 'ouro' ? 'border-[var(--accent-gold)]' : 'border-[var(--border-raised)]'"
            >
              <span v-if="plan.popular" class="absolute -top-3 right-4 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-xs font-bold px-3 py-0.5 rounded-full">POPULAR</span>
              <span v-if="proPremiumPlano === plan.id" class="absolute -top-3 left-4 bg-[var(--accent-green)] text-white text-xs font-bold px-3 py-0.5 rounded-full">ATUAL</span>
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h3 class="font-semibold text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors">{{ plan.name }}</h3>
                  <p class="text-sm text-[var(--text-muted)]">{{ plan.description }}</p>
                </div>
                <div class="text-right">
                  <p v-if="plan.price === 0" class="text-2xl font-bold text-[var(--text-primary)]">Grátis</p>
                  <p v-else class="text-2xl font-bold text-[var(--text-primary)]">R$ {{ plan.price.toFixed(2).replace('.', ',') }}</p>
                  <p v-if="plan.price > 0" class="text-xs text-[var(--text-subtle)]">/mês</p>
                </div>
              </div>
              <ul class="space-y-1 mt-3">
                <li v-for="(feat, fi) in plan.features" :key="fi" class="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                  <CheckCircle2 class="w-3 h-3 text-[var(--accent-green)]" />{{ feat }}
                </li>
              </ul>
            </button>
          </div>

          <p class="text-center text-[var(--text-subtle)] text-xs mt-4">Pagamento seguro via Mercado Pago. Cancele quando quiser.</p>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- WhatsApp Negotiation Modal -->
  <div v-if="whatsappModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.7)">
    <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-md shadow-2xl">
      <div class="flex items-center justify-between p-5 border-b border-[var(--border-default)]">
        <h3 class="text-lg font-bold text-[var(--text-primary)]">Negociar Serviço</h3>
        <button @click="fecharNegociacao" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border-default)] transition-colors">
          <X class="w-5 h-5 text-[var(--text-muted)]" />
        </button>
      </div>
      <div class="p-5 space-y-4">
        <p class="text-sm text-[var(--text-muted)]">Adicione seu WhatsApp para que o cliente possa entrar em contato e negociar o serviço.</p>
        <div>
          <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Número WhatsApp *</label>
          <input
            v-model="whatsappNumber"
            type="tel"
            placeholder="Ex: (11) 99999-8888"
            class="w-full px-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-subtle)]"
          />
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-default)]">
        <button @click="fecharNegociacao" class="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">Cancelar</button>
        <button
          @click="handleNegociar"
          :disabled="whatsappLoading || !whatsappNumber.trim()"
          class="px-6 py-2.5 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <template v-if="whatsappLoading">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Enviando...
          </template>
          <template v-else>Confirmar</template>
        </button>
      </div>
    </div>
  </div>

  <!-- Detalhes do Serviço Modal -->
  <div v-if="showDetalhesModal && servicoDetalhes" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.7)" @click.self="fecharDetalhes">
    <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-lg shadow-2xl">
      <div class="flex items-center justify-between p-6 border-b border-[var(--border-default)]/60">
        <h3 class="text-lg font-bold text-[var(--text-primary)]">Detalhes do Orçamento</h3>
        <button @click="fecharDetalhes" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border-default)] transition-colors">
          <X class="w-5 h-5 text-[var(--text-muted)]" />
        </button>
      </div>
      <div class="p-6 space-y-4">
        <!-- Cliente -->
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--accent-gold)]/5 flex items-center justify-center ring-1 ring-[var(--accent-gold)]/15">
            <User class="w-6 h-6 text-[var(--accent-gold)]" />
          </div>
          <div>
            <h4 class="font-semibold text-[var(--text-primary)]">{{ servicoDetalhes.cliente_nome }}</h4>
            <p class="text-sm text-[var(--text-muted)]">{{ servicoDetalhes.cliente_contato }}</p>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="bg-[var(--bg-raised)] rounded-xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-white/60">Categoria</span>
            <span class="text-sm text-[var(--accent-gold)] font-semibold">{{ servicoDetalhes.categoria }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white/60">Urgência</span>
            <span :class="['text-sm font-semibold capitalize', servicoDetalhes.urgencia === 'alta' ? 'text-[var(--accent-red)]' : servicoDetalhes.urgencia === 'media' ? 'text-[var(--accent-amber)]' : 'text-[var(--accent-green)]']">{{ servicoDetalhes.urgencia }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white/60">Status</span>
            <span class="text-sm text-white font-medium">{{ servicoDetalhes.status === 'aberto' ? 'Aberto' : servicoDetalhes.status === 'em_andamento' ? 'Em Andamento' : servicoDetalhes.status === 'concluido' ? 'Concluído' : 'Cancelado' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white/60">Data Preferida</span>
            <span class="text-sm text-white font-medium">{{ new Date(servicoDetalhes.data_preferida).toLocaleDateString('pt-BR') }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white/60">Criado em</span>
            <span class="text-sm text-white font-medium">{{ new Date(servicoDetalhes.created_at).toLocaleDateString('pt-BR') }}</span>
          </div>
          <div v-if="servicoDetalhes.orcamento" class="flex items-center justify-between pt-2 border-t border-white/10">
            <span class="text-sm text-white/60">Orçamento</span>
            <span class="text-lg font-bold text-[var(--accent-green)]">R$ {{ servicoDetalhes.orcamento.toLocaleString('pt-BR') }}</span>
          </div>
        </div>

        <!-- Endereço -->
        <div class="bg-[var(--bg-raised)] rounded-xl p-4">
          <div class="flex items-start gap-3">
            <MapPin class="w-5 h-5 text-[var(--accent-gold)] mt-0.5 shrink-0" />
            <div>
              <p class="text-sm font-medium text-white">{{ servicoDetalhes.endereco }}</p>
            </div>
          </div>
        </div>

        <!-- Descrição -->
        <div class="bg-[var(--bg-raised)] rounded-xl p-4">
          <p class="text-xs text-white/60 mb-2 font-medium uppercase tracking-wider">Descrição</p>
          <p class="text-sm text-white leading-relaxed">{{ servicoDetalhes.descricao }}</p>
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-default)]/60">
        <button @click="fecharDetalhes" class="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">Fechar</button>
        <button
          @click="fecharDetalhes(); abrirNegociacao(servicoDetalhes.id)"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          <MessageCircle class="w-4 h-4" />
          Negociar
        </button>
      </div>
    </div>
  </div>
</template>
