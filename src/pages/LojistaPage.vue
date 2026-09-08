<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Store, MapPin, Clock, MessageCircle,
  Package, Star, CheckCircle2,
  ChevronRight, ExternalLink, ShoppingCart, Shield,
  Camera,
  Search, Globe, Play
} from '@lucide/vue'
import type { PerfilLojista, Produto } from '../types'
import { listarProdutos, mapProdutoToProduto, obterPerfilLojistaPorId } from '../services/api'

const route = useRoute()
const router = useRouter()

const loja = ref<PerfilLojista | null>(null)
const activeTab = ref<'dashboard' | 'profile'>('profile')
const productTab = ref<'destaques' | 'todos'>('destaques')
const searchQuery = ref('')
const produtosLoja = ref<Produto[]>([])
const showBannerFullscreen = ref(false)

onMounted(async () => {
  try {
    const id = route.params.id as string
    const found = await obterPerfilLojistaPorId(id)
    if (found) {
      loja.value = found
      const data = await listarProdutos(found.id)
      produtosLoja.value = data.filter(p => p.status === 'ativo').map(mapProdutoToProduto)
    }
  } catch (e) {
    console.error('Erro ao carregar lojista:', e)
  }
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'stores' })
  }
}

const filteredProdutos = computed(() => {
  let list = productTab.value === 'destaques' ? topProdutos.value.slice(0, 4) : produtosLoja.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p => p.nome.toLowerCase().includes(q) || (p.descricao && p.descricao.toLowerCase().includes(q)))
  }
  return list
})

const topProdutos = computed(() => [...produtosLoja.value].sort((a, b) => b.estoque - a.estoque))

const horarioFormatado = computed(() => (loja.value?.horario_funcionamento || {}) as Record<string, string>)

function abrirMapa() {
  if (!loja.value) return
  const query = encodeURIComponent(`${loja.value.endereco}, ${loja.value.cidade}, ${loja.value.uf}`)
  window.open(`https://www.google.com/maps/search/${query}`, '_blank')
}

function entrarEmContato() {
  if (loja.value?.telefone_comercial) {
    const tel = loja.value.telefone_comercial.replace(/\D/g, '')
    window.open(`https://wa.me/55${tel}`, '_blank')
  }
}

function abrirSocial(rede: string) {
  if (!loja.value) return
  const socialUrls: Record<string, string | undefined> = {
    facebook: loja.value.social_facebook,
    instagram: loja.value.social_instagram,
    youtube: loja.value.social_youtube
  }
  const url = socialUrls[rede]
  if (url) window.open(url, '_blank')
}
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-page)]" v-if="loja">
    <div class="relative" style="background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-raised) 50%, var(--bg-card) 100%);">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-64 h-64 bg-[var(--accent-gold)] rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-72 h-72 bg-[var(--accent-teal)] rounded-full blur-3xl"></div>
      </div>
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <button @click="goBack()" class="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-gold)] mb-6 transition-colors">
        <ChevronRight class="w-5 h-5 rotate-180" /> Voltar
      </button>

      <div class="flex flex-col md:flex-row gap-6 items-start">
        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <img :src="loja.avatar" :alt="loja.nome" class="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-[var(--border-default)]" />
          <div v-if="loja.verificado" class="absolute -bottom-2 -right-2 bg-[var(--accent-green)] rounded-full p-1.5">
            <CheckCircle2 class="w-6 h-6 text-white" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{{ loja.nome }}</h1>
            <span class="flex items-center gap-1 bg-[color-mix(in srgb,var(--accent-green) 10%,transparent)] text-[var(--accent-green)] text-sm px-3 py-1 rounded-full">
              <CheckCircle2 class="w-4 h-4" /> Verificada
            </span>
          </div>
          <p class="text-[var(--text-muted)] mb-3">{{ loja.descricao }}</p>

          <!-- Address -->
          <div class="flex flex-wrap items-center gap-4 text-[var(--text-muted)] mb-4">
            <div class="flex items-center gap-1">
              <MapPin class="w-4 h-4 text-[var(--accent-gold)]" />
              <span>{{ loja.endereco }}, {{ loja.cidade }} - {{ loja.uf }}</span>
              <button @click="abrirMapa" class="ml-2 p-1.5 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] hover:bg-[color-mix(in srgb,var(--accent-gold) 15%,transparent)] text-[var(--accent-gold)] rounded-lg transition-colors" title="Abrir no mapa">
                <ExternalLink class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Stats + Social -->
          <div class="flex flex-wrap items-center gap-3 mt-4">
            <div class="flex items-center gap-1 bg-[color-mix(in srgb,var(--accent-amber) 10%,transparent)] px-3 py-1.5 rounded-lg">
              <Star class="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
              <span class="font-semibold text-[var(--text-primary)]">{{ loja.avaliacao_media }}</span>
              <span class="text-[var(--text-subtle)]">({{ loja.total_avaliacoes }})</span>
            </div>
            <div class="flex items-center gap-1">
              <Package class="w-4 h-4 text-[var(--text-muted)]" />
              <span class="text-[var(--text-muted)]">{{ produtosLoja.length }} produtos</span>
            </div>
            <span class="w-px h-5 bg-[var(--border-default)] hidden sm:block"></span>
            <button @click="entrarEmContato" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 rounded-lg transition-colors text-xs font-medium">
              <MessageCircle class="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button @click="abrirSocial('facebook')" v-if="loja.social_facebook" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2]/25 rounded-lg transition-colors text-xs font-medium">
              <Globe class="w-3.5 h-3.5" /> Facebook
            </button>
            <button @click="abrirSocial('instagram')" v-if="loja.social_instagram" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E4405F]/15 text-[#E4405F] hover:bg-[#E4405F]/25 rounded-lg transition-colors text-xs font-medium">
              <Camera class="w-3.5 h-3.5" /> Instagram
            </button>
            <button @click="abrirSocial('youtube')" v-if="loja.social_youtube" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF0000]/15 text-[#FF0000] hover:bg-[#FF0000]/25 rounded-lg transition-colors text-xs font-medium">
              <Play class="w-3.5 h-3.5" /> YouTube
            </button>
            </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-[var(--border-default)] mt-8">
        <button
          @click="activeTab = 'profile'"
          class="px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 text-[var(--accent-gold)] border-b-2 border-[var(--accent-gold)]"
        >
          <Store class="w-4 h-4" /> Perfil da Loja
        </button>
      </div>
    </div>
    </div>

    <!-- Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- ==================== PERFIL DA LOJA ==================== -->
      <template v-if="activeTab === 'profile'">
        <!-- Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 flex items-start gap-3">
            <div class="p-2.5 bg-[var(--accent-gold)]/10 rounded-lg">
              <MapPin class="w-5 h-5 text-[var(--accent-gold)]" />
            </div>
            <div>
              <h3 class="text-[var(--text-subtle)] text-xs uppercase tracking-wider font-semibold mb-1">Endereço</h3>
              <p class="text-[var(--text-secondary)] text-sm">{{ loja.endereco }}</p>
              <p class="text-[var(--text-muted)] text-xs mt-0.5">{{ loja.cidade }} - {{ loja.uf }}</p>
              <button @click="abrirMapa" class="mt-1.5 inline-flex items-center gap-1 text-xs text-[var(--accent-gold)] hover:text-[var(--accent-teal)] transition-colors">
                <ExternalLink class="w-3 h-3" /> Abrir no mapa
              </button>
            </div>
          </div>

          <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 flex items-start gap-3">
            <div class="p-2.5 bg-[var(--accent-teal)]/10 rounded-lg">
              <Clock class="w-5 h-5 text-[var(--accent-teal)]" />
            </div>
            <div>
              <h3 class="text-[var(--text-subtle)] text-xs uppercase tracking-wider font-semibold mb-1">Horário</h3>
              <div class="text-sm text-[var(--text-secondary)]">
                <p v-if="horarioFormatado.seg_sex">Seg-Sex: {{ horarioFormatado.seg_sex }}</p>
                <p v-if="horarioFormatado.sab">Sáb: {{ horarioFormatado.sab }}</p>
                <p v-if="horarioFormatado.dom">Dom: {{ horarioFormatado.dom }}</p>
              </div>
              <span class="inline-flex items-center gap-1 mt-1.5 text-xs text-[var(--accent-green)] font-medium">
                <span class="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full"></span> Aberto agora
              </span>
            </div>
          </div>

          <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 flex items-start gap-3">
            <div class="p-2.5 bg-[var(--accent-green)]/10 rounded-lg">
              <Shield class="w-5 h-5 text-[var(--accent-green)]" />
            </div>
            <div>
              <h3 class="text-[var(--text-subtle)] text-xs uppercase tracking-wider font-semibold mb-1">Confiabilidade</h3>
              <p class="text-[var(--text-secondary)] text-sm">{{ loja.verificado ? 'Loja Verificada' : 'Não verificado' }}</p>
              <div class="flex items-center gap-1 mt-1.5 text-xs text-[var(--accent-amber)]">
                <Star class="w-3 h-3 fill-[var(--accent-amber)]" />
                <span>{{ loja.avaliacao_media }} ({{ loja.total_avaliacoes }} avaliações)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- About -->
        <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-5 mb-6">
          <h3 class="font-semibold text-[var(--text-secondary)] mb-3">Sobre</h3>
          <p class="text-[var(--text-muted)] text-sm leading-relaxed">{{ loja.descricao }}</p>
          <div v-if="loja.razao_social || loja.cnpj" class="mt-4 pt-4 border-t border-[var(--border-default)] grid grid-cols-2 gap-4">
            <div v-if="loja.razao_social">
              <span class="text-[var(--text-subtle)] text-xs uppercase tracking-wider font-semibold">Razão Social</span>
              <p class="text-[var(--text-secondary)] text-sm mt-0.5">{{ loja.razao_social }}</p>
            </div>
            <div v-if="loja.cnpj">
              <span class="text-[var(--text-subtle)] text-xs uppercase tracking-wider font-semibold">CNPJ</span>
              <p class="text-[var(--text-secondary)] text-sm mt-0.5">{{ loja.cnpj }}</p>
            </div>
          </div>
        </div>

        <!-- Search + Filters -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          <div class="relative flex-1 w-full">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar produtos..."
              class="w-full h-10 pl-10 pr-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-secondary)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-gold)]/50 transition-colors"
            />
          </div>
        </div>

        <!-- Product Tabs -->
        <div class="flex items-center gap-6 mb-5 border-b border-[var(--border-default)]">
          <button
            @click="productTab = 'destaques'; searchQuery = ''"
            :class="['pb-3 text-sm font-medium transition-colors border-b-2', productTab === 'destaques' ? 'text-[var(--accent-gold)] border-[var(--accent-gold)]' : 'text-[var(--text-subtle)] border-transparent hover:text-[var(--text-muted)]']"
          >Destaques</button>
          <button
            @click="productTab = 'todos'; searchQuery = ''"
            :class="['pb-3 text-sm font-medium transition-colors border-b-2', productTab === 'todos' ? 'text-[var(--accent-gold)] border-[var(--accent-gold)]' : 'text-[var(--text-subtle)] border-transparent hover:text-[var(--text-muted)]']"
          >Todos os Produtos <span class="text-[var(--text-subtle)] font-normal">({{ produtosLoja.length }})</span></button>
        </div>

        <!-- Product Grid -->
        <div v-if="filteredProdutos.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <div
            v-for="prod in filteredProdutos"
            :key="prod.id"
            class="group bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl overflow-hidden hover:border-[var(--accent-gold)]/30 hover:shadow-lg hover:shadow-[#f0a500]/5 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="relative aspect-square bg-gradient-to-br from-[var(--bg-raised)] to-[var(--bg-card)] overflow-hidden">
              <img v-if="prod.imagens && prod.imagens.length > 0" :src="prod.imagens[0]" :alt="prod.nome" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div v-else class="absolute inset-0 flex items-center justify-center opacity-15 group-hover:scale-110 transition-transform duration-500">
                <Package class="w-16 h-16 text-[var(--accent-gold)]" />
              </div>
              <span v-if="productTab === 'destaques'" class="absolute top-2 right-2 bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-[9px] font-bold px-1.5 py-0.5 rounded">EM DESTAQUE</span>
              <span class="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded" :class="prod.estoque > 0 ? 'bg-[var(--accent-green)]/90 text-white' : 'bg-[var(--accent-red)]/90 text-white'">
                <span class="w-1.5 h-1.5 bg-white rounded-full"></span> {{ prod.estoque > 50 ? 'EM ESTOQUE' : prod.estoque > 0 ? 'ÚLTIMAS' : 'ESGOTADO' }}
              </span>
              </div>
            <div class="p-3.5">
              <p class="text-[var(--text-subtle)] text-[10px] uppercase tracking-wider font-semibold mb-0.5">{{ prod.categoria }}</p>
              <h4 class="font-medium text-[var(--text-secondary)] text-sm truncate">{{ prod.nome }}</h4>
              <p v-if="prod.descricao" class="text-[var(--text-muted)] text-xs mt-1 line-clamp-2 min-h-[2rem]">{{ prod.descricao }}</p>
              <div class="mt-3 flex items-center justify-between">
                <div>
                  <p class="text-lg font-bold text-[var(--accent-gold)]">R$ {{ prod.preco.toFixed(2) }}</p>
                  <span class="text-[var(--text-subtle)] text-[10px]">/{{ prod.unidade }}</span>
                </div>
                <button class="w-9 h-9 flex items-center justify-center bg-[var(--accent-gold)] text-[var(--text-on-accent)] rounded-xl hover:shadow-lg transition-all active:scale-90">
                  <ShoppingCart class="w-4 h-4" />
                </button>
              </div>
              <div class="mt-2 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" :class="prod.estoque > 50 ? 'bg-[var(--accent-green)]' : prod.estoque > 0 ? 'bg-[var(--accent-amber)]' : 'bg-[var(--accent-red)]'"></span>
                <span class="text-[var(--text-subtle)] text-[10px]">{{ prod.estoque > 50 ? 'Em estoque' : prod.estoque > 0 ? `Apenas ${prod.estoque} un.` : 'Sem estoque' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl mb-8">
          <Package class="w-12 h-12 text-[var(--border-default)] mx-auto mb-3" />
          <h3 class="text-lg font-semibold text-[var(--text-secondary)] mb-1">Nenhum produto encontrado</h3>
          <p class="text-[var(--text-subtle)] text-sm">Tente ajustar sua busca ou filtro.</p>
        </div>

        <!-- Banner de Promoção -->
        <div v-if="loja?.banner_url" class="mb-8">
          <div 
            @click="showBannerFullscreen = true" 
            class="relative cursor-pointer group overflow-hidden rounded-xl"
          >
            <img 
              :src="loja.banner_url" 
              alt="Banner de promoção" 
              class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-800">
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14 21 3"></path>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Banner Fullscreen Modal -->
        <Teleport to="body">
          <div v-if="showBannerFullscreen && loja?.banner_url" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90" @click="showBannerFullscreen = false">
            <button class="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-white">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
            <img 
              :src="loja.banner_url" 
              alt="Banner de promoção" 
              class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              @click.stop
            />
          </div>
        </Teleport>
      </template>
    </div>
  </div>
</template>
