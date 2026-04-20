import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components';
import ModerationCard from '@/components/moderation-card';
import { createClient } from '@/lib/supabase/server';
import {
  getPendingCommunityAgents,
  isCurrentUserAdmin,
} from '@/lib/supabase/community';

export const metadata = {
  title: 'Moderation queue - Wizard Agents',
};

export default async function AdminPage() {
  const supabase = createClient();
  const isAdmin = await isCurrentUserAdmin(supabase);

  if (!isAdmin) {
    notFound();
  }

  const pending = await getPendingCommunityAgents(supabase);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to list
          </Link>

          <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight mb-3">
            Moderation queue
          </h1>
          <p className="text-[15px] text-text-secondary mb-10">
            {pending.length} agent{pending.length !== 1 ? 's' : ''} waiting for review
          </p>

          {pending.length === 0 ? (
            <div className="bg-white/[0.02] border border-border rounded-lg p-10 text-center">
              <p className="text-text-muted text-[15px]">
                No pending submissions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((agent) => (
                <ModerationCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
