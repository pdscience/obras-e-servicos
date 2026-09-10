<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import HomeHero from '@/components/home/HomeHero.vue'
import HomeAboutIntro from '@/components/home/HomeAboutIntro.vue'
import HomeHowItWorks from '@/components/home/HomeHowItWorks.vue'
import HomeProfessionalsGallery from '@/components/home/HomeProfessionalsGallery.vue'
import HomeSearchSection from '@/components/home/HomeSearchSection.vue'
import HomeReforma from '@/components/home/HomeReforma.vue'
import HomeAboutCards from '@/components/home/HomeAboutCards.vue'
import HomeCTABanner from '@/components/home/HomeCTABanner.vue'
import HomeTestimonials from '@/components/home/HomeTestimonials.vue'
import HomePricing from '@/components/home/HomePricing.vue'
import HomeFinalCTA from '@/components/home/HomeFinalCTA.vue'
import { categories } from '@/data/mockData'
import type { PlanoProfissional } from '@/types'

useHead({
  title: 'OS – Obras & Serviços | Encontre profissionais de confiança',
  meta: [
    { name: 'description', content: 'Encontre os melhores profissionais de obras e serviços perto de você. Compare, contrate e avalie com segurança. Orçamentos gratuitos!' },
    { property: 'og:title', content: 'OS – Obras & Serviços | Encontre profissionais de confiança' },
    { property: 'og:description', content: 'Encontre os melhores profissionais de obras e serviços perto de você. Compare, contrate e avalie com segurança.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://obras-servicos.com/' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'OS – Obras & Serviços | Encontre profissionais de confiança' },
    { name: 'twitter:description', content: 'Encontre os melhores profissionais de obras e serviços perto de você. Compare, contrate e avalie com segurança.' },
  ],
})

const router = useRouter()

function goCategories() {
  router.push({ name: 'categories' })
}

function goStores() {
  router.push({ name: 'stores' })
}

function registerProfessional() {
  router.push({ name: 'register', query: { tipo: 'professional' } })
}

function selectProfessional(label: string, slug: string) {
  const cat = categories.find((c) => c.name === label)
  router.push({ name: 'category-detail', params: { slug: slug || cat?.mainCategoryId || 'mc-1' } })
}

function handleSearch(type: 'profissional' | 'lojista', query: string, _uf: string, _city: string) {
  if (type === 'lojista') {
    goStores()
    return
  }
  const cat = categories.find((c) => c.name.toLowerCase() === query.toLowerCase())
  if (cat) {
    router.push({ name: 'category-detail', params: { slug: cat.mainCategoryId } })
  } else {
    goCategories()
  }
}

function scrollToSearch() {
  document.getElementById('busca')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleRegisterPlan(plano: PlanoProfissional) {
  if (plano === 'diamante') {
    router.push({ name: 'register', query: { tipo: 'lojista' } })
  } else {
    router.push({ name: 'register', query: { tipo: 'professional', plano } })
  }
}
</script>

<template>
  <div class="home-landing">
    <HomeHero @search="goCategories" @register="registerProfessional" />
    <HomeAboutIntro />
    <HomeHowItWorks />
    <HomeProfessionalsGallery @select="selectProfessional" @viewAll="goCategories" />
    <HomeSearchSection @search="handleSearch" />
    <HomeReforma @plan="scrollToSearch" />
    <HomeAboutCards />
    <HomeCTABanner @findPro="goCategories" @register="registerProfessional" />
    <HomeTestimonials />
    <HomePricing @selectPlan="handleRegisterPlan" />
    <HomeFinalCTA @register="registerProfessional" />
  </div>
</template>

<style scoped>
.home-landing {
  background: var(--bg-page);
  color: var(--text-secondary);
}

.home-landing :deep(section[id]) {
  scroll-margin-top: 96px;
}
</style>