---
name: roadmap-ux-audit
description: Roda auditoria UX/UI completa do roadmap-convertaflow. Captura screenshots de todas rotas em desktop+mobile via Playwright, classifica gaps em 5 categorias (Estados, Microinterações, Navegação, Mobile, A11y), propõe Sprint priorizado por impacto/esforço, documenta tudo no vault Obsidian sem duplicar.
allowed-tools: Read, Glob, Grep, Bash, mcp__playwright__browser_navigate, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_resize, mcp__playwright__browser_snapshot, mcp__playwright__browser_evaluate, mcp__obsidian__read_note, mcp__obsidian__write_note, mcp__obsidian__list_directory, mcp__obsidian__search_notes
---

# Roadmap UX Audit

Auditoria visual sistemática do `roadmap.convertaflow.com` (mock-driven em `localhost:5566`).

## Passos

### 1. Leia precedentes pra não duplicar

- `D:\Plataformas - DEV\Obsidian\Matriz\Roadmap - ConvertaFlow\06 - Roadmap do Projeto\Auditoria UX-UI v2 (2026-05-24).md` (mais recente)
- Notas em `06 - Roadmap do Projeto\` começando com "Auditoria"

Identifique o que já está documentado, foque em NOVO.

### 2. Capture screenshots via Playwright

Para cada rota em **desktop 1440x900** + **mobile 390x844**:
`/`, `/roadmap`, `/changelog`, `/sobre`, `/nova`, `/feature/agente-ia-com-memoria-persistente`, `/categoria/inbox`, `/buscar?q=ia`, `/categoria/billing` (empty state).

Estados interativos chave: hover FeatureCard, modal PermissionGate (anônimo+Comentar), modal Cmd+K, reply form, reactions picker.

Salve em `docs/screenshots/audit-{YYYY-MM-DD}/`.

### 3. Classifique gaps

5 categorias com impacto (1-5) + esforço (dias) + score (impacto/esforço):

- **A. Estados** — loading, vazio, erro
- **B. Microinterações** — hover, transitions, aria-live, focus
- **C. Navegação/Descoberta** — filtros, busca, breadcrumb, share
- **D. Mobile-first** — touch targets, viewport, hambúrguer
- **E. Acessibilidade** — WCAG AA mínimo

### 4. Compare com concorrentes (só aprendizados novos)

Pesquisas existentes em `04 - Pesquisa de Concorrentes\`. Cite apenas o que ainda não foi documentado.

### 5. Sprint priorizado

Tabela com IDs sequenciais (continuando última Sprint), título, categoria, impacto, esforço, score, dependências.

**EXCLUA** itens que dependem só de backend (Sprint 3+).

### 6. Documente no Obsidian

Crie `06 - Roadmap do Projeto\Auditoria UX-UI v{N} ({YYYY-MM-DD}).md` (N = próxima versão).

Atualize `Estado Atual.md` linkando a nova auditoria. NÃO duplique.

### 7. Reporte

Em ≤400 palavras: top 5 gaps, top 5 itens priorizados, estimativa total em dias.

## Padrões pétreos a respeitar

- `rounded-[10px]` outer, `rounded-[7px]` inner (concentric)
- 1.5px solid border outer, 1px secondary inner
- PT-BR acentos em texto visível
- Touch targets ≥ 44px mobile
- Focus rings `var(--brand-primary)`
- Ícones na escala canônica ADR-035 (xs/sm/md/lg/xl/2xl)
- Proporção ícone/texto ~70%
