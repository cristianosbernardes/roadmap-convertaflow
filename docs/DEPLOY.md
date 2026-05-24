# Deploy — Roadmap ConvertaFlow

## ✅ Status atual (2026-05-24)

**LIVE em https://roadmap.convertaflow.com** — HTTP 200, SSL Let's Encrypt, SSO Clerk multi-domain funcionando.

| Item | Status | Detalhe |
|---|---|---|
| Vercel project | ✅ Live | `roadmap-convertaflow` em `cristiano-bernardes-projects` (Hobby), região `gru1` |
| Auto-deploy | ✅ Ativo | Push pra `main` → deploy automático |
| Custom domain | ✅ Validado | `roadmap.convertaflow.com` |
| DNS | ✅ Propagado | Cloudflare CNAME → `83891fa923f2271a.vercel-dns-017.com` (Proxy OFF) |
| SSL | ✅ Emitido | Let's Encrypt, renovação automática |
| Env vars | ✅ Configuradas | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` (Sensitive, Production + Preview) |
| Clerk auth | ✅ Multi-domain | Subdomínio do primary `convertaflow.com` — autorizado por default (toggle Allowed Subdomains OFF) |

Detalhes completos em [[ADRs]] #025 e [[Estado Atual]] no Obsidian.

## Plataforma: Vercel

Hospedagem 100% Vercel free tier (Hobby plan). Sem VPS, sem container Docker.

## Setup inicial (uma vez) — JÁ EXECUTADO

### 1. Criar repo GitHub
```bash
cd "D:/Plataformas - DEV/converta-flow/roadmap-convertaflow"
git init
git add .
git commit -m "feat(initial): setup inicial do roadmap"
gh repo create cristianosbernardes/roadmap-convertaflow --public --source=. --push
```

**Importante (cláusula pétrea):** este repo é do usuário `cristianosbernardes`. NUNCA misturar com `dxautomotive`.

### 2. Conectar Vercel
1. Acessar [vercel.com/new](https://vercel.com/new)
2. Import Git Repository → selecionar `roadmap-convertaflow`
3. Framework: Next.js (auto-detectado)
4. Root Directory: `./` (raiz)
5. Build Command: `npm run build` (default)
6. Output Directory: `.next` (default)

### 3. Configurar Environment Variables (no Vercel Dashboard)

Production:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...     # mesma do app principal
CLERK_SECRET_KEY=sk_live_...                       # mesma do app principal
NEXT_PUBLIC_API_URL=https://api.convertaflow.com
NEXT_PUBLIC_APP_URL=https://app.convertaflow.com
NEXT_PUBLIC_LP_URL=https://convertaflow.com
NEXT_PUBLIC_ENV=production
```

Preview/Development: usar Clerk test keys (`pk_test_...` e `sk_test_...`).

### 4. Configurar custom domain

No Vercel Dashboard → Project Settings → Domains:
1. Add Domain: `roadmap.convertaflow.com`
2. Vercel mostra registro DNS necessário (CNAME)
3. Adicionar no Cloudflare Dashboard:
   ```
   Type:   CNAME
   Name:   roadmap
   Target: cname.vercel-dns.com
   Proxy:  ⚠️ DESLIGADO (cinza, não laranja)
   ```
4. Aguardar verificação SSL (~5-10min)
5. Confirmar acesso a `https://roadmap.convertaflow.com`

### 5. Adicionar Authorized Domain no Clerk

No [Clerk Dashboard](https://dashboard.clerk.com) → Settings → Domains:
1. Add Domain: `roadmap.convertaflow.com`
2. Aguardar ativação (~1 min)
3. Testar: ir no app principal, fazer login, depois acessar roadmap.convertaflow.com — deve estar autenticado automaticamente

## Deploy contínuo (dia a dia)

```bash
# 1. Trabalhar localmente
npm run dev

# 2. Commit + push
git add .
git commit -m "feat(votes): adiciona botão de voto otimista"
git push origin main

# 3. Vercel deploya automaticamente
# Preview URL aparece em commits de branches
# Produção atualiza no push para main
```

## Monitoramento

- **Vercel Dashboard:** ver builds, deploys, errors
- **Vercel Analytics:** (free tier) métricas de pageview
- **Vercel Speed Insights:** Core Web Vitals (free tier)

## Rollback rápido

Em caso de regressão crítica:
1. Vercel Dashboard → Deployments
2. Selecionar deployment anterior conhecidamente bom
3. Botão "Promote to Production" → confirma
4. Rollback efetivo em ~30s

## Custos

- **Vercel:** $0 (Hobby plan)
- **DNS Cloudflare:** $0 (já configurado pro domínio principal)
- **Clerk:** $0 (mesmo plano do app principal)
- **Backend:** $0 (reusa `backend-python` existente na VPS)

**Total mensal:** $0

Limites do Hobby plan a monitorar:
- 100 GB bandwidth/mês (suficiente até ~500k pageviews)
- 100 builds/dia
- Function invocations: depende do uso

Quando atingir limite → upgrade pra Vercel Pro ($20/mês). Sinal de sucesso.

## CI/CD

Vercel cobre tudo — não precisamos GH Actions separado.

Cada push em `main`:
1. Vercel detecta automaticamente
2. Build (npm install + next build)
3. Deploy preview ou produção
4. Notifica via email + GitHub commit status

## Variáveis sensíveis

NUNCA commitar `.env.local`. Está no `.gitignore`.

Para compartilhar com Claude Code em sessão:
- Variáveis públicas (`NEXT_PUBLIC_*`): podem aparecer em screenshots/logs
- Chaves privadas (`CLERK_SECRET_KEY`): apenas Vercel Dashboard, nunca no chat
