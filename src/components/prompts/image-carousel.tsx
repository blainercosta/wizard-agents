import Image from 'next/image';
import type { PromptImage } from '@/types/prompt';

type Props = {
  images: PromptImage[];
  priority?: boolean;
};

export default function ImageCarousel({ images, priority = false }: Props) {
  if (images.length === 0) return null;

  return (
    <div
      className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-pl-6 -mx-6 px-6 pb-2"
      role="list"
      aria-label="Reference images"
      style={{ scrollbarWidth: 'thin' }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          role="listitem"
          className="shrink-0 w-[85%] sm:w-[65%] snap-start overflow-hidden rounded-lg border border-border bg-white/[0.02]"
        >
          <Image
            src={img.url}
            alt={img.alt || ''}
            width={1200}
            height={630}
            priority={priority && i === 0}
            className="w-full h-auto"
            unoptimized={img.url.endsWith('.svg')}
          />
        </div>
      ))}
    </div>
  );
}
