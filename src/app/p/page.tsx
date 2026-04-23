import SocialLinks from '@/components/prompts/social-links';

export const metadata = {
  title: 'prompts.blainercosta',
  description:
    'Prompts prontos pra usar em IA, feitos por @blainercosta. Clique, copia, cola.',
  openGraph: {
    title: 'prompts.blainercosta',
    description:
      'Prompts prontos pra usar em IA, feitos por @blainercosta.',
    url: 'https://prompts.blainercosta.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'prompts.blainercosta',
    description:
      'Prompts prontos pra usar em IA, feitos por @blainercosta.',
  },
  alternates: {
    canonical: 'https://prompts.blainercosta.com',
  },
};

export default function PromptsLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <h1 className="text-4xl md:text-5xl font-medium text-text-primary tracking-display leading-tight mb-6">
            Prompts prontos,
            <br />
            sem enrolação.
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-5">
            Coleção de prompts que eu uso no dia-a-dia pra cortar caminho com
            IA — escrita, código, análise, criação. Cada um vive em uma URL
            única. Clique, copia, cola.
          </p>
          <p className="text-lg text-text-secondary leading-relaxed mb-10">
            A descoberta acontece fora daqui. Se você chegou por um link, o
            prompt está na página de destino.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <SocialLinks />
            <a
              href="https://blainercosta.com/comunidade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors ml-1"
            >
              Entrar na comunidade
            </a>
            <a
              href="https://blainercosta.com/mentoria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border hover:bg-white/[0.05] hover:text-text-primary rounded-full transition-colors"
            >
              Mentoria
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
