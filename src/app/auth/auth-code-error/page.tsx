import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="font-pixel text-lg text-text-primary mb-4">
        Authentication failed
      </h1>
      <p className="text-text-secondary mb-8">
        Something went wrong during sign-in. Please try again.
      </p>
      <Link
        href="/"
        className="inline-block border-2 border-border px-4 py-2 font-mono text-sm text-text-primary hover:border-accent-neon transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
