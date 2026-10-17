import { getGlobals } from '@/lib/cms/service';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const globals = await getGlobals();
  return <SettingsClient initialGlobals={globals} />;
}
