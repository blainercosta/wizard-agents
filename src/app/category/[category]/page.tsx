import { permanentRedirect } from 'next/navigation';

export default function LegacyCategoryRedirect({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { sort?: string };
}) {
  const params2 = new URLSearchParams();
  params2.set('category', params.category);
  if (searchParams.sort && searchParams.sort !== 'recent') {
    params2.set('sort', searchParams.sort);
  }
  permanentRedirect(`/?${params2.toString()}`);
}
