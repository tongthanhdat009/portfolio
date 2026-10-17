'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginAction } from '../actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const res = await loginAction(email, password);
        if (res.success) {
          router.push('/admin');
          router.refresh();
        } else {
          setError('Invalid email or password. Please check your credentials.');
        }
      } catch (err) {
        setError('An unexpected error occurred during authentication.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[var(--radius-md)] bg-[var(--color-sun)] border-3 border-[var(--color-ink)] shadow-[var(--shadow-neo-md)] mb-3">
            <Lock className="w-7 h-7 text-[var(--color-ink)]" />
          </div>
          <h1 className="font-display font-black text-3xl tracking-tight text-[var(--color-ink)]">
            WELCOME BACK.
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Manage your developer portfolio content.
          </p>
        </div>

        {/* Login Card */}
        <Card variant="surface" shadow="lg" borderWidth="3" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="owner@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                error={error}
              />
            </div>
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="mt-1.5 text-xs text-stone-500 font-mono">
                Development default: <code className="bg-stone-100 px-1 py-0.5 border border-stone-300 rounded font-bold">owner@example.com / ownerpass123</code>
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isPending}
            >
              <span>ACCESS CONSOLE</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t-2 border-stone-200 flex items-center justify-between text-xs font-mono text-stone-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure session cookies
            </span>
            <span>PORTFOLIO v1.1</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
