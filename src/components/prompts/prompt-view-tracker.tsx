'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export default function PromptViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track('prompt_viewed', { slug, product: 'prompts' });
  }, [slug]);

  return null;
}
