import Link from 'next/link';
import { Header, Footer, SignInWithGithubButton } from '@/components';

export const metadata = {
  title: 'Login required - Wizard Agents',
};

export default function LoginRequiredPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-medium text-text-primary tracking-tight mb-3">
            Sign in to submit
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
            Use your GitHub account to submit an agent. Your profile is used
            for attribution only.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <SignInWithGithubButton next="/submit" />
            <Link
              href="/"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
