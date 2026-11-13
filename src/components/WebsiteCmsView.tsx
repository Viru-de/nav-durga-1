import React, { useState, useEffect } from 'react';
import { Globe, Save, CheckCircle2, ExternalLink, Sparkles, Building2, Phone } from 'lucide-react';
import { WebsiteCmsContent } from '../types';
import { PlatformApi } from '../services/platformApi';

interface WebsiteCmsViewProps {
  cms: WebsiteCmsContent;
  onCmsUpdated: (updated: WebsiteCmsContent) => void;
  onOpenPublicSite?: (path: string) => void;
}

export const WebsiteCmsView: React.FC<WebsiteCmsViewProps> = ({
  cms,
  onCmsUpdated,
  onOpenPublicSite,
}) => {
  const [form, setForm] = useState<WebsiteCmsContent>(cms);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(cms);
  }, [cms]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedBanner(null);
    try {
      const res = await PlatformApi.saveWebsiteCms(form);
      onCmsUpdated(res.cms);
      setForm(res.cms);
      setSavedBanner(`Website CMS published at ${new Date(res.cms.updatedAt).toLocaleTimeString('en-IN')}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save CMS content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Public Website Content Manager</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 mt-1">
            Website CMS — Nav Durga Ispat Public Portal
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Update homepage headline, dispatch announcement banner, corporate narrative, unit titles, and contact desk info live.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenPublicSite && (
            <button
              type="button"
              onClick={() => onOpenPublicSite('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Website</span>
            </button>
          )}
        </div>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{savedBanner}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero & Announcement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Hero Section &amp; Top Announcement Strip
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hero Badge Label</label>
              <input
                type="text"
                value={form.heroBadge}
                onChange={(e) => setForm({ ...form, heroBadge: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Main Hero Headline</label>
              <input
                type="text"
                value={form.heroHeadline}
                onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Hero Subheadline</label>
              <textarea
                rows={2}
                value={form.heroSubheadline}
                onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Top Announcement Banner Text
                </label>
                <input
                  type="text"
                  value={form.announcementBanner}
                  onChange={(e) => setForm({ ...form, announcementBanner: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <label className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={form.showAnnouncementBanner}
                  onChange={(e) => setForm({ ...form, showAnnouncementBanner: e.target.checked })}
                  className="rounded border-slate-300 text-blue-700"
                />
                <span>Show Banner Publicly</span>
              </label>
            </div>
          </div>
        </div>

        {/* Corporate & Units */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Company Narrative, Units &amp; Quality Copy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">About Section Title</label>
              <input
                type="text"
                value={form.aboutTitle}
                onChange={(e) => setForm({ ...form, aboutTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medium Section Unit</label>
                <input
                  type="text"
                  value={form.unit1Name}
                  onChange={(e) => setForm({ ...form, unit1Name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Light Section Unit</label>
                <input
                  type="text"
                  value={form.unit2Name}
                  onChange={(e) => setForm({ ...form, unit2Name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">About Summary</label>
              <textarea
                rows={3}
                value={form.aboutSummary}
                onChange={(e) => setForm({ ...form, aboutSummary: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vision Statement</label>
              <textarea
                rows={2}
                value={form.visionText}
                onChange={(e) => setForm({ ...form, visionText: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mission Statement</label>
              <textarea
                rows={2}
                value={form.missionText}
                onChange={(e) => setForm({ ...form, missionText: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Quality Assurance Copy</label>
              <textarea
                rows={2}
                value={form.qualityCommitment}
                onChange={(e) => setForm({ ...form, qualityCommitment: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Contact & Dispatch Desk */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Public Contact &amp; Dispatch Coordinates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sales Phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={form.contactWhatsapp}
                onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Plant Address</label>
              <input
                type="text"
                value={form.contactAddress}
                onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Hours</label>
              <input
                type="text"
                value={form.dispatchHours}
                onChange={(e) => setForm({ ...form, dispatchHours: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Last published by <span className="font-bold text-slate-700">{form.updatedBy}</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing CMS...' : 'Publish Website Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
