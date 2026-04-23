import { ImageResponse } from 'next/og';
import { getPromptBySlug } from '@/lib/prompts';

export const runtime = 'edge';
export const alt = 'Prompt preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const prompt = getPromptBySlug(params.slug);
  const title = prompt?.title ?? 'Prompt';
  const description =
    prompt?.description ?? 'Prompts prontos pra usar em IA.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#08090a',
          color: '#f7f8f8',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: '#8a8f98',
            letterSpacing: '-0.011em',
          }}
        >
          prompts.blainercosta.com
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 510,
              lineHeight: 1.05,
              letterSpacing: '-0.022em',
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#d0d6e0',
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            {description}
          </div>
        </div>
        <div
          style={{
            fontSize: 20,
            color: '#8a8f98',
            letterSpacing: '-0.011em',
          }}
        >
          @blainercosta
        </div>
      </div>
    ),
    { ...size }
  );
}
