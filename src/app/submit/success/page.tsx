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
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-medium text-text-primary tracking-tight mb-3">
            Submitted for review
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
            Your agent is in the review queue. It will appear publicly as soon
            as it&apos;s approved.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/submit"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-md hover:bg-white/[0.05] hover:text-text-primary transition-colors"
            >
              Submit another
            </Link>
            <Link
              href="/"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-white bg-accent-brand hover:bg-accent-hover rounded-md transition-colors"
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
