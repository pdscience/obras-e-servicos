<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Star, MapPin, CheckCircle2, Crown, ArrowRight } from '@lucide/vue'
import { listarProfissionais, mapPerfilToProfessional } from '../services/api'
import { rankingProfissionais } from '../utils/matching'
import type { Professional } from '../types'

const emit = defineEmits<{
  viewProfile: [professional: Professional]
  viewAll: []
}>()

const featuredPros = ref<Professional[]>([])

onMounted(async () => {
  try {
    const all = await listarProfissionais()
    const ranked = rankingProfissionais(all.map(mapPerfilToProfessional), {})
    featuredPros.value = ranked.slice(0, 4).map(m => m.professional)
  } catch { /* fallback vazio */ }
})
</script>

<template>
  <section class="py-16 md:py-24" style="background:var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
        <div>
          <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Destaque</span>
          <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-2 mb-4">Profissionais em Destaque</h2>
          <p class="text-[var(--text-muted)] max-w-xl">Conheça alguns dos nossos profissionais mais bem avaliados</p>
        </div>
        <button
          @click="emit('viewAll')"
          class="mt-4 md:mt-0 inline-flex items-center gap-2 text-[var(--accent-gold)] font-semibold hover:text-[var(--accent-teal)] transition-colors"
        >
          Ver todos <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <template v-for="pro in featuredPros" :key="pro.id">
          <!-- Premium Destaque -->
          <div
            v-if="pro.premium"
            @click="emit('viewProfile', pro)"
            class="h-full relative bg-gradient-to-b from-[var(--bg-raised)] to-[var(--bg-card)] border border-[#f0a50044] rounded-2xl overflow-hidden shadow-lg hover:shadow-[#f0a50011] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col"
          >
            <div class="bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] px-4 py-2 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <Crown class="w-4 h-4 text-[var(--text-on-accent)]" />
                <span class="text-[var(--text-on-accent)] text-xs font-bold uppercase tracking-wider">Premium</span>
              </div>
              <span class="text-[var(--text-on-accent)] text-xs font-medium opacity-80">🎖️ Destaque</span>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <div class="flex items-start gap-4 mb-3">
                <div class="relative">
                  <img :src="pro.avatar" :alt="pro.name" class="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--accent-gold)] ring-offset-2 ring-offset-[var(--bg-card)]" />
                  <div v-if="pro.verified" class="absolute -bottom-1 -right-1 bg-[var(--bg-card)] rounded-full p-0.5"><CheckCircle2 class="w-5 h-5 text-[var(--accent-green)]" /></div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors">{{ pro.name }}</h3>
                  <p class="text-[var(--accent-gold)] text-sm font-medium">{{ pro.category }}</p>
                  <div class="flex items-center gap-1 mt-1"><MapPin class="w-3 h-3 text-[var(--text-subtle)]" /><span class="text-xs text-[var(--text-subtle)] truncate">{{ pro.location }}</span></div>
                </div>
              </div>
              <div class="flex items-center gap-3 mb-3">
                <div class="flex items-center gap-1 bg-[color-mix(in srgb,var(--accent-amber) 10%,transparent)] px-2 py-1 rounded-lg">
                  <Star class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
                  <span class="font-bold text-[var(--text-primary)] text-sm">{{ pro.rating }}</span>
                  <span class="text-[var(--text-subtle)] text-xs">({{ pro.reviewCount }})</span>
                </div>
                <div class="text-xs text-[var(--text-subtle)]"><span class="font-medium text-[var(--text-muted)]">{{ pro.completedJobs }}</span> serv.</div>
              </div>
              <p class="text-[var(--text-muted)] text-xs leading-relaxed line-clamp-2 mb-3">{{ pro.description }}</p>
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span v-for="(spec, i) in pro.specialties.slice(0, 3)" :key="i" class="text-xs bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)] px-2 py-1 rounded-full font-medium">{{ spec }}</span>
              </div>
              <div class="mt-auto flex items-center justify-between pt-3 border-t border-[color-mix(in_srgb,var(--accent-gold)_13%,transparent)]">
                <button @click.stop="emit('viewProfile', pro)" class="px-4 py-2 bg-[var(--accent-gold)] text-[var(--text-on-accent)] rounded-lg text-sm font-semibold hover:shadow-lg transition-all">Agendar Agora</button>
              </div>
            </div>
          </div>

          <!-- Basic Destaque -->
          <div
            v-else
            @click="emit('viewProfile', pro)"
            class="h-full relative bg-gradient-to-b from-[var(--bg-raised)] to-[var(--bg-card)] border border-[var(--border-raised)] rounded-2xl overflow-hidden shadow-lg hover:shadow-[color-mix(in_srgb,var(--text-muted)_7%,transparent)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col"
          >
            <div class="bg-gradient-to-r from-[var(--text-muted)] to-[var(--muted-dark)] px-4 py-2 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <Crown class="w-4 h-4 text-[var(--text-on-accent)]" />
                <span class="text-[var(--text-on-accent)] text-xs font-bold uppercase tracking-wider">Profissional</span>
              </div>
              <span class="text-[var(--text-on-accent)] text-xs font-medium opacity-60">Profissional</span>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <div class="flex items-start gap-4 mb-3">
                <div class="relative">
                  <img :src="pro.avatar" :alt="pro.name" class="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--text-muted)] ring-offset-2 ring-offset-[var(--bg-card)]" />
                  <div v-if="pro.verified" class="absolute -bottom-1 -right-1 bg-[var(--bg-card)] rounded-full p-0.5"><CheckCircle2 class="w-5 h-5 text-[var(--accent-green)]" /></div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors">{{ pro.name }}</h3>
                  <p class="text-[var(--text-muted)] text-sm font-medium">{{ pro.category }}</p>
                  <div class="flex items-center gap-1 mt-1"><MapPin class="w-3 h-3 text-[var(--text-subtle)]" /><span class="text-xs text-[var(--text-subtle)] truncate">{{ pro.location }}</span></div>
                </div>
              </div>
              <div class="flex items-center gap-3 mb-3">
                <div class="flex items-center gap-1 bg-[color-mix(in srgb,var(--accent-amber) 10%,transparent)] px-2 py-1 rounded-lg">
                  <Star class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
                  <span class="font-bold text-[var(--text-primary)] text-sm">{{ pro.rating }}</span>
                  <span class="text-[var(--text-subtle)] text-xs">({{ pro.reviewCount }})</span>
                </div>
                <div class="text-xs text-[var(--text-subtle)]"><span class="font-medium text-[var(--text-muted)]">{{ pro.completedJobs }}</span> serv.</div>
              </div>
              <p class="text-[var(--text-muted)] text-xs leading-relaxed line-clamp-2 mb-3">{{ pro.description }}</p>
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span v-for="(spec, i) in pro.specialties.slice(0, 3)" :key="i" class="text-xs bg-[color-mix(in srgb,var(--text-muted) 10%,transparent)] text-[var(--text-muted)] px-2 py-1 rounded-full font-medium">{{ spec }}</span>
              </div>
              <div class="mt-auto flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
                <div><span class="text-xs text-[var(--text-subtle)]">R$ {{ pro.pricePerHour }}<span class="text-xs">/h</span></span></div>
                <button @click.stop="emit('viewProfile', pro)" class="px-4 py-2 bg-[var(--bg-raised)] text-[var(--text-muted)] rounded-lg text-sm font-medium hover:bg-[var(--border-default)] transition-all">Ver Perfil</button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
