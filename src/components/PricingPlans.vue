<script setup lang="ts">
import { Check, Crown, Medal, Award, Gem } from '@lucide/vue'
import { PLANOS_LISTA } from '../config/planos'
import type { PlanoProfissional, CorPlano } from '../types'

interface PlanVisual {
  id: PlanoProfissional
  name: string
  price: number
  description: string
  cor: CorPlano
  features: string[]
  cta: string
  popular: boolean
  icon: unknown
}

const iconMap: Record<string, unknown> = {
  bronze: Medal,
  prata: Award,
  ouro: Crown,
  diamante: Gem,
}

const coresPlano: Record<string, { from: string; to: string; badge: string; ring: string; text: string }> = {
  bronze: {
    from: '#cd7f32', to: '#a85f1e', badge: '#cd7f32', ring: 'rgba(205,127,50,0.35)', text: '#cd7f32',
  },
  prata: {
    from: '#9ca3af', to: '#6b7280', badge: '#9ca3af', ring: 'rgba(156,163,175,0.35)', text: '#9ca3af',
  },
  ouro: {
    from: '#f0a500', to: '#c97f00', badge: '#f0a500', ring: 'rgba(240,165,0,0.35)', text: '#f0a500',
  },
  diamante: {
    from: '#34d399', to: '#059669', badge: '#10b981', ring: 'rgba(16,185,129,0.35)', text: '#10b981',
  },
}

const popularId = 'ouro'

const todosPlanos: PlanVisual[] = PLANOS_LISTA.map(p => ({
  id: p.id,
  name: p.nome,
  price: p.preco,
  description: p.foco,
  cor: p.cor,
  features: p.beneficios,
  cta: 'Assinar ' + p.nome,
  popular: p.id === popularId,
  icon: iconMap[p.id],
}))

function planoVisual(p: PlanVisual) {
  return coresPlano[p.cor]
}
</script>

<template>
  <!-- Planos para Profissionais -->
  <section class="py-16 md:py-24" style="background:var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Planos</span>
        <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-2 mb-4">Escolha o Plano Ideal</h2>
        <p class="text-[var(--text-muted)] max-w-2xl mx-auto">Planos feitos para cada tipo de profissional da construção civil</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <div
          v-for="plan in todosPlanos"
          :key="plan.id"
          :class="['relative bg-[var(--bg-card)] border rounded-2xl p-6 flex flex-col transition-transform hover:-translate-y-1', plan.popular ? 'border-2 shadow-xl scale-105' : 'border-[var(--border-default)] shadow-card']"
          :style="plan.popular ? { borderColor: planoVisual(plan).text } : {}"
        >
          <div v-if="plan.popular" class="absolute -top-4 left-1/2 -translate-x-1/2">
            <span class="text-[var(--text-on-accent)] text-sm font-medium px-4 py-1 rounded-full" :style="{ background: planoVisual(plan).badge }">Mais Popular</span>
          </div>

          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white"
            :style="{ background: `linear-gradient(135deg, ${planoVisual(plan).from}, ${planoVisual(plan).to})` }"
          >
            <component :is="plan.icon" class="w-6 h-6" />
          </div>

          <h3 class="text-xl font-bold text-[var(--text-primary)] mb-1">{{ plan.name }}</h3>
          <p class="text-[var(--text-muted)] text-sm mb-4">{{ plan.description }}</p>

          <div class="mb-6">
            <span class="text-sm text-[var(--text-muted)]">R$</span>
            <span class="text-4xl font-bold text-[var(--text-primary)]">{{ plan.price.toFixed(2).replace('.', ',') }}</span>
            <span class="text-[var(--text-muted)]">/mês</span>
          </div>

          <ul class="space-y-3 mb-6 flex-1">
            <li v-for="(feature, i) in plan.features" :key="i" class="flex items-start gap-2">
              <Check class="w-5 h-5 flex-shrink-0" :style="{ color: planoVisual(plan).text }" />
              <span class="text-sm text-[var(--text-muted)]">{{ feature }}</span>
            </li>
          </ul>

          <button
            disabled
            class="w-full py-3 rounded-xl font-semibold transition-all text-white opacity-50 cursor-not-allowed"
            :style="{ background: `linear-gradient(135deg, ${planoVisual(plan).from}, ${planoVisual(plan).to})` }"
          >
            {{ plan.cta }}
          </button>
        </div>
      </div>

      <p class="text-center text-[var(--text-subtle)] text-sm mt-8">Cancele a qualquer momento. Sem multas ou taxas escondidas.</p>
    </div>
  </section>
</template>
