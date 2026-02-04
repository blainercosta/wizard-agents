'use client';

import { downloadFile } from '@/lib/utils';
import { DownloadIcon } from './pixel-icons';

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
      className={`inline-flex items-center gap-2 px-4 py-2 font-mono text-sm transition-all duration-150 ${className}`}
      aria-label={`Download ${filename}`}
    >
      <DownloadIcon className="w-4 h-4" />
      {label}
    </button>
  );
}
