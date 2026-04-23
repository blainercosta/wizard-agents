'use client';

import { useState, useTransition } from 'react';
import { Check, Copy, ExternalLink, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createPrompt, uploadPromptImage } from '@/lib/supabase/prompts';
import { slugify, copyToClipboard } from '@/lib/utils';

type Created = { slug: string; title: string };

export default function PromptCreateForm() {
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);

  const [title, setTitle] = useState('');
  const [slugOverride, setSlugOverride] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<'text' | 'json'>('text');
  const [tagsInput, setTagsInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState('');

  const slug = slugOverride.trim() ? slugify(slugOverride) : slugify(title);
  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const imagePreview = imageFile ? URL.createObjectURL(imageFile) : null;

  function validate(): string | null {
    if (!title.trim()) return 'Title is required.';
    if (!slug) return 'Slug could not be derived — provide an override.';
    if (!description.trim()) return 'Description is required.';
    if (description.length > 280) return 'Description must be 280 chars or less.';
    if (!content.trim()) return 'Content is required.';
    if (format === 'json') {
      try {
        JSON.parse(content);
      } catch {
        return 'Content does not parse as JSON.';
      }
    }
    if (imageFile && !imageAlt.trim()) {
      return 'Alt text required when an image is provided.';
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    startTransition(async () => {
      try {
        let imageUrl: string | null = null;
        if (imageFile) {
          imageUrl = await uploadPromptImage(supabase, slug, imageFile);
        }

        await createPrompt(supabase, {
          slug,
          title: title.trim(),
          description: description.trim(),
          content,
          format,
          referenceImageUrl: imageUrl,
          referenceImageAlt: imageAlt.trim() || null,
          tags,
        });

        setCreated({ slug, title: title.trim() });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create');
      }
    });
  }

  if (created) {
    return <Success slug={created.slug} title={created.title} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Title" hint={slug ? `URL: /${slug}` : undefined}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="How I use Claude for translation"
        />
      </Field>

      <Field label="Slug override (optional)">
        <input
          type="text"
          value={slugOverride}
          onChange={(e) => setSlugOverride(e.target.value)}
          className="input"
          placeholder={slugify(title) || 'auto-generated-from-title'}
        />
      </Field>

      <Field label="Description" hint={`${description.length}/280`}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={280}
          className="input resize-none"
          placeholder="Short description used in the card and OG."
        />
      </Field>

      <Field label="Format">
        <div className="flex gap-2">
          {(['text', 'json'] as const).map((f) => (
            <label
              key={f}
              className={`inline-flex items-center h-8 px-3 text-[13px] font-medium rounded-full border transition-colors cursor-pointer ${
                format === f
                  ? 'bg-white/[0.05] border-border-solid text-text-primary'
                  : 'bg-white/[0.02] border-border text-text-secondary hover:bg-white/[0.05]'
              }`}
            >
              <input
                type="radio"
                name="format"
                value={f}
                checked={format === f}
                onChange={() => setFormat(f)}
                className="sr-only"
              />
              {f.toUpperCase()}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Content">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="input font-mono resize-y"
          placeholder={
            format === 'json'
              ? '{ "system": "..." }'
              : 'Você é um especialista em X...'
          }
        />
      </Field>

      <Field label="Tags" hint="Comma separated">
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="input"
          placeholder="writing, translation"
        />
      </Field>

      <Field label="Reference image (optional)">
        <div className="flex items-start gap-3 flex-wrap">
          <label className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            {imageFile ? 'Change' : 'Choose file'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
          {imageFile && (
            <span className="text-[12px] text-text-muted self-center">
              {imageFile.name}
            </span>
          )}
        </div>
        {imagePreview && (
          <div className="mt-3 max-w-[360px] border border-border rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="" className="w-full h-auto" />
          </div>
        )}
      </Field>

      {imageFile && (
        <Field label="Image alt text">
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            className="input"
            placeholder="What the image shows"
          />
        </Field>
      )}

      {error && (
        <div className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60"
        >
          {pending ? 'Publishing…' : 'Publish prompt'}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 13px;
          color: #f7f8f8;
          transition: border-color 0.15s;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #7170ff;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
        }
        :global(.input::placeholder) {
          color: #8a8f98;
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
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <label className="block text-[12px] font-medium text-text-secondary">
          {label}
        </label>
        {hint && <span className="text-[11px] text-text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Success({ slug, title }: Created) {
  const url = `https://prompts.blainercosta.com/${slug}`;
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-white/[0.02] border border-border rounded-lg p-6">
      <h2 className="text-[15px] font-medium text-text-primary mb-1">
        Publicado
      </h2>
      <p className="text-[13px] text-text-muted mb-4">
        {title} já está no ar.
      </p>
      <div className="flex items-center gap-2 bg-background-primary border border-border rounded-full pl-4 pr-1.5 py-1.5 mb-4">
        <span className="text-[13px] text-text-secondary font-mono truncate min-w-0 flex-1">
          {url}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 h-7 px-3 text-[12px] font-medium text-text-primary bg-white/[0.05] border border-border-solid rounded-full hover:bg-white/[0.08] transition-colors shrink-0"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir
        </a>
        <a
          href="/admin/prompts"
          className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
        >
          Ver todos
        </a>
        <a
          href="/admin/prompts/new"
          className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
        >
          Criar outro
        </a>
      </div>
    </div>
  );
}
