<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, User, Briefcase, Store } from '@lucide/vue'

const route = useRoute()
const router = useRouter()

// ?acao=registrar → os cards criam uma conta; sem ele, abrem o login
const isRegistro = computed(() => route.query.acao === 'registrar')

function goToType(type: 'client' | 'professional' | 'lojista') {
  const query: Record<string, string> = { tipo: type }
  for (const [key, value] of Object.entries(route.query)) {
    if (key !== 'acao' && key !== 'tipo' && typeof value === 'string') {
      query[key] = value
    }
  }
  router.push({ name: isRegistro.value ? 'register' : 'auth-login', query })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8" style="background:var(--bg-page)">
    <div class="w-full max-w-md">
      <button @click="router.push({ name: 'home' })" class="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-gold)] mb-8">
        <ChevronLeft class="w-5 h-5" /> Voltar
      </button>

      <div class="flex justify-center mb-8">
        <img src="/src/assets/logo.png" alt="Obras & Serviços" class="h-48 w-auto object-contain" />
      </div>

      <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">{{ isRegistro ? 'Criar conta' : 'Acessar Plataforma' }}</h1>
      <p class="text-[var(--text-muted)] mb-8 text-center">{{ isRegistro ? 'Selecione o tipo de conta que deseja criar.' : 'Selecione o tipo de acesso para entrar na sua conta.' }}</p>

      <div class="space-y-4">
        <button type="button" @click="goToType('client')" class="w-full flex items-center gap-4 p-5 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left">
          <div class="w-12 h-12 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0">
            <User class="w-6 h-6 text-[var(--accent-gold)]" />
          </div>
          <div>
            <h3 class="font-semibold text-[var(--text-secondary)]">Sou Cliente</h3>
            <p class="text-sm text-[var(--text-muted)]">Quero encontrar profissionais para minha obra ou reforma</p>
          </div>
        </button>

        <button type="button" @click="goToType('professional')" class="w-full flex items-center gap-4 p-5 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left">
          <div class="w-12 h-12 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase class="w-6 h-6 text-[var(--accent-gold)]" />
          </div>
          <div>
            <h3 class="font-semibold text-[var(--text-secondary)]">Sou Profissional</h3>
            <p class="text-sm text-[var(--text-muted)]">Quero oferecer meus serviços e encontrar clientes</p>
          </div>
        </button>

        <button type="button" @click="goToType('lojista')" class="w-full flex items-center gap-4 p-5 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left">
          <div class="w-12 h-12 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0">
            <Store class="w-6 h-6 text-[var(--accent-gold)]" />
          </div>
          <div>
            <h3 class="font-semibold text-[var(--text-secondary)]">Sou Lojista</h3>
            <p class="text-sm text-[var(--text-muted)]">Quero vender materiais, insumos e equipamentos</p>
          </div>
        </button>
      </div>

      <p v-if="isRegistro" class="text-center text-[var(--text-muted)] mt-8">
        Já tem uma conta?
        <button @click="router.push({ name: 'login' })" class="text-[var(--accent-gold)] hover:text-[var(--accent-teal)] font-medium">Entrar</button>
      </p>
      <p v-else class="text-center text-[var(--text-muted)] mt-8">
        Ainda não tem conta?
        <button @click="router.push({ name: 'register' })" class="text-[var(--accent-gold)] hover:text-[var(--accent-teal)] font-medium">Cadastre-se grátis</button>
      </p>
    </div>
  </div>
</template>
