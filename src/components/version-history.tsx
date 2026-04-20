import { History } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { CommunityAgent } from '@/types/agent';
import type { AgentVersion } from '@/lib/supabase/versions';

type Props = {
  agent: CommunityAgent;
  olderVersions: AgentVersion[];
};

export default function VersionHistory({ agent, olderVersions }: Props) {
  const hasHistory = olderVersions.length > 0;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-text-muted" strokeWidth={2} />
        <h2 className="text-[15px] font-semibold text-text-primary tracking-tight">
          Version history
        </h2>
      </div>

      <ol className="space-y-2">
        <li>
          <div className="flex items-center gap-3 bg-white/[0.02] border border-border rounded-lg px-4 py-3">
            <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-hover bg-accent-brand/15 border border-accent-brand/40 rounded-full shrink-0">
              Current
            </span>
            <span className="text-[13px] font-medium text-text-primary tabular-nums">
              v{agent.version}
            </span>
            <span className="text-[13px] text-text-muted ml-auto">
              Updated {formatDate(agent.updated)}
            </span>
          </div>
        </li>

        {olderVersions.map((v) => (
          <li key={v.id}>
            <div className="flex items-center gap-3 bg-white/[0.02] border border-border-subtle rounded-lg px-4 py-3 opacity-70">
              <span className="text-[13px] font-medium text-text-secondary tabular-nums">
                v{v.version}
              </span>
              {v.description && (
                <span className="text-[13px] text-text-muted truncate">
                  {v.description}
                </span>
              )}
              <span className="text-[13px] text-text-muted ml-auto">
                {formatDate(v.archivedAt)}
              </span>
            </div>
          </li>
        ))}
      </ol>

      {!hasHistory && (
        <p className="text-[13px] text-text-muted mt-3">
          No older versions yet. Changes from the author will appear here.
        </p>
      )}
    </section>
  );
}
