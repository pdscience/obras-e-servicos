import insforge from './api'
import type { PlanoProfissional } from '../types'

export interface IniciarCheckoutParams {
  perfilId: string
  plano: PlanoProfissional
  tipoPerfil: 'profissional' | 'lojista'
  usuarioId?: string
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
}

export interface CheckoutResposta {
  checkout_url: string
  checkout_id: string
  customer_id: string
  valor: number
  plano: PlanoProfissional
  ambiente: 'sandbox' | 'production'
}

/** Chama a function `criar-pagamento` (Asaas Checkout recorrente) e abre a página de pagamento. */
export async function iniciarCheckoutAsaas(params: IniciarCheckoutParams): Promise<CheckoutResposta> {
  const { data, error } = await insforge.functions.invoke('criar-pagamento', {
    body: {
      perfil_id: params.perfilId,
      plano: params.plano,
      tipo_perfil: params.tipoPerfil,
      usuario_id: params.usuarioId,
      nome: params.nome,
      email: params.email,
      telefone: params.telefone,
      cpf: params.cpf,
      retorno_base: window.location.origin,
    },
  })
  if (error) throw new Error(error.message || 'Falha ao iniciar pagamento')
  const checkout = data as Partial<CheckoutResposta>
  if (!checkout.checkout_url) {
    throw new Error('Checkout indisponível no momento. Tente novamente ou contate o suporte.')
  }
  window.open(checkout.checkout_url, '_blank', 'noopener')
  return checkout as CheckoutResposta
}
