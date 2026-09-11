<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Menu, X, LogIn, Sun, Moon, LogOut, LayoutDashboard, Settings, UserPlus } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import EditarPerfilModal from './EditarPerfilModal.vue'
import logoSrc from '../assets/logo.png'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { theme, toggle: toggleTheme } = useTheme()
const mobileMenuOpen = ref(false)
const showEditProfileModal = ref(false)

function handleLogout() {
  auth.logout()
  mobileMenuOpen.value = false
  router.push({ name: 'home' })
}

function navigate(routeName: string) {
  router.push({ name: routeName })
  mobileMenuOpen.value = false
}

function registerProfessional() {
  router.push({ name: 'register', query: { tipo: 'professional' } })
  mobileMenuOpen.value = false
}

function navigateSettings() {
  router.push({ name: 'dashboard', query: { tab: 'settings' } })
  mobileMenuOpen.value = false
}

function navigateConfigurar() {
  router.push({ name: 'cliente-dashboard', query: { configurar: '1' } })
  mobileMenuOpen.value = false
}

function abrirEditarPerfil() {
  mobileMenuOpen.value = false
  showEditProfileModal.value = true
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function goToSection(id: string) {
  mobileMenuOpen.value = false
  if (route.name === 'home') {
    scrollToId(id)
    return
  }
  await router.push({ name: 'home' })
  await nextTick()
  scrollToId(id)
}

const navLinks = computed(() => [
  { id: 'inicio', label: 'Início', action: () => navigate('home') },
  { id: 'como-funciona', label: 'Como funciona?', action: () => goToSection('como-funciona') },
  { id: 'servicos', label: 'Serviços', action: () => navigate('categories') },
  { id: 'planos', label: 'Planos', action: () => navigate('planos') },
  { id: 'quem-somos', label: 'Quem somos', action: () => goToSection('sobre') },
])
</script>

<template>
  <header class="home-header">
    <div class="home-header__bar">
      <div class="home-header__container">
        <button
          class="home-header__burger"
          :aria-expanded="mobileMenuOpen"
          aria-label="Abrir menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>

        <button class="home-header__logo" @click="navigate('home')" aria-label="OS – Obras e Serviços">
          <img src="/assets/images/logo_os.png" alt="Logo OS - Obras & Serviços" class="home-header__logo-img" @error="(e) => { (e.target as HTMLImageElement).src = logoSrc }" />
        </button>

        <nav class="home-header__nav" aria-label="Menu principal">
          <button
            v-for="link in navLinks"
            :key="link.id"
            :id="link.id"
            class="home-header__nav-link"
            @click="link.action()"
          >
            {{ link.label }}
          </button>
        </nav>

        <div class="home-header__actions">
          <template v-if="auth.isLoggedIn">
            <button
              @click="abrirEditarPerfil"
              class="home-header__avatar"
              :title="`Editar perfil: ${auth.user?.nome ?? ''}`"
            >
              <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" :alt="auth.user?.nome" class="w-full h-full object-cover" />
              <span v-else class="home-header__avatar-fallback">
                {{ auth.user?.nome?.charAt(0)?.toUpperCase() ?? 'U' }}
              </span>
              <span class="home-header__avatar-dot"></span>
            </button>
          </template>

          <template v-else>
            <button class="home-header__pro" @click="registerProfessional">
              Seja um profissional
            </button>
            <button class="home-header__login home-header__login--pulse" @click="navigate('login')">
              Entrar
            </button>
          </template>
        </div>
      </div>
    </div>

    <div class="home-header__banner">
      ENCONTRE PROFISSIONAIS DE CONFIANÇA PERTO DE VOCÊ
    </div>

    <div v-if="mobileMenuOpen" class="home-header__mobile">
      <template v-if="auth.isLoggedIn">
        <div class="home-header__mobile-profile">
          <button
            class="home-header__avatar home-header__avatar--lg"
            @click="abrirEditarPerfil"
            :title="`Editar perfil: ${auth.user?.nome ?? ''}`"
          >
            <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" :alt="auth.user?.nome" class="w-full h-full object-cover" />
            <span v-else class="home-header__avatar-fallback">
              {{ auth.user?.nome?.charAt(0)?.toUpperCase() ?? 'U' }}
            </span>
          </button>
          <div class="home-header__mobile-info">
            <p class="home-header__mobile-name">{{ auth.user?.nome }}</p>
            <p class="home-header__mobile-role">
              {{ auth.currentMode === 'cliente' ? 'Cliente' : auth.currentMode === 'profissional' ? 'Profissional' : 'Lojista' }}
            </p>
          </div>
          <button class="home-header__mobile-icon" title="Sair" @click="handleLogout">
            <LogOut class="w-5 h-5" />
          </button>
        </div>

        <button class="home-header__mobile-link" @click="navigate(auth.currentMode === 'cliente' ? 'cliente-dashboard' : 'dashboard')">
          <LayoutDashboard class="w-5 h-5" />
          Meu Painel
        </button>
        <button v-if="auth.currentMode === 'profissional'" class="home-header__mobile-link" @click="navigateSettings">
          <Settings class="w-5 h-5" />
          Perfil Profissional
        </button>
        <button class="home-header__mobile-link" @click="navigateConfigurar">
          <Settings class="w-5 h-5" />
          Perfil Cliente
        </button>
      </template>

      <template v-else>
        <button
          v-for="link in navLinks"
          :key="link.id"
          class="home-header__mobile-link"
          @click="link.action()"
        >
          {{ link.label }}
        </button>
        <hr class="home-header__mobile-divider" />
        <button class="home-header__mobile-cta" @click="navigate('login')">
          Entrar
        </button>
        <button class="home-header__mobile-cta home-header__mobile-cta--ghost" @click="registerProfessional">
          Cadastre-se grátis
        </button>
      </template>
    </div>
  </header>

  <EditarPerfilModal :visible="showEditProfileModal" @close="showEditProfileModal = false" />
</template>

<style scoped>
.home-header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background-color: #ffffff;
  font-family: 'Poppins', sans-serif;
}

.home-header__banner {
  background-color: #d4a017;
  color: #ffffff;
  text-align: center;
  padding: 4px 10px;
  font-size: clamp(0.55rem, 2.8vw, 0.95rem);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-header__bar {
  padding: 0 20px;
}

.home-header__container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  height: 72px;
}

.home-header__burger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
}

.home-header__logo {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.home-header__logo-img {
  height: 44px;
  width: auto;
}

.home-header__nav {
  display: none;
  align-items: center;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

@media (min-width: 1024px) {
  .home-header__nav {
    display: flex;
  }
}

.home-header__nav-link {
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #555555;
  cursor: pointer;
  transition: color 0.15s ease;
  white-space: nowrap;
}

.home-header__nav-link:hover {
  color: #d4a017;
}

.home-header__actions {
  margin-left: auto;
  display: none;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .home-header__actions {
    display: flex;
  }
}

.home-header__pro {
  display: inline-flex;
  align-items: center;
  padding: 9px 18px;
  border-radius: 0;
  border: 1px solid #e8e8e8;
  background: transparent;
  color: #1a1a1a;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.home-header__pro:hover {
  border-color: #d4a017;
  color: #d4a017;
}

.home-header__login {
  display: inline-flex;
  align-items: center;
  padding: 10px 28px;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #d4a017 0%, #e6a800 100%);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 18px rgba(212, 160, 0, 0.45);
  transition: all 0.22s ease;
}

.home-header__login:hover {
  background: linear-gradient(135deg, #e6a800 0%, #d4a017 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 6px 28px rgba(212, 160, 0, 0.65);
}

@keyframes header-pulse {
  0%, 100% { box-shadow: 0 4px 18px rgba(212, 160, 0, 0.45); }
  50% { box-shadow: 0 4px 30px rgba(212, 160, 0, 0.8); }
}

.home-header__login--pulse {
  animation: header-pulse 2.4s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .home-header__login--pulse {
    animation: none;
  }
}

.home-header__theme {
  display: none;
}

.home-header__avatar {
  position: relative;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  overflow: hidden;
  border: none;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-gold) 45%, transparent);
}

.home-header__avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-dark-gold));
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}

.home-header__avatar-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--accent-green);
  border: 2px solid #ffffff;
}

/* Mobile */
.home-header__mobile {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-default);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.home-header__mobile-profile {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 0.9rem;
  border-radius: 1rem;
  background: var(--bg-raised);
  margin-bottom: 0.4rem;
}

.home-header__avatar--lg {
  width: 3rem;
  height: 3rem;
}

.home-header__mobile-info {
  flex: 1;
  min-width: 0;
}

.home-header__mobile-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-header__mobile-role {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.home-header__mobile-icon {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: color-mix(in srgb, var(--accent-red) 10%, transparent);
  color: var(--accent-red);
  cursor: pointer;
}

.home-header__mobile-link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  text-align: left;
  padding: 0.7rem 0.9rem;
  border: none;
  border-radius: 0.8rem;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
}

.home-header__mobile-link:hover {
  background: var(--bg-raised);
  color: var(--accent-dark-gold);
}

.home-header__mobile-divider {
  border: none;
  border-top: 1px solid var(--border-default);
  margin: 0.4rem 0;
}

.home-header__mobile-cta {
  width: 100%;
  padding: 0.8rem;
  border-radius: 0.8rem;
  border: none;
  background: var(--accent-gold);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}

.home-header__mobile-cta--ghost {
  background: transparent;
  border: 1.5px solid var(--border-raised);
  color: var(--text-primary);
}

@media (max-width: 960px) {
  .home-header__nav {
    display: none;
  }
  .home-header__burger {
    display: inline-flex;
  }
  .home-header__bar {
    padding: 0 1rem;
  }
  .home-header__pro {
    display: none;
  }
}
</style>