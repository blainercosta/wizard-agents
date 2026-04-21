import SignInWithGithubButton from './sign-in-github-button';

export default function SignInGate({ next = '/' }: { next?: string }) {
  return (
    <div
      aria-hidden={false}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30"
    >
      <div className="h-32 bg-gradient-to-b from-transparent to-background-primary" />
      <div className="bg-background-primary pointer-events-auto">
        <div className="max-w-6xl mx-auto px-6 pt-2 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white/[0.02] border border-border rounded-xl px-6 py-5">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-text-primary mb-1">
                Sign in to browse the full library
              </p>
              <p className="text-[13px] text-text-muted">
                Copy prompts, upvote, save favorites. Free with GitHub.
              </p>
            </div>
            <SignInWithGithubButton next={next} />
          </div>
        </div>
      </div>
    </div>
  );
}
