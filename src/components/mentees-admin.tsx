'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { addMentee, removeMentee, type Mentee } from '@/lib/supabase/mentees';

type Props = {
  initial: Mentee[];
};

export default function MenteesAdmin({ initial }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = username.trim().replace(/^@/, '');
    if (!value) {
      setError('Informe um username do GitHub.');
      return;
    }
    startTransition(async () => {
      try {
        await addMentee(supabase, value);
        setUsername('');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao adicionar.');
      }
    });
  }

  function handleRemove(value: string) {
    setError(null);
    startTransition(async () => {
      try {
        await removeMentee(supabase, value);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao remover.');
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex items-center gap-2 mb-6">
        <div className="flex items-center bg-white/[0.02] border border-border rounded-full pl-4 pr-1 h-10 flex-1 min-w-0">
          <span className="text-text-muted text-[13px] mr-0.5">@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="github-username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="bg-transparent outline-none text-[13px] text-text-primary placeholder:text-text-muted flex-1 min-w-0"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>
      </form>

      {error && (
        <p className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {initial.length === 0 ? (
        <div className="bg-white/[0.02] border border-border rounded-lg p-10 text-center">
          <p className="text-text-muted text-[15px]">
            Nenhum mentorado ainda. Adicione pelo username do GitHub.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {initial.map((m) => (
            <li
              key={m.username}
              className="flex items-center justify-between gap-3 bg-white/[0.02] border border-border rounded-lg px-4 py-3"
            >
              <a
                href={`https://github.com/${m.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-medium text-text-primary hover:text-accent-lilac transition-colors truncate"
              >
                @{m.username}
              </a>
              <button
                type="button"
                onClick={() => handleRemove(m.username)}
                disabled={pending}
                aria-label={`Remover @${m.username}`}
                className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
