import { getMediaPaged } from '@/lib/cms/service';
import MediaClient from './MediaClient';

export const dynamic = 'force-dynamic';

const PER_PAGE = 12;

export default async function MediaPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; q?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const bundle = await getMediaPaged({ search: sp.q || undefined, page, perPage: PER_PAGE });
  return <MediaClient key={`${page}-${sp.q || ''}`} initialBundle={bundle} initialSearch={sp.q || ''} />;
}
