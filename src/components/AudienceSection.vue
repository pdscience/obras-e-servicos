<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { audiences } from '../data/audiences'

const emit = defineEmits<{
  register: [type: 'cliente' | 'professional' | 'lojista']
}>()
</script>

<template>
  <section class="py-16 md:py-24" style="background: var(--bg-card)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Feito para você</span>
        <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-2 mb-4">
          Uma plataforma, <span class="text-gradient">três lados</span> da obra
        </h2>
        <p class="text-[var(--text-muted)] max-w-2xl mx-auto">
          Escolha seu lado e veja como a Obras &amp; Serviços resolve o problema de cada um.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          v-for="a in audiences"
          :key="a.type"
          class="group relative bg-[var(--bg-card)] border rounded-3xl p-8 overflow-hidden hover:-translate-y-1.5 transition-all duration-300"
          :style="{ borderColor: `color-mix(in srgb, ${a.color} 40%, var(--border-default))` }"
        >
          <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-40 opacity-0" :style="{ background: a.color }"></div>

          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" :style="{ background: `color-mix(in srgb, ${a.color} 15%, transparent)` }">
                <component :is="a.icon" class="w-6 h-6" :style="{ color: a.color }" />
              </div>
              <span class="text-sm font-bold uppercase tracking-wider" :style="{ color: a.color }">{{ a.title }}</span>
            </div>

            <h3 class="text-xl font-bold text-[var(--text-primary)] mb-3">{{ a.headline }}</h3>
            <p class="text-[var(--text-muted)] text-sm mb-6">{{ a.description }}</p>

            <ul class="space-y-2.5 mb-8">
              <li v-for="(b, j) in a.bullets" :key="j" class="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ background: a.color }"></span>
                {{ b }}
              </li>
            </ul>

            <button
              @click="emit('register', a.type)"
              class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all btn-press"
              :class="a.type === 'professional'
                ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] text-[var(--text-on-accent)] hover:shadow-lg'
                : 'bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]'"
            >
              {{ a.cta }}
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
