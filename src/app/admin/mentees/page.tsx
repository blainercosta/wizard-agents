import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header, Footer } from '@/components';
import { createClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/supabase/community';
import { listMentees } from '@/lib/supabase/mentees';
import MenteesAdmin from '@/components/mentees-admin';

export const metadata = {
  title: 'Mentees · Admin',
};

export default async function AdminMenteesPage() {
  const supabase = createClient();
  const isAdmin = await isCurrentUserAdmin(supabase);
  if (!isAdmin) notFound();

  const mentees = await listMentees(supabase);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Link
            href="/admin/prompts"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Prompts
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight mb-2">
              Mentorados
            </h1>
            <p className="text-[13px] text-text-muted">
              Quem está aqui consegue abrir prompts marcados como{' '}
              <span className="text-accent-lilac">Exclusivo mentorados</span>.
              Adicione pelo username do GitHub.
            </p>
          </div>

          <MenteesAdmin initial={mentees} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
