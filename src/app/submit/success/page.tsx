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
            We review every agent before it goes public — usually within 48
            hours. You can track the status on your submissions page.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/submissions"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-white bg-accent-brand hover:bg-accent-hover rounded-full transition-colors"
            >
              View your submissions
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
            >
              Submit another
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
