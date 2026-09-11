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
  background:
    url('/assets/images/background_sobre.jpg') center/cover no-repeat,
    url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  background-position: 20% center;
  transform: scale(1.02);
}

.home-about-cards__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
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
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.home-about-cards__card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  border-color: #d4a017;
}

.home-about-cards__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 16px;
}

.home-about-cards__title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: #d4a017;
  border-radius: 2px;
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