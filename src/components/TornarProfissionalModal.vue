<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { Briefcase, MapPin, CheckCircle2, ChevronRight, AlertCircle } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { mainCategories } from '../data/mockData'
import { getCitiesByUf } from '../data/cities'
import { listarCategorias, listarProfissoes, salvarCategoriasProfissional } from '../services/api'
import type { CategoriaDB, ProfissaoDB } from '../types'

const emit = defineEmits<{
  close: []
  created: []
}>()

const auth = useAuthStore()

const step = ref(1)
const loading = ref(false)

const form = ref({
  mainCategoryId: '',
  profissaoId: '',
  uf: '',
  cidade: '',
  descricao: '',
  anos_experiencia: 0,
})

const cidades = ref<string[]>([])
const categoriasDB = ref<CategoriaDB[]>([])
const profissoesDB = ref<ProfissaoDB[]>([])

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

const selectedMainCategory = computed(() => mainCategories.find(mc => mc.id === form.value.mainCategoryId))
const categoriaNome = computed(() => selectedMainCategory.value?.name ?? '')
const profissaoNome = computed(() => profissoesDB.value.find(p => p.id === form.value.profissaoId)?.nome ?? '')

onMounted(async () => {
  categoriasDB.value = await listarCategorias()
})

watch(() => form.value.uf, async (newUf, oldUf) => {
  if (newUf !== oldUf) form.value.cidade = ''
  cidades.value = await getCitiesByUf(newUf)
})

watch(() => form.value.mainCategoryId, async (id) => {
  form.value.profissaoId = ''
  profissoesDB.value = []
  if (!id) return
  const mc = mainCategories.find(c => c.id === id)
  if (!mc) return
  const dbCat = categoriasDB.value.find(c => c.nome === mc.name)
  if (dbCat) {
    profissoesDB.value = await listarProfissoes(dbCat.id)
  } else {
    profissoesDB.value = mc.professions.map((p, i) => ({
      id: `mock-${i}`, categoria_id: id, nome: p, created_at: ''
    }))
  }
})

function canProceedStep1() {
  return form.value.mainCategoryId
}

function canProceedStep2() {
  return form.value.uf && form.value.cidade
}

async function submit() {
  if (!auth.user) return
  loading.value = true
  try {
    const ok = await auth.adicionarRole('profissional', {
      categoria: categoriaNome.value,
      subcategoria: profissaoNome.value || undefined,
      especialidades: profissaoNome.value ? [profissaoNome.value] : [],
      uf: form.value.uf,
      cidade: form.value.cidade,
      descricao: form.value.descricao,
      anos_experiencia: form.value.anos_experiencia,
    })
    if (ok) {
      if (form.value.profissaoId && !form.value.profissaoId.startsWith('mock-')) {
        try {
          const perfil = await import('../services/api').then(m => m.obterPerfilProfissional(auth.user!.id))
          if (perfil) {
            const dbCat = categoriasDB.value.find(c => c.nome === categoriaNome.value)
            if (dbCat) {
              await salvarCategoriasProfissional(
                perfil.id,
                [{ categoria_id: dbCat.id, profissao_id: form.value.profissaoId }],
                false
              )
            }
          }
        } catch { /* categorias salvas depois no dashboard */ }
      }
      auth.setMode('profissional')
      emit('created')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="emit('close')">
      <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-[var(--border-default)]">
          <div class="flex items-center gap-3 mb-5">
            <button
              @click="step > 1 ? step-- : emit('close')"
              class="w-9 h-9 rounded-xl border border-[var(--border-raised)] flex items-center justify-center hover:bg-[var(--bg-raised)] transition-colors"
            >
              <ChevronRight class="w-4 h-4 text-[var(--text-muted)] rotate-180" />
            </button>
            <div class="flex-1">
              <p class="text-[var(--text-subtle)] text-[10px] uppercase tracking-widest font-medium">Cadastro Profissional</p>
              <h2 class="text-[var(--text-primary)] text-base font-bold">Torne-se um <span class="text-[var(--accent-gold)]">Profissional</span></h2>
            </div>
            <button
              @click="emit('close')"
              class="w-9 h-9 rounded-xl border border-[var(--border-raised)] flex items-center justify-center hover:bg-[var(--bg-raised)] transition-colors"
            >
              <span class="text-[var(--text-muted)] text-lg leading-none">✕</span>
            </button>
          </div>

          <!-- Progress Steps -->
          <div class="flex items-center gap-0">
            <div v-for="s in 3" :key="s" class="flex items-center flex-1 last:flex-none">
              <div class="flex flex-col items-center">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                  :class="s < step ? 'bg-[var(--accent-green)] text-white' : s === step ? 'bg-[var(--accent-gold)] text-[var(--text-on-accent)]' : 'bg-[var(--border-default)] text-[var(--text-subtle)]'"
                >
                  <span v-if="s < step"><CheckCircle2 class="w-3.5 h-3.5" /></span>
                  <span v-else>{{ s }}</span>
                </div>
                <span
                  class="text-[9px] font-medium mt-1 whitespace-nowrap"
                  :class="s === step ? 'text-[var(--accent-gold)]' : s < step ? 'text-[var(--accent-green)]' : 'text-[var(--text-subtle)]'"
                >{{ ['Categoria', 'Localização', 'Confirmação'][s - 1] }}</span>
              </div>
              <div v-if="s < 3" class="flex-1 h-0.5 mx-2 mb-5 rounded" :class="s < step ? 'bg-[var(--accent-green)]' : 'bg-[var(--border-default)]'"></div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 overflow-y-auto" style="max-height: 60vh;">

          <!-- Step 1: Categoria -->
          <form v-if="step === 1" @submit.prevent="canProceedStep1() && step++" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Área de Atuação *</label>
              <select
                v-model="form.mainCategoryId"
                class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] transition-colors appearance-none cursor-pointer"
              >
                <option value="">Selecione sua área</option>
                <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div v-if="profissoesDB.length > 0">
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Profissão</label>
              <select
                v-model="form.profissaoId"
                class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] transition-colors appearance-none cursor-pointer"
              >
                <option value="">Selecione (opcional)</option>
                <option v-for="prof in profissoesDB" :key="prof.id" :value="prof.id">{{ prof.nome }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Anos de Experiência</label>
              <div class="flex gap-2">
                <button
                  v-for="opt in [0, 1, 3, 5, 10]"
                  :key="opt"
                  type="button"
                  @click="form.anos_experiencia = opt"
                  class="flex-1 px-2 py-2.5 rounded-xl text-xs font-medium border transition-all text-center"
                  :class="form.anos_experiencia === opt
                    ? 'border-[var(--accent-gold)] bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)]'
                    : 'border-[var(--border-raised)] bg-transparent text-[var(--text-muted)] hover:border-[var(--border-default)]'"
                >
                  {{ opt === 0 ? 'Início' : `${opt}+` }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Sobre você <span class="text-[var(--text-subtle)] normal-case font-normal">(opcional)</span></label>
              <textarea
                v-model="form.descricao"
                rows="3"
                placeholder="Conte um pouco sobre sua experiência e diferenciais..."
                class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] resize-none placeholder-[var(--text-subtle)] text-sm"
              ></textarea>
            </div>
          </form>

          <!-- Step 2: Localização -->
          <form v-else-if="step === 2" @submit.prevent="canProceedStep2() && step++" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Estado (UF) *</label>
              <select
                v-model="form.uf"
                class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] transition-colors appearance-none cursor-pointer"
              >
                <option value="">Selecione o estado</option>
                <option v-for="uf in ufList" :key="uf.sigla" :value="uf.sigla">{{ uf.nome }} ({{ uf.sigla }})</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Cidade *</label>
              <div class="relative">
                <MapPin class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)]" />
                <select
                  v-model="form.cidade"
                  :disabled="!form.uf"
                  class="w-full pl-10 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] transition-colors appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">{{ form.uf ? 'Selecione a cidade' : 'Primeiro selecione o estado' }}</option>
                  <option v-for="city in cidades" :key="city" :value="city">{{ city }}</option>
                </select>
              </div>
            </div>

            <div class="bg-[color-mix(in srgb,var(--accent-gold) 8%,transparent)] border border-[color-mix(in srgb,var(--accent-gold) 15%,transparent)] rounded-xl p-3 flex gap-2">
              <AlertCircle class="w-4 h-4 text-[var(--accent-gold)] flex-shrink-0 mt-0.5" />
              <p class="text-[var(--accent-dark-gold)] text-xs leading-relaxed">
                Sua localização ajuda clientes da sua região a encontrarem você. Você poderá alterar depois.
              </p>
            </div>
          </form>

          <!-- Step 3: Confirmação -->
          <div v-else class="space-y-4">
            <div class="bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-xl p-4 space-y-3">
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">Resumo do cadastro</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-[var(--text-muted)]">Área:</span>
                  <span class="text-[var(--text-secondary)] font-medium">{{ categoriaNome }}</span>
                </div>
                <div v-if="profissaoNome" class="flex justify-between">
                  <span class="text-[var(--text-muted)]">Profissão:</span>
                  <span class="text-[var(--text-secondary)] font-medium">{{ profissaoNome }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[var(--text-muted)]">Experiência:</span>
                  <span class="text-[var(--text-secondary)] font-medium">{{ form.anos_experiencia === 0 ? 'Iniciante' : `${form.anos_experiencia}+ anos` }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[var(--text-muted)]">Localização:</span>
                  <span class="text-[var(--text-secondary)] font-medium">{{ form.cidade }} - {{ form.uf }}</span>
                </div>
              </div>
            </div>

            <div v-if="!auth.user" class="bg-[color-mix(in srgb,var(--accent-red) 8%,transparent)] border border-[color-mix(in srgb,var(--accent-red) 15%,transparent)] rounded-xl p-3 flex gap-2">
              <AlertCircle class="w-4 h-4 text-[var(--accent-red)] flex-shrink-0 mt-0.5" />
              <p class="text-[var(--accent-red)] text-xs leading-relaxed">
                Você precisa estar logado para se cadastrar como profissional.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-[var(--border-default)]">
          <div v-if="step < 3" class="flex gap-3">
            <button
              @click="step > 1 ? step-- : emit('close')"
              class="w-12 h-12 rounded-2xl border border-[var(--border-raised)] flex items-center justify-center hover:bg-[var(--bg-raised)] transition-colors shrink-0"
            >
              <span class="text-[var(--text-muted)] text-lg leading-none">✕</span>
            </button>
            <button
              @click="step === 1 ? (canProceedStep1() && step++) : (canProceedStep2() && step++)"
              :disabled="step === 1 ? !canProceedStep1() : !canProceedStep2()"
              class="flex-1 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-bold rounded-2xl text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo passo <ChevronRight class="w-4 h-4" />
            </button>
          </div>
          <div v-else>
            <button
              @click="submit"
              :disabled="loading || !auth.user"
              class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-bold rounded-2xl text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Briefcase class="w-4 h-4" />
              {{ loading ? 'Criando perfil...' : 'Confirmar e Criar Perfil' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
