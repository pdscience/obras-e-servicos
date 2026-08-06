<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Search, MapPin } from '@lucide/vue'
import logoSrc from '../assets/logo.png'
import { mainCategories } from '../data/mockData'
import { ufs } from '../data/ufs'
import { getCitiesByUf } from '../data/cities'

const emit = defineEmits<{
  search: [category: string, location: string]
}>()

const selectedCategory = ref('')
const selectedUf = ref('')
const selectedCity = ref('')

const cidades = ref<string[]>([])

watch(selectedUf, async (val) => {
  selectedCity.value = ''
  cidades.value = await getCitiesByUf(val || null)
})

function handleSearch() {
  const location = [selectedCity.value, selectedUf.value].filter(Boolean).join(', ')
  emit('search', selectedCategory.value, location)
}

onMounted(() => {
  const schema = document.createElement('script')
  schema.type = 'application/ld+json'
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Obras & Serviços",
    "url": "https://obras-servicos.com/",
    "description": "Encontre os melhores profissionais de construção civil. Solicite orçamentos gratuitos, compare preços e contrate com segurança.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://obras-servicos.com/servicos?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  })
  document.head.appendChild(schema)

  const orgSchema = document.createElement('script')
  orgSchema.type = 'application/ld+json'
  orgSchema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Obras & Serviços",
    "url": "https://obras-servicos.com/",
    "logo": "https://obras-servicos.com/logo.png",
    "description": "Plataforma que conecta clientes a profissionais qualificados de construção civil em todo o Brasil.",
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Portuguese"
    }
  })
  document.head.appendChild(orgSchema)
})
</script>

<template>
  <section class="relative overflow-hidden" style="background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-card) 50%, var(--bg-page) 100%);">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 left-10 w-64 h-64 bg-[var(--accent-gold)] rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent-teal)] rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
      <div class="text-center max-w-4xl mx-auto">
        <img :src="logoSrc" alt="Obras & Serviços" class="h-28 md:h-40 lg:h-52 mx-auto mb-6" />
        <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
          Encontre os Melhores
          <span class="text-gradient">Profissionais</span>
          <br />
          para sua Obra
        </h1>

        <p class="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto">
          Solicite orçamentos, compare preços e contrate com segurança.
        </p>

        <!-- TODO: Barra de busca - desabilitada temporariamente
        <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-3 md:p-4 shadow-2xl max-w-5xl mx-auto">
          <div class="flex flex-col md:flex-row gap-3">
            <div class="flex-[2] relative">
              <select
                v-model="selectedCategory"
                @change="selectedCategory && handleSearch()"
                class="w-full px-4 py-3 pl-12 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">Qual categoria você precisa?</option>
                <option v-for="cat in mainCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
              </select>
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
            </div>

            <div class="flex-1 relative">
              <select
                v-model="selectedUf"
                class="w-full px-4 py-3 pl-12 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">UF</option>
                <option v-for="uf in ufs" :key="uf.sigla" :value="uf.sigla">{{ uf.sigla }} - {{ uf.nome }}</option>
              </select>
              <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
            </div>
            <div class="flex-1 relative">
              <select
                v-model="selectedCity"
                :disabled="!selectedUf"
                class="w-full px-4 py-3 pl-12 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{{ selectedUf ? 'Todas as cidades' : 'cidades' }}</option>
                <option v-for="city in cidades" :key="city" :value="city">{{ city }}</option>
              </select>
              <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
            </div>

            <button
              @click="handleSearch"
              class="px-8 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Search class="w-5 h-5" />
              <span>Buscar</span>
            </button>
          </div>
        </div>
        -->

      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0">
      <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" style="fill: var(--bg-page)"/>
      </svg>
    </div>
  </section>
</template>
