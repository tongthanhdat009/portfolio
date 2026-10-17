'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { logoutAction } from '@/app/admin/actions';

interface AdminLayoutShellProps {
  children: React.ReactNode;
  draftCount?: number;
}

export const AdminLayoutShell: React.FC<AdminLayoutShellProps> = ({
  children,
  draftCount = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-body">
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        draftCount={draftCount}
      />
      <div className={`flex-1 flex flex-col transition-all duration-200 ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
        <AdminTopbar
          onLogout={handleLogout}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
