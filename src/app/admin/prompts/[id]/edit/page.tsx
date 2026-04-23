import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Header, Footer } from '@/components';
import { createClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/supabase/community';
import { getPromptByIdForAdmin } from '@/lib/supabase/prompts';
import PromptForm from '@/components/prompts/prompt-form';

export const metadata = {
  title: 'Edit prompt · Admin',
};

type Params = { params: { id: string } };

export default async function AdminEditPromptPage({ params }: Params) {
  const supabase = createClient();
  const isAdmin = await isCurrentUserAdmin(supabase);
  if (!isAdmin) notFound();

  const prompt = await getPromptByIdForAdmin(supabase, params.id);
  if (!prompt) notFound();

  const url = `https://prompts.blainercosta.com/${prompt.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Link
            href="/admin/prompts"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All prompts
          </Link>

          <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight">
              Edit prompt
            </h1>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-7 px-3 text-[12px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open live
            </a>
          </div>
          <p className="text-[13px] text-text-muted mb-8">
            Changes take up to 60 seconds to appear on the public page (ISR).
          </p>

          <PromptForm existing={prompt} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
