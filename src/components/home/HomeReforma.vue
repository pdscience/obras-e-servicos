<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight } from '@lucide/vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const emit = defineEmits<{ plan: [] }>()

function imgError(e: Event) {
  ;(e.target as HTMLElement).style.display = 'none'
}
</script>

<template>
  <section ref="root" class="home-reforma">
    <div class="home-reforma__inner">
      <div class="home-reforma__visual reveal-on-scroll" data-reveal>
        <div class="home-reforma__photo">
          <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=820&q=80"
            alt="Reforma em andamento, com ferramentas e materiais de construção"
            @error="imgError"
          />
        </div>
      </div>

      <div class="home-reforma__content reveal-on-scroll" data-reveal>
        <h2 class="home-reforma__title font-display">
          <span class="home-reforma__title-gray">Vai encarar uma reforma?</span>
          <span class="home-reforma__title-gold">Chega de dor de cabeça.</span>
        </h2>
        <p class="home-reforma__sub">
          Encontre os profissionais certos para cada etapa e tire o seu projeto do papel.
        </p>
        <button class="home-reforma__btn" @click="emit('plan')">
          Quero planejar minha reforma
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-reforma {
  background: var(--bg-card);
  padding: clamp(3.5rem, 7vw, 6rem) 1.5rem;
  overflow: hidden;
}

.home-reforma__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}

.home-reforma__photo {
  position: relative;
  border-radius: 2rem;
  overflow: hidden;
  aspect-ratio: 4 / 3.1;
  background: linear-gradient(150deg, #efe3c8, #dcbd85);
  box-shadow: 0 30px 60px -28px rgba(90, 60, 20, 0.4);
}

.home-reforma__photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(20, 14, 8, 0.12));
}

.home-reforma__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.home-reforma__title {
  font-size: clamp(1.7rem, 3.6vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.18;
  margin-bottom: 1.1rem;
}

.home-reforma__title-gray {
  display: block;
  color: var(--text-primary);
}

.home-reforma__title-gold {
  display: block;
  color: var(--accent-gold);
}

.home-reforma__sub {
  color: var(--text-muted);
  line-height: 1.7;
  font-size: 1.02rem;
  max-width: 28rem;
  margin-bottom: 1.8rem;
}

.home-reforma__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--bg-card);
  font-weight: 600;
  font-size: 0.97rem;
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.home-reforma__btn:hover {
  transform: translateY(-2px);
  opacity: 0.92;
}

.home-reforma__btn:active {
  transform: scale(0.98);
}

@media (max-width: 820px) {
  .home-reforma__inner {
    grid-template-columns: 1fr;
  }

  .home-reforma__visual {
    order: -1;
  }
}
</style>