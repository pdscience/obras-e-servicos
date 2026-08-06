<script setup lang="ts">
import { useRouter } from 'vue-router'
import PricingPlans from '@/components/PricingPlans.vue'

const router = useRouter()

function handleRegisterPlan(plan: string) {
  if (plan === 'diamante') {
    router.push({ path: '/cadastro', query: { tipo: 'lojista' } })
  } else {
    router.push({ path: '/cadastro', query: { tipo: 'professional', plano: plan } })
  }
}
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-page)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
      <div class="text-center mb-12">
        <span class="inline-block px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--accent-gold)_15%,transparent)] text-[var(--accent-gold)] text-sm font-medium mb-4">Planos e Preços</span>
        <h1 class="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">Escolha o plano ideal para o seu negócio</h1>
        <p class="text-[var(--text-muted)] mt-4 max-w-2xl mx-auto">Profissionais da construção civil e lojistas encontraram o pacote certo para alcançar mais clientes.</p>
      </div>
      <PricingPlans @selectPlan="handleRegisterPlan" />
    </div>
  </div>
</template>
