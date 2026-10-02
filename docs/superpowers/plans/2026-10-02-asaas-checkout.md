# Asaas Checkout Recorrente Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cobrar os planos (bronze/prata/ouro/diamante) via Asaas Checkout recorrente Pix+Cartão.

**Architecture:** Functions InsForge falam com Asaas API (customers + checkouts); webhook Asaas ativa premium; frontend só redireciona e exibe retorno.

**Tech Stack:** Vue 3 + InsForge Functions (Deno) + Asaas API v3 + Postgres (InsForge).

**Spec:** `docs/superpowers/specs/2026-10-02-asaas-design.md`

## Global Constraints

- Preços fonte: `src/config/planos.ts` (9.90 / 29.90 / 59.90 / 99.90).
- Chave Asaas só no backend; validar `asaas-access-token` no webhook.
- Responder `200` rápido no webhook; idempotência por `id` do evento.
- `platina` não existe mais no app — remover referências.

---

### Task 1: Cliente HTTP Asaas + migration do banco

**Files:**
- Create: `functions/asaas-client.ts`
- Create: `migrations/20261002000001_assinaturas-webhook-events.sql`

**Interfaces:**
- Consumes: `Deno.env` (`ASAAS_API_KEY`, `ASAAS_ENV`)
- Produces: `asaasFetch(path, init)`, `asaasBaseUrl()`, `PLANOS_ASAAS`, `LIMITE_FOTOS`, `buildExternalRef()`, `parseExternalRef()`

- [ ] **Step 1: Criar `functions/asaas-client.ts`** com base URL por env, headers (`access_token`, `User-Agent`), catálogo de planos e helpers de externalReference.
- [ ] **Step 2: Criar migration** com tabelas `assinaturas` e `webhook_events` (idempotente com `IF NOT EXISTS`).
- [ ] **Step 3: Commit** — `git add functions/asaas-client.ts migrations/... && git commit -m "feat: cliente Asaas e tabelas de assinaturas"`

### Task 2: Criar Checkout recorrente (reescrever `criar-pagamento`)

**Files:**
- Modify: `functions/criar-pagamento.ts`

**Interfaces:**
- Consumes: `asaas-client.ts`
- Produces: `POST` → `{ checkout_url, checkout_id, customer_id, valor, plano }`

- [ ] **Step 1: Reescrever function** — valida `perfil_id, plano, tipo_perfil`; get-or-create customer por `externalReference`; `POST /v3/checkouts` RECURRENT Pix+Cartão; salva `assinaturas`; retorna URL `checkoutSession/show?id=`.
- [ ] **Step 2: Commit** — `git commit -m "feat: criar checkout recorrente Asaas"`

### Task 3: Webhook Asaas (reescrever `payment-webhook`)

**Files:**
- Modify: `functions/payment-webhook.ts`

**Interfaces:**
- Consumes: `asaas-client.ts`, header `asaas-access-token`
- Produces: ativa/desativa `premium` nos perfis

- [ ] **Step 1: Reescrever webhook** — valida token, dedup por `webhook_events`, resolve contexto via `externalReference` (fallback `GET payment`), ativa em `CHECKOUT_PAID/PAYMENT_CONFIRMED/PAYMENT_RECEIVED`, desativa em `OVERDUE/DELETED/INACTIVATED`.
- [ ] **Step 2: Commit** — `git commit -m "feat: webhook Asaas ativa premium"`

### Task 4: Frontend — service + fluxos + retorno

**Files:**
- Create: `src/services/assinaturas.ts`
- Create: `src/pages/PagamentoRetorno.vue`
- Modify: `src/router/index.ts`, `src/pages/DashboardPage.vue`, `src/components/home/HomePricing.vue`, `src/pages/LojistaDashboard.vue`

- [ ] **Step 1: Criar service + página de retorno + rotas.**
- [ ] **Step 2: Religar `HomePricing` (`selectPlan`) e `handleUpgrade` (Asaas).**
- [ ] **Step 3: Card de assinatura no `LojistaDashboard` (plano diamante).**
- [ ] **Step 4: Build** — `npm run build` deve passar.
- [ ] **Step 5: Commit** — `git commit -m "feat: frontend de assinaturas Asaas"`
