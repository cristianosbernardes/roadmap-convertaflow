# 🗺️ Roadmap ConvertaFlow

> Roadmap público da plataforma ConvertaFlow — onde clientes votam e comentam features.
> Versão: `0.1.0-alpha` | Domínio: `roadmap.convertaflow.com`

---

## 🚀 Quickstart

```bash
# 1. Instalar dependências
npm install

# 2. Copiar env de exemplo e preencher
cp .env.example .env.local
# Editar .env.local com chaves Clerk do projeto principal

# 3. Rodar localmente (porta 5566)
npm run dev

# 4. Abrir browser
open http://localhost:5566
```

---

## 📂 Estrutura

Ver [`CLAUDE.md`](./CLAUDE.md) — documentação completa lida pelo Claude Code automaticamente.

Resumo:
```
src/app/         # Next.js App Router (páginas)
src/components/  # UI (shadcn copiados do app principal)
src/lib/         # api.ts, auth.ts, utils.ts
src/types/       # TypeScript types
public/          # Assets estáticos
docs/            # Documentação interna (ARCHITECTURE, DECISIONS, etc.)
```

---

## 🎨 Identidade visual

**Source of truth:** app principal em `../app-converta-flow/`.

Cores, fontes, componentes e logos vêm de:
- `../app-converta-flow/frontend/src/app/globals.css` (design tokens)
- `../app-converta-flow/frontend/src/components/ui/` (shadcn)
- `../app-converta-flow/frontend/public/` (logos)
- `../app-converta-flow/docs/knowledge/visual-identity-components.md` (doc canônica)

**Cláusula pétrea:** roadmap e LP **DEVEM** parecer parte do mesmo ecossistema do app.

---

## 🔐 Autenticação

- **Clerk multi-domain** (mesmo projeto do app principal)
- SSO automático: quem logou em `app.convertaflow.com` chega autenticado aqui
- Google OAuth herdado (não precisa criar outro projeto Google Cloud)

---

## 🌐 Hospedagem

- **Vercel free tier** (mesma conta do app principal)
- DNS Cloudflare: CNAME `roadmap` → `cname.vercel-dns.com`
- SSL automático

---

## 🤝 Como contribuir (você + Claude Code)

Este projeto é desenvolvido por **Cristiano + Claude Code** em iteração contínua.

Padrão:
1. Abrir VS Code nesta pasta
2. Abrir Claude Code (Max 2x)
3. Pedir feature ou ajuste
4. Validar em `localhost:5566`
5. Commit + push pra `main`
6. Vercel deploya automaticamente

---

## 📜 Links importantes

- **Doc estratégica completa:** [Obsidian Roadmap](D:/Plataformas%20-%20DEV/Obsidian/Matriz/Converta%20Flow/Roadmap/)
- **App principal:** [../app-converta-flow](../app-converta-flow)
- **Inspirações:**
  - [Featurebase](https://featurebase.app) — padrão visual
  - [ZDG Roadmap](https://roadmap.zdg.com.br) — referência BR (usa Upvoty)
  - [Linear Changelog](https://linear.app/changelog) — best-in-class
  - [Stripe Changelog](https://stripe.com/changelog) — transparência

---

**Versão atual:** 0.1.0-alpha (em setup inicial)
**Próxima milestone:** `0.2.0` — listagem de features + voto + comentário
