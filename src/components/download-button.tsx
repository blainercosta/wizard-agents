'use client';

import { Download } from 'lucide-react';
import { downloadFile } from '@/lib/utils';
import { track } from '@/lib/analytics';

interface DownloadButtonProps {
  content: string;
  filename: string;
  className?: string;
  label?: string;
  trackAgent?: { id: string; slug: string; source: 'grid' | 'detail' };
}

export default function DownloadButton({
  content,
  filename,
  className = '',
  label = 'Download .md',
  trackAgent,
}: DownloadButtonProps) {
  const handleDownload = () => {
    if (trackAgent) {
      track('agent_downloaded', {
        agent_id: trackAgent.id,
        agent_slug: trackAgent.slug,
        source: trackAgent.source,
      });
    }
    downloadFile(content, filename);
  };

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-2 text-[13px] font-medium transition-colors ${className}`}
      aria-label={`Download ${filename}`}
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}
