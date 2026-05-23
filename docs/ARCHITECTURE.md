# Arquitetura — Roadmap ConvertaFlow

## Stack

| Camada | Tecnologia | Hosting |
|---|---|---|
| Frontend | Next.js 15 + React 19 + TypeScript 5 | Vercel (free tier) |
| Estilo | Tailwind CSS 4 + shadcn/ui | — |
| Auth | Clerk (`@clerk/nextjs`) | Mesmo projeto do app principal |
| API | Backend Python (existente, `backend-python`) | VPS Hetzner do app principal |
| Banco | PostgreSQL (schema `public.roadmap.*`) | Mesma DB do app principal |
| Busca | pgvector (cosine similarity) | Mesma DB do app principal |
| Domínio | `roadmap.convertaflow.com` | DNS Cloudflare → Vercel |

## Diagrama

```
┌────────────────────────────────────────────────┐
│ Browser (público OU autenticado via Clerk)      │
└─────────────────────┬──────────────────────────┘
                      │ HTTPS
                      ▼
┌────────────────────────────────────────────────┐
│ Vercel CDN (edge global)                        │
│ Next.js SSR + ISR                               │
└─────────────────────┬──────────────────────────┘
                      │ /api/v1/roadmap/*
                      ▼
┌────────────────────────────────────────────────┐
│ api.convertaflow.com (backend-python)           │
│ Novo módulo: app/api/v1/roadmap/                │
└─────────────────────┬──────────────────────────┘
                      │ asyncpg
                      ▼
┌────────────────────────────────────────────────┐
│ PostgreSQL (VPS Hetzner do app principal)       │
│ Schema: public.roadmap.*                        │
│ pgvector pra busca semântica                    │
└────────────────────────────────────────────────┘
```

## Auth (multi-domain Clerk)

- **Mesmo projeto Clerk** do app principal
- Frontend API em `clerk.convertaflow.com` (já existe)
- Cookie compartilhado em `*.convertaflow.com`
- Google OAuth herdado (NÃO criar outro projeto Google Cloud)
- Adicionar `roadmap.convertaflow.com` em **Authorized Domains** no Clerk Dashboard

## Schema PostgreSQL (a criar)

```sql
CREATE SCHEMA roadmap;

CREATE TABLE roadmap.categories (...);   -- 14 seedadas
CREATE TABLE roadmap.statuses (...);     -- 6 seedadas
CREATE TABLE roadmap.features (...);     -- principal
CREATE TABLE roadmap.votes (...);        -- 1 voto por user por feature
CREATE TABLE roadmap.comments (...);     -- threading 1 nível
CREATE TABLE roadmap.bug_reports (...);  -- só assinantes
CREATE TABLE roadmap.priority_signals (...); -- "minha empresa precisa"
CREATE TABLE roadmap.subscriptions (...); -- opt-in notificação
```

Esquema detalhado em [Obsidian Roadmap/01 - Arquitetura Técnica](../../app-converta-flow/../Obsidian/Matriz/Converta\ Flow/Roadmap/01\ -\ Arquitetura\ Técnica.md).

## Endpoints API (a implementar no backend-python)

### Públicos (sem auth)
- `GET /api/v1/roadmap/features` — lista paginada com filtros
- `GET /api/v1/roadmap/features/{slug}` — detalhes
- `GET /api/v1/roadmap/features/{slug}/comments` — comentários
- `GET /api/v1/roadmap/search?q=...` — busca semântica pgvector
- `GET /api/v1/roadmap/categories` — 14 categorias canônicas
- `GET /api/v1/roadmap/statuses` — 6 statuses canônicos

### Autenticados (Clerk JWT)
- `POST /api/v1/roadmap/features/{slug}/vote` — toggle voto idempotente
- `DELETE /api/v1/roadmap/features/{slug}/vote` — remove voto
- `POST /api/v1/roadmap/features/{slug}/comments` — novo comentário
- `POST /api/v1/roadmap/features/{slug}/subscribe` — opt-in email

### Assinante ativo (Clerk JWT + plano pago)
- `POST /api/v1/roadmap/bug-reports` — reportar bug
- `POST /api/v1/roadmap/features/{slug}/priority` — "minha empresa precisa"

### Staff only (Clerk JWT + email em `public.staff_users`)
- `POST /api/v1/admin/roadmap/features`
- `PATCH /api/v1/admin/roadmap/features/{slug}`
- `DELETE /api/v1/admin/roadmap/features/{slug}`
- `POST /api/v1/admin/roadmap/comments/{id}/pin`
- `POST /api/v1/admin/roadmap/comments/{id}/reply-official`

## Portas

- **Dev local:** 5566 (app principal usa 4000, LP usa porta diferente)
- **Produção:** 443 (HTTPS via Vercel)
