import Link from 'next/link';
import WizardLogo from './wizard-logo';
import AuthButtons from './auth-buttons';
import { createClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/supabase/community';

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

  return (
    <header className="border-b-2 border-border bg-background-secondary">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <WizardLogo className="w-10 h-10" />
          <span className="font-pixel text-xs text-text-primary group-hover:text-accent-lilac transition-colors">
            WIZARD AGENTS
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-text-secondary hover:text-accent-lilac transition-colors text-sm font-mono"
          >
            Agents
          </Link>
          <Link
            href="/submit"
            className="text-text-secondary hover:text-accent-lilac transition-colors text-sm font-mono"
          >
            Submit
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-accent-neon hover:text-accent-lilac transition-colors text-sm font-mono"
            >
              Admin
            </Link>
          )}
          <Link
            href="https://github.com/blainercosta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent-lilac transition-colors text-sm font-mono hidden sm:inline"
          >
            GitHub
          </Link>
          <AuthButtons user={authUser} />
        </nav>
      </div>
    </header>
  );
}
