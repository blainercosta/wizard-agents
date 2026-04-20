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
    <header className="sticky top-0 z-40 bg-background-secondary/80 backdrop-blur border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <WizardLogo className="w-7 h-7" />
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
            href="/submit"
            className="px-3 h-8 flex items-center text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md"
          >
            Submit
          </Link>
          {user && (
            <>
              <Link
                href="/saved"
                className="px-3 h-8 hidden md:flex items-center text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md"
              >
                Saved
              </Link>
              <Link
                href="/submissions"
                className="px-3 h-8 hidden md:flex items-center text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md"
              >
                Your submissions
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 h-8 flex items-center text-[13px] font-medium text-accent-lilac hover:text-accent-hover transition-colors rounded-md"
            >
              Admin
            </Link>
          )}
          <Link
            href="https://github.com/blainercosta/repo-wizard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 h-8 hidden sm:flex items-center text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md"
          >
            GitHub
          </Link>
          <div className="ml-2">
            <AuthButtons user={authUser} />
          </div>
        </nav>
      </div>
    </header>
  );
}
