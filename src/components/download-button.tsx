'use client';

import { Download } from 'lucide-react';
import { downloadFile } from '@/lib/utils';

interface DownloadButtonProps {
  content: string;
  filename: string;
  className?: string;
  label?: string;
}

export default function DownloadButton({
  content,
  filename,
  className = '',
  label = 'Download .md',
}: DownloadButtonProps) {
  const handleDownload = () => {
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
