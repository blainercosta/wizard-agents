import { NextResponse } from 'next/server';
import { PROMPT_SLUGS } from '@/lib/prompt-slugs';
import { incrementCopyCount } from '@/lib/prompt-stats';

export const runtime = 'nodejs';

export async function POST(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  if (!PROMPT_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'Unknown prompt' }, { status: 404 });
  }
  try {
    const count = await incrementCopyCount(slug);
    return NextResponse.json({ count });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to record copy' },
      { status: 500 }
    );
  }
}
