<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LogIn, UserPlus, ChevronLeft } from '@lucide/vue'

const route = useRoute()
const router = useRouter()

const tipo = computed(() => route.query.tipo as string | undefined)

const titulos: Record<string, string> = {
  client: 'Área do Cliente',
  professional: 'Área do Profissional',
  lojista: 'Área do Lojista',
}

function goToLogin() {
  router.push({
    name: 'auth-login',
    query: {
      tipo: tipo.value,
      ...(route.query.redirect ? { redirect: route.query.redirect } : {}),
    },
  })
}

function goToRegister() {
  router.push({ name: 'register', query: { tipo: tipo.value } })
}

function back() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8" style="background:var(--bg-page)">
    <div class="w-full max-w-md">
      <button @click="back" class="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-gold)] mb-8">
        <ChevronLeft class="w-5 h-5" /> Voltar
      </button>

      <div class="flex justify-center mb-8">
        <img src="/src/assets/logo.png" alt="Obras & Serviços" class="h-48 w-auto object-contain" />
      </div>

      <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">
        {{ titulos[tipo || 'client'] || 'Acessar Plataforma' }}
      </h1>
      <p class="text-[var(--text-muted)] mb-8 text-center">
        Faça login na sua conta ou crie um novo acesso para continuar.
      </p>

      <div class="space-y-4">
        <button @click="goToLogin" class="w-full flex items-center gap-4 p-5 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left">
          <div class="w-12 h-12 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0">
            <LogIn class="w-6 h-6 text-[var(--accent-gold)]" />
          </div>
          <div>
            <h3 class="font-semibold text-[var(--text-secondary)]">Entrar</h3>
            <p class="text-sm text-[var(--text-muted)]">Já tenho conta, quero acessar</p>
          </div>
        </button>

        <button @click="goToRegister" class="w-full flex items-center gap-4 p-5 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left">
          <div class="w-12 h-12 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0">
            <UserPlus class="w-6 h-6 text-[var(--accent-gold)]" />
          </div>
          <div>
            <h3 class="font-semibold text-[var(--text-secondary)]">Cadastrar</h3>
            <p class="text-sm text-[var(--text-muted)]">Ainda não tenho conta, quero me cadastrar</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
