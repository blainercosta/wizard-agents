import { NextResponse } from 'next/server';
import { publicSupabase } from '@/lib/supabase/public';
import { getPublishedPromptBySlug } from '@/lib/supabase/prompts';
import { incrementCopyCount } from '@/lib/prompt-stats';

export const runtime = 'nodejs';

export async function POST(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const prompt = await getPublishedPromptBySlug(publicSupabase, params.slug);
  if (!prompt) {
    return NextResponse.json({ error: 'Unknown prompt' }, { status: 404 });
  }
  try {
    const count = await incrementCopyCount(params.slug);
    return NextResponse.json({ count });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to record copy' },
      { status: 500 }
    );
  }
}
