<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Categories from '@/components/Categories.vue'
import CategoryFilters from '@/components/CategoryFilters.vue'
import { mainCategories } from '@/data/mockData'
import { listarTodasProfissoes } from '@/services/api'
import type { MainCategory } from '@/types'

const router = useRouter()

const filterUf = ref<string | null>(null)
const filterCity = ref<string | null>(null)
const filterSearchTerm = ref('')
const filterCategory = ref('')
const profissoes = ref<string[]>([])

onMounted(async () => {
  try {
    const data = await listarTodasProfissoes()
    profissoes.value = [...new Set(data.map(p => p.nome))].sort()
  } catch { /* ignore */ }
})

function handleMainCategorySelect(mainCategory: MainCategory) {
  router.push({ name: 'category-detail', params: { slug: mainCategory.id } })
}

function handleCategorySelect(name: string) {
  if (name) {
    const cat = mainCategories.find(c => c.professions?.some(p => p === name))
    if (cat) {
      router.push({ name: 'category-detail', params: { slug: cat.id }, query: { profissao: name } })
    }
  }
}

function setFilterUf(value: string | null) {
  filterUf.value = value
  filterCity.value = null
}

function setFilterCity(value: string | null) {
  filterCity.value = value
}

function clearFilters() {
  filterUf.value = null
  filterCity.value = null
  filterSearchTerm.value = ''
  filterCategory.value = ''
}
</script>

<template>
  <section class="py-16 md:py-20" style="background:var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <CategoryFilters
        :uf="filterUf"
        :city="filterCity"
        :search-term="filterSearchTerm"
        :filter-category="filterCategory"
        :professions="profissoes"
        @update:uf="setFilterUf"
        @update:city="setFilterCity"
        @update:search-term="(v: string) => filterSearchTerm = v"
        @update:filter-category="handleCategorySelect"
        @clear="clearFilters"
      />
      <Categories
        :filter-uf="filterUf"
        :filter-city="filterCity"
        :filter-search-term="filterSearchTerm"
        @mainCategorySelect="handleMainCategorySelect"
      />
    </div>
  </section>
</template>
