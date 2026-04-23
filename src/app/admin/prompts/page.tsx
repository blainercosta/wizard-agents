import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Header, Footer } from '@/components';
import { createClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/supabase/community';
import { getAllPromptsForAdmin } from '@/lib/supabase/prompts';
import PromptAdminCard from '@/components/prompts/admin-card';

export const metadata = {
  title: 'Prompts · Admin',
};

export default async function AdminPromptsPage() {
  const supabase = createClient();
  const isAdmin = await isCurrentUserAdmin(supabase);
  if (!isAdmin) notFound();

  const prompts = await getAllPromptsForAdmin(supabase);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Moderation queue
          </Link>

          <div className="flex items-baseline justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight mb-2">
                Prompts
              </h1>
              <p className="text-[13px] text-text-muted">
                Manage prompts that live on prompts.blainercosta.com.
              </p>
            </div>
            <Link
              href="/admin/prompts/new"
              className="inline-flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> New prompt
            </Link>
          </div>

          {prompts.length === 0 ? (
            <div className="bg-white/[0.02] border border-border rounded-lg p-10 text-center">
              <p className="text-text-primary text-[15px] mb-1">
                No prompts yet.
              </p>
              <p className="text-text-muted text-[13px]">
                Create your first and share the URL.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {prompts.map((p) => (
                <PromptAdminCard key={p.id} prompt={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
