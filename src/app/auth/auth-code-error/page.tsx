import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-medium text-text-primary tracking-tight mb-3">
          Authentication failed
        </h1>
        <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
          Something went wrong during sign-in. Please try again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-md hover:bg-white/[0.05] hover:text-text-primary transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
