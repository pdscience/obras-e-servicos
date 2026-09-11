<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Search, MapPin } from '@lucide/vue'
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
}

function setType(type: 'profissional' | 'lojista') {
  searchType.value = type
  query.value = ''
}

function submit() {
  emit('search', searchType.value, query.value, selectedUf.value, selectedCity.value)
}

onMounted(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter') submit()
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => {
    window.removeEventListener('keydown', onKey)
  })
})
</script>

<template>
  <section ref="root" id="busca" class="home-search">
    <div class="home-search__container">
      <div class="home-search__content" data-reveal>
        <p class="home-search__eyebrow">OBRAS, REFORMAS E MANUTENÇÃO</p>
        <h2 class="home-search__title">
          Sua obra sem dor de cabeça, do alicerce ao acabamento, em um
          <span class="home-search__accent">clique</span>.<img :src="'/assets/images/click.gif'" alt="Cursor clicando" class="home-search__click" />
        </h2>
        <p class="home-search__sub">
          Busque por categorias, encontre profissionais verificados e fale diretamente com quem pode resolver o seu serviço.
        </p>

        <div class="home-search__mobile-img">
          <img :src="'/assets/images/curioso.png'" alt="Pessoa curiosa procurando serviços" />
        </div>

        <div class="home-search__panel">
          <div class="home-search__toggle" role="tablist" aria-label="Tipo de busca">
            <input type="radio" id="hs-pro" value="profissional" v-model="searchType" />
            <label for="hs-pro">Profissionais</label>
            <input type="radio" id="hs-loj" value="lojista" v-model="searchType" />
            <label for="hs-loj">Lojistas</label>
            <div class="home-search__toggle-bg" :class="{ 'is-loj': searchType === 'lojista' }"></div>
          </div>

          <div class="home-search__field">
            <Search class="home-search__icon" :size="20" />
            <input
              v-model="query"
              type="text"
              class="home-search__input"
              list="hs-datalist"
              :placeholder="`Qual ${searchType === 'profissional' ? 'profissional ou lojista' : 'lojista'} você busca?`"
              autocomplete="off"
            />
            <datalist id="hs-datalist">
              <option v-for="opt in filtered" :key="opt" :value="opt" @click="pick(opt)" />
            </datalist>
          </div>

          <div class="home-search__field">
            <MapPin class="home-search__icon" :size="20" />
            <select v-model="selectedUf" class="home-search__input" aria-label="UF">
              <option value="">Sua localização (UF)</option>
              <option v-for="uf in ufs" :key="uf.sigla" :value="uf.sigla">{{ uf.sigla }} – {{ uf.nome }}</option>
            </select>
          </div>

          <div class="home-search__field" v-if="selectedUf">
            <MapPin class="home-search__icon" :size="20" />
            <select v-model="selectedCity" class="home-search__input" aria-label="Cidade">
              <option value="">Todas as cidades</option>
              <option v-for="city in cidades" :key="city" :value="city">{{ city }}</option>
            </select>
          </div>

          <button class="home-search__submit" @click="submit">
            Buscar profissionais e lojistas
          </button>
        </div>
      </div>

      <div class="home-search__image-wrapper">
        <img :src="'/assets/images/curioso.png'" alt="Pessoa curiosa procurando serviços" class="home-search__image" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-search {
  position: relative;
  background-color: #ffffff;
  color: #1a1a1a;
  overflow: hidden;
  padding: 80px 0;
  font-family: 'Poppins', sans-serif;
}

.home-search__container {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 1024px) {
  .home-search__container {
    display: grid;
    grid-template-columns: 1.3fr 0.7fr;
    gap: 40px;
    align-items: center;
  }
}

.home-search__content {
  width: 100%;
}

.home-search__eyebrow {
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 400;
  text-transform: uppercase;
  color: #d4a017;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  text-align: center;
  width: 100%;
}

@media (min-width: 1024px) {
  .home-search__eyebrow { text-align: left; }
}

.home-search__title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  text-align: center;
  color: #1a1a1a;
}

@media (min-width: 1024px) {
  .home-search__title { text-align: left; }
}

.home-search__accent {
  color: #d4a017;
}

.home-search__click {
  height: 1.15em;
  width: auto;
  vertical-align: middle;
  margin-left: 6px;
  transform: translateY(-2px);
  display: inline-block;
}

.home-search__sub {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: #555555;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 8px;
}

@media (min-width: 1024px) {
  .home-search__sub { text-align: left; }
}

.home-search__mobile-img {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.home-search__mobile-img img {
  width: 100%;
  max-width: 250px;
  object-fit: contain;
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}

@media (min-width: 1024px) {
  .home-search__mobile-img { display: none; }
}

.home-search__panel {
  width: 100%;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 1024px) {
  .home-search__panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 32px;
    border-radius: 32px;
    gap: 20px;
  }
}

.home-search__toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  background: #f0f0f0;
  border-radius: 50px;
  padding: 4px;
  margin-bottom: 8px;
}

@media (min-width: 1024px) {
  .home-search__toggle {
    grid-column: 1 / -1;
    width: max-content;
  }
}

.home-search__toggle input {
  display: none;
}

.home-search__toggle label {
  text-align: center;
  padding: 10px 24px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #555555;
  cursor: pointer;
  z-index: 2;
  position: relative;
  border-radius: 50px;
}

.home-search__toggle input:checked + label {
  color: #fff;
}

.home-search__toggle-bg {
  position: absolute;
  top: 4px;
  left: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background: #d4a017;
  border-radius: 50px;
  transition: transform 0.3s ease;
  z-index: 1;
}

.home-search__toggle-bg.is-loj {
  transform: translateX(100%);
}

.home-search__field {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  border-radius: 0;
  transition: all 0.25s ease;
}

.home-search__field:focus-within {
  border-color: #d4a017;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(212, 160, 23, 0.15);
}

.home-search__icon {
  margin-left: 20px;
  color: #d4a017;
  flex-shrink: 0;
}

.home-search__input {
  width: 100%;
  background: transparent;
  border: none;
  padding: 16px 16px 16px 12px;
  color: #1a1a1a;
  font-size: 0.95rem;
  outline: none;
}

.home-search__submit {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d4a017;
  border: 2px solid #d4a017;
  color: #ffffff;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
}

@media (min-width: 1024px) {
  .home-search__submit { grid-column: 1 / -1; }
}

.home-search__submit:hover {
  background: #b88a0d;
  border-color: #b88a0d;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212, 160, 23, 0.3);
}

.home-search__image-wrapper {
  display: none;
}

@media (min-width: 1024px) {
  .home-search__image-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }
  .home-search__image {
    width: 100%;
    max-width: 450px;
    object-fit: contain;
    -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  }
}
</style>
