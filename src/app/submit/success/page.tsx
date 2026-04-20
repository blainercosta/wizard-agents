import Link from 'next/link';
import { Header, Footer } from '@/components';

export const metadata = {
  title: 'Submitted - Wizard Agents',
};

export default function SubmitSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="font-pixel text-base text-text-primary mb-4 leading-relaxed">
            SUBMITTED
          </h1>
          <p className="text-text-secondary font-mono text-sm mb-8">
            Your agent is in the review queue. You&apos;ll see it listed
            publicly as soon as it&apos;s approved.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/submit"
              className="inline-block border-2 border-border px-4 py-2 font-mono text-sm text-text-primary hover:border-accent-neon transition-colors"
            >
              Submit another
            </Link>
            <Link
              href="/"
              className="inline-block bg-accent-lilac text-white px-4 py-2 font-mono text-sm hover:opacity-90 transition-opacity"
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
