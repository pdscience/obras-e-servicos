<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  UserPlus,
  Users,
  Handshake,
  ClipboardList,
  MessageCircle,
  TrendingUp,
  Store,
  Sparkles,
  PiggyBank,
} from '@lucide/vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

type TabKey = 'client' | 'pro' | 'lojista'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'client', label: 'Para Clientes' },
  { key: 'pro', label: 'Para Profissionais' },
  { key: 'lojista', label: 'Para Lojistas' },
]

const groups: Record<TabKey, { icon: unknown; title: string; text: string }[]> = {
  client: [
    {
      icon: UserPlus,
      title: 'Crie seu perfil',
      text: 'Cadastre-se gratuitamente, informe sua localização, busque pelo profissional, solicite orçamentos ou entre em contato direto.',
    },
    {
      icon: Users,
      title: 'Compare profissionais',
      text: 'Veja perfis, avaliações e portfólios de quem está disponível na sua região.',
    },
    {
      icon: Handshake,
      title: 'Contrate sem complicação',
      text: 'Avalie as opções e feche o serviço direto com o profissional da sua escolha.',
    },
  ],
  pro: [
    {
      icon: ClipboardList,
      title: 'Crie seu perfil',
      text: 'Escolha o melhor plano para você, cadastre até 3 profissões, adicione até 9 fotos no portfólio e conte com um escritório virtual completo. Tudo sem fidelidade e com liberdade para cancelar quando quiser.',
    },
    {
      icon: MessageCircle,
      title: 'Receba oportunidades',
      text: 'Conecte-se diretamente com quem precisa dos seus serviços. O cliente fala com você pelo WhatsApp de forma direta, sem intermediários, para fechar o trabalho com rapidez.',
    },
    {
      icon: TrendingUp,
      title: 'Amplie sua base de clientes',
      text: 'Dê mais visibilidade ao seu trabalho integrando suas redes sociais diretamente no perfil, conquiste novos contratos e faça sua clientela crescer todos os dias.',
    },
  ],
  lojista: [
    {
      icon: Store,
      title: 'Anuncie seus Produtos',
      text: 'Cadastre seus produtos, ferramentas, materiais de construção e equipamentos com facilidade e alcance quem está construindo ou reformando na sua região.',
    },
    {
      icon: Sparkles,
      title: 'Potencialize suas vendas',
      text: 'Ganhe destaque regional, conecte-se diretamente com profissionais e clientes, feche pedidos, expanda suas vendas sem perder tempo.',
    },
    {
      icon: PiggyBank,
      title: 'Aumente seu faturamento',
      text: 'Dê mais visibilidade ao seu negócio, feche novas parcerias comerciais e faça o seu comércio crescer de forma constante.',
    },
  ],
}

const active = ref<TabKey>('client')
const progress = ref(0)

function select(key: TabKey) {
  active.value = key
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progress.value = 0
      requestAnimationFrame(() => {
        progress.value = 100
      })
    })
  })
}

function selectFirst() {
  if (typeof window === 'undefined') return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    progress.value = 100
  } else {
    progress.value = 0
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progress.value = 100
      })
    })
  }
}

let revealObserver: IntersectionObserver | null = null
let revealedOnce = false

onMounted(() => {
  if (typeof window === 'undefined' || !root.value) return
  revealObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && !revealedOnce) {
        revealedOnce = true
        selectFirst()
        revealObserver?.disconnect()
      }
    },
    { threshold: 0.25 }
  )
  revealObserver.observe(root.value)
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
})
</script>

<template>
  <section ref="root" id="como-funciona" class="home-how">
    <div class="home-how__inner">
      <div class="home-section-head" data-reveal>
        <h2 class="home-section-head__title font-display">Como funciona?</h2>
        <p class="home-section-head__sub">Contratar um profissional nunca foi tão fácil</p>
      </div>

      <div class="home-how__tabs" data-reveal>
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="home-how__tab"
          :class="{ 'is-active': active === tab.key }"
          @click="select(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="home-how__progress" data-reveal>
        <div class="home-how__progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <div class="home-how__grid">
        <article
          v-for="(step, i) in groups[active]"
          :key="`${active}-${i}`"
          class="home-how__card"
          :class="`reveal-delay-${i}`"
          data-reveal
        >
          <div class="home-how__icon">
            <component :is="step.icon" class="w-9 h-9" />
          </div>
          <h3 class="home-how__title font-display">{{ step.title }}</h3>
          <p class="home-how__text">{{ step.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-how {
  background: linear-gradient(180deg, var(--bg-page), var(--bg-card));
  padding: clamp(3.5rem, 7vw, 6rem) 1.5rem;
}

.home-how__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.home-how__tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.home-how__tab {
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1.5px solid var(--border-default);
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-how__tab:hover {
  border-color: color-mix(in srgb, var(--accent-gold) 45%, transparent);
  color: var(--accent-dark-gold);
}

.home-how__tab.is-active {
  background: var(--accent-gold);
  border-color: var(--accent-gold);
  color: #fff;
  box-shadow: 0 10px 24px -10px rgba(212, 160, 23, 0.55);
}

.home-how__progress {
  position: relative;
  height: 3px;
  border-radius: 999px;
  background: var(--border-default);
  margin-bottom: clamp(2rem, 4vw, 3rem);
  max-width: 54rem;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
}

.home-how__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold), var(--accent-dark-gold));
  border-radius: 999px;
  transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.home-how__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.home-how__card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 1.5rem;
  padding: 2rem 1.6rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.home-how__card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 44px -24px rgba(212, 160, 23, 0.35);
}

.home-how__icon {
  width: 4.2rem;
  height: 4.2rem;
  border-radius: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-gold);
  background: color-mix(in srgb, var(--accent-gold) 12%, transparent);
  margin-bottom: 1.2rem;
}

.home-how__title {
  font-size: 1.12rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.55rem;
}

.home-how__text {
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--text-muted);
}

@media (max-width: 860px) {
  .home-how__grid {
    grid-template-columns: 1fr;
  }
}
</style>