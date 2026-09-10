<script setup lang="ts">
import { ref } from 'vue'
import { FileCheck, Star, ThumbsUp } from '@lucide/vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const cards = [
  { icon: FileCheck, title: 'Faça o seu pedido', text: 'Fale o que você precisa. É rápido e de graça!' },
  { icon: Star, title: 'Receba orçamentos', text: 'Receba orçamentos de especialistas na área que busca e resolva o seu problema sem sair de casa.' },
  { icon: ThumbsUp, title: 'Negocie direto com o profissional', text: 'Sem intermediários, rápido e descomplicado.' },
]
</script>

<template>
  <section ref="root" class="home-about-intro">
    <div class="home-about-intro__inner">
      <div class="home-section-head" data-reveal>
        <h2 class="home-section-head__title font-display">O que é a OS – Obras &amp; Serviços?</h2>
        <p class="home-section-head__sub">
          A Obras &amp; Serviços é a plataforma que une clientes, profissionais e lojistas em um só lugar.
          Transformamos a forma como você contrata e oferece serviços, garantindo praticidade, confiança e
          rapidez em cada atendimento, de norte a sul do Brasil.
        </p>
      </div>

      <div class="home-about-intro__grid">
        <article
          v-for="(card, i) in cards"
          :key="card.title"
          class="home-about-intro__card"
          :class="`reveal-delay-${i}`"
          data-reveal
        >
          <div class="home-about-intro__icon">
            <component :is="card.icon" class="w-11 h-11" />
          </div>
          <h3 class="home-about-intro__title font-display">{{ card.title }}</h3>
          <p class="home-about-intro__text">{{ card.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-about-intro {
  background: var(--bg-card);
  padding: clamp(3.5rem, 7vw, 6rem) 1.5rem;
}

.home-about-intro__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.home-section-head {
  text-align: center;
  max-width: 46rem;
  margin: 0 auto clamp(2.25rem, 4.5vw, 3.5rem);
}

.home-section-head__title {
  font-size: clamp(1.6rem, 3.4vw, 2.35rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 0.9rem;
}

.home-section-head__sub {
  color: var(--text-muted);
  line-height: 1.7;
  font-size: 1rem;
}

.home-about-intro__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.home-about-intro__card {
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: 1.5rem;
  padding: 2.1rem 1.7rem;
  text-align: center;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.home-about-intro__card:hover {
  transform: translateY(-5px);
  border-color: color-mix(in srgb, var(--accent-gold) 40%, transparent);
  box-shadow: 0 18px 40px -22px rgba(212, 160, 23, 0.35);
}

.home-about-intro__icon {
  width: 4.6rem;
  height: 4.6rem;
  margin: 0 auto 1.15rem;
  border-radius: 1.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-gold);
  background: color-mix(in srgb, var(--accent-gold) 12%, transparent);
}

.home-about-intro__title {
  font-size: 1.12rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.55rem;
}

.home-about-intro__text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-muted);
}

@media (max-width: 860px) {
  .home-about-intro__grid {
    grid-template-columns: 1fr;
  }

  .home-about-intro__card {
    padding: 1.7rem 1.4rem;
  }
}
</style>