'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, ExternalLink, Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  createPrompt,
  updatePrompt,
  uploadPromptImage,
} from '@/lib/supabase/prompts';
import { slugify, copyToClipboard } from '@/lib/utils';
import type { Prompt, PromptImage } from '@/types/prompt';

type Created = { slug: string; title: string };

type Props = {
  existing?: (Prompt & { id: string }) | null;
};

type PendingImage =
  | { kind: 'existing'; url: string; alt: string }
  | { kind: 'new'; file: File; previewUrl: string; alt: string };

export default function PromptForm({ existing }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [slugOverride, setSlugOverride] = useState('');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [howToUse, setHowToUse] = useState(existing?.howToUse ?? '');
  const [format, setFormat] = useState<'text' | 'json'>(existing?.format ?? 'text');
  const [tagsInput, setTagsInput] = useState(existing?.tags.join(', ') ?? '');
  const [images, setImages] = useState<PendingImage[]>(
    existing?.images.map((img) => ({
      kind: 'existing',
      url: img.url,
      alt: img.alt,
    })) ?? []
  );

  const slug = isEdit
    ? existing!.slug
    : slugOverride.trim()
      ? slugify(slugOverride)
      : slugify(title);

  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next: PendingImage[] = [];
    for (const f of Array.from(files)) {
      next.push({
        kind: 'new',
        file: f,
        previewUrl: URL.createObjectURL(f),
        alt: '',
      });
    }
    setImages((prev) => [...prev, ...next]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAlt(index: number, alt: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  function validate(): string | null {
    if (!title.trim()) return 'Title is required.';
    if (!slug) return 'Slug could not be derived — provide an override.';
    if (description.length > 280) return 'Description must be 280 chars or less.';
    if (!content.trim()) return 'Content is required.';
    if (format === 'json') {
      try {
        JSON.parse(content);
      } catch {
        return 'Content does not parse as JSON.';
      }
    }
    for (const img of images) {
      if (!img.alt.trim()) {
        return 'Every image needs alt text.';
      }
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedOk(false);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    startTransition(async () => {
      try {
        const finalImages: PromptImage[] = [];
        for (const img of images) {
          if (img.kind === 'existing') {
            finalImages.push({ url: img.url, alt: img.alt });
          } else {
            const url = await uploadPromptImage(supabase, slug, img.file);
            finalImages.push({ url, alt: img.alt });
          }
        }

        const payload = {
          title: title.trim(),
          description: description.trim(),
          content,
          format,
          images: finalImages,
          howToUse: howToUse.trim() || null,
          tags,
        };

        if (isEdit) {
          await updatePrompt(supabase, existing!.id, payload);
          setSavedOk(true);
          router.refresh();
          setTimeout(() => setSavedOk(false), 2500);
        } else {
          await createPrompt(supabase, { slug, ...payload });
          setCreated({ slug, title: title.trim() });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save');
      }
    });
  }

  if (created) {
    return <CreatedSuccess slug={created.slug} title={created.title} />;
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

      {!isEdit && (
        <Field label="Slug override (optional)">
          <input
            type="text"
            value={slugOverride}
            onChange={(e) => setSlugOverride(e.target.value)}
            className="input"
            placeholder={slugify(title) || 'auto-generated-from-title'}
          />
        </Field>
      )}

      {isEdit && (
        <Field label="Slug (read-only)" hint="Editing the slug would break existing links.">
          <input
            type="text"
            value={existing!.slug}
            readOnly
            className="input opacity-70 cursor-not-allowed"
          />
        </Field>
      )}

      <Field label="Description (optional)" hint={`${description.length}/280`}>
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
              : 'You are an expert in X...'
          }
        />
      </Field>

      <Field
        label="How to use (optional)"
        hint="Step-by-step guide shown below the prompt."
      >
        <textarea
          value={howToUse}
          onChange={(e) => setHowToUse(e.target.value)}
          rows={6}
          className="input resize-y"
          placeholder={`1. Abre o ChatGPT/Claude.\n2. Cola o prompt acima.\n3. Dá o contexto específico.`}
        />
      </Field>

      <Field label="Tags (optional)" hint="Comma separated">
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="input"
          placeholder="writing, translation"
        />
      </Field>

      <Field label="Reference images (optional)">
        <div className="flex items-start gap-3 flex-wrap">
          <label className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            {images.length > 0 ? 'Add more' : 'Choose files'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              multiple
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
              className="sr-only"
            />
          </label>
          {images.length > 0 && (
            <span className="text-[12px] text-text-muted self-center">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </span>
          )}
        </div>
        {images.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/[0.02] border border-border rounded-lg p-3"
              >
                <div className="shrink-0 w-24 h-24 overflow-hidden rounded-md border border-border-subtle">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.kind === 'existing' ? img.url : img.previewUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-medium text-text-muted mb-1">
                    Alt text
                  </label>
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => updateAlt(i, e.target.value)}
                    className="input"
                    placeholder="What the image shows"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="Remove image"
                  className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Field>

      {error && (
        <div className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center gap-4 pt-2 flex-wrap">
        <p className="text-[12px] text-text-muted min-h-[20px]">
          {savedOk && (
            <span className="inline-flex items-center gap-1.5 text-accent-neon">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60"
        >
          {pending
            ? isEdit
              ? 'Saving…'
              : 'Publishing…'
            : isEdit
              ? 'Save changes'
              : 'Publish prompt'}
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

function CreatedSuccess({ slug, title }: Created) {
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
