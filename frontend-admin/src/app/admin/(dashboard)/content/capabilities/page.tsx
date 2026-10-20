import { getEntriesPaged } from '@/lib/cms/service';
import CapabilitiesClient from './CapabilitiesClient';

export const dynamic = 'force-dynamic';

const PER_PAGE = 10;

export default async function CapabilitiesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const bundle = await getEntriesPaged({ type: 'capability', sort: 'order', page, perPage: PER_PAGE });
  return <CapabilitiesClient key={page} initialBundle={bundle} />;
}
