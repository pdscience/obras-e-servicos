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
        <img src="/assets/images/logo_os.png" alt="Logo Obras e Serviços" class="home-cta-banner__img" @error="(e) => { (e.target as HTMLImageElement).src = logoSrc }" />
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
  background: #fff;
  padding: 60px 20px;
  font-family: 'Poppins', sans-serif;
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
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  line-height: 1.2;
  color: #1a1a2e;
  margin-bottom: 32px;
}

.home-cta-banner__title span {
  color: #c9930a;
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
  padding: 14px 28px;
  border-radius: 0;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.home-cta-banner__btn:active {
  transform: scale(0.98);
}

.home-cta-banner__btn--primary {
  background-color: #c9930a;
  color: #fff;
  border: 2px solid #c9930a;
}

.home-cta-banner__btn--primary:hover {
  background-color: #a87b08;
  border-color: #a87b08;
}

.home-cta-banner__btn--outline {
  background: transparent;
  color: #1a1a2e;
  border: 2px solid #cbd5e1;
}

.home-cta-banner__btn--outline:hover {
  border-color: #1a1a2e;
  background-color: rgba(0,0,0,0.03);
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