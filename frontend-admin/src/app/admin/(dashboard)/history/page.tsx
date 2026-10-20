import { getEntries, getRevisionsPaged } from '@/lib/cms/service';
import HistoryClient from './HistoryClient';

export const dynamic = 'force-dynamic';

const PER_PAGE = 10;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ entry?: string; revPage?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const entries = await getEntries({ sort: 'updated' });
  const entryId = sp.entry || entries[0]?._id || '';
  const revPage = Math.max(1, parseInt(sp.revPage || '1', 10) || 1);
  const revisionsBundle = entryId
    ? await getRevisionsPaged(entryId, { page: revPage, perPage: PER_PAGE })
    : { items: [], total: 0, page: 1, perPage: PER_PAGE, lastPage: 1 };

  return (
    <HistoryClient
      key={`${entryId}-${revPage}`}
      entries={entries}
      initialEntryId={entryId}
      revisionsBundle={revisionsBundle}
    />
  );
}
