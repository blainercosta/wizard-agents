# Wizard Agents

Open source collection of plug-and-play system prompts for Claude Code and Claude Projects.

## What's Inside

Curated, battle-tested prompts for specialized AI agents:

| Category | Agents |
|----------|--------|
| **Development** | Dev Specialist, Performance, Security, TypeScript Expert |
| **Design** | UI, UX, Product Design, UX Strategy |
| **Business** | PM Specialist, AI Strategy |
| **Marketing** | SEO Specialist |
| **Automation** | CI/CD Specialist |

## Quick Start

1. Browse agents at the website or in `/agents` directory
2. Copy the prompt content
3. Paste into Claude Code (`CLAUDE.md`) or Claude Projects

```bash
# Run locally
git clone https://github.com/blainercosta/wizard-agents.git
cd wizard-agents
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Using the Agents

### Claude Code
Add to your project's `CLAUDE.md` file:
```markdown
# CLAUDE.md

[Paste agent content here]
```

### Claude Projects
1. Open Claude Projects
2. Go to Project Instructions
3. Paste the agent content

## Agent Structure

Each agent follows a consistent format:

```yaml
---
name: "Agent Name"
slug: "agent-slug"
category: "development"
version: "1.0"
compatibility: ["claude-code", "claude-projects"]
description: "What this agent does"
tags: ["tag1", "tag2"]
---

# Agent Content
[System prompt content]
```

## Adding New Agents

1. Create file in `/agents/[category]/[slug].md`
2. Add frontmatter with required fields
3. Write the prompt content
4. Submit PR

See [CLAUDE.md](CLAUDE.md) for contribution guidelines.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Static Site Generation

## License

MIT - use freely in personal and commercial projects.

## Author

[Blainer Costa](https://github.com/blainercosta)
