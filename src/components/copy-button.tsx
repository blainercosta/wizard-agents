'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';
import { CopyIcon, CheckIcon } from './pixel-icons';

interface CopyButtonProps {
  content: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
}

export default function CopyButton({
  content,
  className = '',
  label = 'Copy',
  copiedLabel = 'Copied',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 font-mono text-sm transition-all duration-150 ${className}`}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
      {copied ? copiedLabel : label}
    </button>
  );
}
