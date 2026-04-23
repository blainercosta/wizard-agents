'use client';

import { Check, X } from 'lucide-react';
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
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-neon/15 text-accent-neon">
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            </span>
            <h2
              id="prompt-success-title"
              className="text-[13px] font-medium text-text-primary"
            >
              {t.modalCopiedLead}{' '}
              <span className="text-text-muted">{t.modalCopiedDescription}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xl font-medium text-text-primary tracking-tight mb-5">
          {t.modalHero}
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[13px] font-medium text-text-secondary mb-2">
              {t.modalMentorshipLabel}
            </p>
            <a
              href={MENTORIA_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track('mentoria_clicked', { slug, product: 'prompts' })
              }
              className="inline-flex w-full items-center justify-center h-11 px-5 text-[15px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors"
            >
              {t.modalMentorshipCta}
            </a>
          </div>

          <div>
            <p className="text-[13px] font-medium text-text-secondary mb-2">
              {t.modalCommunityLabel}
            </p>
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track('community_clicked', { slug, product: 'prompts' })
              }
              className="inline-flex w-full items-center justify-center h-11 px-5 text-[15px] font-medium text-text-secondary bg-white/[0.02] border border-border hover:bg-white/[0.05] hover:text-text-primary rounded-full transition-colors"
            >
              {t.modalCommunityCta}
            </a>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
