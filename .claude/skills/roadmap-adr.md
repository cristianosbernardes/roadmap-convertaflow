---
name: roadmap-adr
description: Cria ADR (Architecture Decision Record) no padrão exato do vault Roadmap ConvertaFlow. Detecta próximo ID sequencial automaticamente, gera frontmatter consistente, estrutura com Status/Contexto/Decisão/Razão/Trade-offs/Cláusulas relacionadas/Próximos passos. Atualiza referências cruzadas em ADRs antigas se aplicável.
allowed-tools: Read, Grep, mcp__obsidian__read_note, mcp__obsidian__write_note, mcp__obsidian__patch_note
---

# Roadmap ADR Writer

Cria ADR seguindo padrão estabelecido no vault.

## Passos

### 1. Próximo ID

Leia `D:\Plataformas - DEV\Obsidian\Matriz\Roadmap - ConvertaFlow\07 - Decisoes\ADRs.md`. Encontre o maior `ADR-NNN` existente. Use `ADR-(N+1)`.

### 2. Colete dados (peça ao usuário se não dado)

- Título curto (5-10 palavras)
- Contexto (1 parágrafo: situação que motivou)
- Decisão (1 parágrafo: o que decidimos)
- Razão (3-5 bullets numerados: por quê)
- Trade-offs (lista ✓ pros / ✗ contras)
- Cláusulas relacionadas (links `[[#ADR-XXX]]` ou `[[Nota Existente]]`)
- Próximos passos

### 3. Renderize no padrão exato

```markdown
## ADR-{NNN} — {Título}

- **Status**: Aceito | {YYYY-MM-DD}
- **Supersedes**: (opcional, `[[#ADR-XXX]]`)
- **Refina**: (opcional, `[[#ADR-XXX]]`)

### Contexto
{texto}

### Decisão
{texto + tabela quando aplicável}

### Razão
1. **{Título do ponto}**: {explicação}
2. ...

### Trade-offs
- ✓ {pro}
- ✗ {contra}

### Cláusulas relacionadas
- [[#ADR-XXX]] — explicação
- [[Nota Existente]] — explicação

### Próximos passos
1. {passo}
```

### 4. Append no final de `ADRs.md`

NUNCA sobrescreva. Apenas adicione após a última ADR existente.

### 5. Atualize referências cruzadas

Se ADR nova **supersede** ou **refina** outras, edite as ADRs antigas adicionando nota no topo do bloco:

- Supersede: `> **⚠️ Atualizada em {YYYY-MM-DD}**: ver [[#ADR-{N+1}]]`
- Refina: `> **🔄 Refinada em {YYYY-MM-DD}**: ver [[#ADR-{N+1}]]`

### 6. Estado Atual

Adicione referência à nova ADR em `06 - Roadmap do Projeto\Estado Atual.md` se for decisão arquitetural significativa.

### 7. Reporte

Em ≤100 palavras: ID atribuído, título, relação com ADRs anteriores, paths atualizados.

## Convenções do vault

- Frontmatter consistente (sem tags ADR — só identificador na seção)
- `[[wiki-links]]` sempre que possível
- Histórico nunca destrutivo (ADRs antigas mantém corpo original; nota de atualização vai no topo)
- PT-BR com acentos em texto visível
