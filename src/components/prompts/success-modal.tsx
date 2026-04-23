'use client';

import { Check } from 'lucide-react';
import { Dialog } from './dialog';
import { track } from '@/lib/analytics';
import { COMMUNITY_URL, MENTORIA_URL, type I18n } from '@/lib/i18n';

type Props = {
  open: boolean;
  onClose: () => void;
  slug: string;
  t: I18n;
};

export default function SuccessModal({ open, onClose, slug, t }: Props) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="prompt-success-title">
      <div className="p-6 text-center">
        <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary mb-4">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-neon/15 text-accent-neon">
            <Check className="w-3 h-3" strokeWidth={2.5} />
          </span>
          {t.modalCopiedLine}
        </p>

        <h2
          id="prompt-success-title"
          className="text-2xl font-medium text-text-primary tracking-tight mb-6"
        >
          {t.modalHero}
        </h2>

        <div className="flex flex-col gap-3">
          <a
            href={MENTORIA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track('mentoria_clicked', { slug, product: 'prompts' })
            }
            className="inline-flex w-full items-center justify-center h-12 px-6 text-base font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors"
          >
            {t.modalMentorshipCta}
          </a>
          <a
            href={COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track('community_clicked', { slug, product: 'prompts' })
            }
            className="inline-flex w-full items-center justify-center h-12 px-6 text-base font-medium text-text-secondary bg-white/[0.02] border border-border hover:bg-white/[0.05] hover:text-text-primary rounded-full transition-colors"
          >
            {t.modalCommunityCta}
          </a>
        </div>
      </div>
    </Dialog>
  );
}
