---
name: roadmap-obsidian-sync
description: Documenta progresso recente (commits, decisões, features, sprints) no vault Obsidian do Roadmap ConvertaFlow. Atualiza Estado Atual + Auditoria + Milestones + cria log de conversa em 08 - Conversas SEM duplicar notas existentes. Respeita feedback antigo de NÃO duplicar.
allowed-tools: Read, Glob, Grep, Bash, mcp__obsidian__read_note, mcp__obsidian__write_note, mcp__obsidian__list_directory, mcp__obsidian__search_notes, mcp__obsidian__patch_note
---

# Roadmap Obsidian Syncer

Documenta progresso recente no vault sem duplicar nota.

## Passos

### 1. Receba contexto

Usuário deve fornecer:
- O que foi feito (commits, decisões, refator, sprint, etc)
- Data (default = hoje)
- Sprint/Wave de referência

### 2. Leia antes de escrever (NÃO duplicar)

Sempre LEIA primeiro:
- `D:\Plataformas - DEV\Obsidian\Matriz\Roadmap - ConvertaFlow\06 - Roadmap do Projeto\Estado Atual.md`
- `06 - Roadmap do Projeto\Milestones e Versionamento.md`
- Auditoria mais recente em `06 - Roadmap do Projeto\` (se houver wave relacionada)
- `08 - Conversas\00 - Como funciona esta pasta.md` (convenção)

### 3. Atualize Estado Atual

Adicione bloco novo NO TOPO da seção de progresso recente:

```markdown
### {Wave/Decisão} ({YYYY-MM-DD})

{Resumo de 2-3 linhas}

- Items: {tabela ou lista}
- Validação: {0 erros TS/ESLint, X rotas 200, etc}
- Próximos: {o que vem depois}
```

### 4. Atualize Auditoria relacionada

Se a wave fecha itens de Sprint priorizado, marque ✅ done na tabela. Adicione seção "Wave X" se aplicável.

### 5. Atualize Milestones

Se versão bumpou (ex: 0.7.0 → 0.7.5), atualize tabela. Caso contrário, atualize contador de wave em curso.

### 6. Crie log em `08 - Conversas\`

Path: `08 - Conversas\{YYYY-MM-DD} - {Título Descritivo Curto}.md`

Estrutura mínima (cf. convenção):
```markdown
---
data: {YYYY-MM-DD}
tags: [conversa, sprint-X, wave-Y]
relacionado: "[[Estado Atual]], [[Sprint X — Plano]]"
---

# {Título}

> Resumo em 1 parágrafo do que foi conversado/decidido/feito.

## Decisões técnicas
- {decisão} — {justificativa curta}

## Outputs
- {arquivo/commit}
- {arquivo/commit}

## Próximas conversas
- {tema pendente}
```

### 7. Atualize `00 - Indice.md` se nota nova foi criada

Adicione referência se aplicável.

### 8. Valide wiki-links

Para cada `[[wiki-link]]` criado, confirme que aponta pra nota existente. Sinalize pendentes.

### 9. NUNCA duplique

Se item já está documentado em outra nota, atualize-a — NÃO crie nova.

### 10. Reporte

Em ≤200 palavras: arquivos atualizados/criados (paths absolutos), wiki-links pendentes, decisões sobre duplicação.

## Princípios

- **Idempotente**: rodar 2x não duplica nada
- **Histórico não-destrutivo**: corpo original de notas antigas preservado; mudanças vão em blocos novos
- **Cross-link liberal**: use `[[wiki-links]]` pra tudo que tem nota correspondente
- **Voz editorial**: PT-BR humano, transparente, sem corporate-speak
