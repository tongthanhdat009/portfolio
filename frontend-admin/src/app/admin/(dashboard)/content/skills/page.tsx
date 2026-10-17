import { getEntries } from '@/lib/cms/service';
import SkillsClient from './SkillsClient';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const skills = await getEntries({ type: 'skill', sort: 'order' });
  return <SkillsClient initialSkills={skills as any} />;
}
