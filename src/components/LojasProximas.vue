<script setup lang="ts">
import { Package, Truck, CreditCard, ArrowRight, CheckCircle } from '@lucide/vue'

const emit = defineEmits<{
  viewAll: []
}>()

const categorias = [
  { icon: Package, name: 'Cimento e Argamassa', description: 'Cimento, argamassa, cal e derivados' },
  { icon: Package, name: 'Tintas e Revestimentos', description: 'Tintas, texturas, grafiatos e massa corrida' },
  { icon: Package, name: 'Hidráulica', description: 'Tubos, conexões, registros e válvulas' },
  { icon: Package, name: 'Elétrica', description: 'Fios, disjuntores, tomadas e interruptores' },
  { icon: Package, name: 'Ferramentas', description: 'Ferramentas manuais e elétricas profissionais' },
  { icon: Package, name: 'Madeiras', description: 'Madeiras de construção, compensados e MDF' },
]

const beneficios = [
  { icon: Truck, title: 'Entrega Rápida', description: 'Entrega na sua obra ou canteiro de obras' },
  { icon: CreditCard, title: 'Preço Justo', description: 'Compare preços e encontre as melhores ofertas' },
]
</script>

<template>
  <section class="py-16 md:py-24" style="background:var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
        <div>
          <span class="text-[var(--accent-gold)] font-semibold text-sm uppercase tracking-wider">Materiais</span>
          <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mt-2 mb-4">Lojas de Materiais de Construção</h2>
          <p class="text-[var(--text-muted)] max-w-xl">Encontre tudo o que precisa para sua obra ou reforma em lojas verificadas e bem avaliadas</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div
          v-for="(cat, index) in categorias"
          :key="index"
          class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5 hover:border-[#f0a50044] transition-all duration-300 group"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <component :is="cat.icon" class="w-6 h-6 text-[var(--accent-gold)]" />
            </div>
            <div>
              <h3 class="font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-gold)] transition-colors">{{ cat.name }}</h3>
              <p class="text-[var(--text-muted)] text-sm">{{ cat.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-8 md:p-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span class="text-[var(--accent-green)] font-semibold text-sm uppercase tracking-wider mb-2 block">Como funciona</span>
            <h3 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">Encontre os melhores materiais para sua obra</h3>
            <p class="text-[var(--text-muted)] mb-6">Cadastre-se gratuitamente e tenha acesso a lojas verificadas com os melhores preços e condições do mercado.</p>

            <ul class="space-y-3 mb-8">
              <li v-for="(item, i) in ['Lojas verificadas e bem avaliadas', 'Preços competitivos e comparativos', 'Entrega rápida na sua região']" :key="i" class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-[var(--accent-green)] flex-shrink-0" />
                <span class="text-[var(--text-secondary)] text-sm">{{ item }}</span>
              </li>
            </ul>

            <button
              @click="emit('viewAll')"
              class="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-gold)] hover:bg-[var(--accent-dark-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl transition-colors"
            >
              Explorar Lojas
              <ArrowRight class="w-5 h-5" />
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              v-for="(beneficio, index) in beneficios"
              :key="index"
              class="bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-xl p-4 text-center"
            >
              <div class="w-12 h-12 rounded-full bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] flex items-center justify-center mx-auto mb-3">
                <component :is="beneficio.icon" class="w-6 h-6 text-[var(--accent-gold)]" />
              </div>
              <h4 class="font-semibold text-[var(--text-primary)] text-sm mb-1">{{ beneficio.title }}</h4>
              <p class="text-[var(--text-muted)] text-xs">{{ beneficio.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
