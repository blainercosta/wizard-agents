# CLAUDE.md - Blainer Agents

## Sobre o Projeto

Repositorio de custom instructions para Claude Code. Site estatico em Next.js com estetica pixel art, dark mode, paleta roxa.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- gray-matter
- Vercel

## Estrutura

```
/agents          -> arquivos .md (fonte de dados)
/src/app         -> paginas
/src/components  -> componentes React
/src/lib         -> parsers e utils
/src/types       -> tipos TS
```

## Comandos

```bash
npm run dev      # desenvolvimento
npm run build    # build de producao
npm run lint     # linting
```

## Convencoes de Codigo

### TypeScript
- Strict mode habilitado
- Interfaces para props de componentes
- Types para dados (Agent, Category)

### Componentes
- Functional components only
- Props tipadas com interface
- Nomenclatura PascalCase
- Um componente por arquivo

### CSS/Tailwind
- Usar tokens definidos no tailwind.config
- Evitar valores hardcoded
- Mobile first

### Commits
- Conventional commits: feat:, fix:, docs:, style:, refactor:
- Mensagens em portugues ou ingles (consistente)

## Design Tokens

### Cores
```
bg-primary:     #0D0A1A
bg-secondary:   #1A1625
bg-tertiary:    #252033
text-primary:   #FFFFFF
text-secondary: #B8B5C4
accent-lilac:   #A78BFA
accent-neon:    #39FF14
border-default: #3D3654
```

### Fontes
- Titulos: 'Press Start 2P'
- Corpo: 'JetBrains Mono'

### Estilo Visual
- Bordas: 2px solid, cantos retos (sem border-radius)
- Sombras: 4px 4px 0 0 (offset solido, sem blur)
- Hover: translateY(-2px), borda accent-neon

## Estrutura de um Agente (.md)

```yaml
---
name: "Nome do Agente"
slug: "nome-do-agente"
category: "design"
version: "1.0"
compatibility: ["claude-code", "claude-projects"]
description: "Descricao curta."
tags: ["tag1", "tag2"]
created: "2025-02-03"
updated: "2025-02-03"
---

# Conteudo do prompt
```

## Categorias Validas

- design
- development
- automation
- writing

## Adicionando um Novo Agente

1. Criar arquivo em `/agents/[categoria]/[slug].md`
2. Preencher frontmatter com todos os campos obrigatorios
3. Adicionar conteudo do prompt apos o frontmatter
4. Testar localmente
5. Commit e push

## Padroes de Qualidade

- Agentes devem ter descricao clara do proposito
- Versao semantica (major.minor)
- Tags relevantes para descoberta
- Conteudo do prompt testado e funcional

## Arquivos Importantes

- `PRD.md` - Product Requirements Document
- `CLAUDE.md` - Este arquivo (contexto para Claude)
- `README.md` - Documentacao publica
- `tailwind.config.ts` - Design tokens
- `/src/lib/agents.ts` - Parser dos arquivos .md

## Contexto de Negocio

Este e um projeto open source pessoal para compartilhar prompts de sistema otimizados. O objetivo e criar uma biblioteca publica e bem organizada de agentes reutilizaveis.

Publico-alvo: desenvolvedores e designers que usam Claude Code/Projects.

## Prioridades

1. Funcionalidade > estetica
2. Simplicidade > features
3. Performance > animacoes
4. Clareza > criatividade

## O Que Evitar

- Overengineering
- Dependencias desnecessarias
- Logica complexa no frontend
- Animacoes pesadas
- Border-radius (manter pixel perfect)
- Light mode (projeto e dark only)
