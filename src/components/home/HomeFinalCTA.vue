<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight } from '@lucide/vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const emit = defineEmits<{ register: [] }>()
</script>

<template>
  <section ref="root" class="home-final-cta">
    <div class="home-final-cta__inner reveal-on-scroll" data-reveal>
      <h2 class="home-final-cta__title font-display">Chega de esperar o cliente bater na sua porta.</h2>
      <p class="home-final-cta__text">
        Cadastre-se na OS – Obras &amp; Serviços e mostre sua competência para quem precisa.
        Sem burocracia, sem taxa sobre o que você ganha e com negociação direto com o cliente.
      </p>
      <button class="home-final-cta__btn" @click="emit('register')">
        Quero ser um profissional OS
        <ArrowRight class="w-5 h-5" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.home-final-cta {
  background: linear-gradient(135deg, #232a33 0%, #181d23 100%);
  color: #f5f0e6;
  padding: clamp(3.5rem, 7vw, 5.5rem) 1.5rem;
  text-align: center;
  overflow: hidden;
  position: relative;
}

.home-final-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(700px 320px at 50% 120%, rgba(212, 160, 23, 0.18), transparent 65%);
}

.home-final-cta__inner {
  position: relative;
  max-width: 46rem;
  margin: 0 auto;
}

.home-final-cta__title {
  font-size: clamp(1.7rem, 3.8vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.home-final-cta__text {
  color: rgba(245, 240, 230, 0.78);
  line-height: 1.7;
  max-width: 34rem;
  margin: 0 auto 2rem;
}

.home-final-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1.05rem 2.2rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #e8b72a, #d4a017);
  color: #2b2110;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 18px 40px -16px rgba(212, 160, 23, 0.7);
  transition: transform 0.18s ease, filter 0.18s ease;
}

.home-final-cta__btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
}

.home-final-cta__btn:active {
  transform: scale(0.98);
}
</style>