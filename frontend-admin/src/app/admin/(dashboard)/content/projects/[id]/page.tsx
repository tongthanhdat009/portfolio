import { notFound } from 'next/navigation';
import { getEntryById } from '@/lib/cms/service';
import ProjectEditorClient from '../ProjectEditorClient';

export const dynamic = 'force-dynamic';

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getEntryById(id);

  if (!entry) {
    notFound();
  }

  return <ProjectEditorClient initialEntry={entry as any} isNew={false} />;
}
