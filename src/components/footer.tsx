export default function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-xs">
            Wizard Agents by Blainer Costa
          </p>
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <a
              href="https://github.com/blainercosta"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors"
            >
              GitHub
            </a>
            <span className="text-text-subtle">·</span>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
