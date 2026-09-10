<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, UserPlus } from '@lucide/vue'
import logoSrc from '@/assets/logo.png'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const emit = defineEmits<{ findPro: []; register: [] }>()
</script>

<template>
  <section ref="root" class="home-cta-banner">
    <div class="home-cta-banner__inner">
      <div class="home-cta-banner__logo reveal-on-scroll" data-reveal>
        <img :src="logoSrc" alt="Logo OS – Obras & Serviços" class="home-cta-banner__img" />
      </div>

      <div class="home-cta-banner__content reveal-on-scroll" data-reveal>
        <h2 class="home-cta-banner__title font-display">
          Conectando<br />
          <span>clientes, profissionais e lojistas</span>
        </h2>
        <div class="home-cta-banner__actions">
          <button class="home-cta-banner__btn home-cta-banner__btn--primary" @click="emit('findPro')">
            Encontrar profissionais
            <ArrowRight class="w-5 h-5" />
          </button>
          <button class="home-cta-banner__btn home-cta-banner__btn--outline" @click="emit('register')">
            <UserPlus class="w-5 h-5" />
            Sou profissional
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-cta-banner {
  background: var(--bg-page);
  padding: clamp(3.5rem, 7vw, 5.5rem) 1.5rem;
}

.home-cta-banner__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}

.home-cta-banner__logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-cta-banner__img {
  max-width: min(100%, 22rem);
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 16px 30px rgba(90, 60, 20, 0.18));
}

.home-cta-banner__title {
  font-size: clamp(1.7rem, 3.8vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 1.6rem;
}

.home-cta-banner__title span {
  color: var(--accent-gold);
}

.home-cta-banner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
}

.home-cta-banner__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.95rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  white-space: nowrap;
}

.home-cta-banner__btn:active {
  transform: scale(0.98);
}

.home-cta-banner__btn--primary {
  background: var(--accent-gold);
  color: #fff;
  border: none;
  box-shadow: 0 12px 26px -14px rgba(212, 160, 23, 0.55);
}

.home-cta-banner__btn--primary:hover {
  background: var(--accent-dark-gold);
}

.home-cta-banner__btn--outline {
  background: transparent;
  color: var(--text-primary);
  border: 1.5px solid var(--border-raised);
}

.home-cta-banner__btn--outline:hover {
  border-color: var(--accent-gold);
  color: var(--accent-dark-gold);
}

@media (max-width: 820px) {
  .home-cta-banner__inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .home-cta-banner__actions {
    justify-content: center;
  }

  .home-cta-banner__img {
    max-width: 14rem;
  }
}
</style>