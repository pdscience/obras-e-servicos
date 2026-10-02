# Landing Page Obras e Serviços — Briefing de Copy & Estrutura

> LP institucional de conversão. Público trilateral (clientes, profissionais e lojistas). Objetivo primário: **cadastro grátis** na plataforma.

**Produto:** Obras e Serviços — marketplace brasileiro de construção e reformas.
**Stack técnica de implementação:** HTML, CSS e JS.
**Conversão primária:** CTA "Cadastre-se grátis".
**Conversão secundária:** WhatsApp (lead quente que não quer se cadastrar agora).

---

## 0. Princípios de conversão (nортas de criação)

1. **Regra dos 5 segundos:** acima da dobra deve responder "o que é, para quem, por que eu deveria me cadastrar agora".
2. **Um CTA por seção, em espelho do público:** cada bloco conversa com um dos 3 lados, com CTA segmentado.
3. **Prova > promessa:** sempre que possível, ancorar em dado concreto (geolocalização, planos, portfólio, webhook PIX).
4. **Fricção zero:** o cadastro grátis é o méthodo — não peça cartão, e-mail único campo a campo.
5. **Mobile-first:** Brasil acesso via celular majoritário.

---

## 1. Estrutura geral (topo → rodapé)

```
┌─ 1. HERO institucional (acima da dobra)
├─ 2. Barra de NAVEGAÇÃO fixa (sticky) com 3 CTAs
├─ 3. PROBLEMA → "Por que a Obras e Serviços existe"
├─ 4. SEÇÃO TRILATERAL — "Para Cliente / Profissional / Lojista" (tabs ou 3 colunas)
│   4a. Seção Cliente
│   4b. Seção Profissional
│   4c. Seção Lojista
├─ 5. DIFERENCIAIS TÉCNICOS (numéricos, ancorados em feito real)
├─ 6. PROVA SOCIAL (placeholders para depoimentos + números)
├─ 7. PLANOS (Bronze → Diamante) — resistência de "custo zero para começar"
├─ 8. COMO FUNCIONA (3 passos visuais)
├─ 9. FAQ curto (4-6 perguntas saneando objeções)
├─10. CTA FINAL — cadastro grátis / WhatsApp
└─11. RODAPÉ (links, redes, CNPJ, termo/privacidade)
```

---

## 2. Seção por seção — copy pronta

### Seção 1 — HERO (acima da dobra)

**Badge topo (pill):** `🚀 Plataforma em lançamento — cadastre-se grátis e ganhe destaque`

**Headline (H1):**
> Construção e reforma sem dor de cabeça. **Encontre, contrate e venda** — tudo numa plataforma só.

**Subheadline (p):**
> A Construmais conecta quem precisa reformar com **profissionais perto de casa**, **lojas de material** e **orçamentos transparentes**. Crie seu perfil gratuito em 2 minutos.

**CTAs (esquerda → direita):**
- 🔵 Primário: `Cadastre-se grátis` → `/cadastro`
- 🟢 Secundário: `Falar no WhatsApp` → `wa.me/SEUNUMERO`

**Microcopy abaixo dos CTAs:**
> ✓ Sem cartão de crédito · ✓ Planos a partir de R$ 9,90 · ✓ Geolocalização por todo o Brasil

**Imagem / mock (lado direito):**
> Mockup da tela de busca com mapa, cards de profissional com avaliação, e badge de plano.

---

### Seção 2 — Navegação sticky

Logo · [Cliente] [Profissional] [Lojista] [Planos] [Como funciona] · **[Entrar] [Cadastre-se grátis]**

---

### Seção 3 — Problema / "Por que a Construmais existe"

**Headline (H2):**
> Reformar casa parece trabalho de outra vida. E profissional fica preso no "boca a boca".

**3 cards de problema (ícone + frase):**

| Card | Título | Copy |
|---|---|---|
| 🏠 Cliente | "Não sei em quem confiar" | Profissionais anonimos, orçamentos que variam de R$ 2 mil a R$ 10 mil pela mesma reforma. |
| 🔨 Profissional | "Vivo de indicação" | Sem internet, sem agenda, sem previsibilidade. Os clientes acabam indo para quem aparece mais, não para quem faz melhor. |
| 🧱 Lojista | "Não consigo divulgar estoque" | Material parado, cliente reformando do outro lado da rua e não sabe que você tem o que ele precisa. |

**Fechamento da seção:**
> A Obras e Serviços existe para resolver os três problemas ao mesmo tempo — numa plataforma só, com cobrança recorrente e destaque para quem leva a sério. **[Ver como funciona →](#como-funciona)**

---

### Seção 4 — A plataforma para cada lado

> Estrutura recomendada: **tabs** no topo com "Sou Cliente / Sou Profissional / Sou Lojista" e conteúdo que troca. Cada tab tem 3 bullets + 1 CTA específico.

#### 4a. Sou Cliente

**Headline:** `Receba orçamentos de quem está perto. Compare. Contrate.`

**Bullets:**
- 📍 **Busca por geolocalização** — encontre pedreiros, eletricistas, encanadores perto de você
- 💬 **Solicitação de orçamento com status** — sem mais "sumiu do WhatsApp"
- ⭐ **Avaliações reais** e portfólio visível antes do primeiro contato
- 🔒 **Sem pegadinha** — você negocia direto com o profissional, sem intermediário

**CTA:** `Quero reformar →` → `/cadastro?tipo=cliente`

#### 4b. Sou Profissional

**Headline:** `Pare de depender de indicação. Receba orçamentos todos os dias.`

**Bullets:**
- 👤 **Perfil com portfólio e certificações** — você vira referência na sua região
- 📨 **Solicitações de serviço chegando até você** — pipeline no seu painel
- 🚀 **Destaque nos resultados** — Bronze, Prata, Ouro, Diamante. Quanto mais sério, mais visível
- 💰 **Planos a partir de R$ 9,90/mês** — menos que um almoço

**CTA:** `Quero receber orçamentos →` → `/cadastro?tipo=profissional`

#### 4c. Sou Lojista

**Headline:** `Sua loja dentro da reforma de quem mora perto.`

**Bullets:**
- 🏪 **Vitrine digital** com seus produtos e estoque em tempo real
- 📍 **Cliente que está reformando do lado** te encontra antes de ir ao concorrente
- ⭐ **Plano Premium** com prioridade na busca por categoria e região
- 📦 **Integração WhatsApp** — cliente chama direto, sem fricção

**CTA:** `Quero divulgar minha loja →` → `/cadastro?tipo=lojista`

---

### Seção 5 — Diferenciais técnicos (ancoragem em feito real)

**Headline:** `Não é promessa. Já está pronto.`

**Grid de 6 cards com número + título + frase:**

| Número | Título | Frase |
|---|---|---|
| 4 | Perfis distintos | Cliente, Profissional e Lojista têm cada um seu painel dedicado |
| 4 | Planos recorrentes | Bronze → Diamante, com webhook PIX e expiração automática |
| 16 | Telas prontas | Toda a UX/UI já implementada e responsiva |
| 16 | Migrations de banco | Estrutura de dados validada em PostgreSQL |
| 3 | Camadas de busca | Categoria, preço, avaliação, experiência e localização |
| ∞ | Upload de portfólio | Profissional e lojista podem mostrar trabalho com imagens |

---

### Seção 6 — Prova social (placeholders)

> ⚠️ Esta seção deve ser preenchida conforme a plataforma for ganhando usuários. Manter placeholders honestos — não inventar números.

**Grid de 3 depoimentos (placeholders para serem substituídos):**
```
[Nome] · [Cidade/UF] · [Tipo: Cliente/Profissional/Lojista]
"Aspas com depoimento curto de 2-3 linhas."
Foto · ★★★★★
```

**Bloco de números (quando existirem):**
- `+XX` profissionais cadastrados
- `+XX` lojas parceiras
- `+XX` orçamentos solicitados
- `XX cidades` atendidas

> Substituir quando houver dado real. Enquanto não houver, mostrar "Primeiros cadastros recebendo destaque gratuito".

---

### Seção 7 — Planos

**Headline:** `Grátis para começar. Pago quando quiser crescer.`

**Subheadline:** `Todo profissional e lojista começa grátis. Quando quiser aparecer mais, escolhe um plano. Sem fidelidade.`

**Tabela de planos (4 colunas):**

| | Bronze | Prata | Ouro | Diamante |
|---|---|---|---|---|
| Preço/mês | R$ 9,90 | R$ 29 | R$ 79 | R$ 199 |
| Perfil público | ✓ | ✓ | ✓ | ✓ |
| Portfólio (fotos) | até 10 | até 30 | até 80 | ilimitado |
| Prioridade na busca | — | 1ª página regional | Top 3 regional | Top 1 regional + nacional |
| Solicitações recebidas | 5/mês | 20/mês | 50/mês | ilimitado |
| Selo verificado | — | — | ✓ | ✓ |
| Suporte | e-mail | e-mail + WhatsApp | WhatsApp优先 | WhatsApp prioritário + phone |

> **Valores acima são placeholders** — alinhar com `src/config/planos.ts` antes de publicar.

**CTA embaixo da tabela:** `Ver detalhes dos planos →` → `/planos`

**Microcopy:** `Período grátis de teste para os primeiros cadastros · Cancele quando quiser · Pagamento via PIX`

---

### Seção 8 — Como funciona (3 passos)

**Headline:** `Pronto em menos de 3 minutos.`

```
1️⃣  Crie seu perfil grátis     →   2️⃣  Receba/Busque         →   3️⃣  Contrate ou Contrado
   Tipo (cliente/prof/lojista)      Solicite orçamento ou          Negocie direto via WhatsApp
   + cidade + contato               receba solicitações no painel   e feche o negócio
```

---

### Seção 9 — FAQ (objeções)

**Headline:** `Perguntas rápidas`

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Preciso pagar para começar? | Não. O cadastro é gratuito. Você só paga se quiser um plano de destaque (R$ 9,90 a R$ 199/mês). |
| 2A | Sou cliente, pago alguma coisa? | Nunca. A Construmais é gratuita para quem busca profissionais e lojas. |
| 3 | A plataforma cobra comissão sobre o serviço? | Hoje não. Você negocia direto com o profissional. Comissão é um item do roadmap futuro, sempre opcional. |
| 4 | Como funciona o pagamento do plano? | Assinatura mensal via PIX com webhook automático. Você pode cancelar a qualquer momento. |
| 5 | Tem na minha cidade? | A plataforma funciona em todo o Brasil. Quantidade de profissionais varia por região — por isso os primeiros cadastros ganham destaque |
| 6 | E se eu não usar, perdiou dinheiro do plano? | Planos são mensais e sem fidelidade. Não usa? Cancele e volta para o grátis. |

---

### Seção 10 — CTA final (antes do rodapé)

**Headline (H2 grande):**
> Comece grátis hoje. A reforma não espera, e sua próxima cliente também não.

**Subheadline:**
> Faça parte da primeira leva de profissionais e lojas com destaque gratuito no lançamento.

**CTAs lado a lado:**
- 🔵 `Cadastre-se grátis` → `/cadastro`
- 🟢 `Falar no WhatsApp` → `wa.me/SEUNUMERO`

**Microcopy final:**
> Sem cartão · Sem fidelidade · Pronto em 2 minutos

---

### Seção 11 — Rodapé

4 colunas:
- **Obras e Serviços** — logo + tagline + ícones sociais (Insta, Facebook, YouTube, WhatsApp)
- **Plataforma** — [Cliente] [Profissional] [Lojista] [Planos] [Como funciona]
- **Empresa** — [Sobre] [Blog] [Contato] [Seja parceiro]
- **Legal** — [Termos de uso] [Política de privacidade] [Cookies]

Linha inferior: `© 2026 Obras e Serviços · CNPJ XX.XXX.XXX/0001-XX · Feito no Brasil 🇧🇷`

---

## 3. Anotações técnicas para implementação

### Estrutura de arquivos sugerida
```
src/views/LandingPage.vue            → container
src/components/landing/
  HeroSection.vue
  ProblemSection.vue
  AudienceTabs.vue
  ClientPanel.vue
  ProfessionalPanel.vue
  StorePanel.vue
  FeaturesSection.vue
  SocialProofSection.vue
  PlansSection.vue
  HowItWorksSection.vue
  FAQSection.vue
  FinalCTASection.vue
  AppFooter.vue
```

### Rotas
- `/` → `LandingPage.vue`
- `/cadastro?tipo=cliente|profissional|lojista` → `CadastroView.vue` (já existirprovável)
- `/planos` → `PlanosView.vue`
- Já conferir rotas em `src/router` e links existentes.

### Dados dinâmicos
- **Planos:** ler de `src/config/planos.ts` — não duplicar valores hardcoded nesta LP.
- **Depoimentos e métricas:** criar `src/config/socialProof.ts` preeer com placeholders.

### Acessibilidade & SEO (já existente sitemap.xml/robots.txt segundo PITCH)
- Toda H1, H2 semântica correta.
- `alt` descritivo em todas imagens.
- `aria-label` nos CTAs com ícone.
- Schema.org `Service` / `LocalBusiness` no `<head>` da LP (via `@vueuse/head`).

### Performance
- LP deve carregar < 2s em 3G brasileiro.
- Imagens com lazy-load no abaixo-da-dobra.
- Evitar bundle de mapas e dashboards no bundle inicial — só carregar quando user entra no app.

### Métricas de conversão (preparar eventos)
- `cta_click_primary` (cadastro grátis)
- `cta_click_whatsapp`
- `audience_tab_view` (qual tab o usuário olhou — inferir intenção)
- `plan_view` (abriu planos)
- `faq_open` (objection removida — esse é um sinal de purchase intent)

---

## 4. Tom de voz

- **Direto, brasileiro, conversacional.** sem "aqui na nossa plataforma…"
- **Sério mas próximo.** Construção é dinheiro sério — não infantilizar.
- **"Você" sempre**, nunca "o usuário" ou "nós".
- **Refrões:** "grátis para começar", "sem fricção", "perto de casa", "sem intermediário".

---

## 5. Checklist pré-publicação

- [ ] Headline testada em mobile (cabe em 2 linhas?)
- [ ] Copy dos 3 CTAs de público revisada com 1 stakeholder de cada lado
- [ ] Valores dos planos alinhados com `src/config/planos.ts`
- [ ] Número do WhatsApp preenchido no lugar de `SEUNUMERO`
- [ ] Placeholders de prova social preenchidos ou removidos (não publicar com `[Nome]`)
- [ ] Links do rodapéexistentes (Termos/Privacidade) ou marcados como TODO antes do go-live
- [ ] GTM/Analytics instalado
- [ ] Schema.org validado em https://search.google.com/test/rich-results
- [ ] Lighthouse mobile score > 90 em performance
- [ ] Teste A/B de headline preparado (variação B pronta)

---

## 6. Variações A/B sugeridas (roadmap de conversão)

| Teste | Variação A (atual) | Variação B |
|---|---|---|
| Headline | "Construção e reforma sem dor de cabeça" | "Encontre o profissional certo perto de você" (mais específica) |
| CTA primário | "Cadastre-se grátis" | "Criar meu perfil grátis" |
| Ordem das seções | Problema → Audiência → Diferenciais | Audiência → Problema → Diferenciais |
| Planos | Tabela completa | Cards com plano "Mais popular" destacado |

---

**Fim do briefing.** Próximo passo recomendado: criar branch `feature/landing-page` e iniciar implementação pela `HeroSection.vue` + rota `/`.

> Conforme convenção do projeto: criar branch `feature/landing-page` antes de tocar no código.
