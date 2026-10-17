import { getEntries } from '@/lib/cms/service';
import NotesClient from './NotesClient';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const notes = await getEntries({ type: 'note', sort: 'updated' });
  return <NotesClient initialNotes={notes as any} />;
}
