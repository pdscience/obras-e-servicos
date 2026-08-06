<script setup lang="ts">
import { ref } from 'vue'
import { X, AlertCircle, MapPin, Calendar, DollarSign } from '@lucide/vue'
import { criarServico } from '../services/api'
import { mainCategories } from '../data/mockData'

const props = defineProps<{
  userId?: string
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const step = ref(1)
const submitting = ref(false)

const form = ref({
  cliente_nome: '',
  cliente_contato: '',
  categoria: '',
  descricao: '',
  endereco: '',
  data_preferida: '',
  orcamento: undefined as number | undefined,
  urgencia: 'media' as 'baixa' | 'media' | 'alta'
})

const categoriasList = mainCategories.map(c => c.name).sort()

async function submit() {
  submitting.value = true
  try {
    await criarServico({
      cliente_id: props.userId ?? 'usr-exemplo',
      cliente_nome: form.value.cliente_nome,
      cliente_contato: form.value.cliente_contato,
      categoria: form.value.categoria,
      descricao: form.value.descricao,
      endereco: form.value.endereco,
      data_preferida: form.value.data_preferida,
      orcamento: form.value.orcamento,
      urgencia: form.value.urgencia,
    })
    emit('created')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.7)">
    <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-[var(--border-default)]">
        <div>
          <h2 class="text-xl font-bold text-[var(--text-primary)]">Publicar Serviço</h2>
          <p class="text-sm text-[var(--text-muted)] mt-0.5">Passo {{ step }} de 3</p>
        </div>
        <button @click="emit('close')" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border-default)] transition-colors">
          <X class="w-5 h-5 text-[var(--text-muted)]" />
        </button>
      </div>

      <!-- Step 1: O que precisa -->
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
          <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Categoria do serviço *</label>
          <select
            v-model="form.categoria"
            class="w-full px-4 py-2.5 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors appearance-none cursor-pointer"
          >
            <option value="" disabled>Selecione uma categoria</option>
            <option v-for="cat in categoriasList" :key="cat" :value="cat">{{ cat }}</option>
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

      <!-- Step 2: Detalhes -->
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

      <!-- Step 3: Revisão -->
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
            <span class="text-sm text-white/60">Categoria</span>
            <span class="text-sm text-[var(--accent-gold)] font-medium">{{ form.categoria }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white/60">Urgência</span>
            <span class="text-sm text-white font-medium">{{ form.urgencia }}</span>
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
        <p class="text-xs text-white/40 text-center">
          <AlertCircle class="w-3 h-3 inline-block mr-1" />
          Seu serviço será publicado no Quadro de Serviços para profissionais da região.
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
          :disabled="(step === 1 && (!form.cliente_nome || !form.cliente_contato || !form.categoria)) || (step === 2 && (!form.descricao || !form.endereco))"
          class="px-6 py-2.5 bg-[var(--accent-gold)] text-[var(--text-on-accent)] rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
        <button
          v-if="step === 3"
          @click="submit"
          :disabled="submitting"
          class="px-6 py-2.5 bg-[var(--accent-green)] text-[var(--text-on-accent)] rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {{ submitting ? 'Publicando...' : 'Publicar Serviço' }}
        </button>
      </div>
    </div>
  </div>
</template>
