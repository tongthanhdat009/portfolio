import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getDashboardMetrics } from '@/lib/cms/service';
import { AdminLayoutShell } from '@/components/layout/AdminLayoutShell';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }

  const metrics = await getDashboardMetrics();

  return (
    <AdminLayoutShell draftCount={metrics.draftCount}>
      {children}
    </AdminLayoutShell>
  );
}
