'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logoutAction } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

export default function AccountClient() {
  const router = useRouter();
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleLogout = async () => {
    await logoutAction();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl">
      <div className="border-b-3 border-[var(--color-ink)] pb-6">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-sun)] px-2 py-0.5 border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
          ACCOUNT SECURITY
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] mt-1">
          OPERATOR PROFILE & ACCESS
        </h1>
        <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
          Manage master console authorization credentials and active administrator sessions.
        </p>
      </div>

      <Card variant="surface" shadow="md" borderWidth="2" className="p-6 space-y-6">
        <div className="flex items-center gap-4 border-b-2 border-stone-100 pb-5">
          <div className="w-14 h-14 rounded-full border-3 border-[var(--color-ink)] bg-[var(--color-sun)] flex items-center justify-center font-display font-black text-xl shadow-[var(--shadow-neo-sm)]">
            DN
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-[var(--color-ink)]">
              Dat Nguyen (System Owner)
            </h3>
            <p className="font-mono text-xs text-stone-500">
              ROLE: FULL ROOT ACCESS · SESSION: ACTIVE
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="font-display font-bold text-sm uppercase">SESSION ATTRIBUTES</h4>
          </div>
          <div className="p-4 bg-stone-50 border border-stone-300 rounded text-xs font-mono space-y-1.5 text-stone-700">
            <div><strong>AUTH STRATEGY:</strong> HttpOnly Encrypted Cookie (<code className="bg-stone-200 px-1">admin_session</code>)</div>
            <div><strong>ENVIRONMENT:</strong> Local / Development (Port 3001)</div>
            <div><strong>DATABASE:</strong> Local Memory / Mongo Fallback Store</div>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-stone-100 flex items-center justify-between">
          <Button variant="danger" size="md" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> TERMINATE SESSION & LOG OUT
          </Button>
        </div>
      </Card>
    </div>
  );
}
