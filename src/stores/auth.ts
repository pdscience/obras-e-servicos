import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import insforge from '../services/api'
import {
  obterPerfilProfissional,
  obterPerfilLojista,
  criarPerfilProfissional,
  criarPerfilLojista,
  criarUsuario,
  obterUsuario,
  ativarPremium,
} from '../services/api'

export interface AuthUser {
  id: string
  email: string
  nome: string
  tipos: string[]
  avatar_url: string | null
}

const SESSION_FLAG = 'os_sessao'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const requireEmailVerification = ref(false)
  const currentMode = ref<'cliente' | 'profissional' | 'lojista'>('cliente')

  const isLoggedIn = computed(() => !!user.value)
  const temPerfilProfissional = computed(() => user.value?.tipos.includes('profissional') ?? false)
  const temPerfilLojista = computed(() => user.value?.tipos.includes('lojista') ?? false)

  function mergeUser(
    u: { id: string; email: string; profile?: { name?: string; avatar_url?: string } },
    tipos: string[]
  ): AuthUser {
    return {
      id: u.id,
      email: u.email,
      nome: u.profile?.name ?? u.email,
      tipos,
      avatar_url: u.profile?.avatar_url ?? null,
    }
  }

  async function detectTipos(userId: string): Promise<string[]> {
    const tiposSet = new Set<string>(['cliente'])
    try {
      const usuario = await obterUsuario(userId)
      if (usuario?.tipos && Array.isArray(usuario.tipos) && usuario.tipos.length > 0) {
        usuario.tipos.forEach((t: string) => tiposSet.add(t))
      } else if (usuario?.tipo && typeof usuario.tipo === 'string') {
        if (usuario.tipo !== 'usuario') {
          tiposSet.add(usuario.tipo)
        }
      }
    } catch (e) { console.warn('[auth] Erro ao detectar tipos do usuario:', e) }
    try {
      const perfil = await obterPerfilProfissional(userId)
      if (perfil) tiposSet.add('profissional')
    } catch (e) { console.warn('[auth] Erro ao detectar perfil profissional:', e) }
    try {
      const loja = await obterPerfilLojista(userId)
      if (loja) tiposSet.add('lojista')
    } catch (e) { console.warn('[auth] Erro ao detectar perfil lojista:', e) }
    return Array.from(tiposSet)
  }

  let initPromise: Promise<void> | null = null

  async function ensureInitialized() {
    if (!initPromise) {
      initPromise = init()
    }
    return initPromise
  }

  async function init() {
    loading.value = true
    error.value = null
    const temSessao = !!localStorage.getItem(SESSION_FLAG)
      || /[?&](code|state)=/.test(window.location.search)
    if (!temSessao) {
      loading.value = false
      return
    }
    const { data, error: err } = await insforge.auth.getCurrentUser()
    if (err) {
      localStorage.removeItem(SESSION_FLAG)
      loading.value = false
      return
    }
    if (data?.user) {
      const u = data.user as { id: string; email: string; profile?: { name?: string; avatar_url?: string } }
      const tipos = await detectTipos(u.id)
      if (u.id) {
        const existing = await obterUsuario(u.id)
        if (!existing || !existing.tipos || (Array.isArray(existing.tipos) && existing.tipos.length === 0)) {
          await criarUsuario({
            id: u.id,
            email: u.email,
            nome: u.profile?.name ?? u.email.split('@')[0],
            telefone: existing?.telefone ?? undefined,
            tipos,
          })
        }
      }
      user.value = mergeUser(u, tipos)
      localStorage.setItem(SESSION_FLAG, '1')
      if (tipos.includes('profissional')) {
        currentMode.value = 'profissional'
      } else if (tipos.includes('lojista')) {
        currentMode.value = 'lojista'
      } else {
        currentMode.value = 'cliente'
      }
    }
    loading.value = false
  }

  async function login(email: string, password: string) {
    error.value = null
    const { data, error: err } = await insforge.auth.signInWithPassword({ email, password })
    if (err) {
      console.error('[auth] Login error:', err)
      if (err.statusCode === 401) {
        error.value = 'Email ou senha incorretos. Verifique suas credenciais.'
      } else if (err.statusCode === 403) {
        requireEmailVerification.value = true
        error.value = 'Email não verificado. Verifique sua caixa de entrada.'
      } else if (err.statusCode === 429) {
        error.value = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
      } else {
        error.value = err.message || 'Erro ao entrar. Tente novamente.'
      }
      return false
    }
    const u = data?.user as { id: string; email: string; profile?: { name?: string; avatar_url?: string } } | undefined
    if (u && u.id) {
      const tipos = await detectTipos(u.id)
      const existing = await obterUsuario(u.id)
      if (!existing || !existing.tipos || (Array.isArray(existing.tipos) && existing.tipos.length === 0)) {
        await criarUsuario({
          id: u.id,
          email: u.email,
          nome: u.profile?.name ?? u.email.split('@')[0],
          telefone: existing?.telefone ?? undefined,
          tipos,
        })
      }
      user.value = mergeUser(u, tipos)
      localStorage.setItem(SESSION_FLAG, '1')
      if (tipos.includes('profissional')) {
        currentMode.value = 'profissional'
      } else if (tipos.includes('lojista')) {
        currentMode.value = 'lojista'
      } else {
        currentMode.value = 'cliente'
      }
      return true
    }
    error.value = 'Usuário não encontrado na resposta do servidor.'
    return false
  }

  async function register(email: string, password: string, nome: string, tipo: string = 'cliente', telefone?: string, isInauguracao: boolean = false) {
    error.value = null
    requireEmailVerification.value = false
    const { data, error: err } = await insforge.auth.signUp({
      email,
      password,
      name: nome,
      redirectTo: window.location.origin,
    })

    // If user already exists, try to sign in and add the role
    if (err) {
      const msg = (err.message || '').toLowerCase()
      const alreadyExists = msg.includes('already') || msg.includes('já cadastrado') || msg.includes('registered') || msg.includes('unique') || msg.includes('duplicate')
      if (alreadyExists) {
        const { data: signInData, error: signInErr } = await insforge.auth.signInWithPassword({ email, password })
        if (signInErr) {
          // Can't sign in (wrong password) - inform user to login first
          error.value = 'Este email já está cadastrado. Faça login e depois acesse "Tornar Profissional" ou "Tornar Lojista" para adicionar esta funcionalidade à sua conta.'
          return false
        }
        // Sign-in succeeded - now add the role
        const u = signInData?.user as { id: string; email: string; profile?: { name?: string; avatar_url?: string } } | undefined
        if (u && u.id) {
          const tipos = await detectTipos(u.id)
          user.value = mergeUser(u, tipos)
          localStorage.setItem(SESSION_FLAG, '1')
          // Set mode based on existing roles
          if (tipos.includes('profissional')) {
            currentMode.value = 'profissional'
          } else if (tipos.includes('lojista')) {
            currentMode.value = 'lojista'
          } else {
            currentMode.value = 'cliente'
          }
          // Add the new role
          const roleMap: Record<string, 'profissional' | 'lojista'> = {
            'professional': 'profissional',
            'profissional': 'profissional',
            'lojista': 'lojista',
          }
          const targetRole = roleMap[tipo]
          if (targetRole && !user.value.tipos.includes(targetRole)) {
            await adicionarRole(targetRole)
            // Update current mode to the new role
            currentMode.value = targetRole
          }
          return true
        }
        error.value = 'Erro ao processar login. Tente novamente.'
        return false
      }
      error.value = err.message || 'Erro ao cadastrar'
      return false
    }

    const tiposFinais = [tipo]
    user.value = {
      id: data?.user?.id ?? '',
      email,
      nome,
      tipos: tiposFinais,
      avatar_url: null,
    }
    currentMode.value = tipo as 'cliente' | 'profissional' | 'lojista'
    if (user.value.id) {
      await criarUsuario({ id: user.value.id, email, nome, telefone, tipos: tiposFinais, tipo })
      if (tipo === 'profissional') {
        try {
          const perfil = await criarPerfilProfissional({
            usuario_id: user.value.id,
            nome,
            categoria: 'Geral',
            data_inicio_gratis: new Date().toISOString(),
          })
          if (isInauguracao && perfil?.id) {
            try {
              await ativarPremium(perfil.id, 'ouro', 60)
            } catch (e) {
              console.warn('[register] Erro ao ativar premium para inauguração:', e)
            }
          }
        } catch (e) {
          console.warn('[register] Erro ao criar perfil profissional:', e)
        }
      } else if (tipo === 'lojista') {
        try {
          await criarPerfilLojista({
            usuario_id: user.value.id,
            nome,
            nome_fantasia: nome,
            data_inicio_gratis: new Date().toISOString(),
          })
        } catch (e) {
          console.warn('[register] Erro ao criar perfil lojista:', e)
        }
      }
    }
    if (data?.requireEmailVerification) {
      requireEmailVerification.value = true
    }
    if (user.value) {
      localStorage.setItem(SESSION_FLAG, '1')
    }
    return !data?.requireEmailVerification
  }

  async function verifyEmail(email: string, otp: string) {
    error.value = null
    const { data, error: err } = await insforge.auth.verifyEmail({ email, otp })
    if (err) {
      error.value = err.message || 'Código inválido ou expirado'
      return false
    }
    const u = data?.user as { id: string; email: string; profile?: { name?: string; avatar_url?: string } } | undefined
    if (u && user.value) {
      user.value = mergeUser(u, user.value.tipos)
      localStorage.setItem(SESSION_FLAG, '1')
    }
    requireEmailVerification.value = false
    return true
  }

  async function resendVerification(email: string) {
    await insforge.auth.resendVerificationEmail({ email, redirectTo: window.location.origin })
  }

  async function oauthLogin(provider: 'google' | 'github') {
    await insforge.auth.signInWithOAuth({ provider, redirectTo: window.location.origin })
  }

  async function setProfile(profile: { name?: string; avatar_url?: string }) {
    await insforge.auth.setProfile(profile)
    if (user.value) {
      if (profile.name) user.value.nome = profile.name
      if (profile.avatar_url) user.value.avatar_url = profile.avatar_url
    }
  }

  async function adicionarRole(role: 'profissional' | 'lojista', profileData?: {
    categoria?: string
    subcategoria?: string
    especialidades?: string[]
    uf?: string
    cidade?: string
    descricao?: string
    anos_experiencia?: number
  }) {
    if (!user.value) return false
    if (user.value.tipos.includes(role)) return true
    if (role === 'profissional') {
      try {
        await criarPerfilProfissional({
          usuario_id: user.value.id,
          nome: user.value.nome,
          categoria: profileData?.categoria ?? 'Geral',
          subcategoria: profileData?.subcategoria,
          especialidades: profileData?.especialidades,
          uf: profileData?.uf,
          cidade: profileData?.cidade,
          data_inicio_gratis: new Date().toISOString(),
        })
        if (!user.value.tipos.includes('profissional')) {
          user.value.tipos.push('profissional')
        }
        await criarUsuario({ id: user.value.id, email: user.value.email, nome: user.value.nome, tipos: user.value.tipos })
      } catch {
        return false
      }
    } else if (role === 'lojista') {
      try {
        await criarPerfilLojista({
          usuario_id: user.value.id,
          nome: user.value.nome,
          nome_fantasia: user.value.nome,
          descricao: 'Nova loja',
          categorias: [],
          data_inicio_gratis: new Date().toISOString(),
        })
        if (!user.value.tipos.includes('lojista')) {
          user.value.tipos.push('lojista')
        }
        await criarUsuario({ id: user.value.id, email: user.value.email, nome: user.value.nome, tipos: user.value.tipos })
      } catch {
        return false
      }
    }
    return true
  }

  function setMode(modo: 'cliente' | 'profissional' | 'lojista') {
    if (user.value?.tipos.includes(modo)) {
      currentMode.value = modo
    }
  }

  async function logout() {
    const { error: err } = await insforge.auth.signOut()
    if (!err) {
      localStorage.removeItem(SESSION_FLAG)
      user.value = null
      currentMode.value = 'cliente'
    }
  }

  return {
    user,
    loading,
    error,
    requireEmailVerification,
    currentMode,
    isLoggedIn,
    temPerfilProfissional,
    temPerfilLojista,
    ensureInitialized,
    init,
    login,
    register,
    verifyEmail,
    resendVerification,
    oauthLogin,
    setProfile,
    adicionarRole,
    setMode,
    logout,
  }
})
