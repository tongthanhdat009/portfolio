import { getEntryByKey, getEntries } from '@/lib/cms/service';
import HomePageBuilderClient from './HomePageBuilderClient';

export const dynamic = 'force-dynamic';

export default async function HomePageBuilder() {
  const homeEntry = await getEntryByKey('home');
  const allProjects = await getEntries({ type: 'project' });

  const projectOptions = allProjects.map((p) => ({
    id: p._id,
    title: p.title,
    status: p.status,
  }));

  return (
    <HomePageBuilderClient
      initialHomeEntry={homeEntry as any}
      allProjects={projectOptions}
    />
  );
}
