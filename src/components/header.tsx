import Link from 'next/link';
import WizardLogo from './wizard-logo';
import UserMenu from './user-menu';
import AdminNotificationBell from './admin-notification-bell';
import { createClient } from '@/lib/supabase/server';
import {
  isCurrentUserAdmin,
  getPendingCommunityAgents,
} from '@/lib/supabase/community';

export default async function Header() {
  const supabase = createClient();
  const [
    {
      data: { user },
    },
    isAdmin,
  ] = await Promise.all([supabase.auth.getUser(), isCurrentUserAdmin(supabase)]);

  const authUser = user
    ? {
        username:
          (user.user_metadata?.user_name as string | undefined) ??
          (user.user_metadata?.preferred_username as string | undefined) ??
          'user',
        avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      }
    : null;

  const pendingForAdmin = isAdmin
    ? (await getPendingCommunityAgents(supabase)).map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        authorUsername: a.author.username,
        createdAt: a.created,
      }))
    : [];

  return (
    <header className="sticky top-0 z-40 bg-background-secondary/80 backdrop-blur border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <WizardLogo className="w-7 h-7 text-text-primary" />
          <span className="text-[13px] font-medium text-text-primary tracking-tight">
            Wizard Agents
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 h-8 flex items-center text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md"
          >
            Agents
          </Link>
          <Link
            href="/leaderboard"
            className="px-3 h-8 hidden sm:flex items-center text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md"
          >
            Leaderboard
          </Link>
          <Link
            href="/submit"
            className="px-3 h-8 flex items-center text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md"
          >
            Submit
          </Link>

          <div className="ml-2 flex items-center gap-1">
            {isAdmin && <AdminNotificationBell pendingAgents={pendingForAdmin} />}
            <UserMenu user={authUser} />
          </div>
        </nav>
      </div>
    </header>
  );
}
