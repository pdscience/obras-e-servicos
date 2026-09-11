<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { PLANOS_LISTA } from '@/config/planos'
import type { PlanoProfissional } from '@/types'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const emit = defineEmits<{ selectPlan: [plano: PlanoProfissional] }>()

const planImages: Record<string, string> = {
  bronze: '/assets/images/bronze.png',
  prata: '/assets/images/prata.png',
  ouro: '/assets/images/ouro.png',
  diamante: '/assets/images/diamante.png',
}

function formatPrice(preco: number) {
  return preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <section ref="root" class="home-pricing" id="planos">
    <div class="home-pricing__inner">
      <div class="pricing__header" data-reveal>
        <h2 class="pricing__title">Um plano para cada fase do seu negócio</h2>
        <p class="pricing__subtitle">Atraia clientes da sua região, aumente sua visibilidade e feche mais obras todos os dias.</p>
      </div>

      <div class="pricing__grid">
        <div
          v-for="plano in PLANOS_LISTA"
          :key="plano.id"
          class="pricing-card-wrapper"
          data-reveal
        >
          <div v-if="plano.id === 'ouro'" class="pricing-card__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span>RECOMENDADO</span>
          </div>

          <article class="pricing-card">
            <div class="pricing-card__icon" :class="`icon--${plano.id}`">
              <img :src="planImages[plano.id]" :alt="`Ícone ${plano.nome}`" />
            </div>

            <h3 class="pricing-card__name">{{ plano.nome }}</h3>
            <p class="pricing-card__desc">{{ plano.foco }}</p>

            <div class="pricing-card__price-wrap">
              <span class="pricing-card__currency">R$</span>
              <span class="pricing-card__price">{{ formatPrice(plano.preco) }}</span>
              <span class="pricing-card__period">/mês</span>
            </div>

            <ul class="pricing-card__features">
              <li v-for="(beneficio, j) in plano.beneficios" :key="j" class="pricing-card__feature">
                <span class="pricing-card__check-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                <span>{{ beneficio }}</span>
              </li>
            </ul>

            <button class="pricing-card__btn" @click="emit('selectPlan', plano.id)">
              Assinar {{ plano.nome }}
            </button>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-pricing {
  padding: 80px 0;
  background: radial-gradient(circle at top, #fafafa 0%, #f1f2f5 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

.home-pricing::before {
  content: "";
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 120%;
  height: 60%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
}

.home-pricing__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  position: relative;
  z-index: 1;
}

.pricing__header {
  text-align: center;
  margin-bottom: 60px;
}

.pricing__title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.pricing__subtitle {
  font-size: 1.125rem;
  color: #555555;
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.6;
}

.pricing__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: stretch;
}

@media (min-width: 768px) {
  .pricing__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1100px) {
  .pricing__grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

.pricing-card-wrapper {
  perspective: 1200px;
  height: 100%;
  position: relative;
  padding-top: 22px;
}

.pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24px 24px 22px;
  border-radius: 20px;
  height: 100%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease;
  overflow: hidden;
  background-color: #ffffff;
}

.pricing-card > * {
  z-index: 3;
  position: relative;
}

.pricing-card-wrapper:hover .pricing-card {
  transform: translateY(-10px) scale(1.015);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.pricing-card-wrapper:nth-child(1) .pricing-card {
  background: linear-gradient(135deg, #3F2418 0%, #75442F 25%, #A86B43 50%, #C8895D 75%, #E1A474 100%);
  border: 1px solid rgba(225, 164, 116, 0.3);
  color: #fff;
}

.pricing-card-wrapper:nth-child(2) .pricing-card {
  background: linear-gradient(135deg, #6D737A 0%, #9CA3AA 25%, #F5F6F7 50%, #D7DBDE 75%, #A5ABB1 100%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #1f2937;
}

.pricing-card-wrapper:nth-child(3) .pricing-card {
  background: linear-gradient(135deg, #7A5200 0%, #B87900 25%, #F5C342 50%, #FFE58A 75%, #FFF1B3 100%);
  border: 1px solid rgba(255, 241, 179, 0.8);
  color: #3f2a00;
  box-shadow: 0 10px 30px rgba(184, 121, 0, 0.15);
}

@media (min-width: 1100px) {
  .pricing-card-wrapper:nth-child(3) .pricing-card {
    transform: translateY(-8px);
    padding-top: 28px;
    padding-bottom: 26px;
  }
}

.pricing-card-wrapper:nth-child(4) .pricing-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(240,250,255,0.4) 50%, rgba(220,240,255,0.2) 100%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 160, 255, 0.05);
  color: #0f172a;
}

.pricing-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 4px 10px rgba(0, 0, 0, 0.1);
}

.pricing-card__icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.2);
}

.icon--bronze { background: linear-gradient(135deg, #75442F, #E1A474); border: 2px solid #C8895D; }
.icon--prata { background: linear-gradient(135deg, #9CA3AA, #F5F6F7); border: 2px solid #D7DBDE; }
.icon--ouro { background: linear-gradient(135deg, #F5C342, #FFF1B3); border: 2px solid #FFE58A; }
.icon--diamante { background: linear-gradient(135deg, #e0f2fe, #ffffff); border: 2px solid #bae6fd; }

.pricing-card__badge {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #FFF3C4 0%, #D4A017 40%, #A67C00 100%);
  color: #1a1a1a;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 8px 20px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 20px rgba(212, 160, 23, 0.35);
  z-index: 10;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.pricing-card__name {
  font-size: 1.375rem;
  font-weight: 800;
  margin-bottom: 4px;
  color: inherit;
}

.pricing-card__desc {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 14px;
  opacity: 0.85;
}

.pricing-card__price-wrap {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 20px;
}

.pricing-card__currency {
  font-size: 0.875rem;
  font-weight: 700;
  margin-top: 6px;
}

.pricing-card__price {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}

.pricing-card__period {
  font-size: 0.8125rem;
  align-self: flex-end;
  margin-bottom: 6px;
  opacity: 0.75;
  font-weight: 500;
}

.pricing-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.pricing-card__feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25;
}

.pricing-card__check-wrap {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pricing-card__check-wrap svg {
  width: 9px;
  height: 9px;
  stroke: #fff;
  stroke-width: 3;
}

.pricing-card-wrapper:nth-child(1) .pricing-card__check-wrap { background: #A86B43; }
.pricing-card-wrapper:nth-child(2) .pricing-card__check-wrap { background: #6D737A; }
.pricing-card-wrapper:nth-child(3) .pricing-card__check-wrap { background: #B87900; }
.pricing-card-wrapper:nth-child(4) .pricing-card__check-wrap { background: #0284c7; }

.pricing-card__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.pricing-card-wrapper:nth-child(1) .pricing-card__btn { background: linear-gradient(135deg, #75442F, #3F2418); color: #fff; }
.pricing-card-wrapper:nth-child(2) .pricing-card__btn { background: linear-gradient(135deg, #4b5563, #1f2937); color: #fff; }
.pricing-card-wrapper:nth-child(3) .pricing-card__btn { background: linear-gradient(135deg, #FFF1B3, #F5C342); color: #3f2a00; border: 1px solid #FFE58A; }
.pricing-card-wrapper:nth-child(4) .pricing-card__btn { background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; }

.pricing-card__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}
</style>
