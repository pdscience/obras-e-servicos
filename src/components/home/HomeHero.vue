<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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

function hideOnError(e: Event) {
  ;(e.target as HTMLElement).style.display = 'none'
}
</script>

<template>
  <section class="home-hero" aria-label="Apresentação" id="hero">
    <div class="home-hero__container">
      <div class="home-hero__content">
        <p class="home-eyebrow">OBRAS, REFORMAS E MANUTENÇÃO</p>

        <h1 class="home-hero__title">
          <span class="title-line1">O lugar certo para</span>
          <span class="text-gold typewrite title-line2">{{ shown }}</span>
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
          <span class="trust-item">
            <img
              :src="'/assets/images/verificado.png'"
              alt="Verificado"
              width="28"
              height="28"
              @error="hideOnError"
            />
            <span>Profissionais verificados</span>
          </span>
        </div>

        <div class="home-hero__arrow" aria-hidden="true">
          <img
            :src="'/assets/images/seta.png'"
            alt="Seta"
            class="home-hero__arrow-img"
            @error="hideOnError"
          />
        </div>
      </div>

      <div class="home-hero__visual">
        <img
          :src="'/assets/images/profissional_hero.png'"
          class="home-hero__pro-img"
          alt="Profissional de obras sorrindo, representando trabalhadores cadastrados na plataforma OS Obras & Serviços"
          @error="hideOnError"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  background-color: #ffffff;
  overflow: hidden;
  display: flex;
  align-items: center;
  font-family: 'Poppins', sans-serif;
}

.home-hero__container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 20px;
  padding-top: 60px;
  padding-bottom: 32px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: center;
}

@media (min-width: 1024px) {
  .home-hero__container {
    grid-template-columns: minmax(0, 1fr) minmax(380px, 0.85fr);
    padding-top: 70px;
    padding-bottom: 20px;
    gap: 40px;
  }
}

.home-hero__content {
  display: flex;
  flex-direction: column;
  max-width: 580px;
  position: relative;
}

.home-hero__arrow {
  margin-top: 5px;
  pointer-events: none;
}

.home-hero__arrow-img {
  max-width: 400px;
  width: 100%;
  height: auto;
  display: block;
}

.home-eyebrow {
  font-size: 0.875rem;
  font-weight: 400;
  color: #d4a017;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.home-hero__title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(28px, 4vw, 54px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #1a1a1a;
  margin-bottom: 22px;
}

.text-gold {
  background: linear-gradient(90deg, #d4a017 0%, #f2c94c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #d4a017;
}

.typewrite,
.title-line2,
.title-line2 * {
  white-space: nowrap !important;
  word-break: keep-all !important;
}

.typewrite::after {
  content: '';
  border-right: 0.03em solid #d4a017;
  animation: blink-cursor 1s step-end infinite;
  margin-left: 2px;
}

@keyframes blink-cursor {
  from, to { border-color: transparent; }
  50% { border-color: #d4a017; }
}

.home-hero__subtitle {
  font-size: 1.125rem;
  color: #555555;
  line-height: 1.5;
  max-width: 480px;
  margin-bottom: 28px;
}

.home-hero__actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 500px) {
  .home-hero__actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  border-radius: 0;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
}

.home-btn--primary {
  background-color: #d4a017;
  color: #ffffff;
  border: 2px solid #d4a017;
  box-shadow: 0 4px 12px rgba(212, 160, 23, 0.2);
}

.home-btn--primary:hover {
  background-color: #b88a0d;
  border-color: #b88a0d;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(212, 160, 23, 0.3);
}

.home-btn--outline {
  background-color: transparent;
  color: #1a1a1a;
  border: 2px solid #e8e8e8;
}

.home-btn--outline:hover {
  border-color: #1a1a1a;
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

.home-hero__trust {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.125rem;
  font-weight: 400;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trust-item img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.home-hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.home-hero__pro-img {
  width: 110%;
  margin-left: -5%;
  max-width: 900px;
  height: auto;
  object-fit: contain;
  display: block;
  margin-top: 20px;
  -webkit-mask-image: linear-gradient(to bottom, black 65%, transparent 98%);
  mask-image: linear-gradient(to bottom, black 65%, transparent 98%);
}

@media (max-width: 1023px) {
  .home-hero__container {
    padding-top: 48px;
    padding-bottom: 0;
    gap: 30px;
  }
  .home-hero__content {
    align-items: center;
  }
  .home-eyebrow {
    font-size: 0.75rem;
    margin-bottom: 12px;
    text-align: center;
    width: 100%;
  }
  .home-hero__title {
    font-size: clamp(28px, 8vw, 36px);
    align-items: center;
    text-align: center;
    margin-bottom: 16px;
    line-height: 1.15;
    width: 100%;
  }
  .typewrite,
  .title-line2,
  .title-line2 * {
    white-space: normal !important;
    word-break: normal !important;
  }
  .home-hero__subtitle {
    font-size: 1rem;
    text-align: center;
    margin: 0 auto 30px auto;
    padding: 0 10px;
    width: 100%;
  }
  .home-hero__actions {
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 350px;
    margin: 0 auto 30px auto;
  }
  .home-btn {
    width: 100%;
    font-size: 0.95rem;
    padding: 14px 20px;
  }
  .home-hero__trust {
    justify-content: center;
    margin-bottom: 20px;
  }
  .trust-item {
    font-size: 0.9rem;
  }
  .home-hero__arrow {
    display: none !important;
  }
  .home-hero__pro-img {
    width: 80%;
    max-width: 320px;
    margin: 10px auto 0 auto;
  }
}
</style>
