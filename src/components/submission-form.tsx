'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { CATEGORIES, type Category } from '@/types/agent';

export default function SubmissionForm() {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('development');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('1.0');

  const slug = slugify(name);
  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  function validate(): string | null {
    if (!name.trim()) return 'Name is required.';
    if (!slug) return 'Name must contain valid characters for a slug.';
    if (!description.trim()) return 'Description is required.';
    if (description.length > 280)
      return 'Description must be 280 characters or less.';
    if (!content.trim()) return 'Prompt content is required.';
    if (content.length < 50)
      return 'Prompt content must be at least 50 characters.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    startTransition(async () => {
      const { data, error: rpcError } = await supabase.rpc(
        'submit_community_agent',
        {
          p_slug: slug,
          p_name: name.trim(),
          p_description: description.trim(),
          p_category: category,
          p_tags: tags,
          p_content: content,
          p_version: version || '1.0',
        }
      );

      if (rpcError) {
        if (rpcError.code === '23505') {
          setError('Slug already in use. Try a slightly different name.');
        } else {
          setError(rpcError.message);
        }
        return;
      }

      router.push(`/submit/success?id=${data}`);
    });
  }

  const selectableCategories = CATEGORIES.filter((c) => c.value !== 'all');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Name" hint={slug ? `Slug: ${slug}` : undefined}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Database Expert"
          maxLength={80}
          className="w-full bg-background-tertiary border-2 border-border px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-lilac"
        />
      </Field>

      <Field
        label="Description"
        hint={`${description.length}/280`}
      >
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short sentence describing what the agent does."
          maxLength={280}
          className="w-full bg-background-tertiary border-2 border-border px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-lilac"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full bg-background-tertiary border-2 border-border px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-lilac"
          >
            {selectableCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Version">
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0"
            maxLength={10}
            className="w-full bg-background-tertiary border-2 border-border px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-lilac"
          />
        </Field>
      </div>

      <Field label="Tags" hint="Comma-separated, up to 8">
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="postgres, sql, migration"
          className="w-full bg-background-tertiary border-2 border-border px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-lilac"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.slice(0, 8).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 border border-accent-lilac text-accent-lilac text-xs font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Field>

      <Field
        label="Prompt content"
        hint="Markdown. Do NOT include YAML frontmatter (---) — we add that on output."
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="# Database Expert&#10;&#10;You are a senior database engineer..."
          rows={16}
          className="w-full bg-background-tertiary border-2 border-border px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus:border-accent-lilac"
        />
      </Field>

      {error && (
        <div className="border-2 border-red-500 bg-red-500/10 text-red-400 px-4 py-3 font-mono text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 bg-accent-lilac text-white font-bold font-mono text-sm hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {pending ? 'Submitting...' : 'Submit for review'}
        </button>
        <p className="text-text-muted font-mono text-xs">
          Your agent will be reviewed before appearing publicly.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="font-mono text-xs text-text-primary">{label}</label>
        {hint && <span className="font-mono text-xs text-text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
