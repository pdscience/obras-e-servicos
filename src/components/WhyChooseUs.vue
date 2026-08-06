<script setup lang="ts">
import { Shield, Clock, MapPin, Star } from '@lucide/vue'

const items = [
  { icon: Shield, title: 'Profissionais Verificados', description: 'Todos os profissionais passam por verificação de identidade', color: '#f0a500' },
  { icon: Clock, title: 'Resposta Rápida', description: 'Receba orçamentos em até 24 horas', color: '#3fb950' },
  { icon: MapPin, title: 'Proximidade', description: 'Encontre profissionais perto de você', color: '#f0b429' },
  { icon: Star, title: 'Avaliações Reais', description: 'Sistema de reviews com clientes verificados', color: '#7ee8fa' }
]
</script>

<template>
  <section class="py-20" style="background:var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Vantagens</span>
        <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-3 mb-4">
          Por que escolher o <span class="text-[var(--accent-gold)]">Obras &amp; Serviços</span>?
        </h2>
        <p class="text-[var(--text-muted)] max-w-2xl mx-auto">
          Uma plataforma pensada para conectar você aos melhores profissionais com segurança e agilidade
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 text-center hover:border-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] transition-all duration-300 hover:-translate-y-1 group"
        >
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors duration-300 group-hover:bg-opacity-100"
            :style="{ background: item.color + '18' }"
          >
            <component :is="item.icon" class="w-8 h-8" :style="{ color: item.color }" />
          </div>
          <h3 class="text-lg font-semibold text-[var(--text-secondary)] mb-2 group-hover:text-[var(--accent-gold)] transition-colors">
            {{ item.title }}
          </h3>
          <p class="text-sm text-[var(--text-subtle)] leading-relaxed">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
