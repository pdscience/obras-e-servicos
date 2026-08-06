<script setup lang="ts">
import {
  Hammer, Shovel, Paintbrush, House, Zap, Wind, Cpu, Frame,
  Sparkles, Trees, Truck, Leaf, Shield, Building2,
  ArrowRight, Wrench
} from '@lucide/vue'
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { ChevronDown } from '@lucide/vue'
import { mainCategories, professionals } from '../data/mockData'
import { contarProfissionaisPorCategoria } from '../services/api'
import type { Component } from 'vue'
import type { MainCategory, Professional } from '../types'

const props = withDefaults(defineProps<{
  compact?: boolean
  filterUf?: string | null
  filterCity?: string | null
  filterSearchTerm?: string
  maxItems?: number
}>(), {
  compact: false,
  filterUf: null,
  filterCity: null,
  filterSearchTerm: '',
  maxItems: 0
})

const emit = defineEmits<{
  mainCategorySelect: [mainCategory: MainCategory]
}>()

const realCounts = ref<Record<string, number>>({})

async function fetchCounts(uf?: string | null, cidade?: string | null) {
  try {
    realCounts.value = await contarProfissionaisPorCategoria(uf ?? null, cidade ?? null)
  } catch { /* fallback para mock */ }
}

onMounted(() => fetchCounts())

watch([() => props.filterUf, () => props.filterCity], ([uf, city]) => {
  fetchCounts(uf, city)
})

const iconMap: Record<string, Component> = {
  Hammer, Shovel, Paintbrush, House, Zap, Wind, Cpu, Frame,
  Sparkles, Trees, Truck, Leaf, Shield, Building2, Wrench
}

function getIcon(name: string) {
  return iconMap[name] || Hammer
}

function matchesFilter(p: Professional): boolean {
  if (props.filterUf && p.uf !== props.filterUf) return false
  if (props.filterCity) {
    const city = p.location.split(',')[0]?.trim()
    if (city !== props.filterCity) return false
  }
  return true
}

const visibleProfessions = 6
const visibleProfessionsCompact = 3

const enrichedCategories = computed(() => {
  const term = props.filterSearchTerm.toLowerCase().trim()
  const hasLocationFilter = !!props.filterUf || !!props.filterCity
  const list = mainCategories.map(mc => {
    if (term) {
      const matchesCategory = mc.name.toLowerCase().includes(term)
      const matchesProfession = mc.professions.some(p => p.toLowerCase().includes(term))
      if (!matchesCategory && !matchesProfession) {
        return { ...mc, professionalCount: 0, totalCount: 0, hasProfessionals: false, extraCount: 0, extraCountCompact: 0 }
      }
    }
    const dbCount = realCounts.value[mc.name] ?? 0
    const inCategory = professionals.filter(p => p.mainCategoryId === mc.id)
    const mockCount = inCategory.length
    const filteredCount = hasLocationFilter ? dbCount : (dbCount || inCategory.filter(matchesFilter).length)
    return {
      ...mc,
      color: '#d4a017',
      professionalCount: filteredCount,
      totalCount: dbCount || mockCount,
      hasProfessionals: filteredCount > 0,
      extraCount: Math.max(0, mc.professions.length - visibleProfessions),
      extraCountCompact: Math.max(0, mc.professions.length - visibleProfessionsCompact)
    }
  })
  let filtered = list
  if (hasLocationFilter) {
    filtered = list.filter(mc => mc.hasProfessionals)
  } else if (term) {
    filtered = list.filter(mc => mc.hasProfessionals || mc.name.toLowerCase().includes(term) || mc.professions.some(p => p.toLowerCase().includes(term)))
  }
  return props.maxItems > 0 ? filtered.slice(0, props.maxItems) : filtered
})

const expandedCategories = reactive<Record<string, boolean>>({})

function toggleExpand(mcId: string) {
  expandedCategories[mcId] = !expandedCategories[mcId]
}

function isExpanded(mcId: string) {
  return expandedCategories[mcId] || false
}

function selectCategory(mc: MainCategory) {
  emit('mainCategorySelect', mc)
}
</script>

<template>
  <section class="py-16 md:py-24" style="background:var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Serviços</span>
        <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-2 mb-4">Categorias de Serviços</h2>
        <p class="text-[var(--text-muted)] max-w-2xl mx-auto">Encontre profissionais especializados em diversas áreas da construção civil</p>
      </div>

      <div
        :class="compact
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'"
      >
        <article
          v-for="mc in enrichedCategories"
          :key="mc.id"
          @click="selectCategory(mc)"
          class="group bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
          :class="compact
            ? 'p-5 hover:shadow-xl'
            : `p-6 ${mc.hasProfessionals ? 'hover:border-[color-mix(in_srgb,var(--cat-color)_20%,transparent)] hover:shadow-card-hover' : 'opacity-90 hover:opacity-100'}`"
          :style="{ '--cat-color': mc.color }"
        >
          <div
            v-if="compact"
            class="absolute top-0 left-0 right-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity"
            :style="{ background: `linear-gradient(90deg, ${mc.color} 0%, ${mc.color}40 60%, transparent 100%)` }"
          ></div>

          <div
            v-if="compact"
            class="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
            :style="{ background: mc.color }"
          ></div>

          <div
            class="relative flex items-center justify-between"
            :class="compact ? 'mb-4' : 'items-start justify-between mb-4'"
          >
            <div
              :class="compact
                ? 'w-12 h-12 rounded-xl group-hover:scale-110 group-hover:rotate-3'
                : 'w-12 h-12 rounded-xl'"
              class="flex items-center justify-center transition-all duration-300 shrink-0"
              :style="compact
                ? { background: `linear-gradient(135deg, ${mc.color}30 0%, ${mc.color}10 100%)`, border: `1px solid ${mc.color}33` }
                : { background: mc.color + '18' }"
            >
              <component
                :is="getIcon(mc.icon)"
                :class="compact ? 'w-6 h-6' : 'w-6 h-6'"
                class="transition-colors"
                :style="{ color: mc.color }"
              />
            </div>

            <div
              v-if="compact"
              class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
              :style="{ background: mc.color + '18', color: mc.color }"
            >
              <span>{{ mc.professions.length }}</span>
              <span class="opacity-70">profs</span>
            </div>
          </div>

          <h3
            :class="compact
              ? 'text-base font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-gold)] transition-colors line-clamp-2 leading-tight'
              : 'text-base font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-gold)] transition-colors line-clamp-2'"
          >
            {{ mc.name }}
          </h3>

          <p
            v-if="!compact"
            class="text-sm text-[var(--text-muted)] mb-4 line-clamp-2 min-h-[2.5rem]"
          >
            {{ mc.description }}
          </p>

          <div
            v-if="compact"
            class="flex flex-wrap gap-1 mb-4"
          >
            <template v-if="isExpanded(mc.id)">
              <span
                v-for="prof in mc.professions"
                :key="prof"
                class="text-[10px] leading-none px-2 py-1 rounded-md bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-secondary)] font-medium"
              >
                {{ prof }}
              </span>
            </template>
            <button
              @click.stop="toggleExpand(mc.id)"
              class="text-[10px] leading-none px-2 py-1 rounded-md font-bold flex items-center gap-0.5 transition-all duration-200 hover:opacity-80"
              :style="{ background: mc.color + '25', color: mc.color }"
            >
              <template v-if="!isExpanded(mc.id)">
                {{ mc.professions.length }} profissões
              </template>
              <template v-else>
                Recolher
              </template>
              <ChevronDown
                class="w-3 h-3 transition-transform duration-200"
                :class="{ 'rotate-180': isExpanded(mc.id) }"
              />
            </button>
          </div>

          <div
            v-if="!compact"
            class="flex flex-wrap gap-1 mb-3"
          >
            <template v-if="isExpanded(mc.id)">
              <span
                v-for="prof in mc.professions"
                :key="prof"
                class="text-[10px] leading-none px-2 py-1 rounded-md bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-secondary)]"
              >
                {{ prof }}
              </span>
            </template>
            <button
              @click.stop="toggleExpand(mc.id)"
              class="text-[10px] leading-none px-2 py-1 rounded-md font-bold flex items-center gap-0.5 transition-all duration-200 hover:opacity-80"
              :style="{ background: mc.color + '18', color: mc.color }"
            >
              <template v-if="!isExpanded(mc.id)">
                {{ mc.professions.length }} profissões
              </template>
              <template v-else>
                Recolher
              </template>
              <ChevronDown
                class="w-3 h-3 transition-transform duration-200"
                :class="{ 'rotate-180': isExpanded(mc.id) }"
              />
            </button>
          </div>

          <div
            v-if="compact"
            class="mt-auto pt-3 border-t border-[var(--border-default)] flex items-center justify-between"
          >
            <span
              v-if="mc.professionalCount > 0"
              class="inline-flex items-center gap-1.5 text-[11px] text-[var(--accent-green)] font-bold"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse"></span>
              {{ mc.professionalCount }} {{ mc.professionalCount === 1 ? 'profissional' : 'profissionais' }}
            </span>
            <span
              v-else-if="mc.totalCount > 0"
              class="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-semibold"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--text-subtle)]"></span>
              Sem profissionais aqui
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-semibold"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--text-subtle)]"></span>
              Em breve
            </span>

            <span
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg group-hover:scale-110 transition-all"
              :style="{ background: mc.color + '20', color: mc.color }"
            >
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          <div
            v-else
            class="mt-auto pt-3 border-t border-[var(--border-default)] flex items-center justify-between"
          >
            <div class="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
              <span
                v-if="mc.professionalCount > 0"
                class="inline-flex items-center gap-1.5 text-[var(--accent-green)]"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]"></span>
                {{ mc.professionalCount }} {{ mc.professionalCount === 1 ? 'profissional' : 'profissionais' }}
              </span>
              <span
                v-else-if="mc.totalCount > 0"
                class="inline-flex items-center gap-1.5 text-[var(--text-muted)]"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--text-subtle)]"></span>
                Nenhum
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 text-[var(--text-muted)]"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--text-subtle)]"></span>
                Em breve
              </span>
            </div>

            <span
              class="inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
              :style="{ color: mc.color }"
            >
              Ver
              <ArrowRight class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
