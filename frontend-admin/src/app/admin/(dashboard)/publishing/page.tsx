import { getEntriesPaged, getContentHealth } from '@/lib/cms/service';
import PublishingClient from './PublishingClient';

export const dynamic = 'force-dynamic';

const PER_PAGE = 10;

export default async function PublishingPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; page?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const tab = sp.tab === 'live' ? 'live' : 'drafts';
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const bundle = await getEntriesPaged({
    status: tab === 'live' ? 'published' : 'draft',
    page,
    perPage: PER_PAGE,
  });
  const healthIssues = await getContentHealth();

  return (
    <PublishingClient
      key={`${tab}-${page}`}
      bundle={bundle}
      activeTab={tab}
      healthIssues={healthIssues}
    />
  );
}
