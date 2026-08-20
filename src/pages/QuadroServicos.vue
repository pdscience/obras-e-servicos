<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Briefcase, MapPin, Clock, DollarSign, AlertCircle, Calendar, Search, X, User, FileText } from '@lucide/vue'
import { listarServicosAbertos, aceitarServico, negociarServico, obterPerfilProfissional } from '../services/api'
import { PLANOS } from '../config/planos'
import SolicitarOrcamentoModal from '@/components/SolicitarOrcamentoModal.vue'
import type { ServiceRequest, PlanoProfissional } from '../types'
import { useAuthStore } from '../stores/auth'

const showOrcamentoModal = ref(false)
const whatsappModal = ref(false)
const whatsappLoading = ref(false)
const whatsappNumber = ref('')
const servicoParaNegociar = ref<string | null>(null)

const emit = defineEmits<{
  viewProfile: [professionalId: string]
  createJob: []
  upgradePlan: []
}>()

const auth = useAuthStore()

const servicos = ref<ServiceRequest[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchProfissao = ref('')
const isProfessional = ref(false)
const professionalCategory = ref('')
const hasPlan = ref(false)
const profissionalPlano = ref<string | null>(null)

const profissoes = computed(() => {
  const profs = new Set(servicos.value.map(s => s.subcategoria).filter(Boolean) as string[])
  return [...profs].sort()
})

const filteredServicos = computed(() => {
  let result = servicos.value
  if (searchProfissao.value) {
    result = result.filter(s => s.subcategoria === searchProfissao.value)
  }
  return result
})

const planoNome = computed(() => {
  if (!profissionalPlano.value) return 'Gratuito'
  return PLANOS[profissionalPlano.value as PlanoProfissional]?.nome ?? 'Gratuito'
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

const perfilProfissionalId = ref<string | null>(null)

async function carregar() {
  loading.value = true
  error.value = null
  try {
    if (auth.user) {
      const perfil = await obterPerfilProfissional(auth.user.id)
      if (perfil) {
        perfilProfissionalId.value = perfil.id
        isProfessional.value = true
        professionalCategory.value = perfil.categoria
        hasPlan.value = perfil.premium === true
        profissionalPlano.value = perfil.premium_plano || null
      }
    }
    
    if (isProfessional.value && professionalCategory.value) {
      servicos.value = await listarServicosAbertos({ categoria: professionalCategory.value })
    } else {
      servicos.value = await listarServicosAbertos()
    }
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Erro ao carregar serviços'
  } finally {
    loading.value = false
  }
}

async function handleAceitar(servico: ServiceRequest) {
  if (!perfilProfissionalId.value) {
    alert('Faça login como profissional para aceitar serviços.')
    return
  }
  if (!hasPlan.value) {
    alert('Adquira um plano (a partir do Bronze) para aceitar serviços.')
    emit('upgradePlan')
    return
  }
  try {
    await aceitarServico(servico.id, perfilProfissionalId.value)
    servico.status = 'em_andamento'
    servico.profissional_id = perfilProfissionalId.value
  } catch (e: unknown) {
    alert((e as Error).message)
  }
}

function abrirNegociacao(servicoId: string) {
  servicoParaNegociar.value = servicoId
  whatsappModal.value = true
}

async function handleNegociar() {
  if (!servicoParaNegociar.value || !whatsappNumber.value.trim()) return
  whatsappLoading.value = true
  try {
    if (!perfilProfissionalId.value) {
      alert('Faça login como profissional para negociar serviços.')
      whatsappModal.value = false
      whatsappNumber.value = ''
      return
    }
    await negociarServico(servicoParaNegociar.value, perfilProfissionalId.value, whatsappNumber.value.trim())
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

watch(() => auth.user, (newUser) => {
  if (newUser) carregar()
})

onMounted(carregar)
</script>

<template>
  <section class="py-12" style="background:var(--bg-page); min-height: calc(100vh - 72px)">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Oportunidades</span>
          <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-1">Quadro de Serviços</h1>
          <p class="text-[var(--text-muted)] mt-1">
            {{ isProfessional ? `Serviços disponíveis para profissionais de ${professionalCategory}` : 'Serviços disponíveis para profissionais da região' }}
          </p>
        </div>
        <button v-if="auth.user && !isProfessional" @click="showOrcamentoModal = true" class="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all text-sm">
          <FileText class="w-4 h-4" /> Solicitar Orçamento
        </button>
      </div>

      <!-- Aviso para profissionais com plano -->
      <div v-if="isProfessional" class="mb-6 p-4 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] border border-[color-mix(in srgb,var(--accent-gold) 20%,transparent)] rounded-xl">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <AlertCircle class="w-5 h-5 text-[var(--accent-gold)] flex-shrink-0" />
            <div>
              <p class="text-[var(--accent-gold)] font-semibold text-sm">Plano {{ planoNome }} Ativo</p>
              <p class="text-[var(--accent-dark-gold)] text-xs mt-1">Você pode navegar, mas para aceitar serviços e receber orçamentos, adquira um plano (a partir do Bronze).</p>
            </div>
          </div>
          <button @click="emit('upgradePlan')" class="shrink-0 px-4 py-2 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-sm font-semibold rounded-lg hover:shadow-lg transition-all">
            Ver Planos
          </button>
        </div>
      </div>

      <!-- Aviso para não logados -->
      <div v-if="!auth.user" class="mb-6 p-4 bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-xl">
        <div class="flex items-center gap-3">
          <AlertCircle class="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
          <div>
            <p class="text-[var(--text-secondary)] font-semibold text-sm">Faça login para aceitar serviços</p>
            <p class="text-[var(--text-muted)] text-xs mt-1">Crie uma conta como profissional para receber orçamentos da sua área.</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap items-center gap-3 mb-8">
        <div class="relative flex-1 max-w-xs">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <select
            v-model="searchProfissao"
            class="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors appearance-none cursor-pointer"
          >
            <option value="">Todas as profissões</option>
            <option v-for="prof in profissoes" :key="prof" :value="prof">{{ prof }}</option>
          </select>
        </div>
        <button
          v-if="searchProfissao"
          @click="searchProfissao = ''"
          class="inline-flex items-center gap-1 px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <X class="w-3 h-3" /> Limpar
        </button>
        <span class="text-sm text-[var(--text-subtle)] ml-auto">
          {{ filteredServicos.length }} {{ filteredServicos.length === 1 ? 'serviço' : 'serviços' }} disponíveis
        </span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <div class="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-[var(--text-muted)]">Carregando serviços...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredServicos.length === 0" class="text-center py-16 bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-2xl">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--bg-card)]">
          <Briefcase class="w-8 h-8 text-[var(--text-subtle)]" />
        </div>
        <h3 class="text-xl font-semibold text-[var(--text-secondary)] mb-2">Nenhum serviço disponível</h3>
        <p class="text-[var(--text-muted)] max-w-md mx-auto">No momento não há serviços abertos. Volte mais tarde para verificar novas solicitações.</p>
      </div>

      <!-- Lista de Serviços -->
      <div v-else class="space-y-4">
        <div
          v-for="servico in filteredServicos"
          :key="servico.id"
          class="bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-2xl p-6 hover:border-[var(--border-raised)] transition-all duration-300"
        >
          <div class="flex flex-col lg:flex-row lg:items-start gap-4">
            <!-- Info principal -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-3 mb-2">
                <div class="w-10 h-10 rounded-full bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] flex items-center justify-center shrink-0">
                  <User class="w-5 h-5 text-[var(--accent-gold)]" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-semibold text-[var(--text-primary)] truncate">{{ servico.cliente_nome }}</h3>
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="urgenciaColor(servico.urgencia)"
                    >
                      <AlertCircle class="w-3 h-3" />
                      {{ urgenciaLabel(servico.urgencia) }}
                    </span>
                  </div>
                  <p class="text-sm text-[var(--accent-gold)] font-medium">{{ servico.categoria }}</p>
                </div>
              </div>

              <p class="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                {{ servico.descricao }}
              </p>

              <div class="flex flex-wrap items-center gap-4 text-xs text-[var(--text-subtle)]">
                <span class="flex items-center gap-1">
                  <MapPin class="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                  {{ servico.endereco }}
                </span>
                <span class="flex items-center gap-1">
                  <Calendar class="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                  {{ new Date(servico.data_preferida).toLocaleDateString('pt-BR') }}
                </span>
                <span class="flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                  {{ diasAtras(servico.created_at) }}
                </span>
                <span v-if="servico.orcamento" class="flex items-center gap-1">
                  <DollarSign class="w-3.5 h-3.5 text-[var(--accent-green)]" />
                  <span class="text-[var(--accent-green)] font-medium">R$ {{ servico.orcamento.toLocaleString('pt-BR') }}</span>
                </span>
              </div>
            </div>

            <!-- Ação -->
            <div class="flex lg:flex-col items-center lg:items-stretch gap-2 lg:min-w-[160px]">
                  <button
                    v-if="isProfessional"
                    @click="abrirNegociacao(servico.id)"
                    class="flex-1 lg:flex-none px-5 py-2.5 bg-[var(--accent-gold)] text-[var(--text-on-accent)] rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    Negociar
                  </button>
                  <button
                    v-else
                    @click="auth.user ? emit('viewProfile', servico.categoria) : undefined"
                    :disabled="!auth.user"
                    :class="['flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all', auth.user ? 'bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] hover:bg-[var(--border-default)] hover:text-[var(--text-secondary)]' : 'bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-subtle)] cursor-not-allowed opacity-60']"
                  >
                    {{ auth.user ? 'Ver profissionais' : 'Faça login para interagir' }}
                  </button>
              <button
                @click="auth.user ? handleAceitar(servico) : undefined"
                :disabled="!auth.user || (isProfessional && !hasPlan)"
                :class="['flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all', auth.user ? (isProfessional && !hasPlan ? 'bg-[var(--text-subtle)] text-[var(--border-default)] cursor-not-allowed opacity-60' : 'bg-[var(--accent-gold)] text-[var(--text-on-accent)] hover:shadow-lg hover:shadow-[color-mix(in_srgb,var(--accent-gold)_25%,transparent)]') : 'bg-[var(--text-subtle)] text-[var(--border-default)] cursor-not-allowed opacity-60']"
              >
                {{ !auth.user ? 'Faça login para interagir' : (isProfessional && !hasPlan) ? 'Requer plano pago' : 'Aceitar Serviço' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <SolicitarOrcamentoModal
    v-if="showOrcamentoModal"
    @close="showOrcamentoModal = false"
    @created="showOrcamentoModal = false; carregar()"
    @requestLogin="showOrcamentoModal = false"
  />

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
        <p class="text-sm text-[var(--text-muted)]">Adicione seu WhatsApp para que o cliente possa entrar em contato.</p>
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
</template>
