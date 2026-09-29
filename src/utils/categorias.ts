import type { CategoriaDB, ProfissaoDB } from '../types'

export function construirMapaProfissaoCategoria(
  categorias: CategoriaDB[],
  profissoes: ProfissaoDB[]
): Map<string, string> {
  const nomePorId = new Map(categorias.map(c => [c.id, c.nome]))
  const mapa = new Map<string, string>()
  for (const p of profissoes) {
    const categoria = nomePorId.get(p.categoria_id)
    if (categoria) mapa.set(p.nome, categoria)
  }
  return mapa
}

// servicos.categoria pode ser nome de profissão ("Pedreiro") ou de categoria
// ("Estrutura e Alvenaria"). O profissional recebe se tiver selecionado
// diretamente o valor ou a categoria pai da profissão.
export function servicoPertenceAoProfissional(
  categoriaServico: string,
  minhasCategorias: Set<string>,
  profissaoParaCategoria: Map<string, string>
): boolean {
  if (minhasCategorias.size === 0) return true
  if (minhasCategorias.has(categoriaServico)) return true
  const categoriaPai = profissaoParaCategoria.get(categoriaServico)
  return !!categoriaPai && minhasCategorias.has(categoriaPai)
}
