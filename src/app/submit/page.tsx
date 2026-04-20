import Link from 'next/link';
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
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-lilac transition-colors mb-8 font-mono text-sm"
          >
            ← Back to list
          </Link>

          <h1 className="font-pixel text-lg md:text-xl text-text-primary leading-relaxed mb-3">
            SUBMIT_AGENT
          </h1>
          <p className="text-text-secondary font-mono text-sm mb-8">
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
