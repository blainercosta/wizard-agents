import Image from 'next/image';
import type { Prompt } from '@/types/prompt';

type Props = {
  image: Prompt['referenceImage'];
  priority?: boolean;
};

export default function ReferenceImage({ image, priority = false }: Props) {
  if (!image?.src) return null;

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-white/[0.02]">
      <Image
        src={image.src}
        alt={image.alt || ''}
        width={image.width || 1200}
        height={image.height || 630}
        priority={priority}
        className="w-full h-auto"
        unoptimized={image.src.endsWith('.svg')}
      />
    </div>
  );
}
