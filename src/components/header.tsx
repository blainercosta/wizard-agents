import Link from 'next/link';
import WizardLogo from './wizard-logo';

export default function Header() {
  return (
    <header className="border-b-2 border-border bg-background-secondary">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <WizardLogo className="w-10 h-10" />
          <span className="font-pixel text-xs text-text-primary group-hover:text-accent-lilac transition-colors">
            WIZARD AGENTS
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-text-secondary hover:text-accent-lilac transition-colors text-sm font-mono"
          >
            Agents
          </Link>
          <Link
            href="https://github.com/blainercosta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent-lilac transition-colors text-sm font-mono"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  );
}
