import Image from 'next/image';
import type { Prompt } from '@/types/prompt';

type Props = {
  image: Prompt['referenceImage'];
  priority?: boolean;
};

export default function ReferenceImage({ image, priority = false }: Props) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-white/[0.02]">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        className="w-full h-auto"
      />
    </div>
  );
}
