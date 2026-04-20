import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Header, Footer } from '@/components';
import SubmissionForm from '@/components/submission-form';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Submit an agent - Wizard Agents',
  description: 'Share your own Claude Code agent with the community.',
};

export default async function SubmitPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/submit/login-required');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to list
          </Link>

          <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight mb-3">
            Submit an agent
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-10">
            Share your prompt with the community. Agents go through a short
            review before appearing publicly.
          </p>

          <SubmissionForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
