export default function Footer() {
  return (
    <footer className="border-t border-border bg-background-secondary mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs font-mono">
            Wizard Agents by Blainer Costa
          </p>
          <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
            <a
              href="https://github.com/blainercosta"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-lilac transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
