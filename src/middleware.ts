import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const WIZARDS_RESERVED = new Set([
  'admin',
  'agent',
  'api',
  'auth',
  'category',
  'community',
  'leaderboard',
  'p',
  'saved',
  'sitemap.xml',
  'robots.txt',
  'submissions',
  'submit',
  'u',
]);

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase();

  if (host.startsWith('prompts.')) {
    const { pathname } = request.nextUrl;

    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/p';
      return NextResponse.rewrite(url);
    }

    // Rewrite pretty URL /<slug> → /p/<slug> on prompts host, except for
    // reserved wizards top-level segments (so someone landing on
    // prompts.blainercosta.com/submit still reaches the wizards submit page).
    const match = /^\/([^/]+)$/.exec(pathname);
    if (match) {
      const first = match[1];
      if (!WIZARDS_RESERVED.has(first)) {
        const url = request.nextUrl.clone();
        url.pathname = `/p/${first}`;
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
