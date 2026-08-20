<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Store, MapPin, Star, CheckCircle2, ExternalLink, ChevronRight,
  Phone, Globe, Clock, Tag, X, Filter
} from '@lucide/vue'
import { listarLojistas, mapLojistaToPerfil, listarCategorias } from '../services/api'
import { ufs } from '../data/ufs'
import { getCitiesByUf } from '../data/cities'
import type { PerfilLojista } from '../types'

const router = useRouter()

const dbLoading = ref(true)
const lojistas = ref<PerfilLojista[]>([])
const categorias = ref<string[]>([])

const searchTerm = ref('')
const filterUf = ref<string | null>(null)
const filterCity = ref<string | null>(null)
const filterCategory = ref<string | null>(null)

const cities = ref<string[]>([])

watch(filterUf, async (val) => {
  filterCity.value = null
  cities.value = await getCitiesByUf(val)
})

onMounted(async () => {
  try {
    const [data, categoriasData] = await Promise.all([
      listarLojistas(),
      listarCategorias()
    ])
    lojistas.value = data.map(mapLojistaToPerfil)
    categorias.value = [...new Set(categoriasData.map(c => c.nome))].sort()
  } catch (e) {
    console.error('Erro ao carregar dados:', e)
  } finally {
    dbLoading.value = false
  }
})

watch(() => filterUf.value, (newUf, oldUf) => {
  if (newUf !== oldUf) {
    filterCity.value = null
  }
})

function onUfChange(event: Event) {
  filterUf.value = (event.target as HTMLSelectElement).value || null
}

function onCityChange(event: Event) {
  filterCity.value = (event.target as HTMLSelectElement).value || null
}

function onCategoryChange(event: Event) {
  filterCategory.value = (event.target as HTMLSelectElement).value || null
}

function clearFilters() {
  filterUf.value = null
  filterCity.value = null
  filterCategory.value = null
  searchTerm.value = ''
}

const hasFilter = computed(() => filterUf.value || filterCity.value || filterCategory.value || searchTerm.value)

const filteredLojas = computed(() => {
  return lojistas.value.filter(l => {
    if (filterUf.value && l.uf !== filterUf.value) return false
    if (filterCity.value && l.cidade !== filterCity.value) return false
    if (filterCategory.value) {
      const hasMatch = l.categorias.some(c =>
        c.toLowerCase() === filterCategory.value!.toLowerCase()
      )
      if (!hasMatch) return false
    }
    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      const matchName = l.nome.toLowerCase().includes(term)
      const matchDesc = l.descricao.toLowerCase().includes(term)
      const matchCat = l.categorias.some(c => c.toLowerCase().includes(term))
      if (!matchName && !matchDesc && !matchCat) return false
    }
    return true
  })
})

function abrirMapaLoja(loja: PerfilLojista) {
  const query = encodeURIComponent(`${loja.endereco}, ${loja.cidade}, ${loja.uf}`)
  window.open(`https://www.google.com/maps/search/${query}`, '_blank')
}

function formatHorario(horario: Record<string, unknown>): string {
  const entries = Object.values(horario).filter(Boolean)
  if (entries.length === 0) return ''
  return entries.slice(0, 2).map(String).join(' • ')
}
</script>

<template>
  <div class="min-h-screen" style="background:var(--bg-page)">
    <section class="py-12 md:py-16" style="background:var(--bg-page)">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto">
          <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Marketplace</span>
          <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-2 mb-4">
            Lojas de Materiais e Insumos
          </h1>
          <p class="text-[var(--text-muted)]">
            Encontre lojas verificadas com tudo o que você precisa para sua obra ou reforma. Filtre por estado, município e categoria de produto.
          </p>
        </div>
      </div>
    </section>

    <section class="py-8" style="background:var(--bg-page)">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-[color-mix(in_srgb,var(--accent-gold)_4%,transparent)] border border-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-4">
            <Filter class="w-4 h-4 text-[var(--accent-gold)]" />
            <h2 class="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Filtros</h2>
            <button
              v-if="hasFilter"
              @click="clearFilters"
              class="ml-auto inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
            >
              <X class="w-3.5 h-3.5" />
              Limpar tudo
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Categoria</label>
              <div class="relative">
                <select
                  :value="filterCategory ?? ''"
                  @change="onCategoryChange"
                  class="w-full appearance-none bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-lg pl-9 pr-8 py-2.5 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-gold)] focus:border-[var(--accent-gold)] focus:outline-none transition-colors cursor-pointer"
                  style="max-height: 200px; overflow-y: auto;"
                >
                  <option value="">Todas as categorias</option>
                  <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <Tag class="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Estado (UF)</label>
              <div class="relative">
                <select
                  :value="filterUf ?? ''"
                  @change="onUfChange"
                  class="w-full appearance-none bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-lg pl-9 pr-8 py-2.5 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-gold)] focus:border-[var(--accent-gold)] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">Todos os estados</option>
                  <option v-for="u in ufs" :key="u.sigla" :value="u.sigla">{{ u.sigla }} - {{ u.nome }}</option>
                </select>
                <MapPin class="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Município</label>
              <div class="relative">
                <select
                  :value="filterCity ?? ''"
                  @change="onCityChange"
                  :disabled="!filterUf"
                  class="w-full appearance-none bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-lg pl-9 pr-8 py-2.5 text-sm text-[var(--text-secondary)] focus:border-[var(--accent-gold)] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">{{ filterUf ? 'Todos os municípios' : 'Selecione um estado' }}</option>
                  <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
                </select>
                <MapPin class="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <span class="text-[var(--text-muted)]">
              <strong class="text-[var(--text-secondary)]">{{ filteredLojas.length }}</strong>
              {{ filteredLojas.length === 1 ? 'loja encontrada' : 'lojas encontradas' }}
            </span>
            <span v-if="filterUf" class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)] font-semibold">
              {{ filterUf }}
              <button @click="filterUf = null; filterCity = null" class="hover:opacity-80"><X class="w-3 h-3" /></button>
            </span>
            <span v-if="filterCity" class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[color-mix(in srgb,var(--accent-teal) 10%,transparent)] text-[var(--accent-teal)] font-semibold">
              {{ filterCity }}
              <button @click="filterCity = null" class="hover:opacity-80"><X class="w-3 h-3" /></button>
            </span>
            <span v-if="filterCategory" class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)] text-[var(--accent-green)] font-semibold">
              {{ filterCategory }}
              <button @click="filterCategory = null" class="hover:opacity-80"><X class="w-3 h-3" /></button>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-16" style="background:var(--bg-page)">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="filteredLojas.length === 0" class="bg-[var(--bg-card)] border border-[var(--border-default)] border-dashed rounded-2xl p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--bg-raised)]">
            <Store class="w-8 h-8 text-[var(--text-subtle)]" />
          </div>
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">Nenhuma loja encontrada</h3>
          <p class="text-[var(--text-muted)] max-w-md mx-auto mb-6">
            <template v-if="hasFilter">
              Não encontramos lojas com esses filtros. Tente ampliar sua busca.
            </template>
            <template v-else>
              Em breve teremos lojas cadastradas. Cadastre-se para ser avisado.
            </template>
          </p>
          <button
            v-if="hasFilter"
            @click="clearFilters"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)] hover:bg-[color-mix(in srgb,var(--accent-gold) 20%,transparent)] transition-colors"
          >
            <X class="w-4 h-4" />
            Limpar filtros
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="loja in filteredLojas"
            :key="loja.id"
            class="group bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-card-hover hover:border-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] flex flex-col"
          >
            <div
              class="relative h-32 bg-gradient-to-br from-[var(--bg-raised)] to-[var(--bg-card)] overflow-hidden cursor-pointer"
              @click="router.push({ name: 'lojista', params: { id: loja.id } })"
            >
              <img
                :src="loja.avatar"
                :alt="loja.nome"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent"></div>

              <div
                v-if="loja.verificado"
                class="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 bg-[var(--accent-green)] text-[var(--text-on-accent)] rounded-md text-[10px] font-bold uppercase tracking-wider"
              >
                <CheckCircle2 class="w-3 h-3" />
                Verificada
              </div>
            </div>

            <div class="p-5 flex flex-col flex-1">
              <div class="flex items-start gap-3 mb-3">
                <div
                  class="w-12 h-12 rounded-xl overflow-hidden border-2 border-[var(--border-default)] -mt-10 relative z-10 shrink-0 cursor-pointer"
                  @click="router.push({ name: 'lojista', params: { id: loja.id } })"
                >
                  <img :src="loja.avatar" :alt="loja.nome" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0 pt-1">
                  <h3
                    @click="router.push({ name: 'lojista', params: { id: loja.id } })"
                    class="font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
                  >
                    {{ loja.nome_fantasia || loja.nome }}
                  </h3>
                  <p class="text-xs text-[var(--text-subtle)] truncate">{{ loja.razao_social || loja.nome }}</p>
                </div>
              </div>

              <p class="text-sm text-[var(--text-muted)] line-clamp-2 mb-3 min-h-[2.5rem]">
                {{ loja.descricao }}
              </p>

              <div class="flex items-center gap-3 mb-3 text-xs">
                <div class="flex items-center gap-1 bg-[color-mix(in srgb,var(--accent-amber) 10%,transparent)] px-2 py-1 rounded-lg">
                  <Star class="w-3.5 h-3.5 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
                  <span class="font-bold text-[var(--text-primary)]">{{ loja.avaliacao_media }}</span>
                  <span class="text-[var(--text-subtle)]">({{ loja.total_avaliacoes }})</span>
                </div>
                <div class="flex items-center gap-1 text-[var(--text-muted)]">
                  <MapPin class="w-3 h-3 text-[var(--accent-gold)]" />
                  <span class="font-medium">{{ loja.cidade }}, {{ loja.uf }}</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-1.5 mb-4">
                <span
                  v-for="cat in loja.categorias.slice(0, 4)"
                  :key="cat"
                  class="text-[10px] leading-none px-2 py-1 rounded-md bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)] font-semibold"
                >
                  {{ cat }}
                </span>
                <span
                  v-if="loja.categorias.length > 4"
                  class="text-[10px] leading-none px-2 py-1 rounded-md bg-[var(--bg-raised)] text-[var(--text-muted)] font-semibold"
                >
                  +{{ loja.categorias.length - 4 }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 mb-4 text-[11px]">
                <div
                  v-if="loja.telefone_comercial"
                  class="flex items-center gap-1.5 text-[var(--text-muted)]"
                >
                  <Phone class="w-3 h-3 text-[var(--accent-gold)]" />
                  <span class="truncate">{{ loja.telefone_comercial }}</span>
                </div>
                <div
                  v-if="loja.site"
                  class="flex items-center gap-1.5 text-[var(--text-muted)]"
                >
                  <Globe class="w-3 h-3 text-[var(--accent-gold)]" />
                  <span class="truncate">Site</span>
                </div>
                <div
                  v-if="Object.keys(loja.horario_funcionamento || {}).length > 0"
                  class="flex items-center gap-1.5 text-[var(--text-muted)] col-span-2"
                >
                  <Clock class="w-3 h-3 text-[var(--accent-gold)]" />
                  <span class="truncate">{{ formatHorario(loja.horario_funcionamento) }}</span>
                </div>
              </div>

              <div class="mt-auto pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                <button
                  @click.stop="abrirMapaLoja(loja)"
                  class="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <ExternalLink class="w-3 h-3" />
                  Ver no mapa
                </button>
                <button
                  @click="router.push({ name: 'lojista', params: { id: loja.id } })"
                  class="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-gold)] hover:text-[var(--accent-dark-gold)] transition-colors"
                >
                  Ver loja
                  <ChevronRight class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
