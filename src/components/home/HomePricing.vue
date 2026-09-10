<script setup lang="ts">
import { ref, type Component } from 'vue'
import { Medal, Award, Crown, Gem, Check } from '@lucide/vue'
import { PLANOS_LISTA, CORES_PLANO } from '@/config/planos'
import type { PlanoProfissional, PlanoConfig } from '@/types'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const emit = defineEmits<{ selectPlan: [plano: PlanoProfissional] }>()

const icons: Record<string, Component> = {
  bronze: Medal,
  prata: Award,
  ouro: Crown,
  diamante: Gem,
}

function formatPrice(preco: number) {
  return preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function planoIcon(plano: PlanoConfig) {
  return icons[plano.id]
}
</script>

<template>
  <section ref="root" class="home-pricing">
    <div class="home-pricing__inner">
      <div class="home-section-head" data-reveal>
        <h2 class="home-section-head__title font-display">Um plano para cada fase do seu negócio</h2>
        <p class="home-section-head__sub">Atraia clientes da sua região, aumente sua visibilidade e feche mais obras todos os dias.</p>
      </div>

      <div class="home-pricing__grid">
        <div
          v-for="(plano, i) in PLANOS_LISTA"
          :key="plano.id"
          class="home-pricing__card-wrap"
          :class="`reveal-delay-${i > 2 ? 3 : i}`"
          data-reveal
        >
          <div
            v-if="plano.id === 'ouro'"
            class="home-pricing__badge"
            :style="{ background: CORES_PLANO[plano.id].badge }"
          >
            <Star class="w-3.5 h-3.5" />
            <span>RECOMENDADO</span>
          </div>

          <article class="home-pricing__card">
            <div
              class="home-pricing__icon"
              :style="{
                background: `${CORES_PLANO[plano.id].from}1f`,
                color: CORES_PLANO[plano.id].text,
              }"
            >
              <component :is="planoIcon(plano)" class="w-9 h-9" />
            </div>

            <h3 class="home-pricing__name font-display">{{ plano.nome }}</h3>
            <p class="home-pricing__desc">{{ plano.foco }}</p>

            <div class="home-pricing__price-wrap">
              <span class="home-pricing__currency">R$</span>
              <span class="home-pricing__price">{{ formatPrice(plano.preco) }}</span>
              <span class="home-pricing__period">/mês</span>
            </div>

            <ul class="home-pricing__features">
              <li
                v-for="(beneficio, j) in plano.beneficios"
                :key="j"
                class="home-pricing__feature"
              >
                <span class="home-pricing__check" :style="{ color: CORES_PLANO[plano.id].text, borderColor: CORES_PLANO[plano.id].text + '55' }">
                  <Check class="w-3.5 h-3.5" />
                </span>
                <span>{{ beneficio }}</span>
              </li>
            </ul>

            <button
              class="home-pricing__btn"
              :class="{ 'home-pricing__btn--hot': plano.id === 'ouro' }"
              :style="plano.id === 'ouro' ? { background: CORES_PLANO[plano.id].badge, color: '#fff' } : undefined"
              @click="emit('selectPlan', plano.id)"
            >
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
  background: var(--bg-page);
  padding: clamp(3.5rem, 7vw, 6rem) 1.5rem;
}

.home-pricing__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.home-pricing__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.4rem;
  align-items: stretch;
}

.home-pricing__card-wrap {
  position: relative;
  display: flex;
  height: 100%;
}

.home-pricing__badge {
  position: absolute;
  top: -0.85rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  box-shadow: 0 10px 22px -10px rgba(212, 160, 23, 0.7);
  white-space: nowrap;
}

.home-pricing__card {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 1.6rem;
  padding: 2.2rem 1.5rem 1.8rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.home-pricing__card-wrap:hover .home-pricing__card {
  transform: translateY(-6px);
  box-shadow: 0 26px 50px -28px rgba(212, 160, 23, 0.35);
}

.home-pricing__icon {
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.1rem;
}

.home-pricing__name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.home-pricing__desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 1.1rem;
}

.home-pricing__price-wrap {
  display: flex;
  align-items: baseline;
  gap: 0.15rem;
  margin-bottom: 1.4rem;
}

.home-pricing__currency {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.home-pricing__price {
  font-size: clamp(1.9rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.home-pricing__period {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.home-pricing__features {
  list-style: none;
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 1.7rem;
  flex: 1;
}

.home-pricing__feature {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--text-secondary);
}

.home-pricing__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  flex-shrink: 0;
  margin-top: 0.08rem;
}

.home-pricing__btn {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  border: 1.5px solid var(--border-raised);
  background: transparent;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-pricing__btn:hover {
  border-color: var(--accent-gold);
  color: var(--accent-dark-gold);
  transform: translateY(-1px);
}

.home-pricing__btn--hot {
  border: none;
  box-shadow: 0 14px 30px -14px rgba(212, 160, 23, 0.7);
}

.home-pricing__btn--hot:hover,
.home-pricing__btn--hot:focus-visible {
  border: none;
  color: #fff;
  filter: brightness(1.06);
}

@media (max-width: 1024px) {
  .home-pricing__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 620px) {
  .home-pricing__grid {
    grid-template-columns: 1fr;
  }
}
</style>