'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { setAgentAudience } from '@/lib/supabase/community';
import type { AgentAudience } from '@/types/agent';

type Props = {
  agentId: string;
  audience: AgentAudience;
};

export default function AgentAudienceToggle({ agentId, audience }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState<AgentAudience>(audience);
  const [error, setError] = useState(false);

  const isExclusive = current === 'mentees';
  const next: AgentAudience = isExclusive ? 'public' : 'mentees';

  function toggle() {
    setError(false);
    startTransition(async () => {
      try {
        await setAgentAudience(supabase, agentId, next);
        setCurrent(next);
        router.refresh();
      } catch {
        setError(true);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={
        isExclusive
          ? 'Tornar público'
          : 'Tornar exclusivo pra mentorados'
      }
      className={`inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium rounded-full border transition-colors disabled:opacity-60 ${
        isExclusive
          ? 'text-accent-lilac bg-accent-lilac/10 border-accent-lilac/30 hover:bg-accent-lilac/20'
          : 'text-text-secondary bg-white/[0.02] border-border hover:bg-white/[0.05] hover:text-text-primary'
      }`}
    >
      {isExclusive ? (
        <Lock className="w-3 h-3" />
      ) : (
        <Globe className="w-3 h-3" />
      )}
      {error
        ? 'Erro, tentar de novo'
        : isExclusive
          ? 'Exclusivo mentorados'
          : 'Público'}
    </button>
  );
}
