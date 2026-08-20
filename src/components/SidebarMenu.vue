<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LogOut, LayoutDashboard } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import logoSrc from '../assets/logo.png'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

function navigate(routeName: string) {
  router.push({ name: routeName })
}

function handleLogout() {
  auth.logout()
  router.push({ name: 'home' })
}

const dashboardRoute = computed(() =>
  auth.currentMode === 'cliente' ? 'cliente-dashboard' : auth.currentMode === 'lojista' ? 'lojista-dashboard' : 'dashboard'
)

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
  <aside class="sidebar-main" aria-label="Menu lateral de funções">
    <!-- Logo -->
    <div class="px-2 mb-8">
      <button @click="navigate('home')" class="flex items-center gap-2" style="cursor:pointer">
        <img :src="logoSrc" alt="Obras & Serviços" class="logo-text h-38 w-auto" />
      </button>
      <p class="text-[11px] text-[var(--text-muted)] mt-1 px-1"></p>
    </div>

    <!-- Navegação -->
    <nav class="flex-1 space-y-1 overflow-y-auto">
      <p class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Menu de funções</p>
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="navigate(item.id)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors text-left',
          route.name === item.id
            ? 'bg-[color-mix(in_srgb,var(--accent-gold)_12%,transparent)] text-[var(--accent-gold)] font-semibold'
            : 'text-[var(--text-muted)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-secondary)]'
        ]"
      >
        <span class="w-5 h-5 shrink-0 flex items-center justify-center text-[var(--accent-gold)]">
          <span class="w-1.5 h-1.5 rounded-full" :class="route.name === item.id ? 'bg-[var(--accent-gold)]' : 'bg-[var(--text-subtle)]'"></span>
        </span>
        {{ item.label }}
      </button>

      <template v-if="auth.isLoggedIn">
        <div class="border-t border-[var(--border-default)] my-3"></div>
        <button
          @click="navigate(dashboardRoute)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors text-left',
            route.name === dashboardRoute ? 'bg-[color-mix(in_srgb,var(--accent-gold)_12%,transparent)] text-[var(--accent-gold)] font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-raised)]'
          ]"
        >
          <LayoutDashboard class="w-5 h-5 shrink-0 text-[var(--accent-gold)]" />
          Meu Painel
        </button>
      </template>
    </nav>
<!-- Footer: perfil / ações de autenticação -->
    <div class="mt-auto px-2 pt-3 border-t border-[var(--border-default)]">
      <template v-if="auth.isLoggedIn">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2.5 px-3 py-2 mt-1.5 text-left text-sm text-[var(--accent-red)] rounded-lg hover:bg-[color-mix(in_srgb,var(--accent-red)_8%,transparent)] transition-colors"
        >
          <LogOut class="w-4 h-4 shrink-0" />
          Sair
        </button>
      </template>
      <template v-else>
        <button
          @click="navigate('login')"
          class="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] text-[var(--text-on-accent)] text-sm font-semibold hover:shadow-lg transition-all"
        >
          Entrar
        </button>
        <button
          @click="navigate('register')"
          class="w-full px-3 py-2.5 mt-2 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--border-default)] transition-colors"
        >
          Cadastre-se grátis
        </button>
      </template>
    </div>
  </aside>

</template>