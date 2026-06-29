import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPublishedPromptBySlug } from '@/lib/supabase/prompts';
import { incrementCopyCount } from '@/lib/prompt-stats';

export const runtime = 'nodejs';

export async function POST(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  // Use the viewer's session so copies of exclusive prompts only count for
  // those allowed to read them (RLS returns null otherwise → 404).
  const supabase = createClient();
  const prompt = await getPublishedPromptBySlug(supabase, params.slug);
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
