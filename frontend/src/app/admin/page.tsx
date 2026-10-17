import { Metadata } from 'next';
import { isAuthenticated } from '@/lib/admin/auth';
import {
  getAnnouncement,
  getProjects,
  getExperiments,
  getNotes,
} from '@/lib/cms';
import AdminClient from './AdminClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Local Neo-Brutal content management console for Dat Nguyen portfolio.',
  robots: {
    index: false,
    follow: false,
  },
};

// Ensure page is dynamically rendered so auth cookie and fresh file edits reflect instantly
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const auth = await isAuthenticated();
  const announcement = await getAnnouncement();
  const projects = await getProjects();
  const experiments = await getExperiments();
  const notes = await getNotes();

  return (
    <AdminClient
      initialAuthenticated={auth}
      initialAnnouncement={announcement}
      initialProjects={projects}
      initialExperiments={experiments}
      initialNotes={notes}
    />
  );
}
