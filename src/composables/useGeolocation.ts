import { ref } from 'vue'

export function useGeolocation() {
  const userLat = ref<number | null>(null)
  const userLng = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function obterLocalizacao(): Promise<void> {
    if (!navigator.geolocation) {
      error.value = 'Geolocalização não suportada pelo navegador'
      return Promise.resolve()
    }

    loading.value = true
    error.value = null

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLat.value = pos.coords.latitude
          userLng.value = pos.coords.longitude
          loading.value = false
          resolve()
        },
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              error.value = 'Permissão de localização negada'
              break
            case err.POSITION_UNAVAILABLE:
              error.value = 'Localização indisponível'
              break
            case err.TIMEOUT:
              error.value = 'Tempo excedido ao obter localização'
              break
            default:
              error.value = 'Erro ao obter localização'
          }
          loading.value = false
          resolve()
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  return { userLat, userLng, loading, error, obterLocalizacao }
}
