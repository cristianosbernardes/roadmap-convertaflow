# Branding — Roadmap ConvertaFlow

> **Cláusula pétrea:** roadmap, LP e app DEVEM parecer parte do mesmo ecossistema.
> O **app principal é a fonte de verdade**. Toda mudança visual aqui espelha o que está lá.

---

## Fonte de verdade

| O que | Onde no app principal |
|---|---|
| Design tokens (cores, sombras, radius) | `../app-converta-flow/frontend/src/app/globals.css` |
| Componentes shadcn | `../app-converta-flow/frontend/src/components/ui/` |
| Logos SVG | `../app-converta-flow/frontend/public/icon.svg`, `favicon.svg`, `login.svg` |
| Documentação canônica | `../app-converta-flow/docs/knowledge/visual-identity-components.md` |

**Como manter sincronizado:** quando o app mudar token/componente/logo, atualizar aqui também. Não usar componente diferente "porque ficou bonito" — quebra ecossistema.

---

## Cores principais (`globals.css` linha 56-90)

```css
--brand-primary:  #1e7fd4;  /* azul ConvertaFlow */
--brand-dark:     #1a6bbf;
--brand-deeper:   #1a3a6e;  /* azul escuro pra gradientes */
--brand-cta:      #fc9e1c;  /* laranja sidebar */
--brand-cta-light:#ffd166;
--brand-navy:     #0d1b3e;
--brand-accent:   #a8d4f5;
```

## Gradientes oficiais

| Aplicação | Gradiente |
|---|---|
| **Sidebar / Hero vertical** | `linear-gradient(180deg, #1e7fd4 0%, #1a3a6e 100%)` |
| **Hero card (diagonal)** | `linear-gradient(150deg, #1e7fd4 0%, #1a3a6e 100%)` |
| **Botão primário** | `linear-gradient(180deg, #1e7fd4 0%, #1a6bbf 100%)` |
| **Balão chat enviado** | `linear-gradient(135deg, #1e7fd4 0%, #1a3a6e 100%)` |

**Proibido:** gradiente em botão circular ≤40px (usa `bg-primary` flat).

## Border-radius — 10px uniforme

Cláusula pétrea (2026-04-23):

- Botões, inputs, cards, dialogs, segmented controls: `rounded-[10px]`
- Internos de segmented control (concentric corners): `rounded-[7px]`
- Badges/avatares circulares: `rounded-full`

**Proibido em código novo:** `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-[8px]`, `rounded-[12px]`, `rounded-[16px]`.

## Border-first principle

- **Outer controls:** `1.5px solid var(--border-primary)` (#d1d5db)
- **Items aninhados:** `1px solid var(--border-secondary)` (#e5e7eb)
- **Sombra** reservada pra elevação real (dropdowns, dialogs)

## Alturas grid 8pt

| Elemento | Altura |
|---|---|
| Inputs, search bars, botões primários | `h-10` (40px) |
| Botões em dialogs | `h-9` (36px) |
| Pills icon-only, controles em popovers | `h-8` (32px) |

**Proibido:** `h-11`, números ímpares fora da escala.

## Fontes

- **Sans:** Geist (Google Fonts) — variable `--font-geist-sans`
- **Mono:** Geist (mesma) — variável `--font-geist-mono`
- Não importar outras fontes.

## Logos disponíveis

| Arquivo | Uso |
|---|---|
| `public/favicon.svg` | Browser tab (com fundo) |
| `public/icon.svg` | Header, sidebar dropdown (paths reduzidos) |
| `public/login.svg` | Tela de login, sem fundo |

## Status badges (cores específicas)

Definidos em [`src/lib/constants.ts`](../src/lib/constants.ts):

| Status | Bg light | Text |
|---|---|---|
| sob_analise | gray-100 | gray-700 |
| planejado | sky-100 | sky-700 |
| em_desenvolvimento | orange-100 | orange-700 |
| concluido | green-100 | green-700 |
| pausado | yellow-100 | yellow-700 |
| nao_sera_feito | red-100 | red-700 |

## Categorias (ícones Lucide + cores)

14 categorias canônicas em `src/lib/constants.ts`. Cada uma com:
- Slug (URL-safe)
- Label (PT-BR visível)
- Lucide icon
- Cor hex (badge accent)
- Sort order

**IA tem gradient especial** (não cor sólida): `linear-gradient(135deg, #1e7fd4 0%, #1a3a6e 100%)`.

## PT-BR primeiro (cláusula pétrea)

- Texto visível: SEMPRE com acentuação correta (`configuração`, não `configuracao`)
- URLs e identificadores: ASCII (`/categoria/inbox`, não `/categoria/configurações`)
- Slugs de status: ASCII (`sob_analise`, não `sob_análise`)

## Proibições absolutas (herdadas do app)

- ❌ `alert()`, `confirm()`, `prompt()` nativos
- ❌ `<select>` HTML nativo (usar shadcn Select)
- ❌ Hardcode de hex em código novo (usar `var(--brand-X)` ou `bg-primary`)
- ❌ Borda esquerda colorida em cards (sempre borda uniforme 1.5px)
- ❌ Tabs/view modes com `useState` local (usar `useTabParam` URL-driven)

## Loading state obrigatório

Todo botão async deve:
1. `disabled={loading}` enquanto promessa não resolve
2. Ícone trocado por `<Loader2 className="animate-spin" />`
3. Texto em gerúndio (`"Votando..."`, `"Enviando..."`, `"Carregando..."`)
