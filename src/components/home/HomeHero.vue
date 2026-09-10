<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { BadgeCheck } from '@lucide/vue'

const emit = defineEmits<{
  register: []
  search: []
}>()

const phrases = [
  'encontrar profissionais.',
  'conseguir clientes.',
  'realizar a sua obra.',
]

const shown = ref(phrases[0])
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let typeTimer: ReturnType<typeof setTimeout> | null = null
let introTimer: ReturnType<typeof setTimeout> | null = null

function typewrite() {
  let loop = 0
  let txt = ''
  let deleting = false

  const tick = () => {
    const full = phrases[loop % phrases.length]
    if (deleting) txt = full.substring(0, txt.length - 1)
    else txt = full.substring(0, txt.length + 1)

    shown.value = txt

    let delta = 100 - Math.random() * 50
    if (deleting) delta /= 2

    if (!deleting && txt === full) {
      delta = 2500
      deleting = true
    } else if (deleting && txt === '') {
      deleting = false
      loop++
      delta = 500
    }
    typeTimer = setTimeout(tick, delta)
  }
  tick()
}

function startTypewriter() {
  if (reduceMotion) {
    shown.value = phrases[0]
    return
  }
  typeTimer = setTimeout(typewrite, 600)
}

onMounted(startTypewriter)
onUnmounted(() => {
  if (typeTimer) clearTimeout(typeTimer)
  if (introTimer) clearTimeout(introTimer)
})

function imgError(e: Event) {
  ;(e.target as HTMLElement).style.display = 'none'
}
</script>

<template>
  <section class="home-hero" aria-label="Apresentação">
    <div class="home-hero__bg" aria-hidden="true"></div>
    <div class="home-hero__container">
      <div class="home-hero__content">
        <p class="home-eyebrow">OBRAS, REFORMAS E MANUTENÇÃO</p>

        <h1 class="home-hero__title font-display" dir="ltr">
          O lugar certo para
          <span class="home-hero__typed text-gold">
            {{ shown }}
          </span>
        </h1>

        <p class="home-hero__subtitle">
          Encontre profissionais avaliados para construção, reforma e manutenção perto de você.
        </p>

        <div class="home-hero__actions">
          <button class="home-btn home-btn--primary" @click="emit('search')">
            Contratar profissional
          </button>
          <button class="home-btn home-btn--outline" @click="emit('register')">
            Cadastrar como profissional
          </button>
        </div>

        <div class="home-hero__trust">
          <span class="home-hero__badge">
            <BadgeCheck class="w-6 h-6" />
            Profissionais verificados
          </span>
        </div>
      </div>

      <div class="home-hero__visual">
        <div class="home-hero__card">
          <div class="home-hero__photo">
            <img
              src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=720&q=80"
              alt="Profissional de obras sorrindo, representando os trabalhadores cadastrados na plataforma"
              @error="imgError"
            />
          </div>
          <div class="home-hero__card-badge" aria-hidden="true">
            <span class="home-hero__card-badge-dot"></span>
            Profissionais verificados
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, #fdfbf7 0%, #f6f1e7 45%, #efe6d4 100%);
  color: var(--text-primary);
}

[data-theme='dark'] .home-hero {
  background: radial-gradient(1200px 600px at 80% -10%, rgba(212, 160, 23, 0.12), transparent 60%),
    linear-gradient(150deg, #0a0c0f 0%, #10141a 55%, #0c0e12 100%);
}

.home-hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(900px 420px at 85% 0%, rgba(212, 160, 23, 0.14), transparent 60%),
    radial-gradient(700px 400px at -5% 100%, rgba(212, 160, 23, 0.08), transparent 60%);
}

.home-hero__container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(3.25rem, 6vw, 5.5rem) 1.5rem clamp(3rem, 5vw, 4.5rem);
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}

.home-eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-gold);
  margin-bottom: 1.1rem;
}

.home-hero__title {
  font-size: clamp(2rem, 4.6vw, 3rem);
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.home-hero__typed {
  display: block;
}

.text-gold {
  color: var(--accent-gold);
}

.home-hero__subtitle {
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  line-height: 1.65;
  color: var(--text-muted);
  max-width: 30rem;
  margin-bottom: 1.9rem;
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-bottom: 1.6rem;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.95rem 1.7rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.home-btn:active {
  transform: scale(0.98);
}

.home-btn--primary {
  background: var(--accent-gold);
  color: #fff;
  box-shadow: 0 10px 24px rgba(212, 160, 23, 0.28);
}

.home-btn--primary:hover {
  background: var(--accent-dark-gold);
  box-shadow: 0 14px 30px rgba(212, 160, 23, 0.36);
}

[data-theme='light'] .home-btn--primary,
[data-theme='dark'] .home-btn--primary {
  color: #fffaf0;
}

.home-btn--outline {
  background: transparent;
  color: var(--text-primary);
  border: 1.5px solid var(--border-raised);
}

.home-btn--outline:hover {
  border-color: var(--accent-gold);
  color: var(--accent-dark-gold);
}

.home-hero__trust {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.2rem;
}

.home-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.home-hero__badge svg {
  color: var(--accent-gold);
}

.home-hero__visual {
  position: relative;
  display: flex;
  justify-content: center;
}

.home-hero__card {
  position: relative;
  width: min(100%, 30rem);
  border-radius: 2.25rem;
  overflow: hidden;
  box-shadow: 0 30px 70px -20px rgba(90, 60, 20, 0.35);
  border: 8px solid #fff;
  background: linear-gradient(160deg, #f7eeda, #e9d7b4);
}

[data-theme='dark'] .home-hero__card {
  border-color: #1a2029;
  box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.7);
}

.home-hero__photo {
  position: relative;
  aspect-ratio: 4 / 4.4;
}

.home-hero__photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 55%, rgba(20, 14, 8, 0.25));
}

.home-hero__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.home-hero__card-badge {
  position: absolute;
  left: 1.1rem;
  bottom: 1.1rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.92);
  color: #26321f;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);
}

.home-hero__card-badge-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #2eb872;
  box-shadow: 0 0 0 3px rgba(46, 184, 114, 0.22);
}

@media (prefers-reduced-motion: reduce) {
  .home-hero__card-badge-dot {
    box-shadow: none;
  }
}

@media (max-width: 820px) {
  .home-hero__container {
    grid-template-columns: 1fr;
  }

  .home-hero__visual {
    order: -1;
  }

  .home-hero__card {
    width: min(100%, 22rem);
  }
}
</style>