import Link from 'next/link';

export default function PromptNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-medium text-text-primary tracking-tight mb-3">
            Prompt não encontrado
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-6">
            O link pode estar expirado ou o prompt ainda não foi publicado.
          </p>
          <Link
            href="/p"
            className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
          >
            Voltar pra home
          </Link>
        </div>
      </main>
    </div>
  );
}
