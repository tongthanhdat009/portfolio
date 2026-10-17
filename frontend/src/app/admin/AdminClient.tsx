'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Lock,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Eye,
  Sliders,
  Bell,
  Code2,
  FileText,
  FlaskConical,
} from 'lucide-react';
import {
  Announcement,
  Project,
  Experiment,
  Note,
  ColorAccent,
} from '@/types';
import {
  loginAction,
  logoutAction,
  saveAnnouncementAction,
  saveProjectAction,
  deleteProjectAction,
  saveExperimentAction,
  deleteExperimentAction,
  saveNoteAction,
  deleteNoteAction,
  triggerGithubSyncAction,
} from './actions';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface AdminClientProps {
  initialAuthenticated: boolean;
  initialAnnouncement: Announcement;
  initialProjects: Project[];
  initialExperiments: Experiment[];
  initialNotes: Note[];
}

type TabType = 'projects' | 'experiments' | 'notes' | 'announcement' | 'github';

export default function AdminClient({
  initialAuthenticated,
  initialAnnouncement,
  initialProjects,
  initialExperiments,
  initialNotes,
}: AdminClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [announcement, setAnnouncement] = useState<Announcement>(initialAnnouncement);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments);
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [editingProject, setEditingProject] = useState<{ data: Project; isNew: boolean } | null>(null);
  const [editingExperiment, setEditingExperiment] = useState<{ data: Experiment; isNew: boolean } | null>(null);
  const [editingNote, setEditingNote] = useState<{ data: Note; isNew: boolean } | null>(null);
  const [syncLog, setSyncLog] = useState<string | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    startTransition(async () => {
      const res = await loginAction(pin);
      if (res.success) {
        setIsAuthenticated(true);
        setPin('');
      } else {
        setLoginError(res.error || 'Authentication failed');
      }
    });
  };

  // Logout handler
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setIsAuthenticated(false);
    });
  };

  // GitHub Sync handler
  const handleGithubSync = () => {
    setSyncLog('⏳ Executing scripts/sync-github.mjs via GitHub CLI...');
    startTransition(async () => {
      const res = await triggerGithubSyncAction();
      setSyncLog(res.message);
      if (res.success) {
        showNotification('success', 'GitHub repositories synced successfully! Refreshing data.');
        window.location.reload();
      } else {
        showNotification('error', res.message);
      }
    });
  };

  // Announcement Save
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveAnnouncementAction(announcement);
      if (res.success) {
        showNotification('success', 'Announcement banner updated successfully!');
      } else {
        showNotification('error', res.error || 'Failed to update announcement');
      }
    });
  };

  // Project Handlers
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    startTransition(async () => {
      const res = await saveProjectAction(editingProject.data, editingProject.isNew);
      if (res.success) {
        if (editingProject.isNew) {
          setProjects([editingProject.data, ...projects]);
        } else {
          setProjects(projects.map((p) => (p.slug === editingProject.data.slug ? editingProject.data : p)));
        }
        setEditingProject(null);
        showNotification('success', `Project "${editingProject.data.title}" saved successfully!`);
      } else {
        showNotification('error', res.error || 'Failed to save project');
      }
    });
  };

  const handleDeleteProject = (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteProjectAction(slug);
      if (res.success) {
        setProjects(projects.filter((p) => p.slug !== slug));
        showNotification('success', `Project "${title}" deleted.`);
      } else {
        showNotification('error', res.error || 'Failed to delete project');
      }
    });
  };

  // Experiment Handlers
  const handleSaveExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperiment) return;

    startTransition(async () => {
      const res = await saveExperimentAction(editingExperiment.data, editingExperiment.isNew);
      if (res.success) {
        if (editingExperiment.isNew) {
          setExperiments([editingExperiment.data, ...experiments]);
        } else {
          setExperiments(experiments.map((e) => (e.slug === editingExperiment.data.slug ? editingExperiment.data : e)));
        }
        setEditingExperiment(null);
        showNotification('success', `Experiment "${editingExperiment.data.title}" saved!`);
      } else {
        showNotification('error', res.error || 'Failed to save experiment');
      }
    });
  };

  const handleDeleteExperiment = (slug: string, title: string) => {
    if (!confirm(`Delete experiment "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteExperimentAction(slug);
      if (res.success) {
        setExperiments(experiments.filter((e) => e.slug !== slug));
        showNotification('success', `Experiment "${title}" deleted.`);
      } else {
        showNotification('error', res.error || 'Failed to delete experiment');
      }
    });
  };

  // Note Handlers
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    startTransition(async () => {
      const res = await saveNoteAction(editingNote.data, editingNote.isNew);
      if (res.success) {
        if (editingNote.isNew) {
          setNotes([editingNote.data, ...notes]);
        } else {
          setNotes(notes.map((n) => (n.slug === editingNote.data.slug ? editingNote.data : n)));
        }
        setEditingNote(null);
        showNotification('success', `Note "${editingNote.data.title}" saved!`);
      } else {
        showNotification('error', res.error || 'Failed to save note');
      }
    });
  };

  const handleDeleteNote = (slug: string, title: string) => {
    if (!confirm(`Delete field note "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteNoteAction(slug);
      if (res.success) {
        setNotes(notes.filter((n) => n.slug !== slug));
        showNotification('success', `Note "${title}" deleted.`);
      } else {
        showNotification('error', res.error || 'Failed to delete note');
      }
    });
  };

  // UNAUTHENTICATED LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-xl neo-border-poster neo-shadow-xl bg-[#FFFFFF]">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 bg-[#FF7661] border border-[#111111]" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751]">
              // SECURITY CHECKPOINT
            </span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#111111] uppercase tracking-tight leading-tight mb-2">
            ADMIN CONSOLE
          </h1>

          <p className="text-xs sm:text-sm text-[#5B5751] font-medium leading-relaxed mb-6">
            Enter your security PIN or password to manage projects, experiments, notes, and site settings.
          </p>

          {loginError && (
            <div
              role="alert"
              className="p-3 bg-[#FF7661] text-[#111111] border-2 border-[#111111] rounded-md font-mono text-xs font-bold mb-4 flex items-center gap-2"
            >
              <AlertTriangle size={16} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-pin"
                className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111111] mb-1.5"
              >
                Security PIN / Password
              </label>
              <input
                id="admin-pin"
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-md border-2 border-[#111111] font-mono text-base text-[#111111] bg-[#FFF9E9] focus:outline-none focus:border-[#0A54E8] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 font-display text-sm font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-md bg-[#FFDB58] text-[#111111] neo-btn-press inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock size={16} />
              <span>{isPending ? 'Verifying PIN...' : 'Unlock Dashboard ↗'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-[#111111] font-mono text-[11px] text-[#5B5751] flex items-center justify-between">
            <span>Default PIN: neo2026</span>
            <span className="text-[#176B3A] font-bold">Local Auth</span>
          </div>
        </div>
      </div>
    );
  }

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full py-8 md:py-12 bg-[#FFF9E9]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Floating Notification */}
        {notification && (
          <div
            role="status"
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-lg neo-border neo-shadow-lg font-mono text-xs md:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${
              notification.type === 'success' ? 'bg-[#C6F56A] text-[#111111]' : 'bg-[#FF7661] text-[#111111]'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="p-6 md:p-8 rounded-xl neo-border-poster neo-shadow-lg bg-[#FFFFFF] mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2 border-[#111111]">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#C6F56A] text-[#111111] rounded-xs border border-[#111111] font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#176B3A] animate-pulse" />
                  <span>LOCAL CMS ACTIVE</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#5B5751]">
                  AUTH: ADMINISTRATOR
                </span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#111111] uppercase tracking-tight">
                PORTFOLIO CONTROL CENTER
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="px-4 py-2 font-display text-xs md:text-sm font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-sm bg-[#FFF9E9] text-[#111111] neo-btn-press inline-flex items-center gap-1.5"
              >
                <span>Live Site</span>
                <ExternalLink size={14} />
              </Link>
              <button
                type="button"
                onClick={handleGithubSync}
                disabled={isPending}
                className="px-4 py-2 font-display text-xs md:text-sm font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-sm bg-[#89CFF0] text-[#111111] neo-btn-press inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} />
                <span>Sync GitHub</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 font-display text-xs md:text-sm font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-sm bg-[#FF7661] text-[#111111] neo-btn-press inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            </div>
          </div>

          {/* Quick Metric Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 font-mono text-xs">
            <div className="p-3 bg-[#FFF9E9] border-2 border-[#111111] rounded-md">
              <span className="text-[#5B5751] block mb-1">TOTAL PROJECTS</span>
              <span className="font-display font-extrabold text-2xl text-[#111111]">{projects.length}</span>
            </div>
            <div className="p-3 bg-[#FFF9E9] border-2 border-[#111111] rounded-md">
              <span className="text-[#5B5751] block mb-1">LAB EXPERIMENTS</span>
              <span className="font-display font-extrabold text-2xl text-[#111111]">{experiments.length}</span>
            </div>
            <div className="p-3 bg-[#FFF9E9] border-2 border-[#111111] rounded-md">
              <span className="text-[#5B5751] block mb-1">FIELD NOTES</span>
              <span className="font-display font-extrabold text-2xl text-[#111111]">{notes.length}</span>
            </div>
            <div className="p-3 bg-[#FFF9E9] border-2 border-[#111111] rounded-md">
              <span className="text-[#5B5751] block mb-1">ANNOUNCEMENT</span>
              <span
                className={`font-display font-extrabold text-sm sm:text-base uppercase ${
                  announcement.enabled ? 'text-[#176B3A]' : 'text-[#B42318]'
                }`}
              >
                {announcement.enabled ? 'Active ●' : 'Disabled ○'}
              </span>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav
          aria-label="Admin Navigation Tabs"
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 select-none"
        >
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 font-display text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md border-2 border-[#111111] neo-btn-press whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-[#FFDB58] text-[#111111] neo-shadow-sm'
                : 'bg-[#FFFFFF] text-[#5B5751] hover:text-[#111111]'
            }`}
          >
            <Code2 size={16} />
            <span>01. Projects ({projects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('experiments')}
            className={`px-4 py-2.5 font-display text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md border-2 border-[#111111] neo-btn-press whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'experiments'
                ? 'bg-[#FFDB58] text-[#111111] neo-shadow-sm'
                : 'bg-[#FFFFFF] text-[#5B5751] hover:text-[#111111]'
            }`}
          >
            <FlaskConical size={16} />
            <span>02. Lab Experiments ({experiments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2.5 font-display text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md border-2 border-[#111111] neo-btn-press whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'bg-[#FFDB58] text-[#111111] neo-shadow-sm'
                : 'bg-[#FFFFFF] text-[#5B5751] hover:text-[#111111]'
            }`}
          >
            <FileText size={16} />
            <span>03. Field Notes ({notes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('announcement')}
            className={`px-4 py-2.5 font-display text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md border-2 border-[#111111] neo-btn-press whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'announcement'
                ? 'bg-[#FFDB58] text-[#111111] neo-shadow-sm'
                : 'bg-[#FFFFFF] text-[#5B5751] hover:text-[#111111]'
            }`}
          >
            <Bell size={16} />
            <span>04. Announcement Strip</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2.5 font-display text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md border-2 border-[#111111] neo-btn-press whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'github'
                ? 'bg-[#FFDB58] text-[#111111] neo-shadow-sm'
                : 'bg-[#FFFFFF] text-[#5B5751] hover:text-[#111111]'
            }`}
          >
            <RefreshCw size={16} />
            <span>05. GitHub Sync Console</span>
          </button>
        </nav>

        {/* TAB 1: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="p-4 bg-[#FFFFFF] rounded-lg neo-border neo-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-3 text-[#5B5751]" />
                  <input
                    type="text"
                    placeholder="Search by title, slug, or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-md border-2 border-[#111111] text-xs font-mono bg-[#FFF9E9] focus:outline-none focus:bg-white"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border-2 border-[#111111] text-xs font-mono bg-[#FFF9E9]"
                >
                  <option value="All">All Categories</option>
                  <option value="Web Products">Web Products</option>
                  <option value="Backend & APIs">Backend & APIs</option>
                  <option value="Intelligent Workflows">Intelligent Workflows</option>
                  <option value="Developer Tools">Developer Tools</option>
                  <option value="Systems & Architecture">Systems & Architecture</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingProject({
                    isNew: true,
                    data: {
                      id: `project-${Date.now()}`,
                      slug: '',
                      title: '',
                      year: new Date().getFullYear().toString(),
                      index: String(projects.length + 1).padStart(2, '0'),
                      category: 'Web Products',
                      summary: '',
                      accent: 'sky',
                      tags: ['TypeScript'],
                      status: 'Open Source',
                      featured: false,
                      order: projects.length + 1,
                      caseStudy: {
                        overview: {
                          product: '',
                          targetUsers: 'Engineers and Builders',
                          timeline: '2026',
                          role: 'Lead Architect',
                          status: 'Production',
                        },
                        problem: '',
                        contribution: ['System architecture and implementation'],
                        approach: {
                          summary: '',
                          architecturePoints: ['Clean decoupled module design'],
                        },
                        highlights: ['High reliability and performance'],
                        outcomes: ['Verified in production'],
                        lessons: ['Maintainable architectures scale predictably'],
                      },
                    },
                  })
                }
                className="px-4 py-2 bg-[#FFDB58] text-[#111111] font-display text-xs font-bold uppercase rounded-md neo-border neo-shadow-sm neo-btn-press inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={16} />
                <span>Add New Project</span>
              </button>
            </div>

            {/* Projects Table / Card List */}
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.slug}
                  className="p-5 bg-[#FFFFFF] rounded-lg neo-border neo-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-[11px] font-bold">
                      <span className="px-2 py-0.5 bg-[#111111] text-[#FFF9E9] rounded-xs">
                        {project.index} // {project.category}
                      </span>
                      <span className="text-[#5B5751]">{project.year}</span>
                      {project.featured && (
                        <span className="px-2 py-0.5 bg-[#FFDB58] text-[#111111] border border-[#111111] rounded-xs uppercase">
                          Featured Build
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-[#C6F56A] border border-[#111111] rounded-xs uppercase">
                        {project.status}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-[#111111] leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#5B5751] font-medium mt-1 line-clamp-2 max-w-2xl">
                      {project.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] px-1.5 py-0.5 bg-[#FFF9E9] border border-[#111111] rounded-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                    <Link
                      href={`/work/${project.slug}`}
                      target="_blank"
                      className="p-2 rounded-md border-2 border-[#111111] bg-[#FFF9E9] text-[#111111] hover:bg-[#89CFF0] transition-colors"
                      title="View live case study"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditingProject({ data: { ...project }, isNew: false })}
                      className="px-3 py-1.5 font-display text-xs font-bold uppercase rounded-md border-2 border-[#111111] bg-[#FFDB58] text-[#111111] neo-btn-press inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project.slug, project.title)}
                      className="p-2 rounded-md border-2 border-[#111111] bg-[#FF7661] text-[#111111] hover:opacity-80 transition-opacity cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredProjects.length === 0 && (
                <div className="p-12 text-center bg-[#FFFFFF] rounded-lg neo-border font-mono text-sm text-[#5B5751]">
                  No projects match your search or filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: EXPERIMENTS */}
        {activeTab === 'experiments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-[#5B5751] uppercase">
                // LAB PROTOTYPES & BENCHMARKS ({experiments.length})
              </span>
              <button
                type="button"
                onClick={() =>
                  setEditingExperiment({
                    isNew: true,
                    data: {
                      id: `exp-${Date.now()}`,
                      slug: '',
                      title: '',
                      summary: '',
                      status: 'Prototype',
                      accent: 'lime',
                      tags: ['Prototype', 'Benchmark'],
                      isWide: false,
                      objective: '',
                      howItWorks: '',
                      limitations: '',
                      takeaways: '',
                    },
                  })
                }
                className="px-4 py-2 bg-[#FFDB58] text-[#111111] font-display text-xs font-bold uppercase rounded-md neo-border neo-shadow-sm neo-btn-press inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} />
                <span>New Experiment</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiments.map((exp) => (
                <div
                  key={exp.slug}
                  className="p-6 bg-[#FFFFFF] rounded-lg neo-border neo-shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b-2 border-[#111111] mb-3 font-mono text-xs font-bold">
                      <span className="px-2 py-0.5 bg-[#FFDB58] border border-[#111111] rounded-xs uppercase">
                        {exp.status}
                      </span>
                      <span className="text-[#5B5751]">/{exp.slug}</span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-[#111111] mb-2 leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-[#5B5751] font-medium leading-relaxed mb-4">
                      {exp.summary}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {exp.tags.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] px-1.5 py-0.5 bg-[#FFF9E9] border border-[#111111] rounded-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-[#111111] flex items-center justify-between">
                    <Link
                      href={`/lab/${exp.slug}`}
                      target="_blank"
                      className="font-display text-xs font-bold uppercase text-[#111111] hover:underline flex items-center gap-1"
                    >
                      <span>View Live</span>
                      <ExternalLink size={12} />
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingExperiment({ data: { ...exp }, isNew: false })}
                        className="px-3 py-1 font-display text-xs font-bold uppercase rounded border-2 border-[#111111] bg-[#FFDB58] neo-btn-press"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperiment(exp.slug, exp.title)}
                        className="p-1.5 rounded border-2 border-[#111111] bg-[#FF7661]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-[#5B5751] uppercase">
                // FIELD NOTES & ARTICLES ({notes.length})
              </span>
              <button
                type="button"
                onClick={() =>
                  setEditingNote({
                    isNew: true,
                    data: {
                      id: `note-${Date.now()}`,
                      slug: '',
                      title: '',
                      category: 'Architecture & AI',
                      publishedAt: new Date().toISOString().split('T')[0],
                      readTime: '5 min read',
                      excerpt: '',
                      tags: ['Software Engineering'],
                      content: [
                        'First introductory paragraph discussing the context and motivation.',
                        'Second detailed technical paragraph explaining the architecture.',
                      ],
                      toc: [
                        { id: 'introduction', text: 'Introduction', level: 2 },
                        { id: 'technical-breakdown', text: 'Technical Breakdown', level: 2 },
                      ],
                    },
                  })
                }
                className="px-4 py-2 bg-[#FFDB58] text-[#111111] font-display text-xs font-bold uppercase rounded-md neo-border neo-shadow-sm neo-btn-press inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} />
                <span>Write Field Note</span>
              </button>
            </div>

            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.slug}
                  className="p-5 bg-[#FFFFFF] rounded-lg neo-border neo-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] font-bold text-[#5B5751]">
                      <span className="px-2 py-0.5 bg-[#FFDB58] text-[#111111] border border-[#111111] rounded-xs uppercase">
                        {note.category}
                      </span>
                      <span>•</span>
                      <span>{note.publishedAt}</span>
                      <span>•</span>
                      <span>{note.readTime}</span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-[#111111] leading-snug">
                      {note.title}
                    </h3>
                    <p className="text-xs text-[#5B5751] font-medium mt-1 line-clamp-2 max-w-2xl">
                      {note.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                    <Link
                      href={`/notes/${note.slug}`}
                      target="_blank"
                      className="p-2 rounded-md border-2 border-[#111111] bg-[#FFF9E9] text-[#111111] hover:bg-[#89CFF0] transition-colors"
                      title="Read note"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditingNote({ data: { ...note }, isNew: false })}
                      className="px-3 py-1.5 font-display text-xs font-bold uppercase rounded-md border-2 border-[#111111] bg-[#FFDB58] text-[#111111] neo-btn-press inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.slug, note.title)}
                      className="p-2 rounded-md border-2 border-[#111111] bg-[#FF7661] text-[#111111] hover:opacity-80 transition-opacity cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANNOUNCEMENT */}
        {activeTab === 'announcement' && (
          <div className="space-y-8 max-w-3xl">
            {/* Live Preview */}
            <div className="p-6 bg-[#FFFFFF] rounded-xl neo-border neo-shadow-sm space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#5B5751] block">
                // LIVE COMPONENT PREVIEW
              </span>
              <div className="w-full bg-[#FFDB58] border-3 border-[#111111] px-4 py-2 text-[#111111] text-xs font-mono flex flex-wrap items-center justify-between gap-2 rounded-sm neo-shadow-sm">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold px-1.5 py-0.5 bg-[#111111] text-[#FFDB58] rounded-xs uppercase text-[10px]">
                    {announcement.label}
                  </span>
                  <span className="truncate font-medium">{announcement.message}</span>
                </div>
                {announcement.linkUrl && (
                  <span className="font-bold underline decoration-2 uppercase text-[11px]">
                    {announcement.linkLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Announcement Form */}
            <form onSubmit={handleSaveAnnouncement} className="p-6 md:p-8 bg-[#FFFFFF] rounded-xl neo-border neo-shadow-md space-y-4">
              <h2 className="font-display font-bold text-xl text-[#111111] uppercase pb-2 border-b-2 border-[#111111]">
                Configure Header Announcement
              </h2>

              <div className="flex items-center gap-3 p-3 bg-[#FFF9E9] border-2 border-[#111111] rounded-md">
                <input
                  id="announcement-enabled"
                  type="checkbox"
                  checked={announcement.enabled}
                  onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                  className="w-5 h-5 accent-[#111111] cursor-pointer"
                />
                <label htmlFor="announcement-enabled" className="font-display font-bold text-sm text-[#111111] cursor-pointer">
                  Display announcement bar across the top of all pages
                </label>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-[#111111] mb-1">
                  Badge Label
                </label>
                <input
                  type="text"
                  required
                  value={announcement.label}
                  onChange={(e) => setAnnouncement({ ...announcement, label: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-md border-2 border-[#111111] font-mono text-xs bg-[#FFF9E9] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-[#111111] mb-1">
                  Message Content
                </label>
                <input
                  type="text"
                  required
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-md border-2 border-[#111111] font-body text-sm bg-[#FFF9E9] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-[#111111] mb-1">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={announcement.linkLabel}
                    onChange={(e) => setAnnouncement({ ...announcement, linkLabel: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border-2 border-[#111111] font-mono text-xs bg-[#FFF9E9] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-[#111111] mb-1">
                    Link Destination URL
                  </label>
                  <input
                    type="text"
                    value={announcement.linkUrl}
                    onChange={(e) => setAnnouncement({ ...announcement, linkUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border-2 border-[#111111] font-mono text-xs bg-[#FFF9E9] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 font-display text-sm font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-md bg-[#FFDB58] text-[#111111] neo-btn-press inline-flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <CheckCircle2 size={16} />
                <span>Save Announcement ↗</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: GITHUB SYNC CONSOLE */}
        {activeTab === 'github' && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-6 md:p-8 bg-[#FFFFFF] rounded-xl neo-border neo-shadow-md space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#5B5751]">
                // AUTOMATED GITHUB REPOSITORY SYNC
              </span>
              <h2 className="font-display font-black text-2xl text-[#111111] uppercase">
                Synchronize Public Repositories
              </h2>
              <p className="text-sm text-[#5B5751] font-medium leading-relaxed">
                Fetches all public repositories from GitHub (<span className="font-mono text-[#111111] font-bold">tongthanhdat009</span>), auto-categorizes them, assigns accents, extracts topics, and updates <span className="font-mono text-[#111111]">src/content/projects.ts</span>.
              </p>

              <button
                type="button"
                onClick={handleGithubSync}
                disabled={isPending}
                className="px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-md bg-[#89CFF0] text-[#111111] neo-btn-press inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
                <span>{isPending ? 'Syncing with GitHub...' : 'Trigger Sync Now 🔄'}</span>
              </button>
            </div>

            {syncLog && (
              <div className="p-6 bg-[#111111] text-[#FFF9E9] rounded-xl neo-border font-mono text-xs space-y-2 overflow-x-auto">
                <div className="text-[#FFDB58] font-bold pb-2 border-b border-[#5B5751]">
                  $ terminal --stream github-sync
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed text-[#C6F56A]">{syncLog}</pre>
              </div>
            )}
          </div>
        )}

        {/* PROJECT EDIT MODAL */}
        {editingProject && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-3xl bg-[#FFFFFF] rounded-xl neo-border-poster neo-shadow-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#111111]">
                <h2 className="font-display font-black text-2xl text-[#111111] uppercase">
                  {editingProject.isNew ? 'Create New Project' : `Edit: ${editingProject.data.title}`}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-3 py-1 font-mono text-xs font-bold border-2 border-[#111111] rounded bg-[#FF7661] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">PROJECT TITLE *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.data.title}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          data: {
                            ...editingProject.data,
                            title: e.target.value,
                            slug: editingProject.isNew
                              ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                              : editingProject.data.slug,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">SLUG (URL KEY) *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.data.slug}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          data: { ...editingProject.data, slug: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">CATEGORY</label>
                    <select
                      value={editingProject.data.category}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          data: { ...editingProject.data, category: e.target.value as Project['category'] },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    >
                      <option value="Web Products">Web Products</option>
                      <option value="Backend & APIs">Backend & APIs</option>
                      <option value="Intelligent Workflows">Intelligent Workflows</option>
                      <option value="Developer Tools">Developer Tools</option>
                      <option value="Systems & Architecture">Systems & Architecture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">STATUS</label>
                    <select
                      value={editingProject.data.status}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          data: { ...editingProject.data, status: e.target.value as Project['status'] },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    >
                      <option value="Open Source">Open Source</option>
                      <option value="In Production">In Production</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Prototype">Prototype</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">ACCENT THEME</label>
                    <select
                      value={editingProject.data.accent}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          data: { ...editingProject.data, accent: e.target.value as ColorAccent },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    >
                      <option value="sky">Sky (Blue)</option>
                      <option value="sun">Sun (Yellow)</option>
                      <option value="coral">Coral (Orange)</option>
                      <option value="lime">Lime (Green)</option>
                      <option value="paper">Paper (Cream)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#111111] mb-1">SUMMARY / TAGLINE *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingProject.data.summary}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        data: { ...editingProject.data, summary: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9] font-body text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">LIVE DEMO URL</label>
                    <input
                      type="url"
                      value={editingProject.data.demoUrl || ''}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          data: { ...editingProject.data, demoUrl: e.target.value || undefined },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">SOURCE REPO URL</label>
                    <input
                      type="url"
                      value={editingProject.data.repoUrl || ''}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          data: { ...editingProject.data, repoUrl: e.target.value || undefined },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#111111] mb-1">TAGS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={editingProject.data.tags.join(', ')}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        data: {
                          ...editingProject.data,
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="project-featured"
                    type="checkbox"
                    checked={editingProject.data.featured}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        data: { ...editingProject.data, featured: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-[#111111]"
                  />
                  <label htmlFor="project-featured" className="font-bold cursor-pointer">
                    Mark as Featured Build on Homepage
                  </label>
                </div>

                <div className="pt-4 border-t-2 border-[#111111] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 border-2 border-[#111111] rounded font-bold uppercase bg-[#FFFFFF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 border-2 border-[#111111] rounded font-bold uppercase bg-[#FFDB58] neo-btn-press"
                  >
                    Save Project ↗
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EXPERIMENT EDIT MODAL */}
        {editingExperiment && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-2xl bg-[#FFFFFF] rounded-xl neo-border-poster neo-shadow-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#111111]">
                <h2 className="font-display font-black text-2xl text-[#111111] uppercase">
                  {editingExperiment.isNew ? 'New Lab Experiment' : `Edit: ${editingExperiment.data.title}`}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingExperiment(null)}
                  className="px-3 py-1 font-mono text-xs font-bold border-2 border-[#111111] rounded bg-[#FF7661]"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSaveExperiment} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">TITLE *</label>
                    <input
                      type="text"
                      required
                      value={editingExperiment.data.title}
                      onChange={(e) =>
                        setEditingExperiment({
                          ...editingExperiment,
                          data: {
                            ...editingExperiment.data,
                            title: e.target.value,
                            slug: editingExperiment.isNew
                              ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                              : editingExperiment.data.slug,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">SLUG *</label>
                    <input
                      type="text"
                      required
                      value={editingExperiment.data.slug}
                      onChange={(e) =>
                        setEditingExperiment({
                          ...editingExperiment,
                          data: { ...editingExperiment.data, slug: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">STATUS</label>
                    <select
                      value={editingExperiment.data.status}
                      onChange={(e) =>
                        setEditingExperiment({
                          ...editingExperiment,
                          data: { ...editingExperiment.data, status: e.target.value as Experiment['status'] },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    >
                      <option value="Prototype">Prototype</option>
                      <option value="Exploring">Exploring</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">ACCENT</label>
                    <select
                      value={editingExperiment.data.accent}
                      onChange={(e) =>
                        setEditingExperiment({
                          ...editingExperiment,
                          data: { ...editingExperiment.data, accent: e.target.value as ColorAccent },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    >
                      <option value="lime">Lime</option>
                      <option value="sun">Sun</option>
                      <option value="sky">Sky</option>
                      <option value="coral">Coral</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#111111] mb-1">SUMMARY *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingExperiment.data.summary}
                    onChange={(e) =>
                      setEditingExperiment({
                        ...editingExperiment,
                        data: { ...editingExperiment.data, summary: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] mb-1">OBJECTIVE</label>
                  <textarea
                    rows={2}
                    value={editingExperiment.data.objective}
                    onChange={(e) =>
                      setEditingExperiment({
                        ...editingExperiment,
                        data: { ...editingExperiment.data, objective: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] mb-1">HOW IT WORKS</label>
                  <textarea
                    rows={2}
                    value={editingExperiment.data.howItWorks}
                    onChange={(e) =>
                      setEditingExperiment({
                        ...editingExperiment,
                        data: { ...editingExperiment.data, howItWorks: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">KNOWN LIMITATIONS</label>
                    <textarea
                      rows={2}
                      value={editingExperiment.data.limitations}
                      onChange={(e) =>
                        setEditingExperiment({
                          ...editingExperiment,
                          data: { ...editingExperiment.data, limitations: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">KEY TAKEAWAYS</label>
                    <textarea
                      rows={2}
                      value={editingExperiment.data.takeaways}
                      onChange={(e) =>
                        setEditingExperiment({
                          ...editingExperiment,
                          data: { ...editingExperiment.data, takeaways: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-[#111111] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingExperiment(null)}
                    className="px-4 py-2 border-2 border-[#111111] rounded font-bold uppercase bg-[#FFFFFF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 border-2 border-[#111111] rounded font-bold uppercase bg-[#C6F56A] neo-btn-press"
                  >
                    Save Experiment ↗
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NOTE EDIT MODAL */}
        {editingNote && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-3xl bg-[#FFFFFF] rounded-xl neo-border-poster neo-shadow-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#111111]">
                <h2 className="font-display font-black text-2xl text-[#111111] uppercase">
                  {editingNote.isNew ? 'New Field Note' : `Edit: ${editingNote.data.title}`}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-3 py-1 font-mono text-xs font-bold border-2 border-[#111111] rounded bg-[#FF7661]"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">NOTE TITLE *</label>
                    <input
                      type="text"
                      required
                      value={editingNote.data.title}
                      onChange={(e) =>
                        setEditingNote({
                          ...editingNote,
                          data: {
                            ...editingNote.data,
                            title: e.target.value,
                            slug: editingNote.isNew
                              ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                              : editingNote.data.slug,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">SLUG *</label>
                    <input
                      type="text"
                      required
                      value={editingNote.data.slug}
                      onChange={(e) =>
                        setEditingNote({
                          ...editingNote,
                          data: { ...editingNote.data, slug: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">CATEGORY</label>
                    <input
                      type="text"
                      value={editingNote.data.category}
                      onChange={(e) =>
                        setEditingNote({
                          ...editingNote,
                          data: { ...editingNote.data, category: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">READ TIME</label>
                    <input
                      type="text"
                      value={editingNote.data.readTime}
                      onChange={(e) =>
                        setEditingNote({
                          ...editingNote,
                          data: { ...editingNote.data, readTime: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">PUBLISHED DATE</label>
                    <input
                      type="date"
                      value={editingNote.data.publishedAt}
                      onChange={(e) =>
                        setEditingNote({
                          ...editingNote,
                          data: { ...editingNote.data, publishedAt: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#111111] mb-1">EXCERPT *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingNote.data.excerpt}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        data: { ...editingNote.data, excerpt: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] mb-1">
                    CONTENT PARAGRAPHS (SEPARATE BY DOUBLE NEWLINE) *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={editingNote.data.content.join('\n\n')}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        data: {
                          ...editingNote.data,
                          content: e.target.value.split('\n\n').filter(Boolean),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-[#111111] rounded bg-[#FFF9E9] font-body text-xs"
                  />
                </div>

                <div className="pt-4 border-t-2 border-[#111111] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingNote(null)}
                    className="px-4 py-2 border-2 border-[#111111] rounded font-bold uppercase bg-[#FFFFFF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 border-2 border-[#111111] rounded font-bold uppercase bg-[#FFDB58] neo-btn-press"
                  >
                    Save Note ↗
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
