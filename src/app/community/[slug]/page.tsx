import { permanentRedirect } from 'next/navigation';

export default function LegacyCommunityRedirect({
  params,
}: {
  params: { slug: string };
}) {
  permanentRedirect(`/agent/${params.slug}`);
}
