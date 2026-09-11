<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

type TabKey = 'client' | 'pro' | 'lojista'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'client', label: 'Para Clientes' },
  { key: 'pro', label: 'Para Profissionais' },
  { key: 'lojista', label: 'Para Lojistas' },
]

const groups: Record<TabKey, { img: string; title: string; text: string }[]> = {
  client: [
    { img: '/assets/images/descreva.png', title: 'Crie seu perfil', text: 'Cadastre-se gratuitamente, informe sua localização, busque pelo profissional, solicite orçamentos ou entre em contato direto.' },
    { img: '/assets/images/compare.png', title: 'Compare profissionais', text: 'Veja perfis, avaliações e portfólios de quem está disponível na sua região.' },
    { img: '/assets/images/contrate.png', title: 'Contrate sem complicação', text: 'Avalie as opções e feche o serviço direto com o profissional da sua escolha.' },
  ],
  pro: [
    { img: '/assets/images/cadastro.png', title: 'Crie seu perfil', text: 'Escolha o melhor plano para você, cadastre até 3 profissões, adicione até 9 fotos no portfólio e conte com um escritório virtual completo. Tudo isso sem fidelidade e com liberdade para cancelar quando quiser.' },
    { img: '/assets/images/recebaorçamento.png', title: 'Receba oportunidades', text: 'Conecte-se diretamente com quem precisa dos seus serviços. O cliente fala com você pelo WhatsApp de forma direta, sem intermediários, para fechar o trabalho com rapidez.' },
    { img: '/assets/images/maisclientela.png', title: 'Amplie sua base de clientes', text: 'Dê mais visibilidade ao seu trabalho integrando suas redes sociais diretamente no perfil, conquiste novos contratos e faça sua clientela crescer todos os dias.' },
  ],
  lojista: [
    { img: '/assets/images/anuncia_seus_produtos.png', title: 'Anuncie seus Produtos', text: 'Cadastre seus produtos, ferramentas, materiais de construção e equipamentos com facilidade e alcance quem está construindo ou reformando na sua região.' },
    { img: '/assets/images/potencialize_suas_vendas.png', title: 'Potencialize suas vendas', text: 'Ganhe destaque regional, conecte-se diretamente com profissionais e clientes, feche pedidos, expanda suas vendas sem perder tempo.' },
    { img: '/assets/images/aumentar_faturamento.png', title: 'Aumente seu faturamento', text: 'Dê mais visibilidade ao seu negócio, feche novas parcerias comerciais e faça o seu comércio crescer de forma constante.' },
  ],
}

const active = ref<TabKey>('client')
const progress = ref(0)

function select(key: TabKey) {
  active.value = key
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progress.value = 0
      requestAnimationFrame(() => {
        progress.value = 100
      })
    })
  })
}

let revealObserver: IntersectionObserver | null = null
let revealedOnce = false

onMounted(() => {
  if (typeof window === 'undefined' || !root.value) return
  revealObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && !revealedOnce) {
        revealedOnce = true
        progress.value = 100
        revealObserver?.disconnect()
      }
    },
    { threshold: 0.25 }
  )
  revealObserver.observe(root.value)
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
})
</script>

<template>
  <section ref="root" id="como-funciona" class="home-how">
    <div class="home-how__inner">
      <div class="section__header" data-reveal>
        <h2 class="section__title">Como funciona?</h2>
        <p class="section__subtitle">Contratar um profissional nunca foi tão fácil</p>
      </div>

      <div class="steps__tabs" data-reveal>
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="steps__tab"
          :class="{ 'steps__tab--active': active === tab.key }"
          @click="select(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="steps-wrapper">
        <div class="steps-progress-line">
          <div class="steps-progress-fill" :style="{ width: progress + '%' }"></div>
        </div>

        <div class="steps__grid">
          <article
            v-for="(step, i) in groups[active]"
            :key="`${active}-${i}`"
            class="step-card"
            data-reveal
          >
            <div class="step-card__icon">
              <img :src="step.img" :alt="step.title" class="step-icon" />
            </div>
            <h3 class="step-card__title">{{ step.title }}</h3>
            <p class="step-card__text">{{ step.text }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-how {
  background-color: #ffffff;
  padding: 64px 20px;
  font-family: 'Poppins', sans-serif;
}

.home-how__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.section__header {
  text-align: center;
  margin-bottom: 48px;
}

.section__title {
  font-size: clamp(26px, 3vw, 36px);
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.section__subtitle {
  font-size: 1rem;
  color: #555555;
}

.steps__tabs {
  display: flex;
  justify-content: center;
  gap: 0;
  margin-bottom: 40px;
  background-color: #f5f5f5;
  padding: 4px;
  width: fit-content;
  margin-inline: auto;
}

.steps__tab {
  padding: 10px 24px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #555555;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

@media (max-width: 639px) {
  .steps__tabs { width: 100%; }
  .steps__tab { flex: 1; padding: 10px 4px; font-size: 0.8rem; }
}

.steps__tab--active {
  background-color: #d4a017;
  color: #fff;
}

.steps-wrapper {
  position: relative;
}

.steps-progress-line {
  display: none;
}

@media (min-width: 768px) {
  .steps-progress-line {
    display: block;
    position: absolute;
    top: 70px;
    left: 16.66%;
    width: 66.66%;
    height: 3px;
    background-color: #e8e8e8;
    z-index: 0;
  }
  .steps-progress-fill {
    height: 100%;
    background-color: #d4a017;
    transition: width 0.4s ease-out;
  }
}

.steps__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .steps__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.step-card {
  background: transparent;
  border: none;
  padding: 32px 0;
  position: relative;
  z-index: 1;
  text-align: center;
}

.step-card__icon {
  position: relative;
  z-index: 2;
  display: inline-block;
  background-color: #ffffff;
  padding: 0 16px;
  margin-bottom: 16px;
}

.step-icon {
  height: 100px;
  width: auto;
  display: block;
  margin: 0 auto;
  object-fit: contain;
}

.step-card__title {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.step-card__text {
  font-size: 0.9375rem;
  color: #555555;
  line-height: 1.6;
}
</style>
