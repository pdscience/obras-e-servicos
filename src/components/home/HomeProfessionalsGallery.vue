<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight } from '@lucide/vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const emit = defineEmits<{
  select: [label: string, slug: string]
  viewAll: []
}>()

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const gallery = [
  { label: 'Pedreiro', img: '/assets/images/Pedreiro.png', slug: 'mc-1' },
  { label: 'Eletricista', img: '/assets/images/Eletricista.svg', slug: 'mc-2' },
  { label: 'Encanador', img: '/assets/images/Encanador.svg', slug: 'mc-3' },
  { label: 'Pintor', img: '/assets/images/Pintor.svg', slug: 'mc-4' },
  { label: 'Mestre de Obras', img: '/assets/images/Mestre de Obras.svg', slug: 'mc-1' },
  { label: 'Ar-Condicionado', img: '/assets/images/Técnico de Ar-Condicionado.svg', slug: 'mc-5' },
  { label: 'Manutenção', img: '/assets/images/Técnico de Manutenção.svg', slug: 'mc-5' },
]

function selectItem(label: string, slug: string) {
  emit('select', label, slug)
}
</script>

<template>
  <section ref="root" class="home-gallery" id="categorias">
    <div class="home-gallery__head" data-reveal>
      <span class="home-gallery__eyebrow">QUEM FAZ ACONTECER</span>
      <h2 class="home-gallery__title">Profissionais prontos para te atender</h2>
      <p class="home-gallery__sub">Do projeto à decoração, conectamos você aos melhores profissionais da sua região.</p>
    </div>

    <div class="home-gallery__track-wrapper" aria-hidden="true" data-reveal>
      <div class="home-gallery__track">
        <div v-for="(item, i) in gallery" :key="`a-${i}`" class="prof-card" @click="selectItem(item.label, item.slug)">
          <div class="prof-card__img-wrap">
            <img :src="item.img" :alt="item.label" class="prof-card__img" />
          </div>
          <div class="prof-card__label">{{ item.label }}</div>
        </div>
        <div v-for="(item, i) in gallery" :key="`b-${i}`" class="prof-card" aria-hidden="true">
          <div class="prof-card__img-wrap">
            <img :src="item.img" :alt="''" class="prof-card__img" />
          </div>
          <div class="prof-card__label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <div class="home-gallery__cta" data-reveal>
      <button class="home-gallery__btn" @click="emit('viewAll')">
        Ver todos os profissionais
        <ArrowRight class="w-5 h-5" />
      </button>
    </div>
  </section>
</template>

<style scoped>
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.home-gallery {
  background: #fff;
  padding: 80px 0 72px;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

.home-gallery__head {
  text-align: center;
  margin-bottom: 56px;
  padding: 0 20px;
}

.home-gallery__eyebrow {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c9930a;
  margin-bottom: 12px;
}

.home-gallery__title {
  font-size: clamp(1.75rem, 3vw, 2.4rem);
  font-weight: 400;
  color: #1a1a2e;
  line-height: 1.2;
  margin-bottom: 14px;
}

.home-gallery__sub {
  font-size: 1rem;
  color: #6b7280;
  max-width: 540px;
  margin-inline: auto;
  line-height: 1.65;
}

.home-gallery__track-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%);
}

.home-gallery__track {
  display: flex;
  width: max-content;
  gap: 48px;
  align-items: flex-end;
  animation: marquee-scroll 20s linear infinite;
  will-change: transform;
  padding: 20px 0;
}

.home-gallery__track-wrapper:hover .home-gallery__track {
  animation-play-state: paused;
}

.prof-card {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.prof-card__img-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
}

.prof-card__img-wrap::before {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 24px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
  z-index: -1;
  pointer-events: none;
}

.prof-card__img {
  width: auto;
  height: 260px;
  object-fit: contain;
  object-position: bottom center;
  display: block;
  transition: transform 0.35s ease;
}

.prof-card:hover .prof-card__img {
  transform: translateY(-8px) scale(1.04);
}

.prof-card__label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  text-align: center;
  margin-top: 16px;
  letter-spacing: 0.02em;
}

.prof-card:hover .prof-card__label {
  color: #c9930a;
}

.home-gallery__cta {
  display: flex;
  justify-content: center;
  margin-top: 48px;
  padding: 0 20px;
}

.home-gallery__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background-color: #d4a017;
  color: #fff;
  border: 2px solid #d4a017;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.home-gallery__btn:hover {
  background-color: #b88a0d;
  border-color: #b88a0d;
}

@media (max-width: 768px) {
  .home-gallery { padding: 56px 0 48px; }
  .home-gallery__head { margin-bottom: 40px; }
  .home-gallery__track { gap: 32px; animation-duration: 16s; }
  .prof-card__img { height: 180px; }
}

@media (max-width: 480px) {
  .home-gallery__track { gap: 24px; animation-duration: 14s; }
  .prof-card__img { height: 140px; }
}
</style>
