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
  background-color: #ffffff;
  color: #1a1a1a;
  padding: 64px 20px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
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
  background: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  padding: 48px 32px;
}

.home-final-cta__title {
  font-size: clamp(22px, 2.5vw, 30px);
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.home-final-cta__text {
  color: #555555;
  line-height: 1.7;
  max-width: 34rem;
  margin: 0 auto 24px;
}

.home-final-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 16px 32px;
  border: none;
  border-radius: 0;
  background-color: #d4a017;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.home-final-cta__btn:hover {
  background-color: #b88a0d;
  transform: translateY(-1px);
}
</style>