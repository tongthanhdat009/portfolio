import { getEntriesPaged } from '@/lib/cms/service';
import SkillsClient from './SkillsClient';

export const dynamic = 'force-dynamic';

const PER_PAGE = 12;

export default async function SkillsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; category?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const category = sp.category && sp.category !== 'All' ? sp.category : undefined;
  const bundle = await getEntriesPaged({
    type: 'skill',
    sort: 'order',
    category,
    page,
    perPage: PER_PAGE,
  });
  return (
    <SkillsClient
      key={`${page}-${category || 'All'}`}
      initialBundle={bundle}
      initialCategory={sp.category || 'All'}
    />
  );
}
