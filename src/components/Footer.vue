<script setup lang="ts">
import { Mail, Phone, MapPin, ExternalLink } from '@lucide/vue'
import { useRouter } from 'vue-router'
import logoSrc from '@/assets/logo.png'

const router = useRouter()

function goRegister() {
  router.push({ name: 'register' })
}

function goRegisterProfessional() {
  router.push({ name: 'register', query: { tipo: 'professional' } })
}

function goRegisterLojista() {
  router.push({ name: 'register', query: { tipo: 'lojista' } })
}

function goHome() {
  router.push({ name: 'home' })
}

function goCategories() {
  router.push({ name: 'categories' })
}

function goStores() {
  router.push({ name: 'stores' })
}

function goPlanos() {
  router.push({ name: 'planos' })
}

function goHowItWorks() {
  router.push({ name: 'how-it-works' })
}

function goFaq() {
  router.push({ name: 'faq' })
}

const colunas = [
  {
    titulo: 'Clientes',
    links: [
      { label: 'O que é a OS?', action: goHome },
      { label: 'Como funciona?', action: goHowItWorks },
      { label: 'Encontrar profissionais', action: goCategories },
      { label: 'Cadastrar grátis', action: goRegister },
    ],
  },
  {
    titulo: 'Profissionais',
    links: [
      { label: 'Como funciona?', action: goHowItWorks },
      { label: 'Planos e preços', action: goPlanos },
      { label: 'Seja um profissional', action: goRegisterProfessional },
      { label: 'Encontrar serviços', action: goCategories },
    ],
  },
  {
    titulo: 'Lojistas',
    links: [
      { label: 'Divulgue sua loja', action: goRegisterLojista },
      { label: 'Parcerias', action: goCategories },
      { label: 'Vendas', action: goStores },
      { label: 'Planos', action: goPlanos },
    ],
  },
]

const ano = new Date().getFullYear()

const icones: Record<string, typeof Mail> = {
  mail: Mail,
  phone: Phone,
  map: MapPin,
  external: ExternalLink,
}

const contato = [
  { icone: 'mail' as const, label: 'contato@osobras.com.br', href: 'mailto:contato@osobras.com.br' },
  { icone: 'mail' as const, label: 'contato@osobraseservicos.com.br', href: 'mailto:contato@osobraseservicos.com.br' },
  { icone: 'mail' as const, label: 'comercial@osobraseservicos.com.br', href: 'mailto:comercial@osobraseservicos.com.br' },
  { icone: 'phone' as const, label: '(67) 98120-2442', href: 'tel:+5567981202442' },
  { icone: 'map' as const, label: 'Maracaju, MS - Brasil', href: undefined },
]
</script>

<template>
  <footer class="home-footer">
    <div class="home-footer__container">
      <div class="home-footer__grid">
        <div class="home-footer__brand">
          <img :src="logoSrc" alt="Logo OS – Obras & Serviços" class="home-footer__logo" />
          <p class="home-footer__tagline">
            A plataforma que conecta clientes, profissionais e lojistas da sua região.
            Contrate com segurança, avalie serviços e acompanhe tudo do seu painel.
          </p>
          <div class="home-footer__social">
            <a href="https://instagram.com/obraseservicos" target="_blank" rel="noopener" aria-label="Instagram"
              class="home-footer__social-link">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.95c-3.13 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.61-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.61.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.61.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.61-.07-4.74-.07zm0 3.32a4.57 4.57 0 1 1 0 9.14 4.57 4.57 0 0 1 0-9.14zm0 7.54a2.97 2.97 0 1 0 0-5.94 2.97 2.97 0 0 0 0 5.94zm5.82-7.76a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0z" /></svg>
            </a>
            <a href="https://facebook.com/obraseservicos" target="_blank" rel="noopener" aria-label="Facebook"
              class="home-footer__social-link">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" /></svg>
            </a>
            <a href="mailto:contato@obraseservicos.com.br" aria-label="E-mail" class="home-footer__social-link">
              <component :is="icones.mail" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <nav v-for="coluna in colunas" :key="coluna.titulo" class="home-footer__col" :aria-label="coluna.titulo">
          <h3 class="home-footer__col-title">{{ coluna.titulo }}</h3>
          <ul class="home-footer__col-list">
            <li v-for="link in coluna.links" :key="link.label">
              <button class="home-footer__col-link" @click="link.action()">
                {{ link.label }}
                <ExternalLink class="w-3.5 h-3.5 home-footer__col-arrow" />
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div class="home-footer__contact">
        <div class="home-footer__contact-title">Atendimento</div>
        <div class="home-footer__contact-items">
          <a
            v-for="(item, i) in contato"
            :key="i"
            :href="item.href"
            class="home-footer__contact-item"
          >
            <component :is="icones[item.icone]" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </a>
        </div>
      </div>

      <div class="home-footer__bottom">
        <p>© {{ ano }} OS – Obras &amp; Serviços. Todos os direitos reservados.</p>
        <div class="home-footer__legal">
          <button @click="goFaq">FAQ</button>
          <button @click="goHowItWorks">Como funciona</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.home-footer {
  background: #111827;
  color: #d1d5db;
  padding: clamp(3rem, 6vw, 4.5rem) 1.5rem 1.6rem;
}

.home-footer__container {
  max-width: 1200px;
  margin: 0 auto;
}

.home-footer__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 2.5rem;
  padding-bottom: 3rem;
}

.home-footer__brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.1rem;
}

.home-footer__logo {
  height: 52px;
  width: auto;
  background: #fff;
  border-radius: 0.8rem;
  padding: 0.35rem 0.5rem;
}

.home-footer__tagline {
  font-size: 0.88rem;
  line-height: 1.65;
  color: #9ca3af;
  max-width: 26rem;
}

.home-footer__social {
  display: flex;
  gap: 0.7rem;
}

.home-footer__social-link {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2937;
  color: #d1d5db;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.home-footer__social-link:hover {
  background: #d4a017;
  color: #111827;
  transform: translateY(-2px);
}

.home-footer__col-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 1.1rem;
}

.home-footer__col-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.home-footer__col-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.9rem;
  color: #9ca3af;
  cursor: pointer;
  text-align: left;
  transition: color 0.18s ease;
}

.home-footer__col-link:hover {
  color: #d4a017;
}

.home-footer__col-arrow {
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.18s ease, transform 0.18s ease;
  color: #d4a017;
}

.home-footer__col-link:hover .home-footer__col-arrow {
  opacity: 1;
  transform: translateX(0);
}

.home-footer__contact {
  border-top: 1px solid #1f2937;
  border-bottom: 1px solid #1f2937;
  padding: 1.8rem 0;
  margin-bottom: 1.6rem;
}

.home-footer__contact-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 1rem;
}

.home-footer__contact-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.home-footer__contact-item {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 1.1rem;
  border: 1px solid #1f2937;
  border-radius: 999px;
  font-size: 0.86rem;
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.18s ease, border-color 0.18s ease;
}

.home-footer__contact-item:hover {
  border-color: #d4a017;
  color: #ffffff;
}

.home-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.home-footer__bottom p {
  font-size: 0.8rem;
  color: #6b7280;
}

.home-footer__legal {
  display: flex;
  gap: 1.2rem;
}

.home-footer__legal button {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.18s ease;
}

.home-footer__legal button:hover {
  color: #d4a017;
}

@media (max-width: 960px) {
  .home-footer__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .home-footer__grid {
    grid-template-columns: 1fr;
  }
}
</style>