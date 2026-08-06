<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  Store, Package,
  ChevronRight, Camera, Plus, Pencil, Trash2,
  Bell, Save, X
} from '@lucide/vue'
import { mainCategories } from '../data/mockData'
import { getCitiesByUf } from '../data/cities'
import { useAuthStore } from '../stores/auth'
import {
  obterPerfilLojista, criarPerfilLojista, atualizarPerfilLojista,
  listarProdutos, criarProduto, atualizarProduto, deletarProduto,
  mapLojistaToPerfil
} from '../services/api'
import insforge from '../services/api'
import type { PerfilLojista, Produto } from '../types'

defineEmits<{ back: [] }>()

const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const lojistaId = ref<string | null>(null)
const loja = ref<PerfilLojista | null>(null)
const produtos = ref<Produto[]>([])
const activeTab = ref<'criar' | 'dashboard' | 'produtos' | 'editar'>('criar')

// Form data for creating/editing loja
const formData = ref({
  nome: '',
  nome_fantasia: '',
  razao_social: '',
  cnpj: '',
  descricao: '',
  categorias: [] as string[],
  endereco: '',
  cidade: '',
  uf: '',
  telefone_comercial: '',
  email: '',
  site: '',
  horario_seg_sex: '08:00 - 18:00',
  horario_sab: '08:00 - 12:00',
  horario_dom: '',
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
})

const novoProduto = ref({
  nome: '',
  descricao: '',
  categoria: '',
  preco: 0,
  unidade: 'un',
  estoque: 0,
  imagens: [] as string[],
})

const showNovoProduto = ref(false)
const editProdutoId = ref<string | null>(null)
const uploadImagemLoading = ref(false)
const uploadBannerLoading = ref(false)
const bannerInput = ref<HTMLInputElement | null>(null)

const ufs = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const cidades = ref<string[]>([])

watch(() => formData.value.uf, async (newUf, oldUf) => {
  if (newUf !== oldUf) formData.value.cidade = ''
  cidades.value = await getCitiesByUf(newUf)
})

onMounted(async () => {
  if (!auth.user) return
  loading.value = true
  try {
    const perfil = await obterPerfilLojista(auth.user.id)
    if (perfil) {
      const p = perfil
      loja.value = p
      lojistaId.value = p.id
      formData.value = {
        nome: p.nome,
        nome_fantasia: p.nome_fantasia ?? '',
        razao_social: p.razao_social ?? '',
        cnpj: p.cnpj ?? '',
        descricao: p.descricao,
        categorias: p.categorias,
        endereco: p.endereco,
        cidade: p.cidade,
        uf: p.uf,
        telefone_comercial: p.telefone_comercial ?? '',
        email: p.email ?? '',
        site: p.site ?? '',
        horario_seg_sex: (p.horario_funcionamento as Record<string, string>)?.seg_sex ?? '08:00 - 18:00',
        horario_sab: (p.horario_funcionamento as Record<string, string>)?.sab ?? '08:00 - 12:00',
        horario_dom: (p.horario_funcionamento as Record<string, string>)?.dom ?? '',
        social_facebook: p.social_facebook ?? '',
        social_instagram: p.social_instagram ?? '',
        social_youtube: p.social_youtube ?? '',
      }
      activeTab.value = 'editar'
      await carregarProdutos()
    } else {
      activeTab.value = 'criar'
    }
  } catch (e) {
    console.error('Erro ao carregar perfil lojista:', e)
    activeTab.value = 'criar'
  } finally {
    loading.value = false
  }
})

async function carregarProdutos() {
  if (!lojistaId.value) return
  try {
    const data = await listarProdutos(lojistaId.value)
    produtos.value = data
  } catch (e) {
    console.error('Erro ao carregar produtos:', e)
  }
}

async function salvarLoja() {
  if (!auth.user) return
  saving.value = true
  const horario: Record<string, string> = {}
  if (formData.value.horario_seg_sex) horario.seg_sex = formData.value.horario_seg_sex
  if (formData.value.horario_sab) horario.sab = formData.value.horario_sab
  if (formData.value.horario_dom) horario.dom = formData.value.horario_dom

  const payload = {
    usuario_id: auth.user.id,
    nome: formData.value.nome,
    nome_fantasia: formData.value.nome_fantasia || undefined,
    razao_social: formData.value.razao_social || undefined,
    cnpj: formData.value.cnpj || undefined,
    descricao: formData.value.descricao || undefined,
    categorias: formData.value.categorias,
    endereco: formData.value.endereco || undefined,
    cidade: formData.value.cidade || undefined,
    uf: formData.value.uf || undefined,
    telefone_comercial: formData.value.telefone_comercial || undefined,
    email: formData.value.email || undefined,
    site: formData.value.site || undefined,
    horario_funcionamento: horario,
    social_facebook: formData.value.social_facebook || undefined,
    social_instagram: formData.value.social_instagram || undefined,
    social_youtube: formData.value.social_youtube || undefined,
  }

  try {
    if (loja.value && lojistaId.value) {
      const updated = await atualizarPerfilLojista(lojistaId.value, payload)
      loja.value = mapLojistaToPerfil(updated)
    } else {
      const created = await criarPerfilLojista(payload)
      if (created) {
        loja.value = mapLojistaToPerfil(created)
        lojistaId.value = created.id
        await auth.adicionarRole('lojista')
        await carregarProdutos()
      }
    }
    activeTab.value = 'editar'
  } catch (e) {
    console.error('Erro ao salvar loja:', e)
    alert('Erro ao salvar. Tente novamente.')
  } finally {
    saving.value = false
  }
}

async function salvarProduto() {
  if (!lojistaId.value || !novoProduto.value.nome || novoProduto.value.preco <= 0) return
  saving.value = true
  try {
    const payload = {
      nome: novoProduto.value.nome,
      descricao: novoProduto.value.descricao,
      categoria: novoProduto.value.categoria,
      preco: novoProduto.value.preco,
      unidade: novoProduto.value.unidade,
      estoque: novoProduto.value.estoque,
      imagens: novoProduto.value.imagens,
    }
    if (editProdutoId.value) {
      await atualizarProduto(editProdutoId.value, payload)
    } else {
      await criarProduto({ lojista_id: lojistaId.value, ...payload })
    }
    showNovoProduto.value = false
    editProdutoId.value = null
    novoProduto.value = { nome: '', descricao: '', categoria: '', preco: 0, unidade: 'un', estoque: 0, imagens: [] }
    await carregarProdutos()
  } catch (e) {
    console.error('Erro ao salvar produto:', e)
  } finally {
    saving.value = false
  }
}

function editarProduto(prod: Produto) {
  novoProduto.value = {
    nome: prod.nome,
    descricao: prod.descricao ?? '',
    categoria: prod.categoria,
    preco: prod.preco,
    unidade: prod.unidade,
    estoque: prod.estoque,
    imagens: prod.imagens ?? [],
  }
  editProdutoId.value = prod.id
  showNovoProduto.value = true
}

async function handleDeletarProduto(id: string) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return
  try {
    await deletarProduto(id)
    await carregarProdutos()
  } catch (e) {
    console.error('Erro ao deletar produto:', e)
  }
}

function toggleCategoria(cat: string) {
  const idx = formData.value.categorias.indexOf(cat)
  if (idx >= 0) {
    formData.value.categorias.splice(idx, 1)
  } else {
    formData.value.categorias.push(cat)
  }
}

function mascararTelefone(e: Event) {
  const input = e.target as HTMLInputElement
  let v = input.value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`
  input.value = v
  formData.value.telefone_comercial = v
}

async function handleUploadImagem(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  uploadImagemLoading.value = true
  try {
    const file = input.files[0]
    const ext = file.name.split('.').pop() || 'jpg'
    const key = `produtos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await insforge.storage.from('produtos').upload(key, file)
    if (error) throw error
    if (data?.url) novoProduto.value.imagens.push(data.url)
  } catch (e) {
    console.error('Erro ao enviar imagem:', e)
    alert('Erro ao enviar imagem. Tente novamente.')
  } finally {
    uploadImagemLoading.value = false
    input.value = ''
  }
}

async function handleUploadBanner(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0] || !lojistaId.value) return
  uploadBannerLoading.value = true
  try {
    const file = input.files[0]
    const ext = file.name.split('.').pop() || 'jpg'
    const key = `banners/${lojistaId.value}/${Date.now()}.${ext}`
    const { data, error } = await insforge.storage.from('banner').upload(key, file)
    if (error) throw error
    if (data?.url) {
      await atualizarPerfilLojista(lojistaId.value, { banner_url: data.url })
      if (loja.value) loja.value.banner_url = data.url
    }
  } catch (e) {
    console.error('Erro ao enviar banner:', e)
    alert('Erro ao enviar banner. Tente novamente.')
  } finally {
    uploadBannerLoading.value = false
    input.value = ''
  }
}

async function removerBanner() {
  if (!lojistaId.value) return
  try {
    await atualizarPerfilLojista(lojistaId.value, { banner_url: '' })
    if (loja.value) loja.value.banner_url = ''
  } catch (e) {
    console.error('Erro ao remover banner:', e)
  }
}

function removerImagem(idx: number) {
  novoProduto.value.imagens.splice(idx, 1)
}
</script>

<template>
  <div class="min-h-screen" style="background:var(--bg-page)">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button @click="$emit('back')" class="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">
            <ChevronRight class="w-5 h-5 rotate-180" /> Voltar
          </button>
        </div>
        <div v-if="loja" class="flex items-center gap-3">
          <button class="p-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-raised)] transition-colors relative">
            <Bell class="w-5 h-5 text-[var(--text-muted)]" />
            <span class="absolute top-1 right-1 w-2 h-2 bg-[var(--accent-red)] rounded-full"></span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-16">
        <div class="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-[var(--text-muted)]">Carregando...</p>
      </div>

      <template v-else-if="activeTab === 'criar'">
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store class="w-8 h-8 text-[var(--accent-gold)]" />
            </div>
            <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2">Criar Minha Loja</h1>
            <p class="text-[var(--text-muted)]">Preencha os dados da sua loja para começar a vender</p>
          </div>

          <form @submit.prevent="salvarLoja" class="space-y-6">
            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Informações da Loja</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Nome da Loja *</label>
                  <input v-model="formData.nome" type="text" required placeholder="Minha Loja" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Nome Fantasia</label>
                  <input v-model="formData.nome_fantasia" type="text" placeholder="Nome fantasia" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Razão Social</label>
                  <input v-model="formData.razao_social" type="text" placeholder="Razão social" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">CNPJ</label>
                  <input v-model="formData.cnpj" type="text" placeholder="00.000.000/0001-00" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Descrição da Loja</label>
                <textarea v-model="formData.descricao" rows="3" placeholder="Descreva sua loja, os produtos que vende..." class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] resize-none placeholder-[var(--text-subtle)]"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Categorias da Loja</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="cat in mainCategories"
                    :key="cat.id"
                    type="button"
                    @click="toggleCategoria(cat.name)"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      formData.categorias.includes(cat.name)
                        ? 'bg-[var(--accent-gold)] text-[var(--text-on-accent)]'
                        : 'bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    ]"
                  >{{ cat.name }}</button>
                  </div>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Localização</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Endereço</label>
                  <input v-model="formData.endereco" type="text" placeholder="Rua, número, bairro" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Cidade</label>
                  <select v-model="formData.cidade" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]">
                    <option value="">Selecione a cidade</option>
                    <option v-for="cid in cidades" :key="cid" :value="cid">{{ cid }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">UF</label>
                  <select v-model="formData.uf" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]">
                    <option value="">Selecione</option>
                    <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Contato</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Telefone Comercial</label>
                  <input v-model="formData.telefone_comercial" type="text" placeholder="(11) 99999-9999" @input="mascararTelefone" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">E-mail</label>
                  <input v-model="formData.email" type="email" placeholder="loja@exemplo.com" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Site</label>
                  <input v-model="formData.site" type="url" placeholder="https://meusite.com" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Horário de Funcionamento</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Segunda a Sexta</label>
                  <input v-model="formData.horario_seg_sex" type="text" placeholder="08:00 - 18:00" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Sábado</label>
                  <input v-model="formData.horario_sab" type="text" placeholder="08:00 - 12:00" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Domingo</label>
                  <input v-model="formData.horario_dom" type="text" placeholder="Fechado" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Redes Sociais</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Facebook</label>
                  <input v-model="formData.social_facebook" type="url" placeholder="https://facebook.com/..." class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Instagram</label>
                  <input v-model="formData.social_instagram" type="url" placeholder="https://instagram.com/..." class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">YouTube</label>
                  <input v-model="formData.social_youtube" type="url" placeholder="https://youtube.com/..." class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" @click="$emit('back')" class="px-6 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] rounded-xl hover:text-[var(--text-secondary)] transition-colors">Cancelar</button>
              <button type="submit" :disabled="saving || !formData.nome" class="px-8 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                <Save class="w-4 h-4" /> {{ saving ? 'Salvando...' : 'Criar Loja' }}
              </button>
            </div>
          </form>
        </div>
      </template>

      <template v-else-if="loja">
        <!-- Dashboard Tab (disabled - activate by changing false to activeTab === 'dashboard') -->
        <template v-if="false">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-5 hover:border-[var(--border-raised)] transition-all hover:-translate-y-0.5">
                <div class="flex items-start justify-between mb-2">
                  <span class="text-[var(--text-subtle)] text-xs uppercase tracking-wider font-semibold">Visualizações do Perfil</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5" style="color: rgb(126, 232, 250);"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <p class="text-2xl font-bold text-[var(--text-primary)] font-mono">1.247</p>
                <span class="text-xs font-medium" style="color: rgb(126, 232, 250);">+18%</span>
              </div>
              <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-5 hover:border-[var(--border-raised)] transition-all hover:-translate-y-0.5">
                <div class="flex items-start justify-between mb-2">
                  <span class="text-[var(--text-subtle)] text-xs uppercase tracking-wider font-semibold">Contatos Recebidos</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5" style="color: rgb(240, 165, 0);"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>
                </div>
                <p class="text-2xl font-bold text-[var(--text-primary)] font-mono">89</p>
                <span class="text-xs font-medium" style="color: rgb(240, 165, 0);">+12%</span>
              </div>
              <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-5 hover:border-[var(--border-raised)] transition-all hover:-translate-y-0.5">
                <div class="flex items-start justify-between mb-2">
                  <span class="text-[var(--text-subtle)] text-xs uppercase tracking-wider font-semibold">Produtos Cadastrados</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5" style="color: rgb(63, 185, 80);"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>
                </div>
                <p class="text-2xl font-bold text-[var(--text-primary)] font-mono">{{ produtos.length }}</p>
                <span class="text-xs font-medium" style="color: rgb(63, 185, 80);">+5%</span>
              </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl overflow-hidden">
                <div class="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
                  <h2 class="font-semibold text-[var(--text-secondary)] text-sm">Contatos Recebidos</h2>
                  <button class="text-[var(--accent-gold)] text-xs font-medium hover:text-[var(--accent-teal)] transition-colors">Ver Todos</button>
                </div>
                <div class="divide-y divide-[var(--border-default)]">
                  <div class="px-5 py-4 hover:bg-[var(--bg-raised)] transition-colors">
                    <div class="flex items-start gap-3">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Carlos Almeida" class="w-10 h-10 rounded-full object-cover">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                          <h3 class="font-medium text-[var(--text-secondary)] text-sm">Carlos Almeida</h3>
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--accent-green)]/15 text-[var(--accent-green)]">WhatsApp</span>
                        </div>
                        <p class="text-sm text-[var(--text-muted)] truncate">Gostaria de saber o preço do cimento CP-32</p>
                        <p class="text-xs text-[var(--text-subtle)] mt-0.5">Hoje, 10:30</p>
                      </div>
                    </div>
                  </div>
                  <div class="px-5 py-4 hover:bg-[var(--bg-raised)] transition-colors">
                    <div class="flex items-start gap-3">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt="Marina Santos" class="w-10 h-10 rounded-full object-cover">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                          <h3 class="font-medium text-[var(--text-secondary)] text-sm">Marina Santos</h3>
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]">Site</span>
                        </div>
                        <p class="text-sm text-[var(--text-muted)] truncate">Vocês entregam em Guarulhos?</p>
                        <p class="text-xs text-[var(--text-subtle)] mt-0.5">Ontem, 16:45</p>
                      </div>
                    </div>
                  </div>
                  <div class="px-5 py-4 hover:bg-[var(--bg-raised)] transition-colors">
                    <div class="flex items-start gap-3">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" alt="Roberto Lima" class="w-10 h-10 rounded-full object-cover">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                          <h3 class="font-medium text-[var(--text-secondary)] text-sm">Roberto Lima</h3>
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--accent-green)]/15 text-[var(--accent-green)]">WhatsApp</span>
                        </div>
                        <p class="text-sm text-[var(--text-muted)] truncate">Preciso de 50 sacos de cimento para amanhã</p>
                        <p class="text-xs text-[var(--text-subtle)] mt-0.5">12/05, 09:20</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="space-y-6">
                <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-5">
                  <h2 class="font-semibold text-[var(--text-secondary)] text-sm mb-4">Produtos Mais Vistos</h2>
                  <div class="space-y-3">
                    <div class="flex items-center gap-3 p-2.5 bg-[var(--bg-raised)] rounded-lg hover:bg-[color-mix(in_srgb,var(--bg-raised)_85%,var(--bg-page))] transition-colors cursor-pointer">
                      <div class="w-10 h-10 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] to-[color-mix(in_srgb,var(--accent-gold)_5%,transparent)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-[var(--accent-gold)]"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-[var(--text-secondary)] text-sm truncate">Cimento CP-32 50kg</h4>
                        <p class="text-xs text-[var(--accent-gold)] font-semibold">R$ 42.90</p>
                      </div>
                      <div class="flex items-center gap-1 text-[var(--text-subtle)] text-xs">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>77</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-3 p-2.5 bg-[var(--bg-raised)] rounded-lg hover:bg-[color-mix(in_srgb,var(--bg-raised)_85%,var(--bg-page))] transition-colors cursor-pointer">
                      <div class="w-10 h-10 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] to-[color-mix(in_srgb,var(--accent-gold)_5%,transparent)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-[var(--accent-gold)]"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-[var(--text-secondary)] text-sm truncate">Tubo PVC Esgoto 100mm x 3m</h4>
                        <p class="text-xs text-[var(--accent-gold)] font-semibold">R$ 34.50</p>
                      </div>
                      <div class="flex items-center gap-1 text-[var(--text-subtle)] text-xs">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>68</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-3 p-2.5 bg-[var(--bg-raised)] rounded-lg hover:bg-[color-mix(in_srgb,var(--bg-raised)_85%,var(--bg-page))] transition-colors cursor-pointer">
                      <div class="w-10 h-10 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-gold)_20%,transparent)] to-[color-mix(in_srgb,var(--accent-gold)_5%,transparent)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-[var(--accent-gold)]"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-[var(--text-secondary)] text-sm truncate">Tinta Acrílica Premium Branco 18L</h4>
                        <p class="text-xs text-[var(--accent-gold)] font-semibold">R$ 189.90</p>
                      </div>
                      <div class="flex items-center gap-1 text-[var(--text-subtle)] text-xs">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>89</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Profile Tab -->
        <template v-if="activeTab === 'editar'">
          <form @submit.prevent="salvarLoja" class="max-w-3xl mx-auto space-y-6">
            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Informações da Loja</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Nome da Loja *</label>
                  <input v-model="formData.nome" type="text" required class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Nome Fantasia</label>
                  <input v-model="formData.nome_fantasia" type="text" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Razão Social</label>
                  <input v-model="formData.razao_social" type="text" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">CNPJ</label>
                  <input v-model="formData.cnpj" type="text" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Descrição</label>
                <textarea v-model="formData.descricao" rows="3" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] resize-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Categorias da Loja</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="cat in mainCategories"
                    :key="cat.id"
                    type="button"
                    @click="toggleCategoria(cat.name)"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      formData.categorias.includes(cat.name)
                        ? 'bg-[var(--accent-gold)] text-[var(--text-on-accent)]'
                        : 'bg-[var(--bg-raised)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    ]"
                  >{{ cat.name }}</button>
                </div>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Banner de Promoção</h2>
              <p class="text-sm text-[var(--text-muted)]">Faça upload de um banner para promover promoções da sua loja. O banner será exibido na página pública da loja.</p>
              
              <div v-if="loja?.banner_url" class="relative">
                <img :src="loja.banner_url" alt="Banner da loja" class="w-full h-48 object-cover rounded-xl" />
                <button @click="removerBanner" class="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              
              <div v-else class="border-2 border-dashed border-[var(--border-default)] rounded-xl p-8 text-center hover:border-[var(--accent-gold)] transition-colors">
                <input type="file" accept="image/*" hidden @change="handleUploadBanner" ref="bannerInput" />
                <button @click="bannerInput?.click()" :disabled="uploadBannerLoading" class="flex flex-col items-center gap-2 w-full">
                  <Camera class="w-8 h-8 text-[var(--text-subtle)]" />
                  <span class="text-sm text-[var(--text-muted)]">{{ uploadBannerLoading ? 'Enviando...' : 'Clique para enviar um banner' }}</span>
                  <span class="text-xs text-[var(--text-subtle)]">PNG, JPG até 5MB. Recomendado: 1200x400px</span>
                </button>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Localização</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Endereço</label>
                  <input v-model="formData.endereco" type="text" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Cidade</label>
                  <select v-model="formData.cidade" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]">
                    <option value="">Selecione a cidade</option>
                    <option v-for="cid in cidades" :key="cid" :value="cid">{{ cid }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">UF</label>
                  <select v-model="formData.uf" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]">
                    <option value="">Selecione</option>
                    <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Contato</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Telefone Comercial</label>
                  <input v-model="formData.telefone_comercial" type="text" placeholder="(11) 99999-9999" @input="mascararTelefone" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">E-mail</label>
                  <input v-model="formData.email" type="email" placeholder="loja@exemplo.com" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Site</label>
                  <input v-model="formData.site" type="url" placeholder="https://meusite.com" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Horário de Funcionamento</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Segunda a Sexta</label>
                  <input v-model="formData.horario_seg_sex" type="text" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Sábado</label>
                  <input v-model="formData.horario_sab" type="text" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Domingo</label>
                  <input v-model="formData.horario_dom" type="text" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
              </div>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
              <h2 class="font-semibold text-[var(--text-secondary)] text-lg">Redes Sociais</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Facebook</label>
                  <input v-model="formData.social_facebook" type="url" placeholder="https://facebook.com/..." class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Instagram</label>
                  <input v-model="formData.social_instagram" type="url" placeholder="https://instagram.com/..." class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">YouTube</label>
                  <input v-model="formData.social_youtube" type="url" placeholder="https://youtube.com/..." class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" @click="$emit('back')" class="px-6 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] rounded-xl hover:text-[var(--text-secondary)] transition-colors">Cancelar</button>
              <button type="submit" :disabled="saving" class="px-8 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                <Save class="w-4 h-4" /> {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
              </button>
            </div>
          </form>

          <!-- Products Section -->
          <div class="max-w-3xl mx-auto mt-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-[var(--text-secondary)]">Meus Produtos</h2>
              <button
                @click="showNovoProduto = true; editProdutoId = null; novoProduto = { nome: '', descricao: '', categoria: '', preco: 0, unidade: 'un', estoque: 0, imagens: [] }"
                class="px-4 py-2 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-sm font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus class="w-4 h-4" /> Novo Produto
              </button>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl overflow-hidden">
              <div v-if="produtos.length === 0" class="text-center py-12">
                <Package class="w-10 h-10 text-[var(--border-default)] mx-auto mb-3" />
                <p class="text-[var(--text-subtle)] text-sm">Nenhum produto cadastrado</p>
              </div>
              <div v-else class="divide-y divide-[var(--border-default)]">
                <div v-for="prod in produtos" :key="prod.id" class="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-raised)] transition-colors">
                  <div class="w-12 h-12 rounded-lg overflow-hidden bg-[var(--bg-raised)] flex-shrink-0">
                    <img v-if="prod.imagens && prod.imagens.length > 0" :src="prod.imagens[0]" :alt="prod.nome" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <Package class="w-5 h-5 text-[var(--text-subtle)]" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-[var(--text-secondary)] text-sm truncate">{{ prod.nome }}</h4>
                    <p class="text-xs text-[var(--accent-gold)] font-semibold">R$ {{ prod.preco.toFixed(2) }}</p>
                    <span class="text-[var(--text-subtle)] text-[10px]">{{ prod.categoria }} - Estoque: {{ prod.estoque }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="editarProduto(prod)" class="p-2 hover:bg-[var(--border-default)] rounded-lg transition-colors">
                      <Pencil class="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                    <button @click="handleDeletarProduto(prod.id)" class="p-2 hover:bg-[var(--border-default)] rounded-lg transition-colors">
                      <Trash2 class="w-4 h-4 text-[var(--accent-red)]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Novo Produto Modal -->
        <div v-if="showNovoProduto" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="showNovoProduto = false">
          <div class="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-[var(--text-primary)]">{{ editProdutoId ? 'Editar' : 'Novo' }} Produto</h3>
              <button @click="showNovoProduto = false" class="p-1.5 hover:bg-[var(--bg-raised)] rounded-lg transition-colors"><X class="w-5 h-5 text-[var(--text-muted)]" /></button>
            </div>
            <form @submit.prevent="salvarProduto" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Nome do Produto *</label>
                <input v-model="novoProduto.nome" type="text" required placeholder="Ex: Cimento CP-32" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Descrição</label>
                <textarea v-model="novoProduto.descricao" rows="2" placeholder="Descrição do produto" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] resize-none placeholder-[var(--text-subtle)]"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Categoria</label>
                  <select v-model="novoProduto.categoria" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]">
                    <option value="">Selecione</option>
                    <option v-for="cat in mainCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Unidade</label>
                  <select v-model="novoProduto.unidade" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]">
                    <option value="un">Unidade</option>
                    <option value="kg">Quilograma</option>
                    <option value="m²">Metro²</option>
                    <option value="m³">Metro³</option>
                    <option value="L">Litro</option>
                    <option value="saco">Saco</option>
                    <option value="caixa">Caixa</option>
                    <option value="pacote">Pacote</option>
                    <option value="barra">Barra</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Preço (R$) *</label>
                  <input v-model.number="novoProduto.preco" type="number" step="0.01" min="0" required class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Estoque</label>
                  <input v-model.number="novoProduto.estoque" type="number" min="0" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Imagens</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <div v-for="(img, idx) in novoProduto.imagens" :key="idx" class="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--border-default)] group">
                    <img :src="img" alt="" class="w-full h-full object-cover" />
                    <button type="button" @click="removerImagem(idx)" class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 class="w-4 h-4 text-[var(--accent-red)]" />
                    </button>
                  </div>
                  <label class="w-16 h-16 flex items-center justify-center bg-[var(--bg-raised)] border-2 border-dashed border-[var(--border-raised)] rounded-lg cursor-pointer hover:border-[var(--accent-gold)]/50 transition-colors">
                    <input type="file" accept="image/*" hidden @change="handleUploadImagem" />
                    <Plus v-if="!uploadImagemLoading" class="w-5 h-5 text-[var(--text-subtle)]" />
                    <div v-else class="w-4 h-4 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin"></div>
                  </label>
                </div>
                <p class="text-[var(--text-subtle)] text-xs">Formatos: JPG, PNG, WEBP. Máx: 5MB</p>
              </div>
              <button type="submit" :disabled="saving || !novoProduto.nome || novoProduto.preco <= 0" class="w-full py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                {{ saving ? 'Salvando...' : editProdutoId ? 'Salvar Alterações' : 'Adicionar Produto' }}
              </button>
            </form>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
