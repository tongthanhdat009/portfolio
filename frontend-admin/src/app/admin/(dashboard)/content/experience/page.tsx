import { getEntries } from '@/lib/cms/service';
import ExperienceClient from './ExperienceClient';

export const dynamic = 'force-dynamic';

export default async function ExperiencePage() {
  const exps = await getEntries({ type: 'experience', sort: 'order' });
  return <ExperienceClient initialExperience={exps as any} />;
}
