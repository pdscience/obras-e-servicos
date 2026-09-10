<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Search, MapPin, ChevronDown, MousePointerClick } from '@lucide/vue'
import { ufs } from '@/data/ufs'
import { getCitiesByUf } from '@/data/cities'
import { useScrollReveal } from '@/composables/useScrollReveal'

const emit = defineEmits<{
  search: [type: 'profissional' | 'lojista', query: string, uf: string, city: string]
}>()

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const searchType = ref<'profissional' | 'lojista'>('profissional')

const proOptions = [
  'Pedreiro', 'Eletricista', 'Encanador', 'Pintor',
  'Gesseiro', 'Montador de Móveis', 'Marido de Aluguel',
]

const lojOptions = [
  'Material de Construção', 'Tintas', 'Ferramentas',
  'Madeireira', 'Elétrica e Iluminação', 'Pisos e Revestimentos', 'Ferragens',
]

const options = computed(() => (searchType.value === 'profissional' ? proOptions : lojOptions))

const query = ref('')
const open = ref(false)
const selectedUf = ref('')
const selectedCity = ref('')
const cidades = ref<string[]>([])

const filtered = computed(() =>
  options.value.filter((o) => o.toLowerCase().includes(query.value.toLowerCase()))
)

watch(selectedUf, async (uf) => {
  selectedCity.value = ''
  cidades.value = await getCitiesByUf(uf || null)
})

function pick(opt: string) {
  query.value = opt
  open.value = false
}

function setType(type: 'profissional' | 'lojista') {
  searchType.value = type
  query.value = ''
  open.value = false
}

function submit() {
  emit('search', searchType.value, query.value, selectedUf.value, selectedCity.value)
}

function toggleOpen() {
  open.value = !open.value
}

onMounted(() => {
  function onDocClick(e: Event) {
    const t = e.target as HTMLElement
    if (!t.closest('.home-search__service')) open.value = false
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') open.value = false
  }
  document.addEventListener('click', onDocClick)
  window.addEventListener('keydown', onKey)
  onUnmounted(() => {
    document.removeEventListener('click', onDocClick)
    window.removeEventListener('keydown', onKey)
  })
})
</script>

<template>
  <section ref="root" id="busca" class="home-search">
    <div class="home-search__bg" aria-hidden="true"></div>

    <div class="home-search__inner">
      <div class="home-search__content" data-reveal>
        <p class="home-search__eyebrow">OBRAS, REFORMAS E MANUTENÇÃO</p>
        <h2 class="home-search__title font-display">
          Sua obra sem dor de cabeça, do alicerce ao acabamento, em um
          <span class="home-search__accent">clique</span>.
        </h2>
        <p class="home-search__sub">
          Busque por categorias, encontre profissionais verificados e fale diretamente com quem pode resolver o seu serviço.
        </p>
      </div>

      <div class="home-search__panel" data-reveal>
        <div class="home-search__toggle" role="tablist" aria-label="Tipo de busca">
          <button
            role="tab"
            :aria-selected="searchType === 'profissional'"
            :class="{ 'is-active': searchType === 'profissional' }"
            @click="setType('profissional')"
          >
            Profissionais
          </button>
          <button
            role="tab"
            :aria-selected="searchType === 'lojista'"
            :class="{ 'is-active': searchType === 'lojista' }"
            @click="setType('lojista')"
          >
            Lojistas
          </button>
        </div>

        <div class="home-search__fields">
          <div class="home-search__service">
            <Search class="home-search__field-icon" width="20" height="20" />
            <input
              v-model="query"
              type="text"
              :placeholder="`Qual ${searchType === 'profissional' ? 'profissional' : 'lojista'} você busca?`"
              autocomplete="off"
              @focus="toggleOpen"
              role="combobox"
              :aria-expanded="open"
            />
            <ChevronDown class="home-search__chevron" width="18" height="18" />
            <div v-if="open" class="home-search__dropdown">
              <ul>
                <li
                  v-for="opt in filtered"
                  :key="opt"
                  @click="pick(opt)"
                >
                  {{ opt }}
                </li>
                <li v-if="!filtered.length" class="is-empty">Nenhum resultado encontrado</li>
              </ul>
            </div>
          </div>

          <div class="home-search__location">
            <MapPin class="home-search__field-icon" width="20" height="20" />
            <select v-model="selectedUf" aria-label="UF">
              <option value="">UF</option>
              <option v-for="uf in ufs" :key="uf.sigla" :value="uf.sigla">{{ uf.sigla }} – {{ uf.nome }}</option>
            </select>
          </div>

          <div class="home-search__location">
            <MapPin class="home-search__field-icon" width="20" height="20" />
            <select v-model="selectedCity" :disabled="!selectedUf" aria-label="Cidade">
              <option value="">{{ selectedUf ? 'Todas as cidades' : 'Cidade' }}</option>
              <option v-for="city in cidades" :key="city" :value="city">{{ city }}</option>
            </select>
          </div>

          <button class="home-search__submit" @click="submit" @keydown.enter="submit">
            <Search class="w-5 h-5" />
            Buscar {{ searchType === 'profissional' ? 'profissionais' : 'lojistas' }}
          </button>
        </div>
      </div>

      <p class="home-search__hint">
        <MousePointerClick class="w-4 h-4" />
        Clique no campo, escolha a categoria, informe sua região e pronto.
      </p>
    </div>
  </section>
</template>

<style scoped>
.home-search {
  position: relative;
  overflow: hidden;
  padding: clamp(3.5rem, 7vw, 6rem) 1.5rem;
  color: #f5f0e6;
  background: #20242b;
}

[data-theme='light'] .home-search {
  background: #232a33;
}

.home-search__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(900px 480px at 85% 10%, rgba(212, 160, 23, 0.22), transparent 62%),
    radial-gradient(700px 420px at 0% 100%, rgba(212, 160, 23, 0.1), transparent 60%);
}

.home-search__inner {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
}

.home-search__content {
  text-align: center;
  margin-bottom: clamp(1.8rem, 3.5vw, 2.6rem);
}

.home-search__eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #f0c24b;
  margin-bottom: 0.8rem;
}

.home-search__title {
  font-size: clamp(1.55rem, 3.4vw, 2.3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #ffffff;
  line-height: 1.25;
  margin-bottom: 0.9rem;
}

.home-search__accent {
  color: #f0c24b;
}

.home-search__sub {
  color: rgba(245, 240, 230, 0.78);
  line-height: 1.65;
  max-width: 40rem;
  margin: 0 auto;
}

.home-search__panel {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1.5rem;
  padding: 1.4rem;
  backdrop-filter: blur(8px);
  box-shadow: 0 30px 60px -26px rgba(0, 0, 0, 0.6);
}

.home-search__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.28);
  border-radius: 999px;
  padding: 0.28rem;
  margin-bottom: 1.1rem;
}

.home-search__toggle button {
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: rgba(245, 240, 230, 0.7);
  font-weight: 600;
  font-size: 0.86rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-search__toggle button.is-active {
  background: var(--accent-gold);
  color: #fff;
  box-shadow: 0 8px 18px -8px rgba(212, 160, 23, 0.7);
}

.home-search__fields {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.9fr auto;
  gap: 0.75rem;
  align-items: center;
}

.home-search__service,
.home-search__location {
  position: relative;
  display: flex;
  align-items: center;
}

.home-search__service input,
.home-search__location select {
  width: 100%;
  height: 3.1rem;
  padding: 0 1rem 0 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: #f7f2e8;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
  appearance: none;
}

.home-search__service input::placeholder {
  color: rgba(245, 240, 230, 0.55);
}

.home-search__service input:focus,
.home-search__location select:focus {
  border-color: var(--accent-gold);
  background: rgba(255, 255, 255, 0.12);
}

.home-search__location select {
  cursor: pointer;
}

.home-search__location select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.home-search__field-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(245, 240, 230, 0.55);
  pointer-events: none;
}

.home-search__chevron {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(245, 240, 230, 0.55);
  pointer-events: none;
}

.home-search__dropdown {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.4rem);
  left: 0;
  right: 0;
  background: #2b313a;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0.9rem;
  overflow: hidden;
  box-shadow: 0 24px 44px -20px rgba(0, 0, 0, 0.65);
}

.home-search__dropdown ul {
  list-style: none;
  max-height: 16rem;
  overflow-y: auto;
}

.home-search__dropdown li {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #f7f2e8;
  cursor: pointer;
  transition: background 0.15s ease;
}

.home-search__dropdown li:hover {
  background: rgba(212, 160, 23, 0.16);
  color: #f0c24b;
}

.home-search__dropdown li.is-empty {
  cursor: default;
  color: rgba(245, 240, 230, 0.55);
}

.home-search__submit {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 3.1rem;
  padding: 0 1.4rem;
  border: none;
  border-radius: 0.9rem;
  background: linear-gradient(90deg, #e8b72a, #d4a017);
  color: #2b2110;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: filter 0.2s ease, transform 0.15s ease;
}

.home-search__submit:hover {
  filter: brightness(1.07);
}

.home-search__submit:active {
  transform: scale(0.98);
}

.home-search__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.1rem;
  font-size: 0.82rem;
  color: rgba(245, 240, 230, 0.6);
}

@media (max-width: 900px) {
  .home-search__fields {
    grid-template-columns: 1fr 1fr;
  }

  .home-search__service {
    grid-column: 1 / -1;
  }

  .home-search__submit {
    grid-column: 1 / -1;
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .home-search__fields {
    grid-template-columns: 1fr;
  }

  .home-search__service,
  .home-search__submit {
    grid-column: auto;
  }
}
</style>