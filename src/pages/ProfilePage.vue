<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Star, MapPin, CheckCircle2, Crown, Clock, Calendar,
  Phone, Share2, Heart, Shield, Award,
  ChevronRight, Send, Image, ThumbsUp, AlertCircle,
  Briefcase, ExternalLink
} from '@lucide/vue'
import type { Professional, PerfilLojista, Produto } from '../types'
import { criarServico, criarReview, listarLojistas, listarProdutos, mapLojistaToPerfil, mapProdutoToProduto, obterProfissionalPorId } from '../services/api'
import { sugerirLojistas, sugerirProdutos } from '../utils/matching'
import { PLANOS, CORES_PLANO } from '../config/planos'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const props = defineProps<{
  isLoggedIn?: boolean
  autoOpenRequest?: boolean
  userId?: string
}>()
const emit = defineEmits<{
  back: []
  navigate: [page: string]
  requestLogin: [professional: Professional]
  viewLojista: [lojista: PerfilLojista]
  requestJobBoard: [professional: Professional]
}>()

const professional = ref<Professional | null>(null)
const loadingProfile = ref(true)
const profileError = ref(false)
const lojasSugeridas = ref<PerfilLojista[]>([])
const produtosSugeridos = ref<Produto[]>([])

onMounted(async () => {
  const id = route.params.id as string
  try {
    const [pro, lojasData, prodsData] = await Promise.all([
      obterProfissionalPorId(id),
      listarLojistas(),
      listarProdutos(),
    ])
    if (pro) {
      professional.value = pro
      lojasSugeridas.value = sugerirLojistas(lojasData.map(mapLojistaToPerfil), pro.category, pro.uf)
      produtosSugeridos.value = sugerirProdutos(prodsData.filter(p => p.status === 'ativo').map(mapProdutoToProduto), pro.category)
    } else {
      profileError.value = true
    }
  } catch {
    profileError.value = true
  } finally {
    loadingProfile.value = false
  }
})
const activeTab = ref<'about' | 'portfolio' | 'reviews' | 'experience'>('about')
const pro = computed(() => professional.value)

const planoNomePro = computed(() => {
  const p = professional.value?.premium_plano
  if (!p) return 'Bronze'
  return PLANOS[p]?.nome ?? 'Bronze'
})

const planoCoresPro = computed(() => {
  const p = professional.value?.premium_plano
  const plano = p && PLANOS[p] ? p : 'bronze'
  return CORES_PLANO[plano]
})

const isLoggedIn = computed(() => auth.isLoggedIn || props.isLoggedIn)
const currentUserId = computed(() => props.userId || auth.user?.id || '')

const isOwner = computed(() => {
  return isLoggedIn.value && currentUserId.value && pro.value?.usuario_id === currentUserId.value
})

const showRequestModal = ref(props.autoOpenRequest ?? false)
const requestStep = ref(1)
const requestTipo = ref('')
const requestUrgencia = ref('')
const requestForm = ref({ description: '', address: '', date: '', phone: '' })
const mensagem = ref('')
const mensagemTipo = ref<'sucesso' | 'erro' | null>(null)

const showReviewForm = ref(false)
const reviewForm = ref({ rating: 5, comment: '', serviceType: '' })

function proximoPasso() {
  if (requestStep.value < 3) requestStep.value++
}

function passoAnterior() {
  if (requestStep.value > 1) requestStep.value--
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}

function handleRequestService() {
  if (!isLoggedIn.value) {
    if (pro.value) emit('requestLogin', pro.value)
    return
  }
  showRequestModal.value = true
}

async function handleSubmitRequest() {
  if (!pro.value) {
    mensagem.value = 'Perfil do profissional não carregado.'
    mensagemTipo.value = 'erro'
    return
  }
  if (!requestForm.value.description || !requestForm.value.address || !requestForm.value.phone) {
    mensagem.value = 'Por favor, preencha todos os campos obrigatórios.'
    mensagemTipo.value = 'erro'
    return
  }
  if (!pro.value.category) {
    mensagem.value = 'Profissional não tem categoria definida. Não é possível enviar solicitação.'
    mensagemTipo.value = 'erro'
    return
  }
  
  const urgenciaMap: Record<string, string> = { Flexível: 'baixa', 'Esta semana': 'media', Urgente: 'alta' }
  const urgenciaValida = urgenciaMap[requestUrgencia.value] || 'media'
  
  if (!currentUserId.value) {
    mensagem.value = 'Faça login para solicitar um orçamento.'
    mensagemTipo.value = 'erro'
    return
  }

  try {
    await criarServico({
      cliente_id: currentUserId.value,
      cliente_nome: auth.user?.nome || 'Cliente',
      cliente_contato: requestForm.value.phone,
      categoria: pro.value.category,
      subcategoria: pro.value.subcategory,
      descricao: requestForm.value.description,
      endereco: requestForm.value.address,
      data_preferida: requestForm.value.date || new Date().toISOString().split('T')[0],
      urgencia: urgenciaValida as 'baixa' | 'media' | 'alta',
    })

    const nomeCliente = auth.user?.nome || 'Cliente'
    const categoria = pro.value.category
    const descricao = requestForm.value.description
    const endereco = requestForm.value.address
    const dataPreferida = requestForm.value.date || 'A combinar'
    const urgenciaLabel = requestUrgencia.value || 'A combinar'

    const mensagemWhatsApp = encodeURIComponent(
      `Olá ${pro.value.name}, vi seu perfil no Obras & Serviços! 👋\n\n` +
      `Preciso de um orçamento para:\n\n` +
      `🔧 *Categoria:* ${categoria}\n` +
      `📋 *Descrição:* ${descricao}\n` +
      `📍 *Local:* ${endereco}\n` +
      `📅 *Data preferida:* ${dataPreferida}\n` +
      `⚡ *Urgência:* ${urgenciaLabel}\n\n` +
      `Meu nome é ${nomeCliente} e meu telefone é ${requestForm.value.phone}.\n\n` +
      `Aguardo seu retorno! 😊`
    )

    const telefoneProfissional = pro.value.whatsapp?.replace(/\D/g, '') || ''
    if (telefoneProfissional) {
      const urlWhatsApp = `https://wa.me/55${telefoneProfissional}?text=${mensagemWhatsApp}`
      window.open(urlWhatsApp, '_blank')
    }

    mensagem.value = 'Solicitação enviada com sucesso! Verifique seu WhatsApp.'
    mensagemTipo.value = 'sucesso'
    showRequestModal.value = false
    requestStep.value = 1
    requestForm.value = { description: '', address: '', date: '', phone: '' }
    requestTipo.value = ''
    requestUrgencia.value = ''
  } catch {
    mensagem.value = 'Erro ao enviar solicitação. Tente novamente.'
    mensagemTipo.value = 'erro'
  }
}

async function handleSubmitReview() {
  if (!reviewForm.value.comment || !reviewForm.value.serviceType || !pro.value) return
  if (!isLoggedIn.value) {
    mensagem.value = 'Faça login para enviar uma avaliação.'
    mensagemTipo.value = 'erro'
    return
  }
  try {
    await criarReview({
      profissional_id: pro.value.id,
      cliente_nome: auth.user?.nome || 'Cliente',
      cliente_avatar: auth.user?.avatar_url || '',
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment,
      service_type: reviewForm.value.serviceType,
    })
    mensagem.value = 'Avaliação enviada com sucesso!'
    mensagemTipo.value = 'sucesso'
    showReviewForm.value = false
    reviewForm.value = { rating: 5, comment: '', serviceType: '' }
  } catch {
    mensagem.value = 'Erro ao enviar avaliação.'
    mensagemTipo.value = 'erro'
  }
}

function fecharMensagem() {
  mensagem.value = ''
  mensagemTipo.value = null
}
</script>

<template>
  <div v-if="loadingProfile" class="min-h-screen flex items-center justify-center" style="background:var(--bg-page)">
    <div class="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin"></div>
    <span class="ml-3 text-[var(--text-muted)]">Carregando perfil...</span>
  </div>

  <div v-else-if="profileError || !pro" class="min-h-screen flex items-center justify-center" style="background:var(--bg-page)">
    <div class="text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--bg-raised)]">
        <Briefcase class="w-8 h-8 text-[var(--text-subtle)]" />
      </div>
      <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-2">Perfil não encontrado</h2>
      <p class="text-[var(--text-muted)] mb-6">O profissional que você procura não foi encontrado.</p>
      <button @click="router.push({ name: 'home' })" class="px-6 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl">Voltar ao início</button>
    </div>
  </div>

  <div v-else>
    <div class="relative" style="background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-card) 50%, var(--bg-page) 100%);">
      <div class="absolute inset-0 opacity-10"><div class="absolute top-10 left-10 w-64 h-64 bg-[var(--accent-gold)] rounded-full blur-3xl"></div></div>

      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <button @click="goBack()" class="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-gold)] mb-6 transition-colors">
          <ChevronRight class="w-5 h-5 rotate-180" /> Voltar para busca
        </button>

        <div class="flex flex-col md:flex-row gap-6">
          <div class="relative flex-shrink-0">
            <img :src="pro.avatar" :alt="pro.name" class="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-[var(--border-default)]" />
            <div v-if="pro.verified" class="absolute -bottom-2 -right-2 bg-[var(--accent-green)] rounded-full p-1.5"><CheckCircle2 class="w-6 h-6 text-white" /></div>
          </div>
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-3 mb-2">
              <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{{ pro.name }}</h1>
              <span v-if="pro.premium" class="flex items-center gap-1 text-[var(--text-on-accent)] text-sm px-3 py-1 rounded-full" :style="{ background: `linear-gradient(to right, ${planoCoresPro.from}, ${planoCoresPro.to})` }"><Crown class="w-4 h-4" /> {{ planoNomePro }}</span>
            </div>
            <p class="text-[var(--accent-gold)] font-medium text-lg mb-2">{{ pro.category }} • {{ pro.subcategory }}</p>
            <div class="flex flex-wrap items-center gap-4 text-[var(--text-muted)] mb-4">
              <div class="flex items-center gap-1"><MapPin class="w-4 h-4" /> {{ pro.location }}</div>
              <div class="flex items-center gap-1"><Clock class="w-4 h-4" /> Responde em {{ pro.responseTime }}</div>
            </div>
            <div class="flex flex-wrap gap-6">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] px-3 py-1.5 rounded-lg">
                  <Star class="w-5 h-5 text-[var(--accent-amber)] fill-[var(--accent-amber)]" /><span class="text-[var(--text-primary)] font-bold">{{ pro.rating }}</span>
                </div>
                <span class="text-[var(--text-muted)] text-sm">{{ pro.reviewCount }} avaliações</span>
              </div>
              <div class="text-[var(--text-muted)]"><span class="text-[var(--text-primary)] font-bold">{{ pro.completedJobs }}</span> serviços realizados</div>
              <div class="text-[var(--text-muted)]"><span class="text-[var(--text-primary)] font-bold">{{ pro.yearsExperience }}</span> anos de experiência</div>
            </div>
          </div>
          <div class="flex flex-row md:flex-col gap-2">
            <button class="p-2 bg-[var(--bg-raised)] hover:bg-[var(--border-default)] rounded-lg transition-colors"><Heart class="w-5 h-5 text-[var(--text-muted)]" /></button>
            <button class="inline-flex items-center gap-2 px-3 py-2 bg-[var(--bg-raised)] hover:bg-[var(--border-default)] rounded-lg transition-colors text-sm text-[var(--text-muted)]"><Share2 class="w-5 h-5" /> Compartilhar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-card overflow-hidden">
            <div class="flex border-b border-[var(--border-default)]">
              <button v-for="tab in [{ id: 'about', label: 'Sobre' }, { id: 'experience', label: 'Experiência' }, { id: 'portfolio', label: 'Portfólio' }, { id: 'reviews', label: 'Avaliações' }]" :key="tab.id" @click="activeTab = tab.id as typeof activeTab" :class="['flex-1 px-6 py-4 text-sm font-medium transition-colors', activeTab === tab.id ? 'text-[var(--accent-gold)] border-b-2 border-[var(--accent-gold)]' : 'text-[var(--text-subtle)] hover:text-[var(--text-muted)]']">{{ tab.label }}</button>
            </div>
            <div class="p-6">
              <div v-if="activeTab === 'about'" class="space-y-6">
                <div><h3 class="font-semibold text-[var(--text-secondary)] mb-3">Descrição</h3><p class="text-[var(--text-muted)] leading-relaxed">{{ pro.description }}</p></div>
                <div><h3 class="font-semibold text-[var(--text-secondary)] mb-3">Especialidades</h3><div class="flex flex-wrap gap-2"><span v-for="(spec, i) in pro.specialties" :key="i" class="px-3 py-1.5 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)] rounded-lg text-sm font-medium">{{ spec }}</span></div></div>
                <div><h3 class="font-semibold text-[var(--text-secondary)] mb-3">Certificações</h3><div class="space-y-2"><div v-for="(cert, i) in pro.certifications" :key="i" class="flex items-center gap-2 text-[var(--text-muted)]"><Award class="w-4 h-4 text-[var(--accent-green)]" /> {{ cert }}</div></div></div>
                <div><h3 class="font-semibold text-[var(--text-secondary)] mb-3">Verificações</h3><div class="grid grid-cols-2 gap-3"><div v-for="(item, i) in [{ label: 'Identidade Verificada', verified: true }, { label: 'Telefone Verificado', verified: true }, { label: 'E-mail Verificado', verified: true }, { label: 'Endereço Verificado', verified: pro.verified }]" :key="i" :class="['flex items-center gap-2 p-3 rounded-lg', item.verified ? 'bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)]' : 'bg-[var(--bg-raised)]']"><Shield :class="['w-4 h-4', item.verified ? 'text-[var(--accent-green)]' : 'text-[var(--text-subtle)]']" /><span :class="['text-sm', item.verified ? 'text-[var(--accent-green)]' : 'text-[var(--text-subtle)]']">{{ item.label }}</span></div></div></div>
              </div>
              <div v-if="activeTab === 'experience'" class="space-y-6">
                <div class="flex items-center gap-3 p-4 bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-xl">
                  <Briefcase class="w-10 h-10 text-[var(--accent-gold)]" />
                  <div>
                    <p class="text-2xl font-bold text-[var(--text-primary)]">{{ pro.yearsExperience }} anos</p>
                    <p class="text-sm text-[var(--text-muted)]">de experiência profissional</p>
                  </div>
                </div>
                <div class="space-y-4">
                  <h3 class="font-semibold text-[var(--text-secondary)]">Histórico Profissional</h3>
                  <div v-for="exp in pro.experience" :key="exp.id" class="relative pl-6 pb-6 border-l-2 border-[var(--border-default)] last:pb-0">
                    <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[var(--accent-gold)] border-2 border-[var(--bg-page)]"></div>
                    <div class="bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-xl p-4">
                      <div class="flex items-start justify-between mb-2">
                        <div>
                          <h4 class="font-medium text-[var(--text-primary)]">{{ exp.role }}</h4>
                          <p class="text-sm text-[var(--accent-gold)]">{{ exp.company }}</p>
                        </div>
                        <span class="text-xs text-[var(--text-subtle)] whitespace-nowrap">{{ exp.startDate }}{{ exp.endDate ? ' - ' + exp.endDate : ' - Presente' }}</span>
                      </div>
                      <p class="text-sm text-[var(--text-muted)]">{{ exp.description }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 p-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg">
                  <CheckCircle2 class="w-4 h-4 text-[var(--accent-green)]" />
                  <span class="text-sm text-[var(--text-muted)]">{{ pro.completedJobs }} serviços concluídos</span>
                </div>
              </div>
              <div v-if="activeTab === 'portfolio'">
                <template v-if="pro.portfolio.length > 0"><div class="grid grid-cols-2 gap-4"><div v-for="item in pro.portfolio" :key="item.id" class="space-y-2"><div class="relative aspect-video rounded-lg overflow-hidden bg-[var(--bg-raised)]"><img :src="item.beforeImage" :alt="item.title" class="w-full h-full object-cover" /></div><h4 class="font-medium text-[var(--text-secondary)] text-sm">{{ item.title }}</h4><p class="text-[var(--text-subtle)] text-xs">{{ item.description }}</p></div></div></template>
                <div v-else class="text-center py-12"><Image class="w-12 h-12 text-[var(--border-default)] mx-auto mb-3" /><p class="text-[var(--text-subtle)]">Este profissional ainda não adicionou fotos ao portfólio.</p></div>
              </div>
              <div v-if="activeTab === 'reviews'">
                <template v-if="pro.reviews.length > 0"><div class="space-y-6 mb-8"><div v-for="review in pro.reviews" :key="review.id" class="pb-6 border-b border-[var(--border-default)] last:border-0"><div class="flex items-start gap-3 mb-3"><img :src="review.clientAvatar" :alt="review.clientName" class="w-10 h-10 rounded-full object-cover" /><div class="flex-1"><h4 class="font-medium text-[var(--text-secondary)]">{{ review.clientName }}</h4><div class="flex items-center gap-2"><div class="flex items-center gap-0.5"><Star v-for="i in 5" :key="i" :class="['w-3 h-3', i <= review.rating ? 'text-[var(--accent-amber)] fill-[var(--accent-amber)]' : 'text-[var(--border-default)]']" /></div><span class="text-[var(--text-subtle)] text-xs">•</span><span class="text-[var(--text-subtle)] text-xs">{{ review.serviceType }}</span></div></div><span class="text-[var(--text-subtle)] text-xs">{{ review.date }}</span></div><p class="text-[var(--text-muted)] text-sm">{{ review.comment }}</p></div></div></template>
                <div v-else class="text-center py-12"><Star class="w-12 h-12 text-[var(--border-default)] mx-auto mb-3" /><p class="text-[var(--text-subtle)]">Este profissional ainda não recebeu avaliações.</p></div>

                <template v-if="isLoggedIn && pro.premium">
                  <button v-if="!showReviewForm" @click="showReviewForm = true" class="w-full py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--border-default)] transition-colors flex items-center justify-center gap-2"><ThumbsUp class="w-5 h-5" /> Avaliar este profissional</button>
                  <form v-else @submit.prevent="handleSubmitReview" class="bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl p-6 space-y-4">
                    <h4 class="font-semibold text-[var(--text-secondary)]">Avaliar Profissional</h4>
                    <div><label class="block text-sm text-[var(--text-muted)] mb-2">Nota</label><div class="flex gap-2"><button v-for="n in 5" :key="n" type="button" @click="reviewForm.rating = n"><Star :class="['w-8 h-8 transition-colors', n <= reviewForm.rating ? 'text-[var(--accent-amber)] fill-[var(--accent-amber)]' : 'text-[var(--border-default)]']" /></button></div></div>
                    <div><label class="block text-sm text-[var(--text-muted)] mb-2">Tipo de serviço</label><input v-model="reviewForm.serviceType" type="text" placeholder="Ex: Instalação Elétrica" class="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /></div>
                    <div><label class="block text-sm text-[var(--text-muted)] mb-2">Comentário</label><textarea v-model="reviewForm.comment" placeholder="Descreva sua experiência..." class="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] resize-none h-24 placeholder-[var(--text-subtle)]"></textarea></div>
                    <div class="flex gap-3">
                      <button type="submit" class="flex-1 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all">Enviar Avaliação</button>
                      <button type="button" @click="showReviewForm = false" class="px-4 py-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">Cancelar</button>
                    </div>
                  </form>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-card p-6 sticky top-24">
            <div class="space-y-3 mb-6">
              <button @click="handleRequestService" class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all">Solicitar Orçamento</button>
            </div>
            <div v-if="pro.instagram || pro.facebook" class="space-y-2 mb-4">
              <a v-if="pro.instagram" :href="`https://instagram.com/${pro.instagram.replace('@', '')}`" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 border rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium"
                style="color:#e1306c;border-color:rgba(225,48,108,0.25);background:rgba(225,48,108,0.06)">
                <ExternalLink class="w-4 h-4" /> Instagram
              </a>
              <a v-if="pro.facebook" :href="pro.facebook.startsWith('http') ? pro.facebook : `https://facebook.com/${pro.facebook}`" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 border rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium"
                style="color:#1877f2;border-color:rgba(24,119,242,0.25);background:rgba(24,119,242,0.06)">
                <ExternalLink class="w-4 h-4" /> Facebook
              </a>
            </div>
            <div v-if="isOwner && !pro.premium" class="mb-6 p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl">
              <div class="flex items-center gap-2 mb-2">
                <AlertCircle class="w-4 h-4 text-[var(--text-muted)]" />
                <span class="text-sm font-medium text-[var(--text-muted)]">Perfil Informativo</span>
              </div>
              <p class="text-[var(--text-subtle)] text-xs leading-relaxed">
                Este profissional possui o plano <strong>{{ planoNomePro }}</strong>.
                <br />Para contratar, acesse o <button @click="emit('navigate', 'quadro-servicos')" class="text-[var(--accent-gold)] hover:underline font-medium">Quadro de Serviços</button> e publique sua solicitação.
              </p>
            </div>
            <div v-if="!pro.premium && isLoggedIn" class="mb-4 p-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl">
              <div class="flex items-center gap-2 mb-2">
                <Crown class="w-4 h-4 text-[var(--accent-gold)]" />
                <span class="text-sm font-semibold text-[var(--text-primary)]">Destaque seu Perfil</span>
              </div>
              <p class="text-[var(--text-muted)] text-xs mb-3">Apareça em destaque nos resultados e receba mais clientes</p>
              <button disabled class="w-full py-2 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] text-[var(--text-on-accent)] font-semibold rounded-lg text-sm opacity-50 cursor-not-allowed">Assinar Ouro</button>
            </div>
            <div :class="['flex items-center gap-2 p-3 rounded-lg', pro.available ? 'bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)]' : 'bg-[var(--bg-raised)]']">
              <div :class="['w-2.5 h-2.5 rounded-full', pro.available ? 'bg-[var(--accent-green)]' : 'bg-[var(--text-subtle)]']"></div>
              <span :class="['text-sm font-medium', pro.available ? 'text-[var(--accent-green)]' : 'text-[var(--text-subtle)]']">{{ pro.available ? 'Disponível para novos serviços' : 'Indisponível no momento' }}</span>
            </div>
            <div class="flex items-center gap-2 mt-4 text-[var(--text-muted)] text-sm"><Clock class="w-4 h-4" /> Tempo de resposta: {{ pro.responseTime }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Matching: Lojas relacionadas -->
    <div v-if="lojasSugeridas.length > 0" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6">
        <h3 class="font-semibold text-[var(--text-secondary)] mb-4">Lojas com materiais para {{ pro.category }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="loja in lojasSugeridas.slice(0, 3)" :key="loja.id" @click="emit('viewLojista', loja)" class="bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl p-4 hover:border-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] transition-colors cursor-pointer">
            <div class="flex items-center gap-3 mb-2">
              <img :src="loja.avatar" :alt="loja.nome" class="w-10 h-10 rounded-full object-cover" />
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-[var(--text-secondary)] text-sm truncate">{{ loja.nome }}</h4>
                <p class="text-xs text-[var(--text-muted)] truncate">{{ loja.uf }} • {{ loja.cidade }}</p>
              </div>
            </div>
            <p class="text-xs text-[var(--text-subtle)] line-clamp-2">{{ loja.descricao }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Matching: Produtos sugeridos -->
    <div v-if="produtosSugeridos.length > 0" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6">
        <h3 class="font-semibold text-[var(--text-secondary)] mb-4">Produtos relacionados</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="prod in produtosSugeridos.slice(0, 4)" :key="prod.id" class="bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl p-4 hover:border-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] transition-colors cursor-pointer">
            <h4 class="font-medium text-[var(--text-secondary)] text-sm mb-1">{{ prod.nome }}</h4>
            <p class="text-xs text-[var(--text-subtle)] mb-2">{{ prod.lojista_nome }}</p>
            <p class="font-bold text-[var(--accent-gold)]">R$ {{ prod.preco.toFixed(2) }} <span class="text-xs text-[var(--text-subtle)]">/{{ prod.unidade }}</span></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast / Notification -->
    <div v-if="mensagem" :class="['fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-lg transition-all flex items-center gap-3', mensagemTipo === 'sucesso' ? 'bg-[var(--accent-green)] text-[var(--text-on-accent)]' : 'bg-[var(--accent-red)] text-white']">
      <span class="text-sm font-medium">{{ mensagem }}</span>
      <button @click="fecharMensagem" class="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>

    <!-- Request Modal (redesigned) -->
    <div v-if="showRequestModal" class="modal-overlay" @click.self="showRequestModal = false">
      <div class="modal-content" style="max-width: 560px;">

        <!-- Header with steps -->
        <div class="px-6 pt-6 pb-4 border-b border-[var(--border-default)]">
          <div class="flex items-center gap-3 mb-5">
            <button @click="requestStep > 1 ? passoAnterior() : showRequestModal = false" class="w-9 h-9 rounded-xl border border-[var(--border-raised)] flex items-center justify-center hover:bg-[var(--bg-raised)] transition-colors">
              <ChevronRight class="w-4 h-4 text-[var(--text-muted)] rotate-180" />
            </button>
            <div>
              <p class="text-[var(--text-subtle)] text-[10px] uppercase tracking-widest font-medium">Pedido de Orçamento</p>
              <h2 class="text-[var(--text-primary)] text-base font-bold">Descreva seu <span class="text-[var(--accent-gold)]">serviço</span></h2>
            </div>
            <button class="ml-auto w-9 h-9 rounded-xl border border-[var(--border-raised)] flex items-center justify-center hover:bg-[var(--bg-raised)] transition-colors" @click="showRequestModal = false">
              <span class="text-[var(--text-muted)] text-lg leading-none">✕</span>
            </button>
          </div>

          <!-- Progress Steps -->
          <div class="flex items-center gap-0">
            <div v-for="s in 3" :key="s" class="flex items-center flex-1 last:flex-none">
              <div class="flex flex-col items-center">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                  :class="s < requestStep ? 'bg-[var(--accent-green)] text-white' : s === requestStep ? 'bg-[var(--accent-gold)] text-[var(--text-on-accent)]' : 'bg-[var(--border-default)] text-[var(--text-subtle)]'"
                >
                  <span v-if="s < requestStep"><CheckCircle2 class="w-3.5 h-3.5" /></span>
                  <span v-else>{{ s }}</span>
                </div>
                <span
                  class="text-[9px] font-medium mt-1 whitespace-nowrap"
                  :class="s === requestStep ? 'text-[var(--accent-gold)]' : s < requestStep ? 'text-[var(--accent-green)]' : 'text-[var(--text-subtle)]'"
                >{{ ['Tipo', 'Detalhes', 'Contato'][s - 1] }}</span>
              </div>
              <div v-if="s < 3" class="flex-1 h-0.5 mx-2 mb-5 rounded" :class="s < requestStep ? 'bg-[var(--accent-green)]' : 'bg-[var(--border-default)]'"></div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 overflow-y-auto" style="max-height: 60vh;">

          <!-- Professional card -->
          <div class="bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-2xl p-3 flex items-center gap-3 mb-5">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ background: planoCoresPro.from }">
              <span class="text-[var(--text-on-accent)] font-bold text-sm">{{ pro.name.charAt(0) }}{{ pro.name.split(' ')[1]?.charAt(0) || '' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-[var(--text-secondary)] text-sm font-bold truncate">{{ pro.name }}</p>
                <span v-if="pro.premium" class="text-[var(--text-on-accent)] text-[8px] font-bold px-1.5 py-0.5 rounded-full" :style="{ background: planoCoresPro.from }">PREMIUM</span>
              </div>
              <p class="text-[var(--accent-gold)] text-xs">{{ pro.category }} <span v-if="pro.distance" class="text-[var(--text-subtle)]">• {{ pro.distance }} km</span></p>
            </div>
            <div class="flex flex-col items-end shrink-0">
              <div class="flex gap-0.5">
                <Star v-for="i in 5" :key="i" :class="['w-3 h-3', i <= Math.round(pro.rating) ? 'text-[var(--accent-amber)] fill-[var(--accent-amber)]' : 'text-[var(--border-default)]']" />
              </div>
              <span class="text-[var(--text-muted)] text-[10px] mt-0.5">{{ pro.rating }} ({{ pro.reviewCount }})</span>
            </div>
          </div>

          <!-- Step 1: Tipo de Serviço -->
          <form v-if="requestStep === 1" @submit.prevent="proximoPasso" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Tipo de Serviço</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="tipo in ['Instalação', 'Manutenção', 'Vistoria', 'Outro']"
                  :key="tipo"
                  type="button"
                  @click="requestTipo = tipo"
                  class="px-3 py-2.5 rounded-xl text-xs font-medium border transition-all"
                  :class="requestTipo === tipo ? 'border-[var(--accent-gold)] bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)]' : 'border-[var(--border-raised)] bg-transparent text-[var(--text-muted)] hover:border-[var(--border-default)]'"
                >
                  {{ tipo === 'Instalação' ? '⚡' : tipo === 'Manutenção' ? '🔧' : tipo === 'Vistoria' ? '🔍' : '📋' }}
                  {{ tipo }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Urgência</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="urg in [{ label: 'Flexível', icon: '🕐' }, { label: 'Esta semana', icon: '📅' }, { label: 'Urgente', icon: '🔥' }]"
                  :key="urg.label"
                  type="button"
                  @click="requestUrgencia = urg.label"
                  class="px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-center"
                  :class="requestUrgencia === urg.label ? 'border-[var(--accent-gold)] bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)]' : 'border-[var(--border-raised)] bg-transparent text-[var(--text-muted)] hover:border-[var(--border-default)]'"
                >
                  <div class="text-sm mb-0.5">{{ urg.icon }}</div>
                  {{ urg.label }}
                </button>
              </div>
            </div>
          </form>

          <!-- Step 2: Detalhes -->
          <form v-else-if="requestStep === 2" @submit.prevent="proximoPasso" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Descreva o serviço *</label>
              <textarea
                v-model="requestForm.description"
                rows="4"
                placeholder="Ex: Preciso trocar toda a fiação elétrica, instalar tomadas 220V e verificar o aterramento..."
                class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] resize-none placeholder-[var(--text-subtle)] text-sm"
              ></textarea>
              <p class="text-[var(--text-subtle)] text-[10px] mt-1 text-right">{{ requestForm.description.length }} / 500</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Local do Serviço *</label>
              <div class="relative">
                <MapPin class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)]" />
                <input v-model="requestForm.address" type="text" placeholder="Endereço do serviço" class="w-full pl-10 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)] text-sm" />
              </div>
              <p class="text-[var(--text-subtle)] text-[10px] mt-1"><span class="text-[var(--text-muted)]">ⓘ</span> Seu endereço só será compartilhado após o contato.</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Fotos do local <span class="text-[var(--text-subtle)] normal-case font-normal">(opcional)</span></label>
              <div class="flex gap-2">
                <div class="w-16 h-16 border-2 border-dashed border-[var(--border-raised)] rounded-xl flex flex-col items-center justify-center gap-1 bg-[var(--bg-raised)]">
                  <span class="text-[var(--accent-gold)] text-lg">+</span>
                  <span class="text-[var(--text-subtle)] text-[8px]">Adicionar</span>
                </div>
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-dark-gold)] flex items-center justify-center text-white text-lg">⚡</div>
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--text-subtle)] to-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] text-lg">🔌</div>
                <div class="w-16 h-16 border border-[var(--border-raised)] rounded-xl flex items-center justify-center bg-[var(--bg-raised)]">
                  <span class="text-[var(--text-subtle)] text-xs">+3</span>
                </div>
              </div>
            </div>
          </form>

          <!-- Step 3: Contato -->
          <form v-else @submit.prevent="handleSubmitRequest" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Data preferida</label>
              <div class="relative">
                <Calendar class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)]" />
                <input v-model="requestForm.date" type="date" class="w-full pl-10 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Telefone *</label>
              <div class="relative">
                <Phone class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)]" />
                <input v-model="requestForm.phone" type="tel" placeholder="(11) 99999-9999" class="w-full pl-10 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)] text-sm" />
              </div>
            </div>

            <!-- Aviso -->
            <div class="bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] border border-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] rounded-xl p-3 flex gap-2">
              <span class="text-[var(--accent-gold)] text-sm flex-shrink-0 mt-0.5">ⓘ</span>
              <div>
                <p class="text-[var(--accent-gold)] text-[11px] font-semibold">Como funciona o contato</p>
                <p class="text-[var(--accent-dark-gold)] text-[10px] mt-0.5 leading-relaxed">O profissional receberá seu pedido e entrará em contato diretamente com você.</p>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer CTA -->
        <div class="px-6 py-4 border-t border-[var(--border-default)]">
          <div v-if="requestStep < 3" class="flex gap-3">
            <button @click="showRequestModal = false" class="w-12 h-12 rounded-2xl border border-[var(--border-raised)] flex items-center justify-center hover:bg-[var(--bg-raised)] transition-colors shrink-0">
              <span class="text-[var(--text-muted)] text-lg leading-none">✕</span>
            </button>
            <button @click="proximoPasso" class="flex-1 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-bold rounded-2xl text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
              Próximo passo <ChevronRight class="w-4 h-4" />
            </button>
          </div>
          <div v-else>
            <button @click="handleSubmitRequest" class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-bold rounded-2xl text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Send class="w-4 h-4" /> Enviar Solicitação
            </button>
          </div>
          <p class="text-center text-[10px] text-[var(--text-subtle)] mt-2">Passo {{ requestStep }} de 3</p>
        </div>
      </div>
    </div>
  </div>
</template>
