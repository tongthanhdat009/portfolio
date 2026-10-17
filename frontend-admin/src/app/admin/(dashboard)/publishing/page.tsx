import { getEntries, getContentHealth } from '@/lib/cms/service';
import PublishingClient from './PublishingClient';

export const dynamic = 'force-dynamic';

export default async function PublishingPage() {
  const all = await getEntries();
  const drafts = all.filter((e) => e.status === 'draft' || e.hasUnpublishedChanges);
  const publishedEntries = all.filter((e) => e.status === 'published');
  const healthIssues = await getContentHealth();

  return (
    <PublishingClient
      drafts={drafts}
      publishedEntries={publishedEntries}
      healthIssues={healthIssues}
    />
  );
}
