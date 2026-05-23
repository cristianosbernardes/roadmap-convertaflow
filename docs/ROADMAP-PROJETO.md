# Roadmap do próprio projeto Roadmap

> Meta-roadmap: o que falta pra esse projeto chegar em 1.0.0.

## Versão atual: `0.1.0-alpha`

Setup inicial. Estrutura de pastas + configs + CLAUDE.md prontos.

## Milestones planejados

### `0.2.0` — Listagem de features (sem auth)

Objetivo: home funcional mostrando features.

- [ ] Backend Python: módulo `app/api/v1/roadmap/` com endpoint `GET /features`
- [ ] Backend Python: migration Alembic schema `roadmap.*`
- [ ] Backend Python: seed inicial de 30-40 features (extraídas do CLAUDE.md §15 do app)
- [ ] Frontend: copiar componentes shadcn do app (Button, Card, Badge, Skeleton)
- [ ] Frontend: `<FeatureCard />` component
- [ ] Frontend: `<StatusBadge />` component
- [ ] Frontend: `<CategoryIcon />` component
- [ ] Frontend: home `/` lista features com filtros (status + categoria)
- [ ] Frontend: TanStack Query hook `useFeatures()`
- [ ] Frontend: paginação ou scroll infinito
- [ ] Frontend: skeleton loading
- [ ] Deploy primeira vez no Vercel

### `0.3.0` — Página de detalhe + votos

- [ ] Frontend: rota `/feature/[slug]` com SSR + ISR
- [ ] Frontend: `<VoteButton />` com otimismo + rollback
- [ ] Backend: `POST/DELETE /features/{slug}/vote`
- [ ] Backend: contador de votos com índice apropriado
- [ ] Frontend: meta tags SEO dinâmicas (title, description, og:image)
- [ ] Frontend: `og:image` dinâmico via Vercel OG

### `0.4.0` — Comentários

- [ ] Backend: `GET/POST /features/{slug}/comments`
- [ ] Frontend: `<CommentThread />` com markdown rendering (react-markdown + remark-gfm)
- [ ] Frontend: `<CommentEditor />` com markdown preview
- [ ] Frontend: aninhamento 1 nível (parent_comment_id)
- [ ] Frontend: badges autor (staff / subscriber / guest)

### `0.5.0-beta` — Páginas por categoria + status + busca

- [ ] Rota `/categoria/[slug]`
- [ ] Rota `/status/[slug]`
- [ ] Rota `/mais-votados`
- [ ] Rota `/buscar?q=...` com pgvector
- [ ] Backend: endpoint `GET /search` com cosine similarity
- [ ] Frontend: `<SearchBar />` com debounce 800ms

### `0.6.0-beta` — Auth + ações restritas

- [ ] Integrar `<SignInButton />` Clerk
- [ ] `<SignedIn />` / `<SignedOut />` wrappers
- [ ] Backend: middleware Clerk pra rotas auth
- [ ] Rota `/nova` (sugerir feature — apenas auth)
- [ ] Frontend: opt-in notificação (`<SubscribeButton />`)

### `0.7.0-beta` — Assinante features

- [ ] Backend: helper `is_active_subscriber()` (consulta Companies + planSlug)
- [ ] Frontend: `<BugReportButton />` (apenas assinante)
- [ ] Frontend: `<PrioritySignalButton />` ("minha empresa precisa")
- [ ] Rota `/bug-reports/novo`

### `0.8.0-beta` — Staff admin

- [ ] Página `/admin` (apenas staff)
- [ ] CRUD de features
- [ ] Mudança de status com histórico
- [ ] Pin/unpin comentários
- [ ] Resposta oficial em comentários

### `0.9.0-beta` — SEO + Analytics

- [ ] `sitemap.xml` auto-gerado
- [ ] `robots.txt` allow tudo
- [ ] Structured data JSON-LD
- [ ] Vercel Analytics
- [ ] Open Graph cards otimizados

### `1.0.0` — Lançamento público

- [ ] Política pública `/sobre` finalizada
- [ ] Cláusula pétrea: zero datas em features
- [ ] Anúncio interno via Central de Ajuda
- [ ] Anúncio externo (LP, social, email)
- [ ] Monitoramento de métricas iniciais
- [ ] First "minha empresa precisa" da CTA Marketing 🎉

## Pós 1.0.0 (futuro)

- Tradução EN
- Peso de voto por plano (Premium = 3x Starter)
- Integração com sistema de billing
- Notificações por email Resend (mudança de status)
- Subscribe a categoria inteira
- Comentários reportáveis pela comunidade
- Webhook pra Slack/Discord interno quando feature recebe 100+ votos
- Heatmap de engagement por horário
- A/B test de copy nas features

## Tempo estimado total

- `0.2.0` → `1.0.0`: ~80-120h de dev espalhadas
- Em ritmo de 4-6h/semana: ~16-20 semanas (4-5 meses)
- Em ritmo focado de 20h/semana: ~5-6 semanas

## Próxima sessão recomendada

Após `npm install` + abrir Claude Code no projeto:

1. Verificar que `npm run dev` sobe sem erros em `localhost:5566`
2. Decidir se backend Python vai primeiro (recomendo) OU se mockamos dados pra ver UI rodando
3. Se backend primeiro: implementar `GET /features` no `app-converta-flow/backend-python/app/api/v1/roadmap/` + migration
4. Se UI primeiro: criar `lib/mock-data.ts` com 10 features fake pra prototipar layout
