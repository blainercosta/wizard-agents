# CLAUDE.md - Blainer Agents

## Sobre o Projeto

Repositorio de custom instructions para Claude Code. App Next.js dark-mode-first, com estetica inspirada no Linear.app (tipografia Inter, paleta achromatica com acento indigo, bordas semitransparentes). Fontes: agentes oficiais em arquivos `.md`, agentes da comunidade em Supabase Postgres com moderacao.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- gray-matter (parser de frontmatter dos oficiais)
- Supabase (auth, DB, RLS) — autenticacao GitHub OAuth, tabelas `community_agents`, `votes`, `admins`
- lucide-react (icones)
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

## Design Tokens (Linear-inspired)

Fonte canonica: `DESIGN.md` na raiz do repo. Resumo:

### Cores
```
background-primary:    #08090a   (canvas)
background-secondary:  #0f1011   (panel)
background-tertiary:   #191a1b   (elevated)
background-elevated:   #28282c   (hover surface)

text-primary:          #f7f8f8   (near-white, nao usar #fff puro)
text-secondary:        #d0d6e0
text-muted:            #8a8f98
text-subtle:           #62666d

accent-brand:          #5e6ad2   (indigo, so CTA primario)
accent-lilac:          #7170ff   (violet, interativo)
accent-hover:          #828fff
accent-neon:           #10b981   (success/status apenas)

border-DEFAULT:        rgba(255,255,255,0.08)   (padrao)
border-subtle:         rgba(255,255,255,0.05)
border-solid:          #23252a
```

### Fontes
- UI: **Inter Variable** com `font-feature-settings: "cv01", "ss03"` globais
- Codigo: **JetBrains Mono** (fallback pro Berkeley Mono do spec original, que e pago)
- Pesos: **400** (leitura), **510** (UI/emphasis — peso padrao), **590** (strong)
- Tracking negativo em displays: `tracking-display` (-0.022em) pra >32px

### Estilo Visual
- Bordas: **1px solid**, translucidas brancas (`rgba(255,255,255,0.05–0.08)`)
- Radii: `rounded-md` (6px) botoes/inputs, `rounded-lg` (8px) cards, `rounded-full` pills
- Superficies translucidas: `bg-white/[0.02]` (card), `bg-white/[0.04]` (hover), `bg-white/[0.05]` (active)
- Sombras pra elevacao: `shadow-ring`, `shadow-elevated`, `shadow-focus`
- Hover em cards: aumentar opacidade do bg, NAO usar translate ou sombra pixel

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
- business
- marketing

## Fluxos Autenticados (Supabase)

- **Login**: GitHub OAuth via Supabase Auth → `/auth/callback` troca code por session
- **Upvote**: usuarios autenticados chamam RPC `cast_vote` / `remove_vote`. Dados do GitHub (id/username/avatar) sao preenchidos server-side a partir de `auth.users`, nunca do cliente
- **Submissao**: `/submit` chama RPC `submit_community_agent` (auto-preenche autor server-side, status=pending)
- **Moderacao**: admins (tabela `admins`) acessam `/admin`, aprovam/rejeitam via RPC `approve_community_agent` / `reject_community_agent`
- **RLS**: todas as mutacoes passam por security-definer RPCs. Leituras usam policies (approved+not deleted publico, autor ve proprio, admin ve tudo)

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
- `DESIGN.md` - Sistema visual completo (Linear-inspired, fonte canonica pra UI)
- `README.md` - Documentacao publica
- `tailwind.config.ts` - Design tokens materializados
- `/src/lib/agents.ts` - Parser dos arquivos .md (oficiais)
- `/src/lib/supabase/` - Clients + helpers pra auth, votes, community, moderation

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
- Light mode (projeto e dark only)
- Pure white (`#ffffff`) como texto — usar `text-text-primary` (`#f7f8f8`)
- Border `2px solid` e sombras pixel (`shadow-[4px_4px_0_0_...]`) — padrao atual e `1px` translucido
- Fonte pixel (Press Start 2P) — substituida por Inter Variable
- Bordas opacas solidas em dark backgrounds — usar translucidas brancas
- Peso `font-bold` (700) — maximo e `font-semibold` (590); padrao de UI e `font-medium` (510)
- Acento indigo (`accent-brand`) decorativo — reservado pra CTAs e elementos interativos
