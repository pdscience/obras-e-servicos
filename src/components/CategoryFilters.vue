<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MapPin, X, Filter, Tag } from '@lucide/vue'
import { ufs } from '../data/ufs'
import { getCitiesByUf } from '../data/cities'
import { mainCategories } from '../data/mockData'

const props = defineProps<{
  uf: string | null
  city: string | null
  searchTerm: string
  filterCategory: string
  professions?: string[]
}>()

const emit = defineEmits<{
  'update:uf': [value: string | null]
  'update:city': [value: string | null]
  'update:searchTerm': [value: string]
  'update:filterCategory': [value: string]
  clear: []
}>()

const cities = ref<string[]>([])

watch(() => props.uf, async (newUf, oldUf) => {
  if (newUf !== oldUf) emit('update:city', null)
  cities.value = await getCitiesByUf(newUf)
}, { immediate: true })

function onUfChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:uf', value || null)
}

function onCityChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:city', value || null)
}

function clear() {
  emit('update:filterCategory', '')
  emit('clear')
}

const hasFilter = computed(() => props.uf || props.city || props.filterCategory)
</script>

<template>
  <div class="bg-[color-mix(in_srgb,var(--accent-gold)_4%,transparent)] border border-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] rounded-2xl p-5">
    <div class="flex items-center gap-2 mb-4">
      <Filter class="w-4 h-4 text-[var(--accent-gold)]" />
      <h2 class="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Filtros</h2>
      <button
        v-if="hasFilter"
        @click="clear"
        class="ml-auto inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
      >
        <X class="w-3.5 h-3.5" />
        Limpar tudo
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div>
        <label class="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
          {{ professions ? 'Profissão' : 'Categoria' }}
        </label>
        <div class="relative">
          <select
            :value="filterCategory"
            @change="emit('update:filterCategory', ($event.target as HTMLSelectElement).value)"
            class="w-full appearance-none bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-lg pl-9 pr-8 py-2.5 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-gold)] focus:border-[var(--accent-gold)] focus:outline-none transition-colors cursor-pointer"
            :class="professions ? 'max-h-[200px] overflow-y-auto' : ''"
          >
            <option value="">{{ professions ? 'Todas as profissões' : 'Todas as categorias' }}</option>
            <template v-if="professions">
              <option v-for="prof in professions" :key="prof" :value="prof">{{ prof }}</option>
            </template>
            <template v-else>
              <option v-for="cat in mainCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
            </template>
          </select>
          <Tag class="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Estado (UF)</label>
        <div class="relative">
          <select
            :value="uf ?? ''"
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
            :value="city ?? ''"
            @change="onCityChange"
            :disabled="!uf"
            class="w-full appearance-none bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-lg pl-9 pr-8 py-2.5 text-sm text-[var(--text-secondary)] focus:border-[var(--accent-gold)] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">{{ uf ? 'Todos os municípios' : 'Selecione um estado' }}</option>
            <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
          </select>
          <MapPin class="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  </div>
</template>
