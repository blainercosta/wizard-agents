import type { Prompt } from '@/types/prompt';
import exemploPrompt from '../../content/prompts/exemplo-prompt.json';

function validate(raw: unknown, key: string): Prompt {
  const p = raw as Prompt;
  if (!p.slug || !p.title || !p.description || !p.content || !p.format) {
    throw new Error(`Prompt ${key} is missing required fields`);
  }
  if (!p.referenceImage?.src || !p.referenceImage?.alt) {
    throw new Error(`Prompt ${key} is missing referenceImage`);
  }
  if (p.format === 'json') {
    try {
      JSON.parse(p.content);
    } catch {
      throw new Error(`Prompt ${key} declared format="json" but content is not valid JSON`);
    }
  }
  return p;
}

const ALL: Prompt[] = [validate(exemploPrompt, 'exemplo-prompt')];

const BY_SLUG = new Map(ALL.map((p) => [p.slug, p]));

export function getAllPrompts(): Prompt[] {
  return ALL;
}

export function getAllPromptSlugs(): string[] {
  return ALL.map((p) => p.slug);
}

export function getPromptBySlug(slug: string): Prompt | null {
  return BY_SLUG.get(slug) ?? null;
}
