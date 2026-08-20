<script setup lang="ts">
import { ref, watch } from 'vue'
import { obterPerfilUsuario, atualizarPerfilUsuario } from '../services/api'
import { ufs } from '../data/ufs'
import { getCitiesByUf } from '../data/cities'
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
const saving = ref(false)

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
})

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
          <button @click="close" class="flex-1 py-3 bg-[var(--bg-raised)] border border-[var(--border-raised)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--border-default)] transition-colors">Cancelar</button>
          <button @click="salvarEdicao" :disabled="saving" class="flex-1 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>