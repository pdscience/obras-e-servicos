<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Star, MapPin, CheckCircle2, Crown,
  Phone, MessageCircle, Briefcase, Wrench, Hammer, Shovel,
  Paintbrush, House, Zap, Wind, Cpu, Frame, Sparkles, Trees,
  Truck, Leaf, Shield, Building2, Users, Award, Clock
} from '@lucide/vue'
import CategoryFilters from '../components/CategoryFilters.vue'
import { professionals, mainCategories } from '../data/mockData'
import { listarProfissionaisPorCategoria, listarTodasProfissoes } from '../services/api'
import { rankingProfissionais } from '../utils/matching'
import type { Component } from 'vue'
import type { MainCategory, Professional } from '../types'
import { CORES_PLANO, PLANOS, obterPlanoEficaz } from '../config/planos'

function getPlanInfo(pro: Professional) {
  const { plano, isGratis } = obterPlanoEficaz(pro.premium_plano, pro.premium, pro.data_inicio_gratis)
  const cores = CORES_PLANO[plano]
  const nome = PLANOS[plano].nome
  const label = isGratis ? `${nome} (Grátis)` : nome
  return { plano, cores, nome, label, isGratis }
}

const route = useRoute()
const router = useRouter()

const props = defineProps<{
  filterUf?: string | null
  filterCity?: string | null
  filterSearchTerm?: string
}>()

const localUf = ref<string | null>(props.filterUf ?? null)
const localCity = ref<string | null>(props.filterCity ?? null)
const localSearchTerm = ref<string>(props.filterSearchTerm ?? '')
const profissaoParam = route.query.profissao as string | undefined

const mainCategory = computed<MainCategory>(() => {
  const slug = route.params.slug as string
  return mainCategories.find(mc => mc.id === slug) || mainCategories[0]
})

const emit = defineEmits<{
  back: []
  viewProfile: [professional: Professional]
  'update:uf': [value: string | null]
  'update:city': [value: string | null]
  'update:searchTerm': [value: string]
  clearFilters: []
}>()

const iconMap: Record<string, Component> = {
  Hammer, Shovel, Paintbrush, House, Zap, Wind, Cpu, Frame,
  Sparkles, Trees, Truck, Leaf, Shield, Building2, Wrench
}

function getIcon(name: string) {
  return iconMap[name] || Hammer
}

const selectedProfession = ref<string>('all')
const filterCategoryLocal = ref<string>(profissaoParam ?? '')
const realPros = ref<Professional[]>([])
const loadingReal = ref(true)
const profissoes = ref<string[]>([])

onMounted(async () => {
  try {
    const [pros, profissoesData] = await Promise.all([
      listarProfissionaisPorCategoria(mainCategory.value.name),
      listarTodasProfissoes()
    ])
    realPros.value = pros
    profissoes.value = [...new Set(profissoesData.map(p => p.nome))].sort()
  } catch { /* fallback */ }
  loadingReal.value = false
})

function matchesLocation(p: Professional): boolean {
  if (localUf.value && p.uf !== localUf.value) return false
  if (localCity.value) {
    const city = p.location.split(',')[0]?.trim()
    if (city !== localCity.value) return false
  }
  if (localSearchTerm.value) {
    const term = localSearchTerm.value.toLowerCase()
    if (!p.name.toLowerCase().includes(term) && !p.category.toLowerCase().includes(term) && !p.description?.toLowerCase().includes(term)) return false
  }
  return true
}

const allCategoryPros = computed(() => {
  if (realPros.value.length > 0) {
    return realPros.value
  }
  const mockPros = professionals.filter(p => p.mainCategoryId === mainCategory.value.id)
  const mockRanked = rankingProfissionais(mockPros, {}).map(m => m.professional)
  const seen = new Set<string>()
  return mockRanked.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
})

const visibleCategoryPros = computed(() => {
  return allCategoryPros.value.filter(matchesLocation)
})

const totalWithoutFilter = computed(() => allCategoryPros.value.length)

interface ProfessionGroup {
  name: string
  professionals: Professional[]
}

const professionGroups = computed<ProfessionGroup[]>(() => {
  return mainCategory.value.professions.map((prof: string) => ({
    name: prof,
    professionals: visibleCategoryPros.value.filter(
      p => p.category === prof || p.subcategory === prof || p.specialties?.some(s => s === prof)
    )
  }))
})

const filteredPros = computed(() => {
  const professionFilter = selectedProfession.value !== 'all' ? selectedProfession.value : filterCategoryLocal.value
  if (!professionFilter) return visibleCategoryPros.value
  return visibleCategoryPros.value.filter(p =>
    p.category === professionFilter ||
    p.subcategory === professionFilter ||
    p.specialties?.some(s => s === professionFilter)
  )
})

const hasAnyPro = computed(() => visibleCategoryPros.value.length > 0)

const availableProfessions = computed(() =>
  professionGroups.value.filter(g => g.professionals.length > 0)
)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'categories' })
  }
}

function viewProfile(pro: Professional) {
  router.push({ name: 'profile', params: { id: pro.id } })
}
</script>

<template>
  <div class="min-h-screen" style="background:var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        @click="goBack()"
        class="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors mb-6"
      >
        <ArrowLeft class="w-4 h-4" />
        <span class="text-sm font-medium">Voltar para Categorias</span>
      </button>

      <header
        class="rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden border"
        :style="{ background: mainCategory.color + '0a', borderColor: mainCategory.color + '33' }"
      >
        <div
          class="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30"
          :style="{ background: mainCategory.color }"
        ></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
            :style="{ background: mainCategory.color + '25' }"
          >
            <component
              :is="getIcon(mainCategory.icon)"
              class="w-10 h-10"
              :style="{ color: mainCategory.color }"
            />
          </div>

          <div class="flex-1">
            <span
              class="text-xs font-bold uppercase tracking-wider"
              :style="{ color: mainCategory.color }"
            >
              Categoria
            </span>
            <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-1 mb-2">
              {{ mainCategory.name }}
            </h1>
            <p class="text-[var(--text-muted)] max-w-2xl">{{ mainCategory.description }}</p>

            <div class="flex flex-wrap items-center gap-4 mt-4 text-sm">
              <div class="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Users class="w-4 h-4" :style="{ color: mainCategory.color }" />
                <span><strong class="text-[var(--text-primary)]">{{ mainCategory.professions.length }}</strong> profissões</span>
              </div>
              <div class="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Briefcase class="w-4 h-4" :style="{ color: mainCategory.color }" />
                <span>
                  <strong class="text-[var(--text-primary)]">{{ visibleCategoryPros.length }}</strong>
                  <template v-if="(filterUf || filterCity) && visibleCategoryPros.length !== totalWithoutFilter">
                    de {{ totalWithoutFilter }} profissionais
                  </template>
                  <template v-else>profissionais cadastrados</template>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CategoryFilters
        :uf="localUf"
        :city="localCity"
        :search-term="localSearchTerm"
        :filter-category="filterCategoryLocal"
        :professions="profissoes"
        @update:uf="(v) => { localUf = v; localCity = null }"
        @update:city="(v) => localCity = v"
        @update:search-term="(v) => localSearchTerm = v"
        @update:filter-category="(v) => { filterCategoryLocal = v; selectedProfession = 'all' }"
        @clear="localUf = null; localCity = null; localSearchTerm = ''; filterCategoryLocal = ''; selectedProfession = 'all'"
      />

      <section class="mb-10">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Award class="w-5 h-5" :style="{ color: mainCategory.color }" />
          Profissões desta categoria
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            @click="selectedProfession = 'all'; filterCategoryLocal = ''"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            :class="selectedProfession === 'all' && !filterCategoryLocal
              ? 'text-[var(--text-on-accent)]'
              : 'bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-raised)]'"
            :style="selectedProfession === 'all' && !filterCategoryLocal ? { background: mainCategory.color } : {}"
          >
            Todas ({{ visibleCategoryPros.length }})
          </button>
          <button
            v-for="group in availableProfessions"
            :key="group.name"
            @click="selectedProfession = group.name; filterCategoryLocal = group.name"
            class="px-4 py-2 rounded-full text-sm font-medium transition-all"
            :class="selectedProfession === group.name || filterCategoryLocal === group.name
              ? 'text-[var(--text-on-accent)]'
              : 'bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-raised)]'"
            :style="selectedProfession === group.name || filterCategoryLocal === group.name ? { background: mainCategory.color } : {}"
          >
            {{ group.name }} ({{ group.professionals.length }})
          </button>
        </div>
      </section>

      <section v-if="hasAnyPro" class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-[var(--text-primary)]">
            {{ selectedProfession === 'all'
              ? 'Todos os Profissionais'
              : `Profissionais de ${selectedProfession}` }}
          </h2>
          <span class="text-sm text-[var(--text-muted)]">
            {{ filteredPros.length }} {{ filteredPros.length === 1 ? 'resultado' : 'resultados' }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="pro in filteredPros"
            :key="pro.id"
            @click="viewProfile(pro)"
            class="group bg-gradient-to-b from-[var(--bg-raised)] to-[var(--bg-card)] border rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            :style="{ borderColor: getPlanInfo(pro).cores.ring, boxShadow: `0 4px 6px ${getPlanInfo(pro).cores.ring}` }"
          >
            <div
              class="px-4 py-2 flex items-center justify-between shrink-0"
              :style="{ background: `linear-gradient(to right, ${getPlanInfo(pro).cores.from}, ${getPlanInfo(pro).cores.to})` }"
            >
              <div class="flex items-center gap-2">
                <Crown class="w-4 h-4 text-white" />
                <span class="text-white text-xs font-bold uppercase tracking-wider">{{ getPlanInfo(pro).label }}</span>
              </div>
              <span v-if="getPlanInfo(pro).plano !== 'bronze'" class="text-white text-xs font-medium opacity-80">📌 Destaque</span>
            </div>

            <div class="p-5 flex flex-col flex-1">
              <div class="flex items-start gap-4 mb-4">
                <div class="relative shrink-0">
                  <img
                    :src="pro.avatar"
                    :alt="pro.name"
                    class="w-16 h-16 rounded-full object-cover ring-2 ring-offset-2 ring-offset-[var(--bg-card)]"
                    :style="{ '--tw-ring-color': getPlanInfo(pro).cores.ring }"
                  />
                  <div
                    v-if="pro.verified"
                    class="absolute -bottom-1 -right-1 bg-[var(--bg-card)] rounded-full p-0.5"
                  >
                    <CheckCircle2 class="w-5 h-5 text-[var(--accent-green)]" />
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors">
                    {{ pro.name }}
                  </h3>
                  <p
                    class="text-sm font-semibold truncate"
                    :style="pro.premium ? { color: mainCategory.color } : { color: 'var(--text-muted)' }"
                  >
                    {{ pro.category }}
                  </p>
                  <p class="text-xs text-[var(--text-subtle)] truncate">{{ pro.subcategory }}</p>
                  <div class="flex items-center gap-1 mt-1">
                    <MapPin class="w-3 h-3 text-[var(--text-subtle)]" />
                    <span class="text-xs text-[var(--text-subtle)] truncate">{{ pro.location }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3 mb-3">
                <div class="flex items-center gap-1 bg-[color-mix(in srgb,var(--accent-amber) 10%,transparent)] px-2 py-1 rounded-lg">
                  <Star class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
                  <span class="font-bold text-[var(--text-primary)] text-sm">{{ pro.rating }}</span>
                  <span class="text-[var(--text-subtle)] text-xs">({{ pro.reviewCount }})</span>
                </div>
                <div class="text-xs text-[var(--text-subtle)]">
                  <span class="font-medium text-[var(--text-muted)]">{{ pro.completedJobs }}</span> serv.
                </div>
                <div class="text-xs text-[var(--text-subtle)] flex items-center gap-1">
                  <Clock class="w-3 h-3" />
                  <span>{{ pro.responseTime }}</span>
                </div>
              </div>

              <p class="text-[var(--text-muted)] text-xs leading-relaxed line-clamp-2 mb-3">
                {{ pro.description }}
              </p>

              <div class="flex flex-wrap gap-1.5 mb-4">
                <span
                  v-for="(spec, i) in pro.specialties.slice(0, 3)"
                  :key="i"
                  class="text-[11px] px-2 py-1 rounded-full font-medium"
                  :style="{ background: mainCategory.color + '18', color: mainCategory.color }"
                >
                  {{ spec }}
                </span>
              </div>

              <div
                class="mt-auto pt-4 border-t flex items-center justify-between"
                :style="{ borderColor: getPlanInfo(pro).cores.ring }"
              >
                <div class="flex items-center gap-1.5">
                  <button
                    @click.stop
                    class="p-2 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-raised)] transition-colors"
                    title="Mensagem"
                  >
                    <MessageCircle class="w-4 h-4" />
                  </button>
                  <button
                    @click.stop
                    class="p-2 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-raised)] transition-colors"
                    title="Ligar"
                  >
                    <Phone class="w-4 h-4" />
                  </button>
                  <button
                    @click.stop="viewProfile(pro)"
                    class="px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all"
                    :style="{ background: getPlanInfo(pro).cores.from }"
                  >
                    Ver Perfil
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section
        v-else
        class="bg-[var(--bg-card)] border border-[var(--border-default)] border-dashed rounded-2xl p-12 text-center mb-12"
      >
        <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--bg-raised)]">
          <Users class="w-8 h-8 text-[var(--text-subtle)]" />
        </div>
        <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">
          <template v-if="filterUf || filterCity">
            Nenhum profissional nesta localização
          </template>
          <template v-else>
            Nenhum profissional cadastrado ainda
          </template>
        </h3>
        <p class="text-[var(--text-muted)] max-w-md mx-auto mb-6">
          <template v-if="filterUf || filterCity">
            Não encontramos profissionais de <strong>{{ mainCategory.name }}</strong> para esta região. Tente outro estado ou município.
          </template>
          <template v-else>
            Em breve teremos profissionais de <strong>{{ mainCategory.name }}</strong> disponíveis. Cadastre-se para ser avisado.
          </template>
        </p>
        <button
          v-if="filterUf || filterCity"
          @click="emit('clearFilters')"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          :style="{ background: mainCategory.color + '18', color: mainCategory.color }"
        >
          Limpar filtros
        </button>
      </section>

      <section v-if="selectedProfession === 'all'" class="mb-12">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Briefcase class="w-5 h-5" :style="{ color: mainCategory.color }" />
          Todas as profissões da categoria
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="group in professionGroups"
            :key="group.name"
            class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              :style="{ background: mainCategory.color + '18' }"
            >
              <Wrench
                class="w-5 h-5"
                :style="{ color: mainCategory.color }"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[var(--text-secondary)] truncate">{{ group.name }}</p>
              <p class="text-xs text-[var(--text-subtle)]">
                {{ group.professionals.length }}
                {{ group.professionals.length === 1 ? 'profissional' : 'profissionais' }}
              </p>
            </div>
            <span
              v-if="group.professionals.length > 0"
              class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
              :style="{ background: mainCategory.color + '18', color: mainCategory.color }"
            >
              Ativo
            </span>
            <span
              v-else
              class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[var(--bg-raised)] text-[var(--text-subtle)]"
            >
              Em breve
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
