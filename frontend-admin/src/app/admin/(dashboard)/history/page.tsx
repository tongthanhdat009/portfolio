import { getEntries, getRevisions } from '@/lib/cms/service';
import HistoryClient from './HistoryClient';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const entries = await getEntries();
  const perEntry = await Promise.all(entries.map((e) => getRevisions(e._id)));
  const allRevs = perEntry.flat();

  return <HistoryClient entries={entries} initialRevisions={allRevs as any} />;
}
