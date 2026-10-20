import { getEntriesPaged } from '@/lib/cms/service';
import ExperienceClient from './ExperienceClient';

export const dynamic = 'force-dynamic';

const PER_PAGE = 10;

export default async function ExperiencePage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; type?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const bundle = await getEntriesPaged({
    type: 'experience',
    sort: 'order',
    category: sp.type && sp.type !== 'all' ? sp.type : undefined,
    page,
    perPage: PER_PAGE,
  });
  return <ExperienceClient key={`${page}-${sp.type || 'all'}`} initialBundle={bundle} initialType={sp.type || 'all'} />;
}
