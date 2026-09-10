<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import {
  Zap, Droplets, Hammer, Paintbrush, Square, Armchair, Shield,
  Grid3x3, AppWindow, Flower2, Wind, Building2, Wrench, ArrowRight,
} from '@lucide/vue'
import { categories, mainCategories } from '@/data/mockData'
import { useScrollReveal } from '@/composables/useScrollReveal'

const emit = defineEmits<{
  select: [label: string, slug: string]
  viewAll: []
}>()

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const iconMap: Record<string, Component> = {
  Zap, Droplets, Hammer, Paintbrush, Square, Armchair, Shield,
  Grid3x3, AppWindow, Flower2, Wind, Building2,
}

const items = computed(() =>
  categories.map((cat) => {
    const main = mainCategories.find((mc) => mc.id === cat.mainCategoryId)
    return {
      label: cat.name,
      icon: iconMap[cat.icon] || Wrench,
      color: main?.color ?? '#d4a017',
      slug: cat.mainCategoryId ?? 'mc-1',
    }
  })
)

interface GalleryItem {
  label: string
  icon: Component
  color: string
  slug: string
}

function cardStyle(item: GalleryItem) {
  return {
    background: `linear-gradient(140deg, ${item.color}26, ${item.color}10)`,
    color: item.color,
  }
}
</script>

<template>
  <section ref="root" class="home-gallery" id="profissionais">
    <div class="home-gallery__head" data-reveal>
      <p class="home-gallery__eyebrow">QUEM FAZ ACONTECER</p>
      <h2 class="home-gallery__title font-display">Profissionais prontos para te atender</h2>
      <p class="home-gallery__sub">Do projeto à decoração, conectamos você aos melhores profissionais da sua região.</p>
    </div>

    <div class="home-marquee home-gallery__marquee" aria-hidden="true" data-reveal>
      <div class="home-marquee__track" :style="{ '--marquee-duration': '38s' }">
        <div v-for="(item, i) in items" :key="`a-${i}`" class="home-gallery__card">
          <button class="home-gallery__tile" :style="cardStyle(item)" @click="emit('select', item.label, item.slug)">
            <component :is="item.icon" class="w-9 h-9" />
          </button>
          <span class="home-gallery__label">{{ item.label }}</span>
        </div>

        <div v-for="(item, i) in items" :key="`b-${i}`" class="home-gallery__card" aria-hidden="true">
          <button class="home-gallery__tile" :style="cardStyle(item)" @click="emit('select', item.label, item.slug)">
            <component :is="item.icon" class="w-9 h-9" />
          </button>
          <span class="home-gallery__label">{{ item.label }}</span>
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
.home-gallery {
  background: var(--bg-page);
  padding: clamp(3.5rem, 7vw, 5.5rem) 0;
  overflow: hidden;
}

.home-gallery__head {
  text-align: center;
  max-width: 44rem;
  margin: 0 auto clamp(2rem, 4vw, 2.6rem);
  padding: 0 1.5rem;
}

.home-gallery__eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent-gold);
  margin-bottom: 0.7rem;
}

.home-gallery__title {
  font-size: clamp(1.6rem, 3.4vw, 2.3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 0.8rem;
}

.home-gallery__sub {
  color: var(--text-muted);
  line-height: 1.65;
}

.home-gallery__marquee {
  width: 100%;
}

.home-gallery__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  padding: 0 0.9rem;
}

.home-gallery__tile {
  width: 7.5rem;
  height: 7.5rem;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.home-gallery__tile:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 16px 30px -18px rgba(20, 14, 8, 0.35);
}

.home-gallery__label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.home-gallery__cta {
  display: flex;
  justify-content: center;
  margin-top: clamp(2.2rem, 4vw, 3rem);
  padding: 0 1.5rem;
}

.home-gallery__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.95rem 1.9rem;
  border-radius: 999px;
  background: var(--accent-gold);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 12px 26px -14px rgba(212, 160, 23, 0.6);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.home-gallery__btn:hover {
  background: var(--accent-dark-gold);
  box-shadow: 0 16px 32px -14px rgba(212, 160, 23, 0.7);
  transform: translateY(-1px);
}

.home-gallery__btn:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .home-gallery__tile {
    width: 6rem;
    height: 6rem;
  }
}
</style>