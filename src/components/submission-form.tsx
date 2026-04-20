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
          setError(
            `An agent named "${name.trim()}" already exists. Try a different name or add a qualifier (e.g. "${name.trim()} Pro").`
          );
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Name" hint={slug ? `/${slug}` : undefined}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Database Expert"
          maxLength={80}
          className="input"
        />
      </Field>

      <Field label="Description" hint={`${description.length}/280`}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short sentence describing what the agent does."
          maxLength={280}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="input"
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
            className="input"
          />
        </Field>
      </div>

      <Field label="Tags" hint="Comma-separated, up to 8">
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="postgres, sql, migration"
          className="input"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.slice(0, 8).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center h-5 px-2 text-[11px] font-medium text-text-secondary bg-white/[0.04] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Field>

      <Field
        label="Prompt"
        hint="Write in Markdown. The YAML header is added automatically."
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`# Database Expert\n\nYou are a senior database engineer...`}
          rows={16}
          className="input font-mono text-xs"
        />
      </Field>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-white bg-accent-brand hover:bg-accent-hover rounded-md transition-colors disabled:opacity-60"
        >
          {pending ? 'Submitting...' : 'Submit for review'}
        </button>
        <p className="text-text-muted text-xs">
          We review every agent before it goes public. Usually within 48 hours.
        </p>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 13px;
          color: #f7f8f8;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.input::placeholder) {
          color: #62666d;
        }
        :global(.input:focus) {
          border-color: #7170ff;
          box-shadow: 0 0 0 1px rgba(113, 112, 255, 0.25);
        }
      `}</style>
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
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-[13px] font-medium text-text-primary">{label}</label>
        {hint && <span className="text-xs text-text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
