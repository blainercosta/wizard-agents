import Image from 'next/image';
import type { PromptImage } from '@/types/prompt';

type Props = {
  image: PromptImage;
  priority?: boolean;
};

export default function ReferenceImage({ image, priority = false }: Props) {
  if (!image?.url) return null;

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-white/[0.02]">
      <Image
        src={image.url}
        alt={image.alt || ''}
        width={1200}
        height={630}
        priority={priority}
        className="w-full h-auto"
        unoptimized={image.url.endsWith('.svg')}
      />
    </div>
  );
}
