import Link from 'next/link';
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
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-lilac transition-colors mb-8 font-mono text-sm"
          >
            ← Back to list
          </Link>

          <h1 className="font-pixel text-lg md:text-xl text-text-primary leading-relaxed mb-3">
            MODERATION_QUEUE
          </h1>
          <p className="text-text-secondary font-mono text-sm mb-8">
            {pending.length} agent{pending.length !== 1 ? 's' : ''} waiting for review.
          </p>

          {pending.length === 0 ? (
            <div className="border-2 border-border bg-background-secondary p-8 text-center">
              <p className="text-text-muted font-mono text-sm">
                No pending submissions.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
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
