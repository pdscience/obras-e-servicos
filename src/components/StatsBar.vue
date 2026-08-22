<script setup lang="ts">

import { Users, MapPin, Briefcase, ShieldCheck } from '@lucide/vue'

const stats = [
  { icon: Briefcase, value: '14+', label: 'Categorias de serviço' },
  { icon: Users, value: '100%', label: 'Perfis dedicados' },
  { icon: MapPin, value: 'BR', label: 'Cobertura nacional' },
  { icon: ShieldCheck, value: 'Grátis', label: 'Para começar' },
]
</script>

<template>
  <section class="py-10" style="background: var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(item, i) in stats"
          :key="i"
          class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl px-5 py-6 text-center hover:border-[color-mix(in_srgb,var(--accent-gold)_25%,transparent)] hover:-translate-y-0.5 transition-all duration-300"
        >
          <div class="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center" style="background: color-mix(in srgb, var(--accent-gold) 12%, transparent)">
            <component :is="item.icon" class="w-5 h-5 text-[var(--accent-gold)]" />
          </div>
          <div class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-['JetBrains_Mono',monospace]">{{ item.value }}</div>
          <div class="text-[var(--text-muted)] text-xs md:text-sm mt-1">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
