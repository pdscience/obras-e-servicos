import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { verificarPeriodoGratis } from '../config/planos'

export function usePeriodoGratis(dataInicioGratisRef: import('vue').Ref<string | null | undefined>) {
  const tempoRestante = ref<{ emGratis: boolean; diasRestantes: number; dataExpiracao: Date | null }>({
    emGratis: false,
    diasRestantes: 0,
    dataExpiracao: null,
  })

  let intervalId: ReturnType<typeof setInterval> | null = null

  function atualizarTempo() {
    tempoRestante.value = verificarPeriodoGratis(dataInicioGratisRef.value)
  }

  watch(dataInicioGratisRef, () => {
    atualizarTempo()
  })

  onMounted(() => {
    atualizarTempo()
    intervalId = setInterval(atualizarTempo, 1000 * 60 * 60)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  const emPeriodoGratis = computed(() => tempoRestante.value.emGratis)
  const diasRestantes = computed(() => tempoRestante.value.diasRestantes)
  const dataExpiracao = computed(() => tempoRestante.value.dataExpiracao)
  const expirado = computed(() => !tempoRestante.value.emGratis && tempoRestante.value.dataExpiracao !== null)

  const textoDiasRestantes = computed(() => {
    if (!emPeriodoGratis.value) return ''
    if (diasRestantes.value === 0) return 'Último dia!'
    if (diasRestantes.value === 1) return 'Resta 1 dia'
    return `Faltam ${diasRestantes.value} dias`
  })

  const percentualRestante = computed(() => {
    if (!dataInicioGratisRef.value) return 0
    const inicio = new Date(dataInicioGratisRef.value).getTime()
    const expiracao = tempoRestante.value.dataExpiracao?.getTime() ?? inicio + 60 * 24 * 60 * 60 * 1000
    const agora = Date.now()
    const total = expiracao - inicio
    const usado = agora - inicio
    return Math.max(0, Math.min(100, 100 - (usado / total) * 100))
  })

  return {
    emPeriodoGratis,
    diasRestantes,
    dataExpiracao,
    expirado,
    textoDiasRestantes,
    percentualRestante,
  }
}
