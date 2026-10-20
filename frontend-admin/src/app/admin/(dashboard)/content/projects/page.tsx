import { getEntriesPaged } from '@/lib/cms/service';
import ProjectsClient from './ProjectsClient';

export const dynamic = 'force-dynamic';

const PER_PAGE = 10;

type SearchParams = {
  page?: string;
  q?: string;
  status?: string;
  category?: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const status = sp.status || 'all';
  const bundle = await getEntriesPaged({
    type: 'project',
    status: (status === 'all' ? ['draft', 'published'] : status) as any,
    search: sp.q || undefined,
    category: sp.category && sp.category !== 'all' ? sp.category : undefined,
    page,
    perPage: PER_PAGE,
  });

  return (
    <ProjectsClient
      key={`${page}-${status}-${sp.q || ''}-${sp.category || 'all'}`}
      initialBundle={bundle}
      initialStatus={status}
      initialSearch={sp.q || ''}
      initialCategory={sp.category || 'all'}
    />
  );
}
