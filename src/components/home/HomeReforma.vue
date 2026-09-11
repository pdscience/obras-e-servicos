<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const emit = defineEmits<{ plan: [] }>()
</script>

<template>
  <section ref="root" class="home-reforma" id="reforma">
    <div class="home-reforma__inner">
      <div class="home-reforma__visual" data-reveal>
        <img :src="'/assets/images/vaiencarar.png'" alt="Vai encarar uma reforma?" class="home-reforma__image" />
      </div>

      <div class="home-reforma__content" data-reveal>
        <h2 class="home-reforma__title">
          <span class="home-reforma__title-gray">Vai encarar uma reforma?</span>
          <span class="home-reforma__title-gold">Chega de dor de cabeça.</span>
        </h2>
        <p class="home-reforma__sub">
          Encontre os profissionais certos para cada etapa e tire o seu projeto do papel.
        </p>
        <button class="home-reforma__btn" @click="emit('plan')">
          Quero planejar minha reforma
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-reforma {
  background: #ffffff;
  padding: 80px 20px;
  font-family: 'Poppins', sans-serif;
}

.home-reforma__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
}

@media (min-width: 992px) {
  .home-reforma__inner {
    grid-template-columns: 1fr 1fr;
    gap: 60px;
  }
}

.home-reforma__image {
  width: 100%;
  height: auto;
  display: block;
  -webkit-mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
}

.home-reforma__title {
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 400;
  line-height: 1.15;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.home-reforma__title-gray {
  display: block;
  color: #1a1a1a;
}

.home-reforma__title-gold {
  display: block;
  color: #d4a017;
}

.home-reforma__sub {
  font-size: 1.125rem;
  color: #555555;
  line-height: 1.6;
  margin-bottom: 28px;
}

.home-reforma__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  background-color: #d4a017;
  color: #fff;
  border: 2px solid #d4a017;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.home-reforma__btn:hover {
  background-color: #b88a0d;
  border-color: #b88a0d;
  transform: translateY(-2px);
}
</style>
