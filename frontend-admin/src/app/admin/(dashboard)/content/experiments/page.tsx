import { getEntriesPaged } from '@/lib/cms/service';
import ExperimentsClient from './ExperimentsClient';

export const dynamic = 'force-dynamic';

const PER_PAGE = 10;

export default async function ExperimentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const bundle = await getEntriesPaged({ type: 'experiment', sort: 'updated', page, perPage: PER_PAGE });
  return <ExperimentsClient key={page} initialBundle={bundle} />;
}
