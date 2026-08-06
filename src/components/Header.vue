<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Menu, X, Settings,
  ChevronDown, LogIn, Sun, Moon, User, Phone, MapPin
} from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import { ufs } from '../data/ufs'
import { getCitiesByUf } from '../data/cities'
import { listarServicosDoCliente, obterPerfilUsuario, atualizarPerfilUsuario } from '../services/api'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { theme, toggle: toggleTheme } = useTheme()
const mobileMenuOpen = ref(false)
const showUserMenu = ref(false)
const showEditProfileModal = ref(false)
const editNome = ref('')
const editTelefone = ref('')
const editCpf = ref('')
const editDataNascimento = ref('')
const editUf = ref('')
const editCidade = ref('')
const editCidades = ref<string[]>([])
const editEndereco = ref('')
const saving = ref(false)

watch(editUf, async (newUf, oldUf) => {
  if (newUf !== oldUf) editCidade.value = ''
  editCidades.value = await getCitiesByUf(newUf || null)
})

function maskTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

async function abrirEditarPerfil() {
  if (!auth.user) return
  showUserMenu.value = false
  editNome.value = auth.user.nome
  editUf.value = ''
  editCidade.value = ''
  editCidades.value = []
  editEndereco.value = ''
  editCpf.value = ''
  editDataNascimento.value = ''
  editTelefone.value = ''
  try {
    const perfil = await obterPerfilUsuario(auth.user.id)
    if (perfil) {
      editTelefone.value = perfil.telefone ?? ''
      editCpf.value = perfil.cpf ?? ''
      editDataNascimento.value = perfil.data_nascimento ?? ''
      editUf.value = perfil.uf ?? ''
      editCidade.value = perfil.cidade ?? ''
      editEndereco.value = perfil.endereco ?? ''
      if (editUf.value) editCidades.value = await getCitiesByUf(editUf.value)
    }
  } catch { /* sem perfil ainda */ }
  showEditProfileModal.value = true
}

async function salvarEdicao() {
  if (!auth.user) return
  saving.value = true
  try {
    await atualizarPerfilUsuario(auth.user.id, {
      nome: editNome.value,
      telefone: editTelefone.value,
      cpf: editCpf.value,
      data_nascimento: editDataNascimento.value,
      uf: editUf.value,
      cidade: editCidade.value,
      endereco: editEndereco.value,
    })
    await auth.setProfile({ name: editNome.value })
    showEditProfileModal.value = false
  } catch (e) {
    console.error('Erro ao salvar perfil:', e)
  } finally {
    saving.value = false
  }
}

function handleLogout() {
  auth.logout()
  showUserMenu.value = false
  router.push({ name: 'home' })
}

function navigate(routeName: string) {
  router.push({ name: routeName })
  mobileMenuOpen.value = false
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
      <div class="logo-section">
        <div style="display:flex; flex-direction:column; gap:2px">
           <div class="logo" @click="navigate('home')" style="cursor:pointer">
             <span class="logo-text">OS - Obras &amp; Serviços</span>
           </div>
         </div>
      </div>

      <nav v-if="auth.currentMode !== 'profissional'" class="hidden md:flex items-center gap-6">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="navigate(item.id)"
          :class="[
            'text-sm font-medium transition-colors',
            route.name === item.id ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)] hover:text-[var(--accent-gold)]'
          ]"
        >
          {{ item.label }}
        </button>
      </nav>

       <div class="hidden md:flex items-center gap-3">
        <template v-if="auth.isLoggedIn">
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-2 p-1 hover:bg-[var(--bg-raised)] rounded-full transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-[var(--accent-gold)] flex items-center justify-center text-[var(--text-on-accent)] text-sm font-bold">
                {{ auth.user?.nome?.charAt(0)?.toUpperCase() ?? 'U' }}
              </div>
              <ChevronDown class="w-4 h-4 text-[var(--text-muted)]" />
            </button>
            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] rounded-lg shadow-lg py-2 border border-[var(--border-raised)]">
              <div class="px-4 py-2 text-sm text-[var(--text-muted)] border-b border-[var(--border-default)]">{{ auth.user?.nome }}</div>
              <div v-if="auth.user" class="px-3 py-2 border-b border-[var(--border-default)]">
                <div class="flex bg-[var(--bg-raised)] rounded-lg p-0.5">
                  <span class="flex-1 px-2 py-1 text-xs rounded-md font-medium text-center bg-[var(--accent-gold)] text-[var(--text-on-accent)]">{{ auth.currentMode === 'cliente' ? '👤 Cliente' : auth.currentMode === 'profissional' ? '🔧 Profissional' : '🏪 Lojista' }}</span>
                </div>
                </div>

                 <hr class="my-2 border-[var(--border-default)]" />
              <button @click="abrirEditarPerfil" class="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] flex items-center gap-2"><Settings class="w-4 h-4" /> Editar Perfil</button>
              <button @click="navigate(auth.currentMode === 'cliente' ? 'cliente-dashboard' : 'dashboard')" class="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] flex items-center gap-2">Meu Painel</button>
              <button @click="handleLogout" class="w-full px-4 py-2 text-left text-sm text-[var(--accent-red)] hover:bg-[color-mix(in srgb,var(--accent-red) 8%,transparent)]">Sair</button>
            </div>
          </div>
         </template>
        <template v-else>
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

       <button
         class="md:hidden p-2 text-[var(--text-muted)]"
         @click="mobileMenuOpen = !mobileMenuOpen"
       >
        <X v-if="mobileMenuOpen" class="w-6 h-6" />
        <Menu v-else class="w-6 h-6" />
      </button>
    </div>

    <div v-if="mobileMenuOpen && auth.currentMode !== 'profissional'" class="md:hidden bg-[var(--bg-card)] border-t border-[var(--border-default)]">
      <div class="px-4 py-4 space-y-3">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="navigate(item.id)"
          :class="[
            'block w-full text-left px-4 py-2 rounded-lg',
            route.name === item.id ? 'bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] text-[var(--accent-gold)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-raised)]'
          ]"
        >{{ item.label }}</button>
        <hr class="my-3 border-[var(--border-default)]" />
        <button @click="navigate('login')" class="block w-full text-center px-4 py-2 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-dark-gold)] text-[var(--text-on-accent)] rounded-lg font-medium hover:shadow-lg transition-all">Entrar</button>
      </div>
    </div>
    </header>

    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <div v-if="showEditProfileModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="showEditProfileModal = false">
        <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-[var(--text-primary)]">Editar Perfil</h2>
            <button @click="showEditProfileModal = false" class="p-1 hover:bg-[var(--border-default)] rounded-lg transition-colors text-[var(--text-muted)]">✕</button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Nome</label>
              <input v-model="editNome" type="text" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Telefone</label>
              <input :value="editTelefone" @input="editTelefone = maskTelefone(($event.target as HTMLInputElement).value)" type="tel" placeholder="(11) 99999-9999" maxlength="15" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">CPF</label>
                <input :value="editCpf" @input="editCpf = maskCpf(($event.target as HTMLInputElement).value)" type="text" placeholder="000.000.000-00" maxlength="14" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Data de Nascimento</label>
                <input v-model="editDataNascimento" type="date" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">UF</label>
                <select v-model="editUf" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] appearance-none cursor-pointer">
                  <option value="">Selecione</option>
                  <option v-for="uf in ufs" :key="uf.sigla" :value="uf.sigla">{{ uf.sigla }} - {{ uf.nome }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Cidade</label>
                <select v-model="editCidade" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]">
                  <option value="">Selecione a cidade</option>
                  <option v-for="cid in editCidades" :key="cid" :value="cid">{{ cid }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Endereço</label>
              <input v-model="editEndereco" placeholder="Rua, número, bairro" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="showEditProfileModal = false" class="flex-1 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--border-default)] transition-colors">Cancelar</button>
            <button @click="salvarEdicao" :disabled="saving" class="flex-1 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </template>
