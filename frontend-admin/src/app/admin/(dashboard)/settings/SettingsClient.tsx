'use client';

import React, { useState, useTransition } from 'react';
import {
  Save,
  Sliders,
  CheckCircle2,
  Globe,
  Bell,
  Navigation,
  Palette,
  Search,
  Download,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { CmsGlobals, ColorAccent, NavLink } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { updateGlobalsAction } from '@/app/admin/actions';

interface SettingsClientProps {
  initialGlobals: CmsGlobals;
}

export default function SettingsClient({ initialGlobals }: SettingsClientProps) {
  const [globals, setGlobals] = useState(initialGlobals);
  const [activeTab, setActiveTab] = useState<'identity' | 'announcement' | 'navigation' | 'appearance' | 'seo' | 'export'>('identity');
  const [saveStatus, setSaveStatus] = useState('');
  const [isPending, startTransition] = useTransition();

  // Settings states
  const [siteTitle, setSiteTitle] = useState(globals.siteSettings?.siteTitle || '');
  const [ownerName, setOwnerName] = useState(globals.siteSettings?.ownerName || '');
  const [tagline, setTagline] = useState(globals.siteSettings?.tagline || '');
  const [description, setDescription] = useState(globals.siteSettings?.description || '');
  const [logoText, setLogoText] = useState(globals.siteSettings?.logoText || 'DAT.DEV');
  const [contactEmail, setContactEmail] = useState(globals.siteSettings?.contactEmail || '');
  const [resumeUrl, setResumeUrl] = useState(globals.siteSettings?.resumeUrl || '');

  // Announcement
  const [announcementEnabled, setAnnouncementEnabled] = useState(globals.announcement?.enabled ?? true);
  const [announcementLabel, setAnnouncementLabel] = useState(globals.announcement?.label || '');
  const [announcementMessage, setAnnouncementMessage] = useState(globals.announcement?.message || '');
  const [announcementLink, setAnnouncementLink] = useState(globals.announcement?.linkUrl || '');

  // Navigation Links
  const [navLinks, setNavLinks] = useState<NavLink[]>(globals.navigation || []);

  // Appearance
  const [accentPreset, setAccentPreset] = useState<ColorAccent>(globals.appearance?.accentPreset || 'sun');

  // SEO
  const [siteTitleTemplate, setSiteTitleTemplate] = useState(globals.siteSettings?.seoDefaults?.siteTitleTemplate || '%s | Dat Nguyen');
  const [keywordsInput, setKeywordsInput] = useState((globals.siteSettings?.seoDefaults?.keywords || []).join(', '));

  const handleSave = () => {
    startTransition(async () => {
      try {
        const updated: Partial<CmsGlobals> = {
          siteSettings: {
            ...globals.siteSettings,
            siteTitle,
            ownerName,
            tagline,
            description,
            logoText,
            contactEmail,
            resumeUrl,
            seoDefaults: {
              ...globals.siteSettings?.seoDefaults,
              siteTitleTemplate,
              keywords: keywordsInput.split(',').map((k) => k.trim()).filter(Boolean),
            },
          },
          announcement: {
            ...globals.announcement,
            enabled: announcementEnabled,
            label: announcementLabel,
            message: announcementMessage,
            linkUrl: announcementLink,
          },
          navigation: navLinks,
          appearance: {
            ...globals.appearance,
            accentPreset,
          },
        };

        const res = await updateGlobalsAction(updated);
        setGlobals(res);
        setSaveStatus(`Settings saved successfully at ${new Date().toLocaleTimeString()}!`);
        setTimeout(() => setSaveStatus(''), 4000);
      } catch (err) {
        setSaveStatus(`Save failed: ${(err as Error).message}`);
      }
    });
  };

  const handleMoveNav = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= navLinks.length) return;
    const copy = [...navLinks];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    copy.forEach((l, idx) => (l.order = idx + 1));
    setNavLinks(copy);
  };

  const handleAddNav = () => {
    setNavLinks([
      ...navLinks,
      {
        id: `nav_${Date.now()}`,
        label: 'NEW LINK',
        href: '/#',
        isExternal: false,
        order: navLinks.length + 1,
      },
    ]);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(globals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `portfolio-cms-globals-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const tabs = [
    { key: 'identity', label: 'Identity & Bio', icon: Globe },
    { key: 'announcement', label: 'Announcement', icon: Bell },
    { key: 'navigation', label: 'Navigation', icon: Navigation },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'seo', label: 'SEO Defaults', icon: Search },
    { key: 'export', label: 'Export JSON', icon: Download },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-[var(--color-ink)] pb-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-sun)] px-2 py-0.5 border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
            SYSTEM PREFERENCES
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] mt-1">
            GLOBAL SETTINGS
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Site identity, navigation menu hierarchy, announcement status strip, appearance tokens, and backup options.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {saveStatus}
            </span>
          )}

          <Button variant="primary" size="lg" onClick={handleSave} isLoading={isPending}>
            <Save className="w-4 h-4" /> SAVE SETTINGS
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-stone-200 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded-t-[var(--radius-sm)] ${
                activeTab === t.key
                  ? 'bg-[var(--color-sun)] text-[var(--color-ink)] border-2 border-b-0 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]'
                  : 'text-stone-600 hover:text-black hover:bg-[var(--color-paper)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <Card variant="surface" shadow="md" borderWidth="2" className="p-6">
        {/* Tab 1: Identity */}
        {activeTab === 'identity' && (
          <div className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Owner / Display Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Dat Nguyen"
              />
              <Input
                label="Logo / Brand Mark Text"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                placeholder="DAT.DEV"
              />
            </div>

            <Input
              label="Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Defiant engineering. Resilient systems. Tactile interfaces."
            />

            <Textarea
              label="Bio / Site Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@datnguyen.dev"
              />
              <Input
                label="Resume / CV File Path"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="/resume.pdf"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Announcement */}
        {activeTab === 'announcement' && (
          <div className="space-y-5 max-w-2xl">
            <div className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-300 rounded">
              <input
                type="checkbox"
                id="annToggle"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-black"
              />
              <label htmlFor="annToggle" className="font-display text-sm font-bold uppercase cursor-pointer">
                ENABLE TOP ANNOUNCEMENT STRIP
              </label>
            </div>

            <Input
              label="Status Tag / Label"
              value={announcementLabel}
              onChange={(e) => setAnnouncementLabel(e.target.value)}
              placeholder="STATUS: ACTIVE"
            />

            <Textarea
              label="Announcement Text"
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              rows={2}
              placeholder="Available for Q4 contracts & technical architecture consulting."
            />

            <Input
              label="Link Destination URL"
              value={announcementLink}
              onChange={(e) => setAnnouncementLink(e.target.value)}
              placeholder="/contact"
            />
          </div>
        )}

        {/* Tab 3: Navigation */}
        {activeTab === 'navigation' && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3">
              <span className="font-display font-bold text-xs uppercase tracking-wider text-stone-600">
                HEADER NAVIGATION LINKS ({navLinks.length})
              </span>
              <Button variant="secondary" size="sm" onClick={handleAddNav}>
                <Plus className="w-3.5 h-3.5" /> ADD LINK
              </Button>
            </div>

            <div className="space-y-2">
              {navLinks.map((link, idx) => (
                <div
                  key={link.id}
                  className="p-3 bg-stone-50 border-2 border-black rounded-[var(--radius-sm)] flex items-center justify-between gap-3 shadow-[var(--shadow-neo-sm)]"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-mono text-xs font-bold text-stone-400 w-4">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const copy = [...navLinks];
                        copy[idx].label = e.target.value;
                        setNavLinks(copy);
                      }}
                      className="px-2 py-1 bg-white border border-black font-display font-bold text-xs uppercase rounded w-36"
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) => {
                        const copy = [...navLinks];
                        copy[idx].href = e.target.value;
                        setNavLinks(copy);
                      }}
                      className="px-2 py-1 bg-white border border-black font-mono text-xs rounded flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveNav(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-stone-200 rounded disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveNav(idx, 'down')}
                      disabled={idx === navLinks.length - 1}
                      className="p-1 hover:bg-stone-200 rounded disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setNavLinks(navLinks.filter((_, i) => i !== idx))}
                      className="p-1 hover:bg-[var(--color-coral)] rounded cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Appearance */}
        {activeTab === 'appearance' && (
          <div className="space-y-5 max-w-2xl">
            <span className="font-display font-bold text-xs uppercase tracking-wider block text-stone-600">
              ACCENT PALETTE PRESET
            </span>
            <p className="text-xs font-body text-stone-600">
              Select the primary energetic accent color used for key interactive elements across both Admin and Public portfolios.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'sun', label: 'Sun Yellow', color: '#FFDB58' },
                { key: 'sky', label: 'Electric Sky', color: '#89CFF0' },
                { key: 'coral', label: 'Coral Neon', color: '#FF7661' },
                { key: 'lime', label: 'Acid Lime', color: '#C6F56A' },
              ].map((preset) => (
                <div
                  key={preset.key}
                  onClick={() => setAccentPreset(preset.key as ColorAccent)}
                  className={`p-4 rounded-[var(--radius-md)] border-2 transition-all cursor-pointer text-center ${
                    accentPreset === preset.key
                      ? 'border-black ring-2 ring-blue-600 shadow-[var(--shadow-neo-md)]'
                      : 'border-stone-300 hover:border-black'
                  }`}
                  style={{ backgroundColor: preset.color }}
                >
                  <span className="font-display font-black text-xs uppercase text-black">
                    {preset.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-5 max-w-2xl">
            <Input
              label="Site Title Template"
              value={siteTitleTemplate}
              onChange={(e) => setSiteTitleTemplate(e.target.value)}
              placeholder="%s | Dat Nguyen"
              helperText="%s will be replaced with individual page/project titles."
            />

            <Input
              label="Global Keywords (comma separated)"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="Next.js, TypeScript, Distributed Systems, Neo-Brutalism"
            />
          </div>
        )}

        {/* Tab 6: Export */}
        {activeTab === 'export' && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-display font-black text-base text-[var(--color-ink)] uppercase">
              BACKUP & CONFIGURATION EXPORT
            </h3>
            <p className="text-xs font-body text-stone-600 leading-relaxed">
              Download complete structured JSON snapshot of all global portfolio configurations, navigation links, and theme presets.
            </p>
            <Button variant="primary" size="md" onClick={handleExportJson}>
              <Download className="w-4 h-4" /> DOWNLOAD GLOBALS.JSON
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
