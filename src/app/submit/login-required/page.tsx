import Link from 'next/link';
import { Header, Footer } from '@/components';

export const metadata = {
  title: 'Login required - Wizard Agents',
};

export default function LoginRequiredPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="font-pixel text-base text-text-primary mb-4 leading-relaxed">
            LOGIN_REQUIRED
          </h1>
          <p className="text-text-secondary font-mono text-sm mb-8">
            Sign in with GitHub to submit an agent. We use your GitHub profile
            for attribution only.
          </p>
          <Link
            href="/"
            className="inline-block border-2 border-border px-4 py-2 font-mono text-sm text-text-primary hover:border-accent-neon transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
