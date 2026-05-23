# CLAUDE.md — Roadmap ConvertaFlow

> Lido automaticamente pelo Claude Code em toda sessão deste projeto.
> Nunca deletar. Atualizar sempre que houver mudanças estruturais.
> Versão: 0.1.0-alpha | Criado em: 2026-05-23

---

## 1. O QUE É ESTE PROJETO

**Roadmap público da plataforma ConvertaFlow.**

Site separado em `roadmap.convertaflow.com` onde:
- **Visitantes** (sem login) veem features planejadas/em-desenvolvimento/concluídas
- **Logados via Clerk SSO** votam e comentam em features
- **Assinantes ativos** podem reportar bugs e marcar "minha empresa precisa"
- **Staff ConvertaFlow** modera, responde oficialmente, altera status

Inspiração visual: **Featurebase** (`featurebase.app`) + **Upvoty** (usado pelo ZPRO/ZDG em `roadmap.zdg.com.br`).

**Filosofia:** transparência radical sobre o que está sendo construído. Status sem datas (evita pressão de prazo). Tudo em PT-BR primeiro.

---

## 2. ECOSSISTEMA — RELAÇÃO COM OUTROS PROJETOS

```
D:/Plataformas - DEV/converta-flow/
├── app-converta-flow/              ← APP PRINCIPAL (Next.js + backend Python + Node.js)
│   • Domínio: app.convertaflow.com
│   • Source of truth de identidade visual e features
│   • API: api.convertaflow.com/api/v1/*
│
├── lp-principal-converta-flow/     ← LANDING PAGE PÚBLICA (HTML estático)
│   • Domínio: convertaflow.com
│   • Marketing público + páginas legais
│
└── roadmap-convertaflow/           ← ESTE PROJETO (Next.js público)
    • Domínio: roadmap.convertaflow.com
    • Roadmap público da plataforma
```

### Quem é a fonte de verdade

- **Identidade visual:** app principal (`app-converta-flow/frontend/src/app/globals.css`)
- **Componentes UI:** app principal (`app-converta-flow/frontend/src/components/ui/`)
- **Auth (Clerk):** mesmo projeto Clerk do app principal (multi-domain)
- **API de dados:** `api.convertaflow.com/api/v1/roadmap/*` (módulo no `backend-python` do app)
- **Logos/ícones:** app principal (`app-converta-flow/frontend/public/`)

### Como pegar identidade do app

Quando precisar de cor, fonte, componente ou ícone:

1. **Cores e tokens:** copiar de `app-converta-flow/frontend/src/app/globals.css`
2. **Componentes shadcn:** copiar de `app-converta-flow/frontend/src/components/ui/` (Button, Card, Badge, Dialog, etc.)
3. **Logo SVG:** copiar de `app-converta-flow/frontend/public/icon.svg`, `favicon.svg`
4. **Doc canônica de visual:** ler `app-converta-flow/docs/knowledge/visual-identity-components.md`

**Cláusula pétrea:** quando o app principal mudar identidade (nova cor, novo logo, refactor de Button), atualizar AQUI no roadmap também. Mantenha sincronizado.

---

## 3. STACK TÉCNICA

### Frontend
- **Next.js 15.5.14** (App Router + Turbopack)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** + `@tailwindcss/postcss`
- **shadcn/ui** (componentes copiados do app principal)
- **Clerk** (`@clerk/nextjs@^7.3.2`) — auth via SSO do projeto principal
- **TanStack Query v5** (cache de API)
- **Axios** (cliente HTTP)
- **Lucide React** (ícones)
- **date-fns** (datas)
- **react-markdown + remark-gfm** (renderização de comentários)
- **sonner** (toasts)
- **nuqs** (URL state)

### Backend (NÃO é desse projeto — é do app principal)
- API em `api.convertaflow.com/api/v1/roadmap/*`
- Implementado em `app-converta-flow/backend-python/app/api/v1/roadmap/`
- PostgreSQL schema `public.roadmap.*`
- pgvector pra busca semântica
- Mesma autenticação Clerk via middleware existente

### Hospedagem
- **Vercel free tier** (mesma conta do app principal)
- Custom domain: `roadmap.convertaflow.com`
- DNS via Cloudflare (CNAME → vercel-dns.com)
- SSL automático

### Porta de desenvolvimento
- **Local dev: porta 5566** (app principal usa 4000, LP usa porta diferente)

---

## 4. AUTENTICAÇÃO — CLERK MULTI-DOMAIN

### Mesmo projeto Clerk do app

- Frontend API: `clerk.convertaflow.com` (já existe)
- Authorized Domain a adicionar: `roadmap.convertaflow.com`
- Cookie `__session` é compartilhado em `*.convertaflow.com`
- Cliente logado em `app.convertaflow.com` chega autenticado em `roadmap.convertaflow.com` (SSO automático)

### Google OAuth

- Funciona automaticamente — configurado no nível Clerk, não no domínio
- Redirect URI já registrado no Google Cloud Console: `clerk.convertaflow.com/v1/oauth_callback`
- **NÃO criar outro projeto Google Cloud Console**

### Variáveis de ambiente

```bash
# .env.local (não commitar)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...    # mesmo do app principal
CLERK_SECRET_KEY=sk_live_...                      # mesmo do app principal
NEXT_PUBLIC_API_URL=https://api.convertaflow.com  # backend Python
NEXT_PUBLIC_APP_URL=https://app.convertaflow.com  # pra link "voltar pro app"
```

### Diferenciação de usuário

| Tipo | Como identificar | Permissões |
|---|---|---|
| **Visitante anônimo** | Sem cookie Clerk | Apenas leitura |
| **Logado (qualquer)** | JWT Clerk válido | Vota + comenta |
| **Assinante ativo** | JWT + `org_id` resolvido + plano pago | Acima + reporta bug + "minha empresa precisa" |
| **Staff** | JWT + email em `public.staff_users` no backend | Acima + modera + altera status + responde oficial |

---

## 5. ESTRUTURA DE PASTAS

```
roadmap-convertaflow/
├── .claude/                       configs Claude Code
│   └── settings.local.json
├── docs/                          documentação interna
│   ├── ARCHITECTURE.md            stack + decisões técnicas
│   ├── DECISIONS.md               registro de escolhas
│   ├── BRANDING.md                como pegar visual do app principal
│   ├── DEPLOY.md                  como deployar no Vercel
│   └── API.md                     endpoints consumidos
├── public/                        assets estáticos
│   ├── favicon.svg                (copiar de app principal)
│   ├── icon.svg                   (copiar de app principal)
│   └── og-default.png             (criar)
├── src/
│   ├── app/                       Next.js App Router
│   │   ├── layout.tsx             root layout (ClerkProvider, fontes)
│   │   ├── page.tsx               home (lista de features)
│   │   ├── globals.css            copiado do app principal
│   │   ├── feature/[slug]/
│   │   │   └── page.tsx           detalhes da feature + comentários
│   │   ├── categoria/[slug]/
│   │   │   └── page.tsx           features por categoria
│   │   ├── status/[slug]/
│   │   │   └── page.tsx           features por status
│   │   ├── nova/
│   │   │   └── page.tsx           sugerir nova feature (auth)
│   │   └── api/                   BFF (se necessário)
│   ├── components/
│   │   ├── ui/                    shadcn copiados do app principal
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── header.tsx             header com logo + "voltar pro app"
│   │   ├── feature-card.tsx       card de feature na lista
│   │   ├── vote-button.tsx        botão de voto + contador
│   │   ├── comment-thread.tsx     árvore de comentários
│   │   ├── status-badge.tsx       badge colorido por status
│   │   └── category-icon.tsx      ícone Lucide por categoria
│   ├── lib/
│   │   ├── api.ts                 axios cliente
│   │   ├── auth.ts                helpers Clerk
│   │   ├── utils.ts               cn() + outros
│   │   └── constants.ts           STATUSES, CATEGORIES
│   └── types/
│       └── roadmap.ts             Feature, Vote, Comment, Category
├── .env.example
├── .gitignore
├── .nvmrc
├── CLAUDE.md                      este arquivo
├── README.md                      quickstart
├── components.json                config shadcn
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── vercel.json
```

---

## 6. PADRÕES VISUAIS — HERDADOS DO APP

### Cláusula pétrea de identidade

**TODA decisão visual deve ser idêntica ao app principal**, com referência canônica em:
- `app-converta-flow/docs/knowledge/visual-identity-components.md`

Resumo das regras críticas:

#### Cores principais
- `--brand-primary: #1e7fd4` (azul ConvertaFlow)
- `--brand-cta: #fc9e1c` (laranja CTA — sidebar)
- `--brand-deeper: #1a3a6e` (azul escuro — gradientes)

#### Gradientes oficiais
- **Sidebar/Hero:** `linear-gradient(180deg, #1e7fd4 0%, #1a3a6e 100%)`
- **Hero card (diagonal):** `linear-gradient(150deg, #1e7fd4 0%, #1a3a6e 100%)`
- **Botão primário:** `linear-gradient(180deg, #1e7fd4 0%, #1a6bbf 100%)`

#### Border radius — UNIFICADO 10px
- Botões, inputs, cards, dialogs: `rounded-[10px]`
- Segmented controls aninhados: `rounded-[7px]` (concentric corners)
- Badges/avatares: `rounded-full`
- **PROIBIDO** `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-[8px]`, `rounded-[12px]` em código novo

#### Border-first principle
- 1.5px solid `var(--border-primary)` em controles outer
- 1px solid `var(--border-secondary)` em items aninhados
- Sombra reservada para elevação real (dropdowns, modais)

#### Alturas grid 8pt
- `h-10` (40px) para inputs, search bars, botões primários (padrão)
- `h-9` (36px) para botões em dialogs
- `h-8` (32px) para pills icon-only
- **Proibido:** `h-11`, números ímpares

#### Português brasileiro com acentos
- Cláusula pétrea: textos visíveis SEMPRE com acentuação correta
- Proibido em texto visível: `voce`, `nao`, `configuracao`, `modulo` etc.
- URLs e identificadores: ASCII (`/categoria/inbox`, não `/categoria/atendimento`)

#### Proibições absolutas
- ❌ `alert()`, `confirm()`, `prompt()` nativos do browser
- ❌ `<select>` HTML nativo (usar `<Select>` shadcn)
- ❌ Hardcode de cores hex em código novo (usar `var(--brand-X)` ou `bg-primary`)
- ❌ Gradiente em botões circulares ≤40px (usar `bg-primary` flat)
- ❌ Borda esquerda colorida em cards (sempre borda uniforme)

---

## 7. POLÍTICA EDITORIAL — STATUS E CATEGORIAS

### 6 Status canônicos (cores e labels)

| Status | Slug | Cor | Quando usar |
|---|---|---|---|
| 🔍 **Sob análise** | `sob_analise` | `bg-gray-100 text-gray-700` | Recebemos a ideia, avaliando |
| 📋 **Planejado** | `planejado` | `bg-sky-100 text-sky-700` | Decidimos fazer, na fila |
| 🚧 **Em desenvolvimento** | `em_desenvolvimento` | `bg-orange-100 text-orange-700` | Dev ativo agora |
| ✅ **Concluído** | `concluido` | `bg-green-100 text-green-700` | Em prod (link pra changelog) |
| ⏸️ **Pausado** | `pausado` | `bg-yellow-100 text-yellow-700` | Suspenso (motivo público obrigatório) |
| ❌ **Não será feito** | `nao_sera_feito` | `bg-red-100 text-red-700` | Decisão de não fazer (motivo público) |

### 14 Categorias canônicas

| Categoria | Slug | Ícone Lucide | Cor |
|---|---|---|---|
| Atendimento Omnichannel | `inbox` | `Inbox` | `#0369a1` |
| Campanhas e Disparos | `campaigns` | `Rocket` | `#7c3aed` |
| Automação e Flows | `automation` | `Workflow` | `#ea580c` |
| IA e Agentes | `ai` | `Sparkles` | gradient brand |
| Email Marketing | `email_marketing` | `Mail` | `#0d9488` |
| CRM e Pipeline | `crm` | `GitBranch` | `#9333ea` |
| Conexões WhatsApp | `connections` | `Plug` | `#16a34a` |
| Agenda e Reuniões | `calendar` | `Calendar` | `#0891b2` |
| Financeiro e Planos | `billing` | `CreditCard` | `#ca8a04` |
| Relatórios e Analytics | `reports` | `BarChart3` | `#dc2626` |
| Integrações | `integrations` | `Puzzle` | `#525252` |
| Segurança e LGPD | `security` | `Shield` | `#1e40af` |
| Configurações e Admin | `settings` | `Settings` | `#64748b` |
| Plataforma e Mobile | `platform` | `Globe` | `#0f172a` |

### Voz editorial

- Linguagem **leiga** (sem jargão técnico)
- Estrutura padrão: "O que é" + "Por que importa" + "Como vai funcionar"
- **Sem datas** (apenas status)
- Toda transição pra `pausado`/`nao_sera_feito` exige motivo público

---

## 8. URLS E SEO

### Estrutura de URLs

```
roadmap.convertaflow.com/
├── /                                home (todas features paginadas)
├── /feature/[slug]                  detalhes de uma feature
├── /categoria/[slug]                features por categoria
├── /status/em-desenvolvimento       features por status
├── /status/concluidos               histórico (changelog)
├── /mais-votados                    top 20 por votos
├── /nova                            sugerir nova feature (auth)
└── /sobre                           política do roadmap
```

### SEO obrigatório

- SSR + ISR (`revalidate: 60`) — páginas de feature são estáticas
- `robots.txt`: allow tudo
- `sitemap.xml`: auto-gerado, todas as features
- `og:image` dinâmico via Vercel OG (mostra título + status + votos)
- Meta description: primeiro parágrafo da feature (max 160 chars)
- Structured data JSON-LD (`schema.org/SoftwareApplication`)

---

## 9. COMANDOS ÚTEIS

```bash
# Setup inicial
npm install

# Rodar localmente (porta 5566)
npm run dev

# Build de produção
npm run build

# Type-check sem build
npm run typecheck

# Lint
npm run lint
```

### Conferir o app principal pra reusar componentes/identidade

```bash
# Ver design system canônico
code "../app-converta-flow/docs/knowledge/visual-identity-components.md"

# Ver globals.css
code "../app-converta-flow/frontend/src/app/globals.css"

# Ver componentes shadcn
ls "../app-converta-flow/frontend/src/components/ui/"
```

---

## 10. ESTADO ATUAL DO PROJETO

```
[x] Decisão estratégica: roadmap público interno (não Featurebase)
[x] Pasta criada em D:/Plataformas - DEV/converta-flow/roadmap-convertaflow/
[x] CLAUDE.md (este arquivo) criado
[x] package.json configurado
[ ] npm install
[ ] Estrutura de pastas src/, public/, docs/
[ ] globals.css copiado do app principal
[ ] layout.tsx + page.tsx home placeholder
[ ] Configs (tsconfig, next.config, tailwind, postcss, eslint)
[ ] Componentes shadcn copiados do app
[ ] Header com logo + "voltar pro app"
[ ] Tipos TypeScript (Feature, Vote, Comment, Category)
[ ] Cliente API (axios + TanStack Query)
[ ] Clerk integrado (ClerkProvider no layout)
[ ] Backend Python: módulo /api/v1/roadmap/ no app principal
[ ] Migration Alembic: schema public.roadmap.*
[ ] Seed inicial de 30-40 features (extraídas do CLAUDE.md §15 do app)
[ ] Deploy Vercel primeira vez
[ ] DNS Cloudflare: roadmap.convertaflow.com → vercel
[ ] Clerk: adicionar roadmap.convertaflow.com em Authorized Domains
[ ] Política pública na página /sobre
[ ] Lançamento interno (Cristiano + staff testam)
[ ] Lançamento público (anúncio na Central de Ajuda)
```

---

## 11. CLÁUSULAS PÉTREAS HERDADAS DO APP PRINCIPAL

Toda decisão técnica neste projeto deve respeitar as cláusulas pétreas estabelecidas no CLAUDE.md do app principal (`app-converta-flow/CLAUDE.md`). Resumo das que se aplicam aqui:

- **§3 No-Paid-Fallback:** se usar IA pra busca semântica de features, NÃO cair em API paga em fallback
- **§3 Backend Python:** TODO endpoint novo no `backend-python` do app principal, NUNCA novo backend separado
- **§5 Clerk JWKS RS256:** auth obrigatoriamente via Clerk multi-domain
- **§8 Border-radius 10px:** uniforme em todo controle
- **§8 Heights grid 8pt:** h-10 padrão, h-9 dialogs, h-8 popovers
- **§8 PT-BR com acentos:** texto visível sempre acentuado, identificadores ASCII
- **§8 Sem alert/confirm/prompt nativos:** sempre Dialog/AlertDialog shadcn
- **§8 Sem `<select>` HTML nativo:** sempre Select shadcn com `position="popper"`
- **§8 Loading state obrigatório:** Loader2Icon + texto em gerúndio
- **§8 Tabs/view modes deep-linkable:** useTabParam (URL-driven, nunca useState local)
- **§14 SemVer:** versionamento próprio do projeto (X.Y.Z)

### Documentos referência sempre lidos

Quando Claude Code abrir uma sessão neste projeto, **DEVE consultar**:

1. Este arquivo (`CLAUDE.md`)
2. `../app-converta-flow/docs/knowledge/visual-identity-components.md` (visual)
3. `../app-converta-flow/.claude/rules/` (cláusulas pétreas operacionais)

---

## 12. PROIBIÇÕES ABSOLUTAS NESTE PROJETO

- ❌ NUNCA usar Featurebase, Canny, Upvoty ou outro SaaS externo (decisão final: 100% interno)
- ❌ NUNCA hospedar fora do Vercel (alternativa só Cloudflare Pages se Vercel rejeitar)
- ❌ NUNCA criar outro projeto Clerk (multi-domain do existente)
- ❌ NUNCA criar outro projeto Google Cloud Console (OAuth herdado)
- ❌ NUNCA criar outra VPS ou container Docker novo
- ❌ NUNCA duplicar lógica de negócio (busca/voto/comentário sempre via API do app principal)
- ❌ NUNCA publicar features sensíveis competitivamente (algoritmos proprietários, integrações em NDA, pricing experiments)
- ❌ NUNCA postar datas concretas (`Q3 2026`, `julho/2026`) — só status
- ❌ NUNCA esquecer de atualizar status quando feature avança no app principal (sync quinzenal)

---

## 13. METODOLOGIA DE DESENVOLVIMENTO

### Fluxo simplificado

```
Cristiano abre VS Code + Claude Code → planeja feature →
implementa direto → testa em localhost:5566 → commit + push →
Vercel deploya automaticamente → valida em roadmap.convertaflow.com
```

### Sem subagents formais

Diferente do app principal que tem AIOX + BMAD, este projeto **NÃO precisa** de:
- AIOX governance
- BMAD agent pipeline
- Story files formais
- QA gates

Razão: projeto pequeno (~30 arquivos previstos), 1 dev (Cristiano), iteração rápida.

### Git e Deploy

- Branch dev: `main` (sem fluxo de develop por enquanto)
- Commits em português: `feat:`, `fix:`, `docs:`, `chore:`, `style:`
- Vercel auto-deploy em push pra `main`
- Sem CI/CD complexo (Vercel já faz build + preview)

---

## 14. VERSIONAMENTO

- Início: `0.1.0-alpha` (este momento)
- `0.1.x` — protótipo + setup
- `0.2.x` — features core (listagem + voto + comentário)
- `0.5.x-beta` — público interno (staff testando)
- `1.0.0` — lançamento público oficial

---

*Atualizar sempre que houver mudanças estruturais.*
*Este arquivo é lido automaticamente pelo Claude Code em toda sessão.*
*Versão do projeto: 0.1.0-alpha | CLAUDE.md atualizado: 2026-05-23*
