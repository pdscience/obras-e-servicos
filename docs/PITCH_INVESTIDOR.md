# Construmais — Pitch para Investidor Anjo

> Marketplace brasileiro que conecta **clientes**, **profissionais da construção** e **lojistas de material** em uma única plataforma.

---

## 1. Resumo Executivo

A Construmais é um SaaS/marketplace de dois lados voltado ao mercado de construção e reformas no Brasil. A plataforma já está **desenvolvida e pronta para lançamento**, com cobrança de planos integrada. O aporte será usado para **aquisição de usuários**, **produção de conteúdo** e **validação comercial** — não para construir o produto.

---

## 2. O Problema

- Profissionais autônomos da construção dependem de indicação boca a boca e não têm presença digital.
- Clientes não encontram profissionais **perto de casa**, com preço transparente e avaliações reais.
- Lojistas de material têm dificuldade de divulgar produtos e estoque para quem está reformando.
- Não há uma plataforma de referência no nicho com geolocalização e cobrança recorrente.

---

## 3. A Solução

Plataforma trilateral (clientes + profissionais + lojistas):

| Papel | O que a plataforma entrega |
|---|---|
| **Cliente** | Busca por geolocalização, filtros, solicitação de orçamentos, comparação de preço/avaliações |
| **Profissional** | Perfil com portfólio, certificações, planos de destaque (Bronze → Diamante), contato via WhatsApp |
| **Lojista** | Vitrine de loja, cadastro de produtos com estoque, plano premium |

**Diferenciais técnicos já implementados:**
- Busca com geolocalização e filtros por categoria, preço, avaliação e experiência
- Sistema de orçamentos/solicitação de serviços com status
- 3 painéis (dashboard) distintos: profissional, cliente e lojista
- Planos recorrentes **Bronze (R$ 9,90) → Diamante (R$ 199/mês)** com pagamento integrado (webhook PIX) e expiração automática
- Período grátis para primeiros cadastros
- SEO (sitemap.xml, robots.txt), integração WhatsApp/redes sociais, upload de portfólio

---

## 4. Modelo de Negócio (Monetização)

- **Planos de assinatura** para profissionais e lojistas (R$ 9,90 a R$ 199/mês) — receita recorrente (MRR)
- **Destaque pago** nos resultados de busca (prioridade por plano)
- **Comissão futura** sobre orçamentos fechados / transações (roadmap)

Estrutura de planos já cadastrada na plataforma: `src/config/planos.ts`.

---

## 5. Investimento Já Aplicado (Custo de Reposição)

Valor patrimonial do produto pronto: o que custaria **reconstruir do zero** hoje, com equipe de mercado.

| Componente | Horas est. |
|---|---|
| Design system + UI (16 telas, responsivo) | 120–160 |
| Frontend (componentes, estado, rotas) | 200–280 |
| Backend/API + autenticação + storage | 90–130 |
| Banco de dados + 16 migrations + seeds | 40–60 |
| Pagamentos (planos, webhook, expiração) | 40–60 |
| Geolocalização + busca/matching | 30–50 |
| Testes, QA, deploy, correções | 60–100 |
| **Total** | **~580–840 h** |

| Cenário | Taxa/hora (mercado BR) | Valor |
|---|---|---|
| Conservador | R$ 120 | **~R$ 70–100 mil** |
| **Justo/médio** | R$ 150 | **~R$ 110–170 mil** |
| Agência sênior | R$ 200 | **~R$ 180–250 mil** |

> **Valor de referência: ~R$ 120.000–150.000** em produto pronto, sem contar ideia, validação de mercado e tempo de fundador.

**Stack técnica:** Vue 3 + TypeScript + Tailwind 4 + PrimeVue + Pinia · Backend InsForge (BaaS) · PostgreSQL (16 migrations) · pagamentos via webhook · storage de imagens. ~13.500 linhas de código de aplicação + 668 de SQL.

---

## 6. Tração

| Métrica | Hoje |
|---|---|
| Usuários cadastrados | ⬜ a preencher |
| Profissionais ativos | ⬜ a preencher |
| Lojistas ativos | ⬜ a preencher |
| Vendas de plano (MRR) | ⬜ a preencher |
| Taxa de conversão | ⬜ a preencher |

> Plataforma em fase de lançamento — aporte acelera a validação e a primeira base de usuários.

---

## 7. Roadmap (6 meses com aporte)

1. **Meses 1–2:** lançamento em 1–2 cidades-piloto, cadastro ativo de profissionais e lojistas
2. **Meses 2–4:** parcerias com lojas de material e associações, ranqueamento de busca por relevância
3. **Meses 4–6:** comissão sobre orçamentos fechados, app mobile, pagamento online para clientes

---

## 8. Pedido de Aporte e Uso dos Recursos

**Aporte solicitado:** R$ ⬜ (sugestão: R$ 100.000–250.000) por ⬜% de participação.

| Destinação | % |
|---|---|
| Marketing e aquisição de usuários | 50% |
| Conteúdo e SEO | 15% |
| Operação e suporte | 15% |
| Desenvolvimento (roadmap/mobile) | 20% |

---

## 9. Anexos

- Arquitetura e decisões técnicas: `.agents/ARCHITECTURE.md`
- Código-fonte completo (frontend + backend + migrations) no repositório
- Testes de fluxo de planos: `test_planos.mjs`
