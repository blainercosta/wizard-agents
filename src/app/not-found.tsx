import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header, Footer } from '@/components';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-5xl md:text-6xl font-medium text-text-primary tracking-display mb-3">
            404
          </h1>
          <p className="text-[15px] text-text-secondary mb-8">
            Agent not found.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to list
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
