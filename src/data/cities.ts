const cache: Record<string, string[]> = {}

export async function getCitiesByUf(uf: string | null | undefined): Promise<string[]> {
  if (!uf) return []
  if (cache[uf]) return cache[uf]
  try {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
    if (!res.ok) throw new Error('IBGE API error')
    const data: { nome: string }[] = await res.json()
    const cities = data.map(m => m.nome).sort()
    cache[uf] = cities
    return cities
  } catch {
    return []
  }
}
