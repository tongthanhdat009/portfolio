import { getEntries } from '@/lib/cms/service';
import ExperimentsClient from './ExperimentsClient';

export const dynamic = 'force-dynamic';

export default async function ExperimentsPage() {
  const experiments = await getEntries({ type: 'experiment', sort: 'updated' });
  return <ExperimentsClient initialExperiments={experiments as any} />;
}
