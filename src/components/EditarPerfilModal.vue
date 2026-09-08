<script setup lang="ts">
import { ref, watch } from 'vue'
import { obterPerfilUsuario, atualizarPerfilUsuario } from '../services/api'
import { ufs } from '../data/ufs'
import { getCitiesByUf } from '../data/cities'
import { buscarEnderecoPorCep, maskCep } from '../data/cep'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const auth = useAuthStore()

const editNome = ref('')
const editTelefone = ref('')
const editCpf = ref('')
const editDataNascimento = ref('')
const editUf = ref('')
const editCidade = ref('')
const editCidades = ref<string[]>([])
const editEndereco = ref('')
const editBairro = ref('')
const editCep = ref('')
const saving = ref(false)
const buscandoCep = ref(false)

watch(() => props.visible, async (val) => {
  if (!val || !auth.user) return
  editNome.value = auth.user.nome
  editTelefone.value = ''
  editCpf.value = ''
  editDataNascimento.value = ''
  editUf.value = ''
  editCidade.value = ''
  editCidades.value = []
  editEndereco.value = ''
  editBairro.value = ''
  editCep.value = ''
  try {
    const perfil = await obterPerfilUsuario(auth.user.id)
    if (perfil) {
      editTelefone.value = perfil.telefone ?? ''
      editCpf.value = perfil.cpf ?? ''
      editDataNascimento.value = perfil.data_nascimento ?? ''
      editUf.value = perfil.uf ?? ''
      editCidade.value = perfil.cidade ?? ''
      editEndereco.value = perfil.endereco ?? ''
      editBairro.value = perfil.bairro ?? ''
      editCep.value = perfil.cep ?? ''
      if (editUf.value) editCidades.value = await getCitiesByUf(editUf.value)
    }
  } catch { /* sem perfil ainda */ }
})

watch(editUf, async (newUf, oldUf) => {
  if (newUf !== oldUf) editCidade.value = ''
  editCidades.value = await getCitiesByUf(newUf || null)
})

async function aoAlterarCep(valor: string) {
  const masked = maskCep(valor)
  editCep.value = masked
  const digits = masked.replace(/\D/g, '')
  if (digits.length === 8) {
    buscandoCep.value = true
    try {
      const endereco = await buscarEnderecoPorCep(digits)
      if (endereco) {
        editUf.value = endereco.uf
        editBairro.value = endereco.bairro ?? ''
        if (endereco.logradouro) {
          const existing = editEndereco.value ? `${editEndereco.value}, ` : ''
          editEndereco.value = existing + endereco.logradouro
        }
        // Carrega cidades do estado selecionado
        editCidades.value = await getCitiesByUf(endereco.uf)
        // Seleciona a cidade se existir na lista
        if (endereco.localidade) {
          const match = editCidades.value.find(c => c === endereco.localidade)
          editCidade.value = match ?? endereco.localidade
        }
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e)
    } finally {
      buscandoCep.value = false
    }
  }
}

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
      bairro: editBairro.value,
      cep: editCep.value,
    })
    await auth.setProfile({ name: editNome.value })
    emit('close')
  } catch (e) {
    console.error('Erro ao salvar perfil:', e)
  } finally {
    saving.value = false
  }
}

function close() {
  emit('close')
}
</script>
<template>
  <Teleport to="body">
    <div
      v-if="props.visible"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/60"
      @click.self="close"
    >
      <div class="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-[var(--text-primary)]">Editar Perfil</h2>
          <button @click="close" class="p-1 hover:bg-[var(--border-default)] rounded-lg transition-colors text-[var(--text-muted)]">✕</button>
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
          <div>
            <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">CEP</label>
            <div class="relative">
              <input :value="editCep" @input="aoAlterarCep(($event.target as HTMLInputElement).value)" type="text" placeholder="00000-000" maxlength="9" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
              <div v-if="buscandoCep" class="absolute right-3 top-1/2 -translate-y-1/2">
                <svg class="animate-spin h-5 w-5 text-[var(--accent-gold)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
            </div>
            <p v-if="buscandoCep" class="text-xs text-[var(--text-muted)] mt-1">Buscando endereço...</p>
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
            <input v-model="editEndereco" placeholder="Rua, número, complemento" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Bairro</label>
            <input v-model="editBairro" placeholder="Nome do bairro" class="w-full px-4 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] rounded-xl text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] placeholder-[var(--text-subtle)]" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="close" class="flex-1 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--border-default)] transition-colors">Cancelar</button>
          <button @click="salvarEdicao" :disabled="saving" class="flex-1 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>