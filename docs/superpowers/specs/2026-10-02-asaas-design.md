# Integração de Pagamentos Asaas — Design (aprovado)

> **For agentic workers:** Spec da integração Asaas Checkout recorrente. Plano em `docs/superpowers/plans/2026-10-02-asaas-checkout.md`.

**Data:** 2026-10-02
**Status:** Aprovado pelo usuário ("aprovado pode implementar")
**Docs Asaas:** https://docs.asaas.com/reference/comece-por-aqui (Sandbox `https://api-sandbox.asaas.com/v3`, Prod `https://api.asaas.com/v3`)

## Decisões (usuário)

- Modelo: **Checkout recorrente** (`chargeTypes: [RECURRENT]`, `subscription.cycle: MONTHLY`)
- Meios: **Pix + Cartão de crédito** (`billingTypes: [PIX, CREDIT_CARD]`)
- Ambiente inicial: **Sandbox** (chave `$aact_hmlg_`, URL sandbox)

## Fonte de verdade de preços

`src/config/planos.ts` — bronze R$9,90 / prata R$29,90 / ouro R$59,90 / diamante R$99,90.
Limites de fotos: bronze 0, prata 6, ouro 9, diamante 20. `functions/*` duplicam esses
valores (functions não importam `@/config`).

## Arquitetura

```
Vue (Dashboard/HomePricing/Lojista) → Function `criar-pagamento`
  → Asaas (POST /v3/customers → POST /v3/checkouts)
  → redirect `https://asaas.com/checkoutSession/show?id=...`
Asaas Webhook → Function `payment-webhook` (valida `asaas-access-token`)
  → `assinaturas` + ativa `premium` em perfis_profissional / perfis_lojista
Cron `expirar-premium` (existente) como rede de segurança.
```

## Contratos

- `externalReference` (customer/checkout/payment): `usuarioId:perfilId:plano:tipoPerfil`
- Callback URLs vêm do front (`retorno_base` = `window.location.origin`):
  `{origin}/pagamento/sucesso|/pagamento/cancelado|/pagamento/expirado`
- Callback **não** confirma pagamento; só Webhook ativa premium.
- Idempotência: tabela `webhook_events(event_id PK)`; `200` imediato, `at-least-once`.
- Eventos que ativam: `CHECKOUT_PAID`, `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`.
  Que desativam/registram: `PAYMENT_OVERDUE`, `SUBSCRIPTION_DELETED`,
  `SUBSCRIPTION_INACTIVATED`. `SUBSCRIPTION_CREATED` só registra.

## Secrets (painel InsForge — nunca no frontend)

- `ASAAS_API_KEY`, `ASAAS_ENV=sandbox|production`, `ASAAS_WEBHOOK_TOKEN` (32–255 chars),
  `INSFORGE_BASE_URL` + `INSFORGE_SERVICE_ROLE_KEY` (ou `ANON_KEY`, já usados).
