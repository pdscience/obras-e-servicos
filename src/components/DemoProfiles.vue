<script setup lang="ts">
import { User, Briefcase, Store, ArrowRight } from '@lucide/vue'

export interface DemoProfile {
  id: string
  type: 'cliente' | 'profissional' | 'lojista'
  name: string
  email: string
  avatar: string
  role: string
  description: string
  icon: typeof User
}

const emit = defineEmits<{
  select: [profile: DemoProfile]
}>()

const demos: DemoProfile[] = [
  {
    id: 'demo-cliente',
    type: 'cliente',
    name: 'Carlos Almeida',
    email: 'carlos@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    role: 'Cliente',
    description: 'Buscar profissionais e solicitar orçamentos',
    icon: User,
  },
  {
    id: 'demo-profissional',
    type: 'profissional',
    name: 'Carlos Silva',
    email: 'carlos.silva@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    role: 'Profissional Premium',
    description: 'Gerenciar pedidos, agenda e avaliações',
    icon: Briefcase,
  },
  {
    id: 'demo-lojista',
    type: 'lojista',
    name: 'ABC Materiais',
    email: 'contato@abcmateriais.com.br',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
    role: 'Lojista',
    description: 'Gerenciar produtos, vendas e perfil da loja',
    icon: Store,
  },
]
</script>

<template>
  <div class="w-full max-w-5xl mx-auto px-4">
    <div class="text-center mb-8">
      <span class="text-[var(--text-subtle)] text-xs uppercase tracking-wider font-mono font-semibold">Acesso Rápido</span>
      <h3 class="text-xl font-bold text-[var(--text-primary)] mt-1">Testar Perfis Demo</h3>
      <p class="text-[var(--text-muted)] text-sm mt-1">Clique em um perfil para explorar a plataforma</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="demo in demos"
        :key="demo.id"
        @click="emit('select', demo)"
        class="group bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5 hover:border-[#f0a50044] hover:shadow-lg hover:shadow-[#f0a500]/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        <div class="flex items-start gap-4 mb-4">
          <div class="relative">
            <img :src="demo.avatar" :alt="demo.name" class="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--border-default)] group-hover:ring-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] transition-all" />
            <div
              class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              :class="demo.type === 'cliente' ? 'bg-[var(--accent-teal)]' : demo.type === 'profissional' ? 'bg-[var(--accent-gold)]' : 'bg-[var(--accent-green)]'"
            >
              <component :is="demo.icon" class="w-3.5 h-3.5 text-[var(--text-on-accent)]" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-[var(--text-secondary)] truncate group-hover:text-[var(--accent-gold)] transition-colors">{{ demo.name }}</h4>
            <span
              class="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1"
              :class="demo.type === 'cliente' ? 'bg-[color-mix(in srgb,var(--accent-teal) 10%,transparent)] text-[var(--accent-teal)]' : demo.type === 'profissional' ? 'bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)]' : 'bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)] text-[var(--accent-green)]'"
            >
              {{ demo.role }}
            </span>
            <p class="text-xs text-[var(--text-subtle)] mt-1">{{ demo.email }}</p>
          </div>
        </div>

        <p class="text-sm text-[var(--text-muted)] mb-3">{{ demo.description }}</p>

        <div
          class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="demo.type === 'cliente' ? 'bg-[color-mix(in srgb,var(--accent-teal) 10%,transparent)] text-[var(--accent-teal)] group-hover:bg-[color-mix(in srgb,var(--accent-teal) 15%,transparent)]' : demo.type === 'profissional' ? 'bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)] group-hover:bg-[color-mix(in srgb,var(--accent-gold) 15%,transparent)]' : 'bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)] text-[var(--accent-green)] group-hover:bg-[#3fb95025]'"
        >
          Entrar como {{ demo.role.split(' ')[0] }}
          <ArrowRight class="w-4 h-4" />
        </div>
      </div>
    </div>

    <p class="text-center text-[var(--text-subtle)] text-xs mt-6">
      Perfis de demonstração — dados fictícios para teste
    </p>
  </div>
</template>
