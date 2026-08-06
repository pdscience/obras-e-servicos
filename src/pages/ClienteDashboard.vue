<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  LayoutDashboard, ClipboardList, Clock, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Settings, User,
  Briefcase, DollarSign, TrendingUp, Search, ArrowRight,
  MapPin, Calendar, MessageCircle, Star, X
} from '@lucide/vue'
import { listarServicosDoCliente, obterPerfilProfissionalPorId, obterPerfilUsuario, atualizarPerfilUsuario, criarPerfilUsuario, atualizarStatusServico, criarReview } from '../services/api'
import { getCitiesByUf } from '../data/cities'
import { useAuthStore } from '../stores/auth'
import SolicitarOrcamentoModal from '@/components/SolicitarOrcamentoModal.vue'
import type { ServiceRequest, Professional } from '../types'

defineEmits<{ back: [] }>()

const auth = useAuthStore()
const servicos = ref<ServiceRequest[]>([])
const loading = ref(true)
const activeTab = ref('todos')
const profissionaisAceitos = ref<Record<string, Professional>>({})

const showEditModal = ref(false)
const showOrcamentoModal = ref(false)
const editNome = ref('')
const editTelefone = ref('')
const editCpf = ref('')
const editDataNascimento = ref('')
const editUf = ref('')
const editCidade = ref('')
const editCidades = ref<string[]>([])
const editEndereco = ref('')
const saving = ref(false)
const showReviewModal = ref(false)
const reviewRating = ref(0)
const reviewComment = ref('')
const reviewServicoId = ref<string | null>(null)

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

watch(editUf, async (newUf, oldUf) => {
  if (newUf !== oldUf) editCidade.value = ''
  editCidades.value = await getCitiesByUf(newUf)
})

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

async function abrirEditarPerfil() {
  if (!auth.user) return
  editNome.value = auth.user.nome
  try {
    const perfil = await obterPerfilUsuario(auth.user.id)
    if (perfil) {
      editTelefone.value = perfil.telefone ?? ''
      editCpf.value = perfil.cpf ?? ''
      editDataNascimento.value = perfil.data_nascimento ?? ''
      editUf.value = perfil.uf ?? ''
      editCidade.value = perfil.cidade ?? ''
      editEndereco.value = perfil.endereco ?? ''
    }
  } catch { /* sem perfil ainda */ }
  showEditModal.value = true
}

async function salvarEdicao() {
  if (!auth.user) return
  saving.value = true
  try {
    await criarPerfilUsuario({
      usuario_id: auth.user.id,
      nome: editNome.value,
      telefone: editTelefone.value,
      cpf: editCpf.value,
      data_nascimento: editDataNascimento.value,
      uf: editUf.value,
      cidade: editCidade.value,
      endereco: editEndereco.value,
    }).catch(() => atualizarPerfilUsuario(auth.user!.id, {
      nome: editNome.value,
      telefone: editTelefone.value,
      cpf: editCpf.value,
      data_nascimento: editDataNascimento.value,
      uf: editUf.value,
      cidade: editCidade.value,
      endereco: editEndereco.value,
    }))
    await auth.setProfile({ name: editNome.value })
    showEditModal.value = false
  } catch (e) {
    console.error('Erro ao salvar perfil:', e)
  } finally {
    saving.value = false
  }
}

function getProfissionalNome(profissionalId: string | null): string {
  if (!profissionalId) return ''
  return profissionaisAceitos.value[profissionalId]?.nome ?? ''
}

async function carregar() {
  loading.value = true
  try {
    if (auth.user) {
      servicos.value = await listarServicosDoCliente(auth.user.id)

      const profissionaisIds = [...new Set(servicos.value
        .filter(s => s.profissional_id)
        .map(s => s.profissional_id))]

      for (const id of profissionaisIds) {
        if (id && !profissionaisAceitos.value[id]) {
          const perfil = await obterPerfilProfissionalPorId(id)
          if (perfil) {
            profissionaisAceitos.value[id] = perfil
          }
        }
      }
    }
  } catch (e) {
    console.error('Erro ao carregar serviços:', e)
  } finally {
    loading.value = false
  }
}

watch(() => auth.user, (newUser) => {
  if (newUser) carregar()
})

onMounted(carregar)

const filteredServicos = computed(() => {
  if (activeTab.value === 'todos') return servicos.value
  return servicos.value.filter(s => s.status === activeTab.value)
})

const stats = computed(() => {
  const total = servicos.value.length
  const abertos = servicos.value.filter(s => s.status === 'aberto').length
  const andamento = servicos.value.filter(s => s.status === 'em_andamento').length
  const concluidos = servicos.value.filter(s => s.status === 'concluido').length
  return [
    { label: 'Total de Pedidos', value: total, icon: ClipboardList, color: '#7ee8fa' },
    { label: 'Aguardando Resposta', value: abertos, icon: Clock, color: '#f0b429' },
    { label: 'Em Andamento', value: andamento, icon: Briefcase, color: '#f0a500' },
    { label: 'Concluídos', value: concluidos, icon: CheckCircle2, color: '#3fb950' },
  ]
})

const tabs = [
  { id: 'todos', label: 'Todos' },
  { id: 'aberto', label: 'Abertos' },
  { id: 'em_andamento', label: 'Em Andamento' },
  { id: 'concluido', label: 'Concluídos' },
  { id: 'cancelado', label: 'Cancelados' },
]

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

function getUrgenciaBadge(urgencia: string) {
  const config: Record<string, { style: string; label: string }> = {
    alta: { style: 'bg-[color-mix(in srgb,var(--accent-red) 10%,transparent)] text-[var(--accent-red)]', label: 'Urgente' },
    media: { style: 'bg-[color-mix(in srgb,var(--accent-amber) 10%,transparent)] text-[var(--accent-amber)]', label: 'Médio' },
    baixa: { style: 'bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)] text-[var(--accent-green)]', label: 'Normal' },
  }
  return config[urgencia] || { style: '', label: urgencia }
}

async function handleConcluir(servicoId: string) {
  try {
    await atualizarStatusServico(servicoId, 'concluido')
  } catch (e: unknown) {
    alert((e as Error).message)
  }
}

async function handleCancelarServico(servicoId: string) {
  try {
    await atualizarStatusServico(servicoId, 'cancelado')
  } catch (e: unknown) {
    alert((e as Error).message)
  }
}

function abrirAvaliacao(servicoId: string) {
  reviewServicoId.value = servicoId
  reviewRating.value = 0
  reviewComment.value = ''
  showReviewModal.value = true
}

async function handleSubmitReview() {
  if (!reviewServicoId.value || reviewRating.value === 0 || !auth.user) return
  try {
    const servico = servicos.value.find(s => s.id === reviewServicoId.value)
    await criarReview({
      profissional_id: servico?.profissional_id ?? '',
      servico_id: reviewServicoId.value,
      cliente_nome: auth.user.nome,
      cliente_avatar: auth.user.avatar_url ?? '',
      rating: reviewRating.value,
      comment: reviewComment.value,
      service_type: servico?.categoria ?? '',
    })
    showReviewModal.value = false
    await carregar()
  } catch (e: unknown) {
    alert((e as Error).message)
  }
}

function fecharReview() {
  showReviewModal.value = false
  reviewRating.value = 0
  reviewComment.value = ''
  reviewServicoId.value = null
}
</script>

<template>
  <div class="min-h-screen" style="background:var(--bg-page)">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
         <div>
           <h1 class="text-2xl font-bold text-[var(--text-primary)]">Meus Pedidos</h1>
           <p class="text-[var(--text-muted)]">Acompanhe seus pedidos de orçamento</p>
         </div>
       </div>

      <div v-if="loading" class="text-center py-16">
        <div class="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-[var(--text-muted)]">Carregando...</p>
      </div>

      <template v-else>
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div v-for="(stat, i) in stats" :key="i" class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-5 hover:border-[var(--border-raised)] transition-all" :style="{ borderLeftColor: stat.color, borderLeftWidth: '3px' }">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold">{{ stat.label }}</span>
              <component :is="stat.icon" class="w-5 h-5" :style="{ color: stat.color }" />
            </div>
            <p class="text-2xl font-bold text-[var(--text-primary)] font-mono">{{ stat.value }}</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-[var(--accent-gold)] text-[var(--text-on-accent)]'
                : 'bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            ]"
          >{{ tab.label }}</button>
          <button
            @click="showOrcamentoModal = true"
            class="ml-auto whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all bg-[var(--accent-gold)] text-[var(--text-on-accent)] hover:shadow-lg"
          >
            Solicitar Orçamento
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="filteredServicos.length === 0" class="text-center py-16 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl">
          <ClipboardList class="w-16 h-16 text-[var(--border-default)] mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-[var(--text-secondary)] mb-2">Nenhum pedido encontrado</h3>
          <p class="text-[var(--text-muted)] text-sm mb-6">
            {{ activeTab === 'todos' ? 'Você ainda não fez nenhum pedido de orçamento.' : 'Nenhum pedido com este status.' }}
          </p>
          <button
            v-if="activeTab === 'todos'"
            @click="showOrcamentoModal = true"
            class="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Solicitar Orçamento <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Service List -->
        <div v-else class="space-y-4">
          <div
            v-for="servico in filteredServicos"
            :key="servico.id"
            class="group relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 hover:border-[var(--accent-gold)]/30 hover:shadow-[0_8px_30px_rgba(212,160,23,0.08)] transition-all duration-300 ease-out"
          >
            <!-- Header -->
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="flex items-start gap-4 flex-1 min-w-0">
                <div class="w-12 h-12 bg-gradient-to-br from-[var(--accent-gold)]/15 to-[var(--accent-gold)]/5 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-[var(--accent-gold)]/10 group-hover:ring-[var(--accent-gold)]/25 transition-all duration-300">
                  <Briefcase class="w-6 h-6 text-[var(--accent-gold)]" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 class="font-semibold text-[var(--text-secondary)] text-base">{{ servico.categoria }}</h3>
                    <span :class="['px-3 py-1 rounded-full text-xs font-semibold tracking-wide', getStatusBadge(servico.status).style]">
                      {{ getStatusBadge(servico.status).label }}
                    </span>
                    <span :class="['px-3 py-1 rounded-full text-xs font-semibold tracking-wide', getUrgenciaBadge(servico.urgencia).style]">
                      {{ getUrgenciaBadge(servico.urgencia).label }}
                    </span>
                  </div>
                  <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ servico.descricao }}</p>
                </div>
              </div>
            </div>

            <!-- Details Row -->
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white ml-16">
              <span class="flex items-center gap-1.5">
                <MapPin class="w-4 h-4" /> {{ servico.endereco }}
              </span>
              <span class="flex items-center gap-1.5">
                <Calendar class="w-4 h-4" /> {{ new Date(servico.created_at).toLocaleDateString('pt-BR') }}
              </span>
              <span v-if="servico.data_preferida" class="flex items-center gap-1.5">
                <Clock class="w-4 h-4" /> Pref: {{ new Date(servico.data_preferida).toLocaleDateString('pt-BR') }}
              </span>
              <span v-if="servico.orcamento" class="flex items-center gap-1.5 font-bold text-[var(--accent-gold)] ml-auto">
                <DollarSign class="w-4 h-4" /> R$ {{ servico.orcamento.toLocaleString('pt-BR') }}
              </span>
            </div>

            <!-- Professional info (if accepted) -->
            <div v-if="servico.profissional_id || servico.whatsapp_profissional" class="mt-4 pt-4 border-t border-[var(--border-default)]/60">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-green)]/20 to-[var(--accent-green)]/5 flex items-center justify-center ring-1 ring-[var(--accent-green)]/20">
                  <User class="w-4 h-4 text-[var(--accent-green)]" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-[var(--accent-green)] font-semibold">
                    {{ servico.status === 'concluido' ? 'Serviço concluído por' : servico.status === 'em_andamento' ? 'Profissional aceitou' : servico.status === 'aberto' ? 'Aguardando resposta' : 'Serviço cancelado' }}
                  </p>
                  <p v-if="servico.profissional_id && getProfissionalNome(servico.profissional_id)" class="text-xs text-[var(--text-muted)] mt-0.5">{{ getProfissionalNome(servico.profissional_id) }}</p>
                </div>
              </div>

              <!-- WhatsApp Contact -->
              <div v-if="servico.whatsapp_profissional && servico.status === 'em_andamento'" class="mt-3 ml-12">
                <a :href="`https://wa.me/${servico.whatsapp_profissional}`" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-green)]/10 text-[var(--accent-green)] text-xs font-medium rounded-lg hover:bg-[var(--accent-green)]/20 transition-colors">
                  <MessageCircle class="w-3.5 h-3.5" />
                  {{ servico.whatsapp_profissional }}
                </a>
              </div>

              <!-- Completed Status -->
              <div v-if="servico.status === 'concluido'" class="mt-3 ml-12 flex items-center gap-2 text-xs text-[var(--accent-green)] font-medium">
                <CheckCircle2 class="w-4 h-4" />
                <span>Serviço concluído com sucesso</span>
              </div>

              <!-- Action Buttons -->
              <div v-if="servico.status === 'em_andamento'" class="mt-4 ml-12 flex items-center gap-3">
                <button
                  @click="handleConcluir(servico.id)"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-green)] text-[var(--text-on-accent)] text-sm rounded-xl font-semibold hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(63,185,80,0.25)] active:scale-[0.98] transition-all duration-200"
                >
                  <CheckCircle2 class="w-4 h-4" />
                  Marcar como Concluído
                </button>
                <button
                  @click="handleCancelarServico(servico.id)"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-red)]/10 text-[var(--accent-red)] text-sm rounded-xl font-semibold hover:bg-[var(--accent-red)]/20 active:scale-[0.98] transition-all duration-200"
                >
                  <X class="w-4 h-4" />
                  Cancelar
                </button>
              </div>

              <!-- Review Button -->
              <div v-if="servico.status === 'concluido'" class="mt-4 ml-12">
                <button
                  @click="abrirAvaliacao(servico.id)"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-sm rounded-xl font-semibold hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(212,160,23,0.25)] active:scale-[0.98] transition-all duration-200"
                >
                  <Star class="w-4 h-4" />
                  Avaliar Serviço
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- Edit Profile Modal -->
  <Teleport to="body">
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="showEditModal = false">
      <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-[var(--text-primary)]">Editar Perfil</h2>
          <button @click="showEditModal = false" class="p-1 hover:bg-[var(--border-default)] rounded-lg transition-colors text-[var(--text-muted)]">✕</button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Nome</label>
            <input v-model="editNome" type="text" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
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
          <div>
            <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Endereço</label>
            <input v-model="editEndereco" placeholder="Rua, número, bairro" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showEditModal = false" class="flex-1 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--border-default)] transition-colors">Cancelar</button>
          <button @click="salvarEdicao" :disabled="saving" class="flex-1 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div>
    </div>
  </Teleport>

  <SolicitarOrcamentoModal
    v-if="showOrcamentoModal"
    @close="showOrcamentoModal = false"
    @created="showOrcamentoModal = false"
    @requestLogin="showOrcamentoModal = false"
  />

  <!-- Review Modal -->
  <div v-if="showReviewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.7)" @click.self="fecharReview">
    <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-md shadow-2xl">
      <div class="flex items-center justify-between p-5 border-b border-[var(--border-default)]">
        <h3 class="text-lg font-bold text-[var(--text-primary)]">Avaliar Serviço</h3>
        <button @click="fecharReview" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border-default)] transition-colors">
          <X class="w-5 h-5 text-[var(--text-muted)]" />
        </button>
      </div>
      <div class="p-5 space-y-4">
        <p class="text-sm text-[var(--text-muted)]">Como foi sua experiência com este profissional?</p>
        <div>
          <label class="block text-sm font-medium text-[var(--text-secondary)] mb-2">Avaliação *</label>
          <div class="flex items-center gap-2">
            <button v-for="star in 5" :key="star" @click="reviewRating = star" class="transition-colors">
              <Star class="w-8 h-8" :class="star <= reviewRating ? 'text-[var(--accent-amber)] fill-[var(--accent-amber)]' : 'text-[var(--border-default)]'" />
            </button>
            <span class="text-sm text-[var(--text-muted)] ml-2">{{ reviewRating }}/5</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Seu Depoimento *</label>
          <textarea
            v-model="reviewComment"
            rows="4"
            placeholder="Conte como foi sua experiência..."
            class="w-full px-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-subtle)] resize-none"
          ></textarea>
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-default)]">
        <button @click="fecharReview" class="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">Cancelar</button>
        <button
          @click="handleSubmitReview"
          :disabled="reviewRating === 0 || !reviewComment.trim()"
          class="px-6 py-2.5 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar Avaliação
        </button>
      </div>
    </div>
  </div>
</template>
