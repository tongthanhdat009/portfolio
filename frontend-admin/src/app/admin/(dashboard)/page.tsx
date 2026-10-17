import React from 'react';
import Link from 'next/link';
import {
  FileText,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Sliders,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileCode2,
} from 'lucide-react';
import {
  getDashboardMetrics,
  getContentHealth,
  getEntries,
  getAuditLogs,
} from '@/lib/cms/service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const healthIssues = await getContentHealth();
  const recentEntries = await getEntries({ sort: 'updated' });
  const recentActivity = await getAuditLogs(6);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-[var(--color-ink)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-sun)] px-2 py-0.5 border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
              OVERVIEW
            </span>
            <span className="font-mono text-xs text-stone-500">SYSTEM HEALTH: NOMINAL</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)]">
            YOUR PORTFOLIO, AT A GLANCE.
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Real-time status of publications, draft revisions, and content health indicators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/content/projects/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              ADD PROJECT
            </Button>
          </Link>
          <Link href="/admin/content/notes">
            <Button variant="secondary" size="md">
              <Plus className="w-4 h-4" />
              ADD NOTE
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published items */}
        <Card variant="surface" shadow="md" borderWidth="2" className="p-5">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-2">
            <span>PUBLISHED ITEMS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-[var(--color-ink)]">
            {metrics.publishedCount}
          </div>
          <p className="text-xs font-body text-[var(--color-muted-text)] mt-1">
            Live on public portfolio
          </p>
        </Card>

        {/* Drafts */}
        <Card variant="surface" shadow="md" borderWidth="2" className="p-5">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-2">
            <span>DRAFTS / REVISIONS</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-[var(--color-ink)]">
            {metrics.draftCount}
          </div>
          <p className="text-xs font-body text-[var(--color-muted-text)] mt-1">
            Pending publication
          </p>
        </Card>

        {/* Recent Changes */}
        <Card variant="surface" shadow="md" borderWidth="2" className="p-5">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-2">
            <span>RECENT CHANGES</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-[var(--color-ink)]">
            {metrics.recentChangesCount}
          </div>
          <p className="text-xs font-body text-[var(--color-muted-text)] mt-1">
            Updated in past 7 days
          </p>
        </Card>

        {/* Media / Content Warnings */}
        <Card
          variant={metrics.warningsCount > 0 ? 'paper' : 'surface'}
          shadow="md"
          borderWidth="2"
          className="p-5"
        >
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-2">
            <span>CONTENT WARNINGS</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.warningsCount > 0 ? 'text-[var(--color-coral)]' : 'text-stone-400'}`} />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-[var(--color-ink)]">
            {metrics.warningsCount}
          </div>
          <p className="text-xs font-body text-[var(--color-muted-text)] mt-1">
            {metrics.warningsCount > 0 ? 'Requires attention before release' : 'All audits passing'}
          </p>
        </Card>
      </div>

      {/* Main Grid: Left Quick Actions + Content; Right Content Health & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <Card variant="paper" shadow="md" borderWidth="2" className="p-6">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-[var(--color-ink)] mb-4">
              QUICK ACTIONS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/admin/content/projects/new"
                className="p-3.5 bg-white rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[var(--color-sun)] transition-all flex flex-col items-center text-center gap-2"
              >
                <FolderKanban className="w-5 h-5" />
                <span className="font-display text-xs font-bold uppercase">New Project</span>
              </Link>
              <Link
                href="/admin/content/pages/home"
                className="p-3.5 bg-white rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[var(--color-sky)] transition-all flex flex-col items-center text-center gap-2"
              >
                <FileCode2 className="w-5 h-5" />
                <span className="font-display text-xs font-bold uppercase">Edit Homepage</span>
              </Link>
              <Link
                href="/admin/settings"
                className="p-3.5 bg-white rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[var(--color-lime)] transition-all flex flex-col items-center text-center gap-2"
              >
                <Sliders className="w-5 h-5" />
                <span className="font-display text-xs font-bold uppercase">Settings & Nav</span>
              </Link>
              <Link
                href="/admin/publishing"
                className="p-3.5 bg-white rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[var(--color-pink)] transition-all flex flex-col items-center text-center gap-2"
              >
                <Layers className="w-5 h-5" />
                <span className="font-display text-xs font-bold uppercase">Publish Hub</span>
              </Link>
            </div>
          </Card>

          {/* Recent Content */}
          <Card variant="surface" shadow="md" borderWidth="2" className="p-6">
            <div className="flex items-center justify-between mb-4 border-b-2 border-stone-100 pb-3">
              <div>
                <h2 className="font-display font-black text-sm uppercase tracking-wider text-[var(--color-ink)]">
                  RECENTLY EDITED CONTENT
                </h2>
                <p className="text-xs text-stone-500 font-body">Latest revisions across all content types</p>
              </div>
              <Link
                href="/admin/content/projects"
                className="text-xs font-mono font-bold text-black hover:underline flex items-center gap-1"
              >
                ALL PROJECTS →
              </Link>
            </div>

            <div className="divide-y-2 divide-stone-100">
              {recentEntries.slice(0, 6).map((entry) => (
                <div key={entry._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant={entry.type === 'project' ? 'sun' : entry.type === 'page' ? 'sky' : 'paper'} size="sm">
                      {entry.type}
                    </Badge>
                    <div className="truncate">
                      <Link
                        href={
                          entry.type === 'project'
                            ? `/admin/content/projects/${entry._id}`
                            : entry.type === 'page'
                            ? `/admin/content/pages/home`
                            : `/admin/content/${entry.type}s`
                        }
                        className="font-display font-bold text-sm text-[var(--color-ink)] hover:underline hover:text-blue-600 block truncate"
                      >
                        {entry.title}
                      </Link>
                      <span className="font-mono text-[11px] text-stone-400">
                        rev #{entry.revision} · {new Date(entry.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge
                      status={entry.status}
                      hasUnpublishedChanges={entry.hasUnpublishedChanges}
                    />
                    <Link
                      href={
                        entry.type === 'project'
                          ? `/admin/content/projects/${entry._id}`
                          : entry.type === 'page'
                          ? `/admin/content/pages/home`
                          : `/admin/content/${entry.type}s`
                      }
                    >
                      <Button variant="secondary" size="sm">
                        EDIT
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Content Health & Activity */}
        <div className="space-y-8">
          {/* Content Health Checker */}
          <Card variant="surface" shadow="md" borderWidth="2" className="p-6">
            <div className="flex items-center justify-between mb-4 border-b-2 border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h2 className="font-display font-black text-sm uppercase tracking-wider text-[var(--color-ink)]">
                  CONTENT HEALTH AUDIT
                </h2>
              </div>
              <Badge variant={healthIssues.length > 0 ? 'coral' : 'lime'} size="sm">
                {healthIssues.length} ISSUES
              </Badge>
            </div>

            {healthIssues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-display font-bold text-sm text-stone-800">ALL AUDITS CLEAN</p>
                <p className="font-body text-xs text-stone-500 mt-1">No missing alts, broken references or SEO gaps detected.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {healthIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 bg-stone-50 border-2 border-stone-300 rounded-[var(--radius-sm)] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {issue.level}
                      </span>
                      {issue.fixAction && (
                        <Link
                          href={issue.fixAction}
                          className="font-mono text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          FIX NOW →
                        </Link>
                      )}
                    </div>
                    <span className="font-display font-bold text-xs text-stone-900">
                      {issue.title}
                    </span>
                    <p className="font-body text-[11px] text-stone-600 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card variant="surface" shadow="md" borderWidth="2" className="p-6">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-[var(--color-ink)] mb-4 border-b-2 border-stone-100 pb-3">
              ACTIVITY STREAM
            </h2>

            <div className="space-y-3.5">
              {recentActivity.map((log) => (
                <div key={log._id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-stone-800">
                      <span className="font-mono font-bold text-[var(--color-ink)]">{log.actor}</span>{' '}
                      performed <span className="font-mono uppercase font-semibold text-blue-700">{log.action}</span> on{' '}
                      <span className="font-semibold text-stone-900">{log.targetTitle}</span>
                    </p>
                    <span className="font-mono text-[10px] text-stone-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
