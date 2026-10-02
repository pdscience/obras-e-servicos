# Conexão com o Asaas — Obras & Serviços

Guia de conexão da integração de cobranças dos planos. Sem segredos aqui:
chaves e tokens ficam **somente** nas variáveis de ambiente das Functions
(painel InsForge) — nunca neste arquivo nem no frontend.

## 1. Ambientes e URLs base

| Ambiente | URL base da API v3 | Onde obter a chave |
|---|---|---|
| Sandbox (testes) | `https://api-sandbox.asaas.com/v3` | [sandbox.asaas.com](https://sandbox.asaas.com/) → Configurações → Integrações → API |
| Produção | `https://api.asaas.com/v3` | [asaas.com](https://www.asaas.com/) → mesmo caminho |

- Chave Sandbox começa com `$aact_hmlg_` · chave Produção com `$aact_prod_`.
- Chave e URL precisam ser do **mesmo ambiente**, senão a API retorna `401
  invalid_environment`.
- Link de pagamento do Checkout (ambos os ambientes):
  `https://asaas.com/checkoutSession/show?id=<CHECKOUT_ID>`

Doc oficial: https://docs.asaas.com/reference/comece-por-aqui

## 2. Variáveis de ambiente (Functions InsForge)

Configurar no painel InsForge → Functions → Environment variables:

| Variável | Valor | Obrigatória |
|---|---|---|
| `ASAAS_API_KEY` | Chave de API (Sandbox ou Produção) | Sim |
| `ASAAS_ENV` | `sandbox` ou `production` (padrão: `sandbox`) | Não |
| `ASAAS_WEBHOOK_TOKEN` | Token do webhook (32–255 caracteres, sem espaços; **não** usar a API key) | Sim* |
| `INSFORGE_BASE_URL` | URL base do projeto InsForge | Sim |
| `INSFORGE_SERVICE_ROLE_KEY` | Service role key (ou `ANON_KEY` como fallback) | Sim |

\* Há fallback para o legado `PAYMENT_WEBHOOK_SECRET` se existir.

## 3. Webhook — configuração no painel Asaas

Integrações → Webhooks → Novo webhook:

- **URL:** `https://<seu-projeto>.insforge.app/functions/payment-webhook`
  (URL pública da function `payment-webhook`)
- **AuthToken:** o mesmo valor de `ASAAS_WEBHOOK_TOKEN`
  (enviado no header `asaas-access-token` e validado pela function)
- **Eventos assinados:**
  - Checkout: `CHECKOUT_CREATED`, `CHECKOUT_PAID`, `CHECKOUT_CANCELED`, `CHECKOUT_EXPIRED`
  - Cobranças: `PAYMENT_CREATED`, `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`,
    `PAYMENT_OVERDUE`, `PAYMENT_DELETED`, `PAYMENT_REFUNDED`,
    `PAYMENT_CHARGEBACK_REQUESTED`, `PAYMENT_RECOVERED`
  - Assinaturas: `SUBSCRIPTION_CREATED`, `SUBSCRIPTION_DELETED`, `SUBSCRIPTION_INACTIVATED`
- As configurações de **Sandbox e Produção são independentes**: configurar nas duas contas.

Comportamento da function: responde `200` imediato, ignora reenvios pelo `id`
do evento (tabela `webhook_events`) e só ativa o premium nos eventos de
pagamento confirmado. Logs de entrega: painel Asaas → Logs de Webhooks.

## 4. Fluxo implementado no código

```
Frontend → function `criar-pagamento`
  1. GET /v3/customers?externalReference=<usuarioId>:<perfilId> (reuso; evita duplicados)
  2. POST /v3/customers (se não existir)
  3. POST /v3/checkouts {
       billingTypes: ["PIX", "CREDIT_CARD"],
       chargeTypes: ["RECURRENT"],
       subscription: { cycle: "MONTHLY", nextDueDate: "+1 dia" },
       items: [{ name: "Plano <Nome> — Obras & Serviços", value: <preço> }],
       customer, externalReference, callback { successUrl, cancelUrl, expiredUrl }
     }
  → retorna checkout_url → frontend abre em nova aba
Asaas → function `payment-webhook` → ativa premium +30 dias (profissional ou lojista)
```

- Preços (fonte: `src/config/planos.ts`): Bronze R$ 9,90 · Prata R$ 29,90 ·
  Ouro R$ 59,90 · Diamante R$ 99,90.
- `externalReference` (checkout/payment): `usuarioId:perfilId:plano:tipoPerfil`.
- Callback **não** confirma pagamento — só o webhook ativa o plano.
- Tabelas: `assinaturas` (tentativas e status) e `webhook_events` (idempotência).
  Migration: `migrations/20261002000001_assinaturas-webhook-events.sql`.
- Código: `functions/asaas-client.ts`, `functions/criar-pagamento.ts`,
  `functions/payment-webhook.ts`, `src/services/assinaturas.ts`.

## 5. Checklist de teste (Sandbox)

1. Criar conta em [sandbox.asaas.com](https://sandbox.asaas.com/) e gerar a API key.
2. Preencher as variáveis da seção 2 com a chave Sandbox.
3. Aplicar a migration no banco.
4. Configurar o webhook Sandbox (seção 3).
5. No app: Dashboard → Escolher Plano → confirmar que abre o checkout Asaas.
6. Pagar com Pix de teste → conferir `premium=true` e `premium_plano` no perfil.
7. Conferir o evento em Logs de Webhooks no painel Sandbox.

## 6. Ida para produção

1. Trocar `ASAAS_API_KEY` pela chave `$aact_prod_` e `ASAAS_ENV=production`.
2. Replicar o webhook na conta produção.
3. Refazer o checklist acima com valores reais baixos (ex.: Bronze).
