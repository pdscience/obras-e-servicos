<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { X, AlertCircle, MapPin, Calendar, DollarSign, LogIn } from '@lucide/vue'
import { criarServico, listarTodasProfissoes } from '../services/api'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{
  profissionalId?: string
  profissionalNome?: string
  categoriaInicial?: string
}>()

const emit = defineEmits<{
  close: []
  created: []
  requestLogin: []
}>()

const auth = useAuthStore()
const step = ref(1)
const submitting = ref(false)
const success = ref(false)

const form = ref({
  cliente_nome: auth.user?.nome ?? '',
  cliente_contato: '',
  categoria: props.categoriaInicial ?? '',
  descricao: '',
  endereco: '',
  data_preferida: '',
  orcamento: undefined as number | undefined,
  urgencia: 'media' as 'baixa' | 'media' | 'alta'
})

const isLoggedIn = computed(() => auth.isLoggedIn)
const profissoes = ref<string[]>([])

async function carregarProfissoes() {
  try {
    const data = await listarTodasProfissoes()
    profissoes.value = data.map((p: { nome: string }) => p.nome).sort()
  } catch {
    profissoes.value = []
  }
}

onMounted(carregarProfissoes)

function canProceedStep1() {
  return form.value.cliente_nome && form.value.cliente_contato && form.value.categoria
}

function canProceedStep2() {
  return form.value.descricao && form.value.endereco
}

async function submit() {
  submitting.value = true
  try {
    await criarServico({
      cliente_id: auth.user?.id ?? 'usr-exemplo',
      profissional_id: props.profissionalId || undefined,
      cliente_nome: form.value.cliente_nome,
      cliente_contato: form.value.cliente_contato,
      categoria: form.value.categoria,
      descricao: form.value.descricao,
      endereco: form.value.endereco,
      data_preferida: form.value.data_preferida,
      orcamento: form.value.orcamento,
      urgencia: form.value.urgencia,
    })
    success.value = true
  } finally {
    submitting.value = false
  }
}

function handleLogin() {
  emit('requestLogin')
}

function handleCreated() {
  emit('created')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.7)">
    <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

      <!-- Success State -->
      <div v-if="success" class="p-8 text-center">
        <div class="w-16 h-16 bg-[color-mix(in srgb,var(--accent-green) 15%,transparent)] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-[var(--accent-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">Solicitação Enviada!</h3>
        <p class="text-[var(--text-muted)] text-sm mb-6">
          Seu pedido de orçamento foi publicado no Quadro de Serviços.
          <span v-if="!isLoggedIn" class="block mt-2 text-[var(--accent-gold)] font-medium">
            Faça login para acompanhar suas solicitações no dashboard.
          </span>
        </p>
        <div class="flex flex-col gap-2">
          <button
            v-if="!isLoggedIn"
            @click="handleLogin"
            class="w-full px-6 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <LogIn class="w-4 h-4" />
            Entrar para acompanhar
          </button>
          <button
            @click="handleCreated"
            class="w-full px-6 py-3 bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-xl text-sm font-semibold hover:border-[var(--accent-gold)] transition-all"
          >
            Fechar
          </button>
        </div>
      </div>

      <!-- Form -->
      <template v-else>
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-[var(--border-default)]">
          <div>
            <h2 class="text-xl font-bold text-[var(--text-primary)]">
              {{ profissionalNome ? `Solicitar Orçamento - ${profissionalNome}` : 'Solicitar Orçamento' }}
            </h2>
            <p class="text-sm text-[var(--text-muted)] mt-0.5">Passo {{ step }} de 3</p>
          </div>
          <button @click="emit('close')" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border-default)] transition-colors">
            <X class="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        <!-- Step 1: Seus dados -->
        <div v-if="step === 1" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Seu nome *</label>
            <input
              v-model="form.cliente_nome"
              type="text"
              placeholder="Ex: Maria Santos"
              class="w-full px-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-subtle)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Telefone para contato *</label>
            <input
              v-model="form.cliente_contato"
              type="text"
              placeholder="Ex: (11) 99999-8888"
              class="w-full px-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-subtle)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Profissão *</label>
            <select
              v-model="form.categoria"
              class="w-full px-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecione uma profissão</option>
              <option v-for="prof in profissoes" :key="prof" :value="prof">{{ prof }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Urgência *</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="opcao in [{ value: 'baixa', label: 'Baixa', icon: '🟢' }, { value: 'media', label: 'Média', icon: '🟡' }, { value: 'alta', label: 'Alta', icon: '🔴' }]"
                :key="opcao.value"
                @click="form.urgencia = opcao.value as 'baixa' | 'media' | 'alta'"
                class="px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
                :class="form.urgencia === opcao.value
                  ? 'border-[var(--accent-gold)] bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)]'
                  : 'border-[var(--border-raised)] bg-[var(--bg-raised)] text-[var(--text-muted)] hover:border-[var(--border-default)]'"
              >
                {{ opcao.icon }} {{ opcao.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: Detalhes do serviço -->
        <div v-if="step === 2" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Descreva o serviço *</label>
            <textarea
              v-model="form.descricao"
              rows="4"
              placeholder="Descreva detalhadamente o que precisa ser feito..."
              class="w-full px-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-subtle)] resize-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Endereço *</label>
            <div class="relative">
              <MapPin class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                v-model="form.endereco"
                type="text"
                placeholder="Rua, número, bairro, cidade - UF"
                class="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-subtle)]"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Data preferida</label>
              <div class="relative">
                <Calendar class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  v-model="form.data_preferida"
                  type="date"
                  class="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Orçamento estimado</label>
              <div class="relative">
                <DollarSign class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  v-model="form.orcamento"
                  type="number"
                  placeholder="R$ 0,00"
                  class="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-subtle)]"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Revisão e login -->
        <div v-if="step === 3" class="p-6 space-y-5">
          <div class="bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-white/60">Nome</span>
              <span class="text-sm text-white font-medium">{{ form.cliente_nome }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-white/60">Contato</span>
              <span class="text-sm text-white font-medium">{{ form.cliente_contato }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-white/60">Profissão</span>
              <span class="text-sm text-[var(--accent-gold)] font-medium">{{ form.categoria }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-white/60">Urgência</span>
              <span class="text-sm text-white font-medium capitalize">{{ form.urgencia }}</span>
            </div>
            <div class="pt-2 border-t border-white/10">
              <span class="text-sm text-white/60 block mb-1">Descrição</span>
              <p class="text-sm text-white">{{ form.descricao }}</p>
            </div>
            <div class="pt-2 border-t border-white/10">
              <span class="text-sm text-white/60 block mb-1">Endereço</span>
              <p class="text-sm text-white">{{ form.endereco }}</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-white/10">
              <span class="text-sm text-white/60">Data preferida</span>
              <span class="text-sm text-white font-medium">{{ form.data_preferida ? new Date(form.data_preferida).toLocaleDateString('pt-BR') : 'Não definida' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-white/60">Orçamento</span>
              <span class="text-sm text-[var(--accent-green)] font-medium">{{ form.orcamento ? `R$ ${form.orcamento.toLocaleString('pt-BR')}` : 'Não definido' }}</span>
            </div>
          </div>

          <!-- Login prompt for non-authenticated users -->
          <div v-if="!isLoggedIn" class="bg-[color-mix(in srgb,var(--accent-gold) 5%,transparent)] border border-[color-mix(in srgb,var(--accent-gold) 20%,transparent)] rounded-xl p-4">
            <div class="flex items-start gap-3">
              <AlertCircle class="w-5 h-5 text-[var(--accent-gold)] mt-0.5 shrink-0" />
              <div>
                <p class="text-sm text-[var(--text-secondary)] font-medium mb-1">Faça login para acompanhar</p>
                <p class="text-xs text-[var(--text-muted)]">
                  Após enviar, você será redirecionado para fazer login. Assim sua solicitação fica vinculada à sua conta e aparece no seu dashboard.
                </p>
              </div>
            </div>
          </div>

          <p v-else class="text-xs text-[var(--text-subtle)] text-center">
            <AlertCircle class="w-3 h-3 inline-block mr-1" />
             Seu pedido será publicado no Quadro de Serviços para profissionais da profissão.
          </p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-6 border-t border-[var(--border-default)]">
          <button
            v-if="step > 1"
            @click="step--"
            class="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Voltar
          </button>
          <div v-else></div>
          <button
            v-if="step < 3"
            @click="step++"
            :disabled="(step === 1 && !canProceedStep1()) || (step === 2 && !canProceedStep2())"
            class="px-6 py-2.5 bg-[var(--accent-gold)] text-[var(--text-on-accent)] rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
          <button
            v-if="step === 3"
            @click="submit"
            :disabled="submitting"
            class="px-6 py-2.5 bg-[var(--accent-green)] text-[var(--text-on-accent)] rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <template v-if="submitting">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </template>
            <template v-else>
              Enviar Solicitação
            </template>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
