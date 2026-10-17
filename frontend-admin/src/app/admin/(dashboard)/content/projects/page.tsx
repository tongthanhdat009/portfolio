import { getEntries } from '@/lib/cms/service';
import ProjectsClient from './ProjectsClient';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getEntries({ type: 'project' });
  return <ProjectsClient initialProjects={projects as any} />;
}
