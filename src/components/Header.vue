<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Menu, X, LogIn, Sun, Moon, LogOut, LayoutDashboard } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import EditarPerfilModal from './EditarPerfilModal.vue'

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

function abrirEditarPerfil() {
  mobileMenuOpen.value = false
  showEditProfileModal.value = true
}

const navItems = computed(() => {
  const items = [
    { id: 'home', label: 'Início' },
    { id: 'categories', label: 'Categorias' },
    { id: 'stores', label: 'Lojas' },
    { id: 'planos', label: 'Planos' },
    { id: 'faq', label: 'Perguntas Frequentes' },
    { id: 'how-it-works', label: 'Como Funciona' },
  ]
  if (auth.currentMode !== 'cliente') {
    items.splice(2, 0, { id: 'quadro-servicos', label: 'Quadro de Serviços' })
  }
  return items
})
</script>
<template>
  <header class="platform-header">
    <div class="header-content">
      <!-- Mobile: hamburger + logo compacto (a sidebar está oculta no mobile) -->
      <div class="flex items-center gap-2 md:hidden">
        <button class="p-2 text-[var(--text-muted)]" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Alternar menu">
          <X v-if="mobileMenuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>
        <span class="text-xl font-bold text-[var(--text-primary)]">Obras &amp; Serviços</span>
      </div>

      <div class="hidden md:flex items-center gap-2">
        <span class="text-xl font-bold text-[var(--accent-gold)]">Obras &amp; Serviços</span>
      </div>

      <div class="flex-1"></div>

      <!-- Actions à la derecha -->
      <div class="flex items-center gap-3">
        <template v-if="auth.isLoggedIn">
          <button
            @click="abrirEditarPerfil"
            class="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-[color-mix(in_srgb,var(--accent-gold)_35%,transparent)]"
            title="Editar / configurar perfil"
          >
            <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" :alt="auth.user?.nome" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-dark-gold)] flex items-center justify-center text-[var(--text-on-accent)] text-sm font-bold">
              {{ auth.user?.nome?.charAt(0)?.toUpperCase() ?? 'U' }}
            </div>
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--accent-green)] border-2 border-[var(--bg-card)]"></span>
          </button>
        </template>

        <template v-if="!auth.isLoggedIn">
          <button
            @click="navigate('login')"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] text-[var(--text-on-accent)] rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <LogIn class="w-4 h-4" />
            Entrar
          </button>
        </template>

        <button
          @click="toggleTheme"
          class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          :class="theme === 'dark' ? 'bg-[var(--bg-raised)] text-[var(--accent-gold)] hover:bg-[var(--border-raised)]' : 'bg-[var(--bg-raised)] text-[var(--accent-gold)] hover:bg-[var(--border-default)]'"
          :title="theme === 'dark' ? 'Modo claro' : 'Modo escuro'"
        >
          <Sun v-if="theme === 'dark'" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Mobile menu dropdown -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-[var(--bg-card)] border-t border-[var(--border-default)]">
      <div class="px-4 py-4 space-y-3">
<!-- Apresentação do perfil (usuário conectado) -->
        <template v-if="auth.isLoggedIn">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-default)]">
            <button
              class="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[color-mix(in_srgb,var(--accent-gold)_35%,transparent)] shrink-0"
              @click="abrirEditarPerfil"
              :title="`Editar perfil: ${auth.user?.nome ?? ''}`"
            >
              <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" :alt="auth.user?.nome" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-dark-gold)] flex items-center justify-center text-[var(--text-on-accent)] text-lg font-bold">
                {{ auth.user?.nome?.charAt(0)?.toUpperCase() ?? 'U' }}
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[var(--accent-green)] border-2 border-[var(--bg-card)]"></span>
            </button>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ auth.user?.nome }}</p>
              <p class="text-xs text-[var(--text-muted)] mt-0.5">{{ auth.currentMode === 'cliente' ? '👤 Cliente' : auth.currentMode === 'profissional' ? '🔧 Profissional' : '🏪 Lojista' }}</p>
            </div>
            <button
              @click="handleLogout"
              class="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[var(--accent-red)] bg-[color-mix(in_srgb,var(--accent-red)_10%,transparent)] transition-colors"
              title="Sair"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
          <button
            @click="navigate(auth.currentMode === 'cliente' ? 'cliente-dashboard' : 'dashboard')"
            class="block w-full text-left px-4 py-2.5 rounded-lg bg-[color-mix(in_srgb,var(--accent-gold)_10%,transparent)] text-[var(--accent-gold)] font-medium"
          >
            <LayoutDashboard class="w-4 h-4 mr-2 inline-block" />
            Meu Painel
          </button>
        </template>

        <!-- Navegación principal -->
        <template v-if="auth.currentMode !== 'profissional'">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="navigate(item.id)"
            :class="[
              'block w-full text-left px-4 py-2 rounded-lg',
              route.name === item.id ? 'bg-[color-mix(in_srgb,var(--accent-gold)_10%,transparent)] text-[var(--accent-gold)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-raised)]'
            ]"
          >{{ item.label }}</button>
        </template>
        <template v-else-if="auth.isLoggedIn">
          <button
            @click="navigate('quadro-servicos')"
            class="block w-full text-left px-4 py-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-raised)]"
          >
            Quadro de Serviços
          </button>
        </template>

        <hr class="my-3 border-[var(--border-default)]" />

        <!-- Não conectado -->
        <template v-if="!auth.isLoggedIn">
          <button @click="navigate('login')" class="block w-full text-center px-4 py-2 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] text-[var(--text-on-accent)] rounded-lg font-medium hover:shadow-lg transition-all">Entrar</button>
          <button @click="navigate('register')" class="block w-full text-center px-4 py-2 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-secondary)] rounded-lg font-medium hover:bg-[var(--border-default)] transition-colors">Cadastre-se grátis</button>
        </template>
      </div>
    </div>
  </header>

  <EditarPerfilModal :visible="showEditProfileModal" @close="showEditProfileModal = false" />
</template>