<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HardHat, Mail, Lock, User, Phone, MapPin, Store, Briefcase,
  Eye, EyeOff, CheckCircle, ArrowRight, ChevronLeft
} from '@lucide/vue'

import { ufs } from '../data/ufs'
import { getCitiesByUf } from '../data/cities'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{ mode: 'login' | 'register' | 'register-professional' }>()
defineEmits<{ back: []; success: [] }>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const localMode = ref(props.mode === 'register-professional' ? 'register' : props.mode)
watch(() => props.mode, (val) => { localMode.value = val === 'register-professional' ? 'register' : val })
const authMode = localMode
const tipoParam = route.query.tipo as string | undefined
const planoParam = route.query.plano as string | undefined
const gratuitoParam = route.query.gratuito as string | undefined
const isInauguracao = gratuitoParam === 'true'

const selectedType = ref<string>(
  tipoParam === 'professional' ? 'professional' :
  tipoParam === 'lojista' ? 'lojista' :
  props.mode === 'register-professional' ? 'professional' : ''
)

const step = ref(1)
const showPassword = ref(false)
const submitting = ref(false)
const loginError = ref<string | null>(null)
const temProfissional = computed(() => selectedType.value === 'professional')
const temLojista = computed(() => selectedType.value === 'lojista')
const showForm = ref(!!tipoParam || props.mode === 'register-professional')
const totalSteps = computed(() => temProfissional.value || temLojista.value ? 2 : 3)
const loginMode = ref<'cliente' | 'profissional' | 'lojista'>('cliente')
const loginStep = ref(1)
const selectedUf = ref('')
const selectedCity = ref('')
const cidades = ref<string[]>([])

watch(selectedUf, async (val) => {
  selectedCity.value = ''
  cidades.value = await getCitiesByUf(val || null)
})

const selectedPlan = ref('')
if (isInauguracao) {
  selectedPlan.value = 'ouro'
} else if (planoParam && ['bronze', 'prata', 'ouro'].includes(planoParam)) {
  selectedPlan.value = planoParam
}

function phoneMask(e: Event) {
  const input = e.target as HTMLInputElement
  const start = input.selectionStart ?? 0
  const prevLen = input.value.length
  const digits = input.value.replace(/\D/g, '').slice(0, 11)
  let masked = ''
  if (digits.length > 6) {
    masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  } else if (digits.length > 2) {
    masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  } else if (digits.length > 0) {
    masked = `(${digits}`
  }
  const diff = masked.length - prevLen
  input.value = masked
  formData.value.phone = masked
  const pos = Math.max(start + diff, 0)
  input.setSelectionRange(pos, pos)
}

function voltarCadastro() {
  if (step.value > 1) {
    step.value--
  } else if (showForm.value) {
    showForm.value = false
    selectedType.value = ''
    selectedPlan.value = ''
  } else {
    router.push({ name: 'home' })
  }
}

function iniciarCadastro() {
  showForm.value = true
  step.value = 1
}

function selectType(type: string) {
  selectedType.value = type
}

const formData = ref({
  name: '', email: '', phone: '', password: '', confirmPassword: '',
  cpfCnpj: '', address: '', city: '', category: '', experience: '',
  description: '', acceptTerms: false
})

const verificationCode = ref('')
const verificationSent = ref(false)


async function handleLogin(e: Event) {
  e.preventDefault()
  submitting.value = true
  loginError.value = null
  const ok = await auth.login(formData.value.email, formData.value.password)
  submitting.value = false
  if (!ok) {
    loginError.value = auth.error
  }
  if (ok) {
    if (auth.requireEmailVerification) {
      verificationSent.value = true
    } else {
      const mapeamento: Record<string, string> = {
        'cliente': 'cliente',
        'profissional': 'profissional',
        'lojista': 'lojista'
      }
      if (!auth.user?.tipos.includes(mapeamento[loginMode.value])) {
        loginError.value = `Sua conta não tem acesso como ${loginMode.value === 'profissional' ? 'Profissional' : loginMode.value === 'lojista' ? 'Lojista' : 'Cliente'}.`
        await auth.logout()
        return
      }
      auth.setMode(loginMode.value)
      const destino: Record<string, string> = {
        cliente: 'cliente-dashboard',
        profissional: 'dashboard',
        lojista: 'loja-dashboard',
      }
      router.push({ name: destino[loginMode.value] })
    }
  }
}

async function handleRegister() {
  submitting.value = true
  const tipoMap: Record<string, string> = {
    'client': 'cliente',
    'professional': 'profissional',
    'lojista': 'lojista',
  }
  const tipo = tipoMap[selectedType.value] ?? 'cliente'
  const ok = await auth.register(
    formData.value.email,
    formData.value.password,
    formData.value.name,
    tipo,
    formData.value.phone,
    isInauguracao
  )
  submitting.value = false

  if (ok) {
    const destino: Record<string, string> = {
      cliente: 'cliente-dashboard',
      profissional: 'dashboard',
      lojista: 'loja-dashboard',
    }
    router.push({ name: destino[tipo] })
  } else if (auth.requireEmailVerification) {
    verificationSent.value = true
  }
}

async function handleVerifyEmail() {
  submitting.value = true
  const ok = await auth.verifyEmail(formData.value.email, verificationCode.value)
  submitting.value = false
  if (ok) {
    const tipoMap: Record<string, string> = {
      'client': 'cliente',
      'professional': 'profissional',
      'lojista': 'lojista',
    }
    const tipo = tipoMap[selectedType.value] ?? 'cliente'
    const destino: Record<string, string> = {
      cliente: 'cliente-dashboard',
      profissional: 'dashboard',
      lojista: 'loja-dashboard',
    }
    router.push({ name: destino[tipo] })
  }
}

async function handleSubmit(e: Event) {
  e.preventDefault()
  if (authMode.value === 'login') {
    await handleLogin(e)
  } else if (verificationSent.value) {
    await handleVerifyEmail()
  } else if (step.value < totalSteps.value) {
    step.value++
  } else {
    await handleRegister()
  }
}
</script>

<template>
  <div class="min-h-screen" style="background:var(--bg-page)">
    <div class="flex">
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="w-full max-w-md">
          <!-- Login -->
          <template v-if="authMode === 'login'">
            <button @click="router.push({ name: 'home' })" class="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-gold)] mb-8"><ChevronLeft class="w-5 h-5" /> Voltar</button>
            <div class="flex items-center gap-2 mb-8">
              <div class="bg-[var(--accent-gold)] p-2 rounded-lg"><HardHat class="w-6 h-6 text-[var(--text-on-accent)]" /></div>
              <span class="text-xl font-bold text-[var(--text-primary)]">Obras &amp; <span class="text-[var(--accent-gold)]">Serviços</span></span>
            </div>
            <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2">Bem-vindo de volta!</h1>
            <p class="text-[var(--text-muted)] mb-8">Entre na sua conta para continuar</p>

            <div v-if="auth.error || loginError" class="p-3 mb-4 bg-[color-mix(in srgb,var(--accent-red) 8%,transparent)] border border-[var(--accent-red)] rounded-xl text-[var(--accent-red)] text-sm">{{ loginError || auth.error }}</div>

            <div v-if="auth.requireEmailVerification && !verificationSent" class="p-3 mb-4 bg-[color-mix(in srgb,var(--accent-gold) 8%,transparent)] border border-[var(--accent-gold)] rounded-xl text-[var(--accent-gold)] text-sm">
              Seu email ainda não foi verificado. Verifique sua caixa de entrada ou solicite um novo código.
            </div>

            <!-- Verification code -->
            <template v-if="verificationSent">
              <p class="text-[var(--text-muted)] mb-6">Digite o código de 6 dígitos enviado para <strong class="text-[var(--text-secondary)]">{{ formData.email }}</strong></p>
              <form @submit="handleSubmit" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Código de verificação</label>
                  <input v-model="verificationCode" type="text" maxlength="6" placeholder="000000" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <button type="submit" :disabled="submitting || verificationCode.length !== 6" class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">{{ submitting ? 'Verificando...' : 'Verificar Email' }}</button>
              </form>
              <button @click="auth.resendVerification(formData.email)" class="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] mt-4">Reenviar código</button>
              <p class="text-center text-[var(--text-muted)] mt-6"><button @click="authMode = 'register'" class="text-[var(--accent-gold)] hover:text-[var(--accent-teal)] font-medium">Criar uma conta</button></p>
            </template>

            <!-- Role selection -->
            <template v-else-if="loginStep === 1">
              <div class="space-y-3">
                <button type="button" @click="loginMode = 'cliente'; loginStep = 2" class="flex items-center gap-3 w-full p-4 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left">
                  <div class="w-10 h-10 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-xl">👤</span></div>
                  <div><h3 class="font-semibold text-[var(--text-secondary)]">Cliente</h3><p class="text-sm text-[var(--text-muted)]">Acessar como cliente</p></div>
                </button>
                <button type="button" @click="loginMode = 'profissional'; loginStep = 2" class="flex items-center gap-3 w-full p-4 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left">
                  <div class="w-10 h-10 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-xl">🔧</span></div>
                  <div><h3 class="font-semibold text-[var(--text-secondary)]">Profissional</h3><p class="text-sm text-[var(--text-muted)]">Acessar como profissional</p></div>
                </button>
                <button type="button" @click="loginMode = 'lojista'; loginStep = 2" class="flex items-center gap-3 w-full p-4 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left">
                  <div class="w-10 h-10 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-xl">🏪</span></div>
                  <div><h3 class="font-semibold text-[var(--text-secondary)]">Lojista</h3><p class="text-sm text-[var(--text-muted)]">Acessar como lojista</p></div>
                </button>
              </div>
            </template>

            <!-- Login form -->
            <form v-else @submit="handleSubmit" class="space-y-4">
              <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">E-mail</label><div class="relative"><Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><input v-model="formData.email" type="email" placeholder="seu@email.com" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /></div></div>
              <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Senha</label><div class="relative"><Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><input v-model="formData.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="w-full pl-12 pr-12 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /><button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-muted)]"><EyeOff v-if="showPassword" class="w-5 h-5" /><Eye v-else class="w-5 h-5" /></button></div></div>

              <button type="submit" :disabled="submitting" class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">{{ submitting ? 'Entrando...' : 'Entrar' }}</button>
            </form>

            <p v-if="loginStep === 1" class="text-center text-[var(--text-muted)] mt-6">Não tem uma conta? <button @click="authMode = 'register'" class="text-[var(--accent-gold)] hover:text-[var(--accent-teal)] font-medium">Cadastre-se</button></p>
            <p v-else class="text-center text-[var(--text-muted)] mt-6"><button @click="loginStep = 1" class="text-[var(--accent-gold)] hover:text-[var(--accent-teal)] font-medium">← Voltar</button></p>
          </template>

          <!-- Register -->
          <template v-if="authMode === 'register'">
            <button @click="voltarCadastro" class="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-gold)] mb-8"><ChevronLeft class="w-5 h-5" /> {{ showForm ? (step > 1 ? 'Passo anterior' : 'Tipo de conta') : 'Voltar' }}</button>
            <div class="flex items-center gap-2 mb-8"><div class="bg-[var(--accent-gold)] p-2 rounded-lg"><HardHat class="w-6 h-6 text-[var(--text-on-accent)]" /></div><span class="text-xl font-bold text-[var(--text-primary)]">Obras &amp; <span class="text-[var(--accent-gold)]">Serviços</span></span></div>

            <div v-if="auth.error" class="p-3 mb-4 bg-[color-mix(in srgb,var(--accent-red) 8%,transparent)] border border-[var(--accent-red)] rounded-xl text-[var(--accent-red)] text-sm">{{ auth.error }}</div>

            <!-- Verification code -->
            <template v-if="verificationSent">
              <h2 class="text-xl font-bold text-[var(--text-primary)] mb-2">Verifique seu email</h2>
              <p class="text-[var(--text-muted)] mb-6">Digite o código de 6 dígitos enviado para <strong class="text-[var(--text-secondary)]">{{ formData.email }}</strong></p>
              <form @submit="handleSubmit" class="space-y-4">
                <input v-model="verificationCode" type="text" maxlength="6" placeholder="000000" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                <button type="submit" :disabled="submitting || verificationCode.length !== 6" class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">{{ submitting ? 'Verificando...' : 'Verificar e Continuar' }}</button>
              </form>
              <button @click="auth.resendVerification(formData.email)" class="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] mt-4">Reenviar código</button>
            </template>

            <template v-else-if="!showForm">
              <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2">Criar conta</h1>
              <p class="text-[var(--text-muted)] mb-8">Escolha como você quer participar</p>
              <div class="space-y-4">
                <button type="button" @click="selectType('client')" class="flex items-start gap-4 w-full p-6 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left" :class="{ 'border-[var(--accent-gold)]': selectedType === 'client' }">
                  <div class="flex items-start gap-4 flex-1"><div class="w-12 h-12 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0"><User class="w-6 h-6 text-[var(--accent-gold)]" /></div><div><h3 class="font-semibold text-[var(--text-secondary)] mb-1">Sou Cliente</h3><p class="text-sm text-[var(--text-muted)]">Quero encontrar profissionais para minha obra ou reforma</p></div></div>
                  <div class="w-5 h-5 mt-1 rounded-full border-2 flex items-center justify-center flex-shrink-0" :class="selectedType === 'client' ? 'border-[var(--accent-gold)]' : 'border-[var(--border-default)]'"><div v-if="selectedType === 'client'" class="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)]"></div></div>
                </button>
                <button type="button" @click="selectType('professional')" class="flex items-start gap-4 w-full p-6 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left" :class="{ 'border-[var(--accent-gold)]': selectedType === 'professional' }">
                  <div class="flex items-start gap-4 flex-1"><div class="w-12 h-12 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0"><Briefcase class="w-6 h-6 text-[var(--accent-gold)]" /></div><div><h3 class="font-semibold text-[var(--text-secondary)] mb-1">Sou Profissional</h3><p class="text-sm text-[var(--text-muted)]">Quero oferecer meus serviços e encontrar clientes</p></div></div>
                  <div class="w-5 h-5 mt-1 rounded-full border-2 flex items-center justify-center flex-shrink-0" :class="selectedType === 'professional' ? 'border-[var(--accent-gold)]' : 'border-[var(--border-default)]'"><div v-if="selectedType === 'professional'" class="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)]"></div></div>
                </button>
                <button type="button" @click="selectType('lojista')" class="flex items-start gap-4 w-full p-6 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-xl hover:border-[var(--accent-gold)] transition-colors text-left" :class="{ 'border-[var(--accent-gold)]': selectedType === 'lojista' }">
                  <div class="flex items-start gap-4 flex-1"><div class="w-12 h-12 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl flex items-center justify-center flex-shrink-0"><Store class="w-6 h-6 text-[var(--accent-gold)]" /></div><div><h3 class="font-semibold text-[var(--text-secondary)] mb-1">Sou Lojista</h3><p class="text-sm text-[var(--text-muted)]">Quero vender materiais, insumos e equipamentos</p></div></div>
                  <div class="w-5 h-5 mt-1 rounded-full border-2 flex items-center justify-center flex-shrink-0" :class="selectedType === 'lojista' ? 'border-[var(--accent-gold)]' : 'border-[var(--border-default)]'"><div v-if="selectedType === 'lojista'" class="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)]"></div></div>
                </button>
                <button @click="iniciarCadastro" class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50" :disabled="!selectedType">Continuar <ArrowRight class="w-5 h-5 inline" /></button>
              </div>
              <p class="text-center text-[var(--text-muted)] mt-8">Já tem uma conta? <button @click="authMode = 'login'" class="text-[var(--accent-gold)] hover:text-[var(--accent-teal)] font-medium">Entrar</button></p>
            </template>

            <template v-if="showForm && !verificationSent">
              <div class="flex items-center gap-2 mb-8">
                <template v-for="s in totalSteps" :key="s">
                  <div class="flex items-center">
                    <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', s < step ? 'bg-[var(--accent-green)] text-white' : s === step ? 'bg-[var(--accent-gold)] text-[var(--text-on-accent)]' : 'bg-[var(--border-default)] text-[var(--text-subtle)]']"><CheckCircle v-if="s < step" class="w-5 h-5" /><template v-else>{{ s }}</template></div>
                    <div v-if="s < totalSteps" :class="['w-12 h-1 mx-1 rounded', s < step ? 'bg-[var(--accent-green)]' : 'bg-[var(--border-default)]']"></div>
                  </div>
                </template>
              </div>

              <form @submit="handleSubmit" class="space-y-4">
                <template v-if="step === 1">
                  <h2 class="text-xl font-bold text-[var(--text-primary)] mb-4">Informações Básicas</h2>
                  <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Nome completo</label><div class="relative"><User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><input v-model="formData.name" type="text" placeholder="Seu nome" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /></div></div>
                  <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">E-mail</label><div class="relative"><Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><input v-model="formData.email" type="email" placeholder="seu@email.com" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /></div></div>
                  <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Telefone</label><div class="relative"><Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><input type="tel" placeholder="(11) 99999-9999" :value="formData.phone" @input="phoneMask" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /></div></div>
                </template>

                <template v-if="step === 2 && !temProfissional && !temLojista">
                  <h2 class="text-xl font-bold text-[var(--text-primary)] mb-4">Localização</h2>
                  <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">UF</label><div class="relative"><MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><select v-model="selectedUf" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] appearance-none cursor-pointer"><option value="">Selecione o estado</option><option v-for="uf in ufs" :key="uf.sigla" :value="uf.sigla">{{ uf.sigla }} - {{ uf.nome }}</option></select></div></div>
                  <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Município</label><div class="relative"><MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><select v-model="selectedCity" :disabled="!selectedUf" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"><option value="">{{ selectedUf ? 'Selecione o município' : 'Selecione um estado primeiro' }}</option><option v-for="city in cidades" :key="city" :value="city">{{ city }}</option></select></div></div>
                </template>

                <template v-if="step === 2 && (temProfissional || temLojista)">
                  <h2 class="text-xl font-bold text-[var(--text-primary)] mb-4">Criar Senha</h2>
                  <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Senha</label><div class="relative"><Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><input v-model="formData.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="w-full pl-12 pr-12 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /><button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-muted)]"><EyeOff v-if="showPassword" class="w-5 h-5" /><Eye v-else class="w-5 h-5" /></button></div></div>
                  <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Confirmar senha</label><div class="relative"><Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><input v-model="formData.confirmPassword" type="password" placeholder="••••••••" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /></div></div>
                  <label class="flex items-start gap-3 cursor-pointer"><input type="checkbox" v-model="formData.acceptTerms" class="w-4 h-4 mt-1 accent-[var(--accent-gold)]" /><span class="text-sm text-[var(--text-muted)]">Li e aceito os <a href="#" class="text-[var(--accent-gold)] hover:underline">Termos de Uso</a> e a <a href="#" class="text-[var(--accent-gold)] hover:underline">Política de Privacidade</a></span></label>
                </template>

                <template v-if="step === 3">
                  <h2 class="text-xl font-bold text-[var(--text-primary)] mb-4">Criar Senha</h2>
                  <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Senha</label><div class="relative"><Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><input v-model="formData.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="w-full pl-12 pr-12 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /><button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-muted)]"><EyeOff v-if="showPassword" class="w-5 h-5" /><Eye v-else class="w-5 h-5" /></button></div></div>
                  <div><label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Confirmar senha</label><div class="relative"><Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" /><input v-model="formData.confirmPassword" type="password" placeholder="••••••••" class="w-full pl-12 pr-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" /></div></div>
                  <label class="flex items-start gap-3 cursor-pointer"><input type="checkbox" v-model="formData.acceptTerms" class="w-4 h-4 mt-1 accent-[var(--accent-gold)]" /><span class="text-sm text-[var(--text-muted)]">Li e aceito os <a href="#" class="text-[var(--accent-gold)] hover:underline">Termos de Uso</a> e a <a href="#" class="text-[var(--accent-gold)] hover:underline">Política de Privacidade</a></span></label>
                </template>

                <button type="submit" :disabled="submitting || (step === totalSteps && !formData.acceptTerms)" class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  <template v-if="submitting">
                    {{ step < totalSteps ? 'Aguarde...' : 'Criando conta...' }}
                  </template>
                  <template v-else>
                    <template v-if="step < totalSteps">Continuar <ArrowRight class="w-5 h-5" /></template>
                    <template v-else>Criar Conta</template>
                  </template>
                </button>
              </form>
            </template>
          </template>
        </div>
      </div>

      <!-- Right side -->
      <div class="hidden lg:block lg:w-1/2 relative" style="background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-card) 100%)">
        <div class="absolute inset-0 opacity-10"><div class="absolute top-20 right-20 w-64 h-64 bg-[var(--accent-gold)] rounded-full blur-3xl"></div><div class="absolute bottom-20 left-20 w-96 h-96 bg-[var(--accent-teal)] rounded-full blur-3xl"></div></div>
        <div class="relative z-10 flex items-center justify-center h-full p-12">
          <div class="text-center max-w-lg">
            <h2 class="text-3xl font-bold text-[var(--text-primary)] mb-4">{{ authMode === 'login' ? 'Conecte-se aos Melhores Profissionais' : selectedType === 'professional' ? 'Aumente sua Renda com o Obras & Serviços' : selectedType === 'lojista' ? 'Expanda seu Negócio Online' : 'Encontre Profissionais Qualificados' }}</h2>
            <p class="text-[var(--text-muted)]">{{ authMode === 'login' ? 'Milhares de profissionais qualificados prontos para transformar seu projeto em realidade.' : selectedType === 'professional' ? 'Junte-se a milhares de profissionais que já encontram clientes todos os dias através da nossa plataforma.' : selectedType === 'lojista' ? 'Anuncie seus materiais e equipamentos e alcance milhares de clientes em todo o Brasil.' : 'Conectamos você aos melhores profissionais da construção civil com segurança e praticidade.' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
