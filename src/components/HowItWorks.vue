<script setup lang="ts">
import { Search, FileCheck, Calendar, ThumbsUp, ArrowRight } from '@lucide/vue'

const steps = [
  { icon: Search, number: '01', title: 'Busque o Profissional Ideal', description: 'Pesquise pelo tipo de serviço que você precisa e encontre profissionais qualificados na sua região.', color: '#f0a500' },
  { icon: FileCheck, number: '02', title:'Receba Múltiplos Orçamentos', description: 'Descreva seu projeto e receba orçamentos de múltiplos profissionais para comparar.', color: '#3fb950' },
  { icon: Calendar, number: '03', title: 'Agende e Contrate', description: 'Escolha o melhor profissional, agende a data e contrate com pagamento seguro.', color: '#7ee8fa' },
  { icon: ThumbsUp, number: '04', title: 'Avalie o Serviço', description: 'Após a conclusão, avalie o profissional e ajude outros clientes a fazer boas escolhas.', color: '#f0b429' }
]
</script>

<template>
  <section class="py-12 md:py-16 relative overflow-hidden" style="background:var(--bg-page)">
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 left-20 w-96 h-96 bg-[var(--accent-gold)] rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-64 h-64 bg-[var(--accent-teal)] rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center mb-16">
        <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Processo Simples</span>
        <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-2 mb-4">Como Funciona</h2>
        <p class="text-[var(--text-muted)] max-w-2xl mx-auto">Em poucos passos você encontra o profissional ideal para seu projeto</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(step, index) in steps" :key="index" class="relative">
          <div v-if="index < steps.length - 1" class="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-[var(--border-default)] to-transparent z-0">
            <ArrowRight class="absolute right-4 -top-2 w-5 h-5 text-[var(--border-default)]" />
          </div>

          <div class="bg-[var(--bg-card)] backdrop-blur-sm rounded-xl p-4 border border-[var(--border-default)] hover:border-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] transition-all duration-300 hover:-translate-y-0.5 relative z-10">
            <span class="text-3xl font-bold text-[var(--text-primary)] absolute top-3 right-3 font-['JetBrains_Mono',monospace]">{{ step.number }}</span>

            <div class="w-11 h-11 rounded-lg flex items-center justify-center mb-3" :style="{ background: step.color + '25' }">
              <component :is="step.icon" class="w-5 h-5" :style="{ color: step.color }" />
            </div>

            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-1.5">{{ step.title }}</h3>
            <p class="text-[var(--text-muted)] text-xs leading-relaxed">{{ step.description }}</p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
