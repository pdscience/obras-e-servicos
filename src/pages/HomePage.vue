<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@vueuse/head'
import Hero from '@/components/Hero.vue'
import StatsBar from '@/components/StatsBar.vue'
import AudienceSection from '@/components/AudienceSection.vue'
import HowItWorks from '@/components/HowItWorks.vue'
import Categories from '@/components/Categories.vue'
import LojasProximas from '@/components/LojasProximas.vue'
import Testimonials from '@/components/Testimonials.vue'
import FAQ from '@/components/FAQ.vue'
import PricingPlans from '@/components/PricingPlans.vue'
import SolicitarOrcamentoModal from '@/components/SolicitarOrcamentoModal.vue'
import { useRouter } from 'vue-router'
import { mainCategories } from '@/data/mockData'
import type { MainCategory, PerfilLojista } from '@/types'

useHead({
  title: 'Obras & Serviços - Encontre Profissionais Qualificados para sua Obra',
  meta: [
    { name: 'description', content: 'Encontre os melhores profissionais de construção civil, eletricistas, encanadores, pedreiros e muito mais. Solicite orçamentos gratuitos, compare preços e contrate com segurança.' },
    { property: 'og:title', content: 'Obras & Serviços - Encontre Profissionais Qualificados' },
    { property: 'og:description', content: 'Encontre os melhores profissionais de construção civil. Solicite orçamentos gratuitos e contrate com segurança.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://obras-servicos.com/' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Obras & Serviços - Encontre Profissionais Qualificados' },
    { name: 'twitter:description', content: 'Encontre os melhores profissionais de construção civil. Solicite orçamentos gratuitos e contrate com segurança.' },
  ],
})

const router = useRouter()
const showOrcamentoModal = ref(false)

function handleSearch(category: string, _location: string) {
  const cat = mainCategories.find(c => c.name === category)
  if (cat) {
    router.push({ name: 'category-detail', params: { slug: cat.id } })
  } else {
    router.push({ name: 'categories' })
  }
}

function handleMainCategorySelect(mainCategory: MainCategory) {
  router.push({ name: 'category-detail', params: { slug: mainCategory.id } })
}

function goToCategoriesPage() {
  router.push({ name: 'categories' })
}

function handleViewAllStores() {
  router.push({ name: 'stores' })
}

function handleViewLojista(lojista: PerfilLojista) {
  router.push({ name: 'lojista', params: { id: lojista.id } })
}

function handleRequestLogin() {
  showOrcamentoModal.value = false
  router.push({ name: 'auth' })
}

function handleAudienceRegister(type: 'cliente' | 'professional' | 'lojista') {
  router.push({ name: 'register', query: { tipo: type } })
}

function handleHeroRegister() {
  router.push({ name: 'register' })
}

function handleRegisterPlan(plano: string) {
  if (plano === 'diamante') {
    router.push({ name: 'register', query: { tipo: 'lojista' } })
  } else {
    router.push({ name: 'register', query: { tipo: 'professional', plano } })
  }
}

function handleInauguracao() {
  router.push({ name: 'register', query: { gratuito: 'true', plano: 'ouro' } })
}

function handleOrcamentoCreated() {
  showOrcamentoModal.value = false
  router.push({ name: 'quadro-servicos' })
}
</script>

<template>
  <Hero @search="handleSearch" @register="handleHeroRegister" />
  <StatsBar />
  <AudienceSection @register="handleAudienceRegister" />
  <HowItWorks />
  <Categories compact :maxItems="8" @mainCategorySelect="handleMainCategorySelect" />
  <div class="pb-16" style="background:var(--bg-page)">
    <div class="text-center flex flex-col sm:flex-row items-center justify-center gap-4">
      <button
        @click="goToCategoriesPage"
        class="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-gold)] hover:bg-[var(--accent-dark-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
      >
        Ver Todas as Categorias
      </button>

    </div>
    <p class="text-xs text-[var(--text-muted)] mt-3 text-center">Filtre por estado e município para encontrar profissionais perto de você</p>
  </div>
  <div id="lojas-proximas">
    <LojasProximas @viewLojista="handleViewLojista" @viewAll="handleViewAllStores" />
  </div>
  <PricingPlans @selectPlan="handleRegisterPlan" />
  
  <!-- Botão de Inauguração Gratuito -->
  <div class="py-12 text-center" style="background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-card) 100%)">
    <div class="max-w-2xl mx-auto px-4">
      <div class="relative inline-block">
        <div class="absolute inset-0 bg-[var(--accent-gold)] rounded-2xl animate-ping opacity-20"></div>
        <button
          @click="handleInauguracao"
          class="relative inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] hover:from-[var(--accent-dark-gold)] hover:to-[var(--accent-gold)] text-[var(--text-on-accent)] font-bold rounded-2xl transition-all shadow-lg hover:shadow-2xl text-lg animate-pulse"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          Cadastro de Inauguração Gratuito
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </button>
      </div>
      <p class="text-sm text-[var(--text-muted)] mt-4 max-w-md mx-auto">
        <strong class="text-[var(--accent-gold)]">Oferta por tempo limitado!</strong> Cadastre-se agora e ganhe <strong class="text-[var(--accent-gold)]">60 dias grátis</strong> do Plano Ouro com todos os benefícios.
      </p>
    </div>
  </div>

  <!-- Solicitar Orçamento -->
  <div class="py-12 text-center" style="background: var(--bg-page)">
    <div class="max-w-2xl mx-auto px-4">
      <button
        @click="showOrcamentoModal = true"
        class="inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        Solicitar Orçamento
      </button>
    </div>
  </div>

  <Testimonials />
  <FAQ />

  <SolicitarOrcamentoModal
    v-if="showOrcamentoModal"
    @close="showOrcamentoModal = false"
    @created="handleOrcamentoCreated"
    @requestLogin="handleRequestLogin"
  />
</template>
