import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header, Footer } from '@/components';
import { createClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/supabase/community';
import PromptForm from '@/components/prompts/prompt-form';

export const metadata = {
  title: 'New prompt · Admin',
};

export default async function AdminNewPromptPage() {
  const supabase = createClient();
  const isAdmin = await isCurrentUserAdmin(supabase);
  if (!isAdmin) notFound();

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

          <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight mb-2">
            New prompt
          </h1>
          <p className="text-[13px] text-text-muted mb-8">
            Title and content publish immediately. You can share the URL right
            after saving.
          </p>

          <PromptForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
