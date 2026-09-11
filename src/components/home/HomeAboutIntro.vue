<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const cards = [
  { img: '/assets/images/pedido.svg', title: 'Faça o seu pedido', text: 'Fale o que você precisa. É rápido e de graça!' },
  { img: '/assets/images/profissionais.svg', title: 'Receba orçamentos', text: 'Receba orçamentos de especialistas na área que busca e resolva o seu problema sem sair de casa.' },
  { img: '/assets/images/like.svg', title: 'Negocie direto com o profissional', text: 'Sem intermediários, rápido e descomplicado.' },
]
</script>

<template>
  <section ref="root" class="home-about-intro" id="oque-e-os">
    <div class="home-about-intro__inner">
      <div class="home-about-intro__head" data-reveal>
        <h2 class="home-about-intro__title-main">O que é a OS - Obras &amp; Serviços?</h2>
        <p class="home-about-intro__sub">
          A Obras &amp; Serviços é a plataforma que une clientes, profissionais e lojistas em um só lugar.
          Transformamos a forma como você contrata e oferece serviços, garantindo praticidade, confiança e
          rapidez em cada atendimento, de norte a sul do Brasil.
        </p>
      </div>

      <div class="home-about-intro__grid">
        <article
          v-for="(card, i) in cards"
          :key="card.title"
          class="hiw-card"
          data-reveal
        >
          <div class="hiw-card__icon-wrapper">
            <img :src="card.img" :alt="card.title" width="100" height="100" />
          </div>
          <h3 class="hiw-card__title">{{ card.title }}</h3>
          <p class="hiw-card__text">{{ card.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-about-intro {
  padding: 60px 20px 80px;
  background-color: #ffffff;
  text-align: center;
  margin-top: -20px;
  position: relative;
  z-index: 10;
  font-family: 'Poppins', sans-serif;
}

.home-about-intro__inner {
  max-width: 1100px;
  margin: 0 auto;
}

.home-about-intro__head {
  max-width: 900px;
  margin: 0 auto 60px;
}

.home-about-intro__title-main {
  font-family: 'Poppins', sans-serif;
  font-size: 36px;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.home-about-intro__sub {
  font-size: 18px;
  line-height: 1.6;
  color: #555555;
  font-weight: 400;
}

.home-about-intro__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  max-width: 1100px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .home-about-intro__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }
}

.hiw-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hiw-card__icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hiw-card__icon-wrapper img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.hiw-card__title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.hiw-card__text {
  font-size: 16px;
  color: #555555;
  line-height: 1.5;
}
</style>
