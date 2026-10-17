import { getEntries } from '@/lib/cms/service';
import CapabilitiesClient from './CapabilitiesClient';

export const dynamic = 'force-dynamic';

export default async function CapabilitiesPage() {
  const caps = await getEntries({ type: 'capability', sort: 'order' });
  return <CapabilitiesClient initialCapabilities={caps as any} />;
}
