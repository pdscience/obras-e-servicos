<script setup lang="ts">
import { Star, Quote } from '@lucide/vue'

const testimonials = [
  { id: 1, name: 'Maria Helena', role: 'Proprietária', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', rating: 5, comment: 'Encontrei um eletricista excelente em menos de 1 hora. O serviço foi impecável e o preço justo.', service: 'Instalação Elétrica' },
  { id: 2, name: 'Roberto Santos', role: 'Síndico', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rating: 5, comment: 'Uso o Obras & Serviços para todas as manutenções do condomínio. A facilidade de comparar orçamentos é incrível.', service: 'Manutenção Predial' },
  { id: 3, name: 'Ana Paula', role: 'Arquiteta', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face', rating: 5, comment: 'Como arquiteta, indico a plataforma para meus clientes. Os profissionais são qualificados e o suporte é excelente.', service: 'Reforma Completa' }
]
</script>

<template>
  <section class="py-16 md:py-24" style="background:var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Depoimentos</span>
        <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-2 mb-4">O que Nossos Clientes Dizem</h2>
        <p class="text-[var(--text-muted)] max-w-2xl mx-auto">Milhares de clientes já encontraram os profissionais ideais através da nossa plataforma</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="testimonial in testimonials" :key="testimonial.id" class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 shadow-card relative">
          <Quote class="absolute top-6 right-6 w-10 h-10 text-[var(--bg-raised)]" />

          <div class="flex items-center gap-1 mb-4">
            <Star v-for="i in testimonial.rating" :key="i" class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
          </div>

          <p class="text-[var(--text-muted)] mb-6 relative z-10 leading-relaxed">"{{ testimonial.comment }}"</p>

          <span class="inline-block bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)] text-xs font-medium px-3 py-1 rounded-full mb-4">{{ testimonial.service }}</span>

          <div class="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
            <img :src="testimonial.avatar" :alt="testimonial.name" class="w-12 h-12 rounded-full object-cover" />
            <div>
              <h4 class="font-semibold text-[var(--text-secondary)]">{{ testimonial.name }}</h4>
              <p class="text-sm text-[var(--text-subtle)]">{{ testimonial.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
