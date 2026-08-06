<script setup lang="ts">
import HowItWorks from '@/components/HowItWorks.vue'
import CTASection from '@/components/CTASection.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleRegister(type: 'client' | 'professional' | 'lojista') {
  if (type === 'professional') {
    router.push({ name: 'register-professional' })
  } else {
    router.push({ name: 'register' })
  }
}

function handleViewStores() {
  router.push({ name: 'stores' })
}
</script>

<template>
  <div class="platform-main">
    <div class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
        Como Funciona o Obras & Serviços
      </h1>
      <p class="text-[var(--text-muted)] max-w-2xl mx-auto">
        Entenda como nossa plataforma conecta você aos melhores profissionais
      </p>
    </div>
  </div>
  <HowItWorks />
  <div class="py-16" style="background:var(--bg-page)">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
          <h3 class="text-xl font-bold text-[var(--text-primary)] mb-4">Para Clientes</h3>
          <ul class="space-y-3">
            <li v-for="(item, i) in ['Cadastro gratuito e sem compromisso', 'Receba múltiplos orçamentos', 'Pagamento seguro com garantia', 'Profissionais verificados', 'Suporte ao cliente 7 dias']" :key="i" class="flex items-center gap-2 text-[var(--text-muted)]">
              <span class="w-2 h-2 bg-[var(--accent-gold)] rounded-full"></span>
              {{ item }}
            </li>
          </ul>
        </div>
        <div class="bg-[var(--bg-card)] border border-[color-mix(in_srgb,var(--accent-gold)_30%,transparent)] rounded-2xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
          <h3 class="text-xl font-bold text-[var(--text-primary)] mb-4">Para Profissionais</h3>
          <ul class="space-y-3">
            <li v-for="(item, i) in ['Aumente sua carteira de clientes', 'Receba solicitações na sua região', 'Gerencie sua agenda online', 'Pagamentos garantidos', 'Destaque seu perfil com Premium']" :key="i" class="flex items-center gap-2 text-[var(--text-muted)]">
              <span class="w-2 h-2 bg-[var(--accent-gold)] rounded-full"></span>
              {{ item }}
            </li>
          </ul>
        </div>
        <div class="bg-[var(--bg-card)] border border-[color-mix(in srgb,var(--accent-gold)_30%,transparent)] rounded-2xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
          <h3 class="text-xl font-bold text-[var(--text-primary)] mb-4">Para Lojistas</h3>
          <ul class="space-y-3">
            <li v-for="(item, i) in ['Divulgue sua loja e produtos', 'Alcance clientes da sua região', 'Gerencie catálogo online', 'Receba pedidos digitalmente', 'Destaque-se com plano Premium']" :key="i" class="flex items-center gap-2 text-[var(--text-muted)]">
              <span class="w-2 h-2 bg-[var(--accent-gold)] rounded-full"></span>
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <CTASection @register="handleRegister" @viewStores="handleViewStores" />
</template>
