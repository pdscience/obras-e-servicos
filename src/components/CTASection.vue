<script setup lang="ts">
import { Briefcase, Store, ArrowRight, CheckCircle } from '@lucide/vue'

const emit = defineEmits<{
  register: [type: 'client' | 'professional' | 'lojista']
  viewStores: []
}>()
</script>

<template>
  <section class="py-16 md:py-24" style="background:var(--bg-page)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-8 md:p-10 text-[var(--text-secondary)] relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/10 rounded-full blur-3xl"></div>

          <div class="relative z-10">
            <div class="w-14 h-14 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center mb-6">
              <Store class="w-7 h-7 text-[var(--accent-gold)]" />
            </div>

            <h3 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">Precisa de Material ou Insumo?</h3>
            <p class="text-[var(--text-muted)] mb-6">Encontre lojas próximas com tudo o que você precisa para sua obra ou reforma.</p>

            <ul class="space-y-3 mb-8">
              <li v-for="(item, i) in ['Lojas verificadas e bem avaliadas', 'Materiais, ferramentas e equipamentos', 'Entrega rápida na sua região', 'Pagamento seguro e protegido']" :key="i" class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-[var(--accent-green)] flex-shrink-0" />
                <span class="text-[var(--text-muted)] text-sm">{{ item }}</span>
              </li>
            </ul>

            <button @click="emit('viewStores')" class="w-full sm:w-auto px-6 py-3 bg-[var(--accent-gold)] hover:bg-[var(--accent-dark-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              Ver Lojas Cadastradas <ArrowRight class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="bg-[var(--accent-gold)] rounded-3xl p-8 md:p-10 text-[var(--text-on-accent)] relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div class="relative z-10">
            <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Briefcase class="w-7 h-7 text-white" />
            </div>

            <h3 class="text-2xl md:text-3xl font-bold mb-4">É Profissional?</h3>
            <p class="text-[var(--text-on-accent)]/70 mb-6">Junte-se a milhares de profissionais e receba clientes todos os dias.</p>

            <ul class="space-y-3 mb-8">
              <li v-for="(item, i) in ['Receba pedidos de serviço na sua região', 'Aumente sua renda e visibilidade', 'Pagamentos garantidos e sem atrasos', 'Ferramentas de gestão e agenda']" :key="i" class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-white flex-shrink-0" />
                <span class="text-[var(--text-on-accent)]/70 text-sm">{{ item }}</span>
              </li>
            </ul>

            <button @click="emit('register', 'professional')" class="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              Cadastrar como Profissional <ArrowRight class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-8 md:p-10 text-[var(--text-secondary)] relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/10 rounded-full blur-3xl"></div>

          <div class="relative z-10">
            <div class="w-14 h-14 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center mb-6">
              <Store class="w-7 h-7 text-[var(--accent-gold)]" />
            </div>

            <h3 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">É Lojista?</h3>
            <p class="text-[var(--text-muted)] mb-6">Divulgue seus materiais e insumos para milhares de profissionais de obra.</p>

            <ul class="space-y-3 mb-8">
              <li v-for="(item, i) in ['Cadastre seus produtos e preços', 'Alcance profissionais da sua região', 'Gerenciate pedidos e entregas', 'Aumente suas vendas']" :key="i" class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-[var(--accent-gold)] flex-shrink-0" />
                <span class="text-[var(--text-muted)] text-sm">{{ item }}</span>
              </li>
            </ul>

            <button @click="emit('register', 'lojista')" class="w-full sm:w-auto px-6 py-3 bg-[var(--accent-gold)] hover:bg-[var(--accent-dark-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              Cadastrar como Lojista <ArrowRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
