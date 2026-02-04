import Link from 'next/link';
import { Header, Footer, ArrowLeftIcon } from '@/components';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-pixel text-xl md:text-2xl text-text-primary mb-4">
            404
          </h1>
          <p className="text-text-secondary font-mono mb-8">
            Agent not found.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-accent-lilac hover:text-accent-neon transition-colors font-mono text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to list
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
