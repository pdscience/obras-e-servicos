<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const testimonials = [
  {
    initials: 'MS',
    color: '#3b82f6',
    name: 'Mariana Silva',
    role: 'Cliente · Avaliado em 2025',
    text: 'Encontrei um eletricista excelente em menos de 2 horas. O serviço foi feito no mesmo dia e o preço foi justo. Super recomendo!',
  },
  {
    initials: 'FG',
    color: '#f59e0b',
    name: 'Fernando Gomes',
    role: 'Cliente · Avaliado em 2025',
    text: 'Precisava de um pedreiro urgente para consertar um vazamento na minha cozinha. O profissional chegou no horário e resolveu tudo rápido. Recomendo muito!',
  },
  {
    initials: 'CM',
    color: '#7c3aed',
    name: 'Carla Mendes',
    role: 'Cliente · Avaliado em 2026',
    text: 'Fiz reforma no apartamento inteiro com profissionais encontrados aqui. Tudo dentro do prazo e com qualidade incrível. Vou usar sempre!',
  },
  {
    initials: 'JP',
    color: '#10b981',
    name: 'João Pedro',
    role: 'Cliente · Avaliado em 2025',
    text: 'Contratei um montador de móveis e ele foi super atencioso. Montou o guarda-roupa em tempo recorde sem deixar sujeira.',
  },
  {
    initials: 'PL',
    color: '#ec4899',
    name: 'Patrícia Lima',
    role: 'Cliente · Avaliado em 2026',
    text: 'Achei um encanador nota 10 no domingo à noite! Salvou minha casa de um alagamento. Serviço impecável e preço ótimo.',
  },
]
</script>

<template>
  <section ref="root" class="home-testimonials">
    <div class="home-testimonials__head" data-reveal>
      <h2 class="home-testimonials__title font-display">O que nossos usuários dizem</h2>
    </div>

    <div class="home-marquee home-testimonials__marquee" data-reveal>
      <div class="home-marquee__track" :style="{ '--marquee-duration': '55s' }">
        <article
          v-for="(t, i) in testimonials"
          :key="`a-${i}`"
          class="home-testimonial-card"
        >
          <div class="home-testimonial-card__stars" aria-label="5 de 5 estrelas">
            <svg v-for="s in 5" :key="s" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p class="home-testimonial-card__text">"{{ t.text }}"</p>
          <div class="home-testimonial-card__author">
            <div class="home-testimonial-card__avatar" :style="{ backgroundColor: t.color }">{{ t.initials }}</div>
            <div>
              <strong class="home-testimonial-card__name">{{ t.name }}</strong>
              <span class="home-testimonial-card__role">{{ t.role }}</span>
            </div>
          </div>
        </article>

        <article
          v-for="(t, i) in testimonials"
          :key="`b-${i}`"
          class="home-testimonial-card"
          aria-hidden="true"
        >
          <div class="home-testimonial-card__stars" aria-hidden="true">
            <svg v-for="s in 5" :key="s" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p class="home-testimonial-card__text">"{{ t.text }}"</p>
          <div class="home-testimonial-card__author">
            <div class="home-testimonial-card__avatar" :style="{ backgroundColor: t.color }">{{ t.initials }}</div>
            <div>
              <strong class="home-testimonial-card__name">{{ t.name }}</strong>
              <span class="home-testimonial-card__role">{{ t.role }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-testimonials {
  background: #ffffff;
  padding: 64px 0;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

.home-testimonials__head {
  max-width: 44rem;
  margin: 0 auto 40px;
  padding: 0 20px;
  text-align: center;
}

.home-testimonials__title {
  font-size: clamp(26px, 3vw, 36px);
  font-weight: 400;
  color: #1a1a1a;
}

.home-testimonial-card {
  width: 350px;
  flex-shrink: 0;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 24px;
  margin: 0 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.home-testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 44px -24px rgba(212, 160, 23, 0.3);
}

.home-testimonial-card__stars {
  display: flex;
  gap: 2px;
  color: #ffb800;
  margin-bottom: 16px;
}

.home-testimonial-card__text {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #555555;
  margin-bottom: 24px;
  flex: 1;
  font-style: italic;
}

.home-testimonial-card__author {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-top: 1px solid var(--border-default);
  padding-top: 1rem;
}

.home-testimonial-card__avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.home-testimonial-card__name {
  display: block;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
}

.home-testimonial-card__role {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

@media (max-width: 560px) {
  .home-testimonial-card {
    width: 78vw;
  }
}
</style>