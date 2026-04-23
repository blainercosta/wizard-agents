import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { PROMPT_SLUGS } from '@/lib/prompt-slugs';

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase();

  if (host.startsWith('prompts.')) {
    const { pathname } = request.nextUrl;

    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/p';
      return NextResponse.rewrite(url);
    }

    // Pretty URL: /<slug> → /p/<slug> ONLY for known prompt slugs.
    // Keeps wizards paths reachable on prompts host (briefing: isolamento por UX).
    const match = /^\/([^/]+)$/.exec(pathname);
    if (match) {
      const slug = match[1];
      if (PROMPT_SLUGS.has(slug)) {
        const url = request.nextUrl.clone();
        url.pathname = `/p/${slug}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
