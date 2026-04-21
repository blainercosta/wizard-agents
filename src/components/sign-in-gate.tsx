import SignInWithGithubButton from './sign-in-github-button';

export default function SignInGate({ next = '/' }: { next?: string }) {
  return (
    <div
      aria-hidden={false}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30"
    >
      <div className="h-72 bg-gradient-to-b from-transparent to-background-primary" />
      <div className="bg-background-primary pointer-events-auto">
        <div className="max-w-6xl mx-auto px-6 pt-1 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 bg-white/[0.02] border border-border rounded-xl px-5 py-3">
            <div className="min-w-0 sm:text-right">
              <p className="text-[13px] font-medium text-text-primary">
                Sign in to browse the full library
              </p>
              <p className="text-[12px] text-text-muted">
                Copy, upvote, save. Free with GitHub.
              </p>
            </div>
            <SignInWithGithubButton next={next} />
          </div>
        </div>
      </div>
    </div>
  );
}
