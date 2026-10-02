<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle2, XCircle, Clock } from '@lucide/vue'

const route = useRoute()
const router = useRouter()

// Rota curinga: /pagamento/sucesso | /pagamento/cancelado | /pagamento/expirado
const status = computed(() => {
  const p = route.path
  if (p.includes('sucesso')) return 'sucesso'
  if (p.includes('cancelado')) return 'cancelado'
  return 'expirado'
})

const config = computed(() => {
  if (status.value === 'sucesso') {
    return {
      icone: CheckCircle2,
      cor: 'text-green-500',
      titulo: 'Pagamento recebido!',
      texto:
        'Obrigado pela assinatura. A confirmação chega via Asaas em alguns instantes e seu plano será ativado automaticamente. Você já pode fechar esta aba e voltar ao painel.',
    }
  }
  if (status.value === 'cancelado') {
    return {
      icone: XCircle,
      cor: 'text-red-500',
      titulo: 'Pagamento cancelado',
      texto:
        'Você cancelou o checkout antes de concluir. Nenhum valor foi cobrado. Quando quiser, volte ao painel e escolha um plano novamente.',
    }
  }
  return {
    icone: Clock,
    cor: 'text-amber-500',
    titulo: 'Checkout expirado',
    texto:
      'O link de pagamento expirou (vale por 24 horas). Gere um novo checkout no painel para concluir sua assinatura.',
  }
})

function voltar() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
    <div class="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-8 text-center shadow-xl">
      <component :is="config.icone" class="w-14 h-14 mx-auto mb-4" :class="config.cor" />
      <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2">{{ config.titulo }}</h1>
      <p class="text-sm text-[var(--text-muted)] leading-relaxed mb-6">{{ config.texto }}</p>
      <button
        @click="voltar"
        class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        Voltar ao início
      </button>
      <p class="text-xs text-[var(--text-subtle)] mt-4">Pagamento seguro via Asaas · Pix ou cartão</p>
    </div>
  </div>
</template>
