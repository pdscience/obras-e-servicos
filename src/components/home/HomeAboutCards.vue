<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const cards = [
  {
    title: 'Por que a OS – Obras & Serviços Existe?',
    text: 'A OS – Obras & Serviços nasceu para eliminar a dor de cabeça de quem precisa encontrar um bom profissional e a dificuldade de quem quer mostrar o próprio trabalho. Acreditamos que contratar um serviço ou conquistar novos clientes não deveria ser algo burocrático, cheio de intermediários ou taxas abusivas. Criamos um espaço direto, transparente e feito para valorizar o mercado local.',
  },
  {
    title: 'Nossa Missão',
    text: 'Simplificar a conexão entre clientes e profissionais, impulsionando a economia local através da tecnologia e da autonomia. Trabalhamos para dar visibilidade a quem faz acontecer, oferecendo uma forma prática de encontrar especialistas para qualquer necessidade, do pequeno reparo à grande obra, sempre com negociação direta.',
  },
  {
    title: 'O que nos move',
    text: 'O respeito pelo trabalho de quem constrói, conserta e transforma o nosso dia a dia. O que nos faz levantar da cama é saber que podemos dar voz e espaço para o profissional crescer, ao mesmo tempo em que facilitamos a vida de quem está com um problema em casa e precisa de uma solução rápida e sem enrolação.',
  },
]
</script>

<template>
  <section ref="root" id="sobre" class="home-about-cards">
    <div class="home-about-cards__bg" aria-hidden="true"></div>
    <div class="home-about-cards__overlay" aria-hidden="true"></div>

    <div class="home-about-cards__inner">
      <div class="home-section-head home-section-head--dark" data-reveal>
        <h2 class="home-section-head__title font-display">Sobre a OS</h2>
      </div>

      <div class="home-about-cards__grid">
        <article
          v-for="(card, i) in cards"
          :key="card.title"
          class="home-about-cards__card"
          :class="`reveal-delay-${i}`"
          data-reveal
        >
          <h3 class="home-about-cards__title font-display">{{ card.title }}</h3>
          <p class="home-about-cards__text">{{ card.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-about-cards {
  position: relative;
  overflow: hidden;
  padding: clamp(3.5rem, 7vw, 6rem) 1.5rem;
  color: #f5f0e6;
}

.home-about-cards__bg {
  position: absolute;
  inset: 0;
  background: url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  transform: scale(1.02);
}

.home-about-cards__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 12, 15, 0.86), rgba(10, 12, 15, 0.94));
}

.home-about-cards__inner {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.home-section-head--dark {
  text-align: center;
  margin-bottom: clamp(2rem, 4vw, 3rem);
}

.home-section-head--dark :deep(.home-section-head__title) {
  color: #ffffff;
}

.home-about-cards__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.home-about-cards__card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1.5rem;
  padding: 2rem 1.7rem;
  backdrop-filter: blur(6px);
  transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}

.home-about-cards__card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(232, 183, 42, 0.45);
}

.home-about-cards__title {
  font-size: 1.12rem;
  font-weight: 600;
  color: #f7f2e8;
  margin-bottom: 0.7rem;
}

.home-about-cards__text {
  font-size: 0.9rem;
  line-height: 1.7;
  color: rgba(245, 240, 230, 0.78);
}

@media (max-width: 860px) {
  .home-about-cards__grid {
    grid-template-columns: 1fr;
  }
}
</style>