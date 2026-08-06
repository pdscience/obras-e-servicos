<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Search, MapPin, Star, CheckCircle2, Crown,
  SlidersHorizontal, Grid3x3, List, ChevronLeft, ChevronRight
} from '@lucide/vue'
import { professionals as mockProfissionais, categories } from '../data/mockData'
import { listarProfissionais, mapPerfilToProfessional } from '../services/api'
import { ufs } from '../data/ufs'
import { getCitiesByUf } from '../data/cities'
import { useSearch } from '../composables/useSearch'
import { useGeolocation } from '../composables/useGeolocation'
import type { Professional } from '../types'

const props = defineProps<{
  initialCategory?: string
  initialLocation?: string
}>()

const emit = defineEmits<{
  viewProfile: [professional: Professional]
}>()

const dbLoading = ref(true)
const profissionais = ref<Professional[]>(structuredClone(mockProfissionais))

const {
  searchTerm, location, sortBy, filters,
  currentPage, pageSize,
  filteredProfessionals, paginatedResults, totalPages,
  clearFilters: limparFiltros,
} = useSearch(profissionais)

const selectedCity = ref('')
const cidades = ref<string[]>([])

watch(location, async (val) => {
  selectedCity.value = ''
  cidades.value = await getCitiesByUf(val || null)
})

const { userLat, userLng, loading: geoLoading, error: geoError, obterLocalizacao } = useGeolocation()

const showFilters = ref(false)
const sidebarOpen = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')

searchTerm.value = props.initialCategory || ''
location.value = props.initialLocation || ''

watch(() => props.initialCategory, (val) => { if (val) searchTerm.value = val })
watch(() => props.initialLocation, (val) => { if (val) location.value = val })

onMounted(async () => {
  try {
    const perfis = await listarProfissionais()
    if (perfis.length > 0) {
      profissionais.value = perfis.map(mapPerfilToProfessional)
    }
  } catch (e) {
    console.error('Erro ao carregar profissionais do banco:', e)
  } finally {
    dbLoading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Sidebar -->
    <div :class="['filters-sidebar', { open: sidebarOpen }]">
      <div class="sidebar-header">
        <h3>Filtros</h3>
        <button class="btn-close" @click="sidebarOpen = false">✕</button>
      </div>

      <div class="filter-group">
        <label>Categoria</label>
        <select v-model="filters.category" class="range-input w-full">
          <option value="">Todas</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Avaliação Mínima</label>
        <select v-model.number="filters.minRating" class="range-input w-full">
          <option :value="0">Qualquer</option>
          <option :value="4">4+ estrelas</option>
          <option :value="4.5">4.5+ estrelas</option>
          <option :value="4.8">4.8+ estrelas</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Preço Máximo / Hora</label>
        <select v-model.number="filters.maxPrice" class="range-input w-full">
          <option :value="50">Até R$ 50</option>
          <option :value="80">Até R$ 80</option>
          <option :value="100">Até R$ 100</option>
          <option :value="150">Até R$ 150</option>
          <option :value="200">Até R$ 200</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Experiência</label>
        <select v-model.number="filters.minExperience" class="range-input w-full">
          <option :value="0">Qualquer</option>
          <option :value="2">2+ anos</option>
          <option :value="5">5+ anos</option>
          <option :value="10">10+ anos</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Status</label>
        <div class="checkbox-list">
          <label class="checkbox-item"><input type="checkbox" v-model="filters.verified" /><span>Verificado</span></label>
          <label class="checkbox-item"><input type="checkbox" v-model="filters.available" /><span>Disponível</span></label>
        </div>
      </div>

      <div class="filter-group">
        <label>Raio de distância</label>
        <select v-model.number="filters.radius" class="range-input w-full">
          <option :value="0">Qualquer distância</option>
          <option :value="5">Até 5 km</option>
          <option :value="10">Até 10 km</option>
          <option :value="25">Até 25 km</option>
          <option :value="50">Até 50 km</option>
          <option :value="100">Até 100 km</option>
        </select>
        <button v-if="!userLat" @click="obterLocalizacao" class="mt-2 w-full text-xs text-[var(--accent-gold)] hover:text-[var(--accent-teal)] transition-colors flex items-center justify-center gap-1">
          <MapPin class="w-3 h-3" /> Usar minha localização
        </button>
        <p v-if="geoLoading" class="text-xs text-[var(--text-subtle)] mt-1">Obtendo localização...</p>
        <p v-if="geoError" class="text-xs text-[var(--accent-red)] mt-1">{{ geoError }}</p>
      </div>
      <div class="filter-actions">
        <button class="btn-clear" @click="limparFiltros">Limpar Filtros</button>
      </div>
    </div>

    <!-- Main -->
    <div :class="['platform-main', { 'sidebar-open': sidebarOpen }]">
      <!-- Search Bar -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1 relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
          <input v-model="searchTerm" type="text" placeholder="Buscar serviço ou profissional..." class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-transparent placeholder-[var(--text-subtle)]" />
        </div>
        <div class="relative">
          <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)] pointer-events-none" />
          <select v-model="location" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-transparent appearance-none cursor-pointer">
            <option value="">Estado (UF)</option>
            <option v-for="uf in ufs" :key="uf.sigla" :value="uf.sigla">{{ uf.sigla }} - {{ uf.nome }}</option>
          </select>
        </div>
        <div class="relative">
          <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)] pointer-events-none" />
          <select v-model="selectedCity" :disabled="!location" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            <option value="">{{ location ? 'Todos os municípios' : 'Selecione um estado' }}</option>
            <option v-for="city in cidades" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="btn-filter">Filtros <SlidersHorizontal class="w-4 h-4" /></button>
      </div>

      <!-- Results Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
          <p class="text-[var(--text-muted)]"><span class="font-semibold text-[var(--text-secondary)]">{{ filteredProfessionals.length }}</span> profissionais encontrados</p>
          <button v-if="!userLat" @click="obterLocalizacao" class="text-xs text-[var(--accent-gold)] hover:text-[var(--accent-teal)] transition-colors flex items-center gap-1">
            <MapPin class="w-3 h-3" /> Minha localização
          </button>
          <span v-if="geoLoading" class="text-xs text-[var(--text-subtle)]">Localizando...</span>
        </div>
        <div class="flex items-center gap-4">
          <select v-model="sortBy" class="px-3 py-2 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-lg text-sm text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]">
            <option value="rating">Melhor avaliação</option>
            <option value="price-low">Menor preço</option>
            <option value="price-high">Maior preço</option>
            <option value="experience">Mais experiente</option>
            <option value="reviews">Mais avaliações</option>
          </select>
          <div class="flex items-center bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-lg overflow-hidden">
            <button @click="viewMode = 'grid'" :class="['p-2', viewMode === 'grid' ? 'bg-[var(--accent-gold)] text-[var(--text-on-accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--border-default)]']"><Grid3x3 class="w-5 h-5" /></button>
            <button @click="viewMode = 'list'" :class="['p-2', viewMode === 'list' ? 'bg-[var(--accent-gold)] text-[var(--text-on-accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--border-default)]']"><List class="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <template v-if="filteredProfessionals.length > 0">
        <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'">
          <div
            v-for="pro in filteredProfessionals"
            :key="pro.id"
            @click="emit('viewProfile', pro)"
          >
            <!-- Card Premium (VIP / Destaque) -->
            <template v-if="pro.premium">
              <div v-if="viewMode === 'grid'"
                class="h-full relative bg-gradient-to-b from-[var(--bg-raised)] to-[var(--bg-card)] border border-[color-mix(in_srgb,var(--accent-gold)_27%,transparent)] rounded-2xl overflow-hidden shadow-lg hover:shadow-[color-mix(in_srgb,var(--accent-gold)_7%,transparent)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col"
              >
                <div class="bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] px-4 py-2 flex items-center justify-between shrink-0">
                  <div class="flex items-center gap-2">
                    <Crown class="w-4 h-4 text-[var(--text-on-accent)]" />
                    <span class="text-[var(--text-on-accent)] text-xs font-bold uppercase tracking-wider">Premium</span>
                  </div>
                  <span class="text-[var(--text-on-accent)] text-xs font-medium opacity-80">🎖️ Destaque</span>
                </div>
                <div class="p-5 flex flex-col flex-1">
                  <div class="flex items-start gap-4 mb-3">
                    <div class="relative">
                      <img :src="pro.avatar" :alt="pro.name" class="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--accent-gold)] ring-offset-2 ring-offset-[var(--bg-card)]" />
                      <div v-if="pro.available" class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[var(--accent-green)] border-2 border-[var(--bg-page)] rounded-full"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-0.5">
                        <h3 class="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors">{{ pro.name }}</h3>
                        <CheckCircle2 v-if="pro.verified" class="w-4 h-4 text-[var(--accent-green)] shrink-0" />
                      </div>
                      <p class="text-[var(--accent-gold)] text-sm font-medium">{{ pro.category }}</p>
                      <div class="flex items-center gap-1 mt-0.5">
                        <MapPin class="w-3 h-3 text-[var(--text-subtle)]" />
                        <span class="text-xs text-[var(--text-subtle)] truncate">{{ pro.location }}</span>
                        <span v-if="pro.distance" class="text-[var(--accent-gold)] text-xs ml-1">{{ pro.distance }} km</span>
                      </div>
                    </div>
                  </div>

                  <p class="text-[var(--text-muted)] text-xs leading-relaxed line-clamp-2 mb-3">{{ pro.description }}</p>

                  <div class="flex items-center gap-3 mb-3">
                    <div class="flex items-center gap-1 bg-[color-mix(in srgb,var(--accent-amber) 10%,transparent)] px-2 py-1 rounded-lg">
                      <Star class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
                      <span class="font-bold text-[var(--text-primary)] text-sm">{{ pro.rating }}</span>
                      <span class="text-[var(--text-subtle)] text-xs">({{ pro.reviewCount }})</span>
                    </div>
                    <div class="text-xs text-[var(--text-subtle)]">
                      <span class="font-medium text-[var(--text-muted)]">{{ pro.completedJobs }}</span> serv. realizados
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-1.5 mb-4">
                    <span v-for="(spec, i) in pro.specialties.slice(0, 3)" :key="i" class="text-xs bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)] px-2 py-1 rounded-full font-medium">{{ spec }}</span>
                  </div>

                  <div class="mt-auto flex items-center justify-end pt-3 border-t border-[color-mix(in_srgb,var(--accent-gold)_13%,transparent)]">
                    <div class="flex gap-2">
                      <button @click.stop="emit('viewProfile', pro)" class="px-4 py-2 bg-[var(--accent-gold)] text-[var(--text-on-accent)] rounded-lg text-sm font-semibold hover:shadow-lg transition-all">Agendar Agora</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Premium List View -->
              <div v-else class="bg-gradient-to-r from-[var(--bg-raised)] to-[var(--bg-card)] border border-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] rounded-xl p-4 shadow-md hover:shadow-[color-mix(in_srgb,var(--accent-gold)_7%,transparent)] transition-all cursor-pointer hover:-translate-x-0.5 group">
                <div class="flex items-start gap-4">
                  <div class="relative flex-shrink-0">
                    <img :src="pro.avatar" :alt="pro.name" class="w-16 h-16 rounded-xl object-cover ring-2 ring-[var(--accent-gold)]" />
                    <div v-if="pro.verified" class="absolute -bottom-1 -right-1 bg-[var(--bg-card)] rounded-full p-0.5"><CheckCircle2 class="w-5 h-5 text-[var(--accent-green)]" /></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">{{ pro.name }}</h3>
                          <span class="flex items-center gap-1 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-xs px-2 py-0.5 rounded-full font-bold"><Crown class="w-3 h-3" /> Premium</span>
                        </div>
                        <p class="text-[var(--accent-gold)] text-sm font-medium">{{ pro.category }}</p>
                        <div class="flex items-center gap-1 mt-1 text-[var(--text-muted)] text-sm">
                          <MapPin class="w-3 h-3" /> {{ pro.location }} <span v-if="pro.distance" class="text-[var(--accent-gold)]">• {{ pro.distance }} km</span>
                        </div>
                        <div class="flex items-center gap-3 mt-2">
                          <div class="flex items-center gap-1"><Star class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" /><span class="font-semibold text-[var(--text-primary)] text-sm">{{ pro.rating }}</span><span class="text-[var(--text-subtle)] text-xs">({{ pro.reviewCount }})</span></div>
                          <span class="text-xs text-[var(--text-subtle)]">{{ pro.completedJobs }} serviços</span>
                        </div>
                      </div>
                      <div class="text-right flex flex-col items-end gap-2">
                        <p class="text-lg font-bold text-[var(--text-primary)]">R$ {{ pro.pricePerHour }}<span class="text-sm font-normal text-[var(--text-subtle)]">/h</span></p>
                        <button @click.stop="emit('viewProfile', pro)" class="px-4 py-2 bg-[var(--accent-gold)] text-[var(--text-on-accent)] rounded-lg text-sm font-semibold hover:shadow-lg transition-all whitespace-nowrap">Agendar Agora</button>
                      </div>
                    </div>
                    <p class="text-[var(--text-muted)] text-sm mt-1 line-clamp-1">{{ pro.description }}</p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Card Básico (Clean, foco em reputação) -->
            <template v-else>
              <div v-if="viewMode === 'grid'"
                class="h-full relative bg-gradient-to-b from-[var(--bg-raised)] to-[var(--bg-card)] border border-[var(--border-raised)] rounded-2xl overflow-hidden shadow-lg hover:shadow-[color-mix(in_srgb,var(--text-muted)_7%,transparent)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col"
              >
                <div class="bg-gradient-to-r from-[var(--text-muted)] to-[var(--muted-dark)] px-4 py-2 flex items-center justify-between shrink-0">
                  <div class="flex items-center gap-2">
                    <Crown class="w-4 h-4 text-[var(--text-on-accent)]" />
                    <span class="text-[var(--text-on-accent)] text-xs font-bold uppercase tracking-wider">Profissional</span>
                  </div>
                  <span class="text-[var(--text-on-accent)] text-xs font-medium opacity-60">Profissional</span>
                </div>
                <div class="p-5 flex flex-col flex-1">
                  <div class="flex items-start gap-4 mb-3">
                    <div class="relative">
                      <img :src="pro.avatar" :alt="pro.name" class="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--text-muted)] ring-offset-2 ring-offset-[var(--bg-card)]" />
                      <div v-if="pro.verified" class="absolute -bottom-1 -right-1 bg-[var(--bg-card)] rounded-full p-0.5"><CheckCircle2 class="w-5 h-5 text-[var(--accent-green)]" /></div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors">{{ pro.name }}</h3>
                      <p class="text-[var(--text-muted)] text-sm font-medium">{{ pro.category }}</p>
                      <div class="flex items-center gap-1 mt-1"><MapPin class="w-3 h-3 text-[var(--text-subtle)]" /><span class="text-xs text-[var(--text-subtle)] truncate">{{ pro.location }}</span></div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 mb-3">
                    <div class="flex items-center gap-1 bg-[color-mix(in srgb,var(--accent-amber) 10%,transparent)] px-2 py-1 rounded-lg">
                      <Star class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
                      <span class="font-bold text-[var(--text-primary)] text-sm">{{ pro.rating }}</span>
                      <span class="text-[var(--text-subtle)] text-xs">({{ pro.reviewCount }})</span>
                    </div>
                    <div class="text-xs text-[var(--text-subtle)]"><span class="font-medium text-[var(--text-muted)]">{{ pro.completedJobs }}</span> serv.</div>
                  </div>
                  <p class="text-[var(--text-muted)] text-xs leading-relaxed line-clamp-2 mb-3">{{ pro.description }}</p>
                  <div class="flex flex-wrap gap-1.5 mb-4">
                    <span v-for="(spec, i) in pro.specialties.slice(0, 3)" :key="i" class="text-xs bg-[color-mix(in srgb,var(--text-muted) 10%,transparent)] text-[var(--text-muted)] px-2 py-1 rounded-full font-medium">{{ spec }}</span>
                  </div>
                  <div class="mt-auto flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
                    <div><span class="text-xs text-[var(--text-subtle)]">R$ {{ pro.pricePerHour }}<span class="text-xs">/h</span></span></div>
                    <button @click.stop="emit('viewProfile', pro)" class="px-4 py-2 bg-[var(--bg-raised)] text-[var(--text-muted)] rounded-lg text-sm font-medium hover:bg-[var(--border-default)] transition-all">Ver Perfil</button>
                  </div>
                </div>
              </div>

              <!-- Basic List View -->
              <div v-else class="bg-gradient-to-r from-[var(--bg-raised)] to-[var(--bg-card)] border border-[var(--border-raised)] rounded-xl p-4 shadow-md hover:shadow-[color-mix(in_srgb,var(--text-muted)_7%,transparent)] transition-all cursor-pointer hover:-translate-x-0.5 group">
                <div class="flex items-start gap-3">
                  <div class="relative flex-shrink-0">
                    <img :src="pro.avatar" :alt="pro.name" class="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--text-muted)]" />
                    <div v-if="pro.verified" class="absolute -bottom-1 -right-1 bg-[var(--bg-card)] rounded-full p-0.5"><CheckCircle2 class="w-5 h-5 text-[var(--accent-green)]" /></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">{{ pro.name }}</h3>
                          <span class="flex items-center gap-1 bg-[var(--text-muted)] text-[var(--text-on-accent)] text-xs px-2 py-0.5 rounded-full font-bold"><Crown class="w-3 h-3" /> Profissional</span>
                        </div>
                        <p class="text-[var(--text-muted)] text-sm font-medium">{{ pro.category }}</p>
                        <div class="flex items-center gap-1 mt-1 text-[var(--text-muted)] text-sm">
                          <MapPin class="w-3 h-3" /> {{ pro.location }}
                        </div>
                        <div class="flex items-center gap-3 mt-2">
                          <div class="flex items-center gap-1"><Star class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" /><span class="font-semibold text-[var(--text-primary)] text-sm">{{ pro.rating }}</span><span class="text-[var(--text-subtle)] text-xs">({{ pro.reviewCount }})</span></div>
                          <span class="text-xs text-[var(--text-subtle)]">{{ pro.completedJobs }} serviços</span>
                        </div>
                      </div>
                      <div class="text-right flex flex-col items-end gap-2">
                        <p class="text-lg font-bold text-[var(--text-primary)]">R$ {{ pro.pricePerHour }}<span class="text-sm font-normal text-[var(--text-subtle)]">/h</span></p>
                        <button @click.stop="emit('viewProfile', pro)" class="px-4 py-2 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] rounded-lg text-sm font-medium hover:bg-[var(--border-default)] transition-all whitespace-nowrap">Ver Perfil</button>
                      </div>
                    </div>
                    <p class="text-[var(--text-muted)] text-sm mt-1 line-clamp-1">{{ pro.description }}</p>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
      <div v-else class="text-center py-16">
        <div class="w-20 h-20 bg-[var(--bg-raised)] rounded-full flex items-center justify-center mx-auto mb-4"><Search class="w-10 h-10 text-[var(--text-subtle)]" /></div>
        <h3 class="text-xl font-semibold text-[var(--text-secondary)] mb-2">Nenhum profissional encontrado</h3>
        <p class="text-[var(--text-subtle)] max-w-md mx-auto">Tente ajustar os filtros ou buscar por outra categoria de serviço.</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
        <button
          :disabled="currentPage <= 1"
          @click="currentPage--"
          class="p-2 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-default)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        ><ChevronLeft class="w-4 h-4" /></button>

        <template v-for="page in totalPages" :key="page">
          <button
            v-if="page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2"
            @click="currentPage = page"
            :class="[
              'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-[var(--accent-gold)] text-[var(--text-on-accent)]'
                : 'bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] hover:bg-[var(--border-default)]'
            ]"
          >{{ page }}</button>
          <span
            v-else-if="page === currentPage - 3 || page === currentPage + 3"
            class="text-[var(--text-subtle)] px-1"
          >...</span>
        </template>

        <button
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
          class="p-2 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-default)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        ><ChevronRight class="w-4 h-4" /></button>
      </div>
    </div>
  </div>
</template>
