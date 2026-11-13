import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Building2,
  Phone,
  Images,
  Upload,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  RotateCcw,
  Star,
} from 'lucide-react';
import { HeroSlideItem, WebsiteCmsContent } from '../types';
import { PlatformApi } from '../services/platformApi';
import { DEFAULT_HERO_SLIDES } from '../data/heroSlidesDefaults';

interface WebsiteCmsViewProps {
  cms: WebsiteCmsContent;
  onCmsUpdated: (updated: WebsiteCmsContent) => void;
  onOpenPublicSite?: (path: string) => void;
}

function normalizeSlides(slides?: HeroSlideItem[]): HeroSlideItem[] {
  const source = slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  return [...source]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s, idx) => ({
      ...s,
      enabled: s.enabled !== false,
      order: idx + 1,
    }));
}

async function compressHeroImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Selected file is not a valid image.'));
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 900;
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable for image compression.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export const WebsiteCmsView: React.FC<WebsiteCmsViewProps> = ({
  cms,
  onCmsUpdated,
  onOpenPublicSite,
}) => {
  const [form, setForm] = useState<WebsiteCmsContent>(() => ({
    ...cms,
    heroSlides: normalizeSlides(cms.heroSlides),
    defaultHeroSlideId: cms.defaultHeroSlideId || normalizeSlides(cms.heroSlides)[0]?.id || 'slide-1',
  }));
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);

  useEffect(() => {
    const normalized = normalizeSlides(cms.heroSlides);
    setForm({
      ...cms,
      heroSlides: normalized,
      defaultHeroSlideId: cms.defaultHeroSlideId || normalized[0]?.id || 'slide-1',
    });
  }, [cms]);

  const slides = normalizeSlides(form.heroSlides);

  const updateSlides = (nextSlides: HeroSlideItem[], nextDefaultId?: string) => {
    const reordered = nextSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    const defaultStillExists = reordered.some((s) => s.id === (nextDefaultId || form.defaultHeroSlideId));
    setForm((prev) => ({
      ...prev,
      heroSlides: reordered,
      defaultHeroSlideId: defaultStillExists
        ? nextDefaultId || prev.defaultHeroSlideId
        : reordered[0]?.id || 'slide-1',
    }));
  };

  const handleUpdateSlideField = <K extends keyof HeroSlideItem>(
    slideId: string,
    field: K,
    value: HeroSlideItem[K]
  ) => {
    const next = slides.map((slide) => {
      if (slide.id !== slideId) return slide;
      const updated: HeroSlideItem = { ...slide, [field]: value };
      // If imageUrl is replaced with a custom URL or upload, clear the preset webpUrl so <picture> displays the updated image
      if (
        field === 'imageUrl' &&
        typeof value === 'string' &&
        !value.startsWith('/assets/hero-slides/')
      ) {
        updated.webpUrl = undefined;
      }
      return updated;
    });
    updateSlides(next);
  };

  const handleMoveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const copy = [...slides];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    updateSlides(copy);
  };

  const handleAddSlide = () => {
    const newId = `slide-${Date.now()}`;
    const newSlide: HeroSlideItem = {
      id: newId,
      order: slides.length + 1,
      enabled: true,
      imageUrl: '/assets/hero-slides/slide-1-rolling-mill.jpg',
      fallbackUrl: '/assets/hero-slides/slide-1-rolling-mill.jpg',
      alt: 'Nav Durga Ispat industrial steel product showcase',
      smallHeading: form.heroBadge || 'ESTABLISHED 1988 | RAIPUR, CHHATTISGARH',
      heading: form.heroHeadline || 'STRENGTH IN STEEL. BUILT FOR TOMORROW.',
      description:
        form.heroSubheadline ||
        'Steel products for industrial, structural and infrastructure requirements. Explore our products and connect with our team.',
      primaryCtaLabel: 'EXPLORE OUR PRODUCTS',
      primaryCtaTarget: '#products-section',
      secondaryCtaLabel: 'VIEW LIVE RATES',
      secondaryCtaTarget: '/product-rates',
    };
    updateSlides([...slides, newSlide]);
  };

  const handleRemoveSlide = (slideId: string) => {
    if (slides.length <= 1) return;
    const filtered = slides.filter((s) => s.id !== slideId);
    const nextDefault =
      form.defaultHeroSlideId === slideId ? filtered[0]?.id : form.defaultHeroSlideId;
    updateSlides(filtered, nextDefault);
  };

  const handleResetDefaultSlides = () => {
    updateSlides(DEFAULT_HERO_SLIDES, DEFAULT_HERO_SLIDES[0].id);
  };

  const handleSlideImageUpload = async (
    slideId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setUploadingSlideId(slideId);
    try {
      const compressedDataUrl = await compressHeroImageFile(file);
      const next = slides.map((s) =>
        s.id === slideId
          ? {
              ...s,
              imageUrl: compressedDataUrl,
              webpUrl: undefined,
            }
          : s
      );
      updateSlides(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process uploaded image.');
    } finally {
      setUploadingSlideId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedBanner(null);
    try {
      const payload: WebsiteCmsContent = {
        ...form,
        heroSlides: slides,
      };
      const res = await PlatformApi.saveWebsiteCms(payload);
      onCmsUpdated(res.cms);
      setForm({
        ...res.cms,
        heroSlides: normalizeSlides(res.cms.heroSlides),
        defaultHeroSlideId: res.cms.defaultHeroSlideId || 'slide-1',
      });
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
            Manage homepage hero slider images, headlines, announcement banner, corporate narrative, unit titles, and contact desk info live.
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
        {/* Hero Default Copy & Announcement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Hero Section Defaults &amp; Top Announcement Strip
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Hero Small Heading</label>
              <input
                type="text"
                value={form.heroBadge}
                onChange={(e) => setForm({ ...form, heroBadge: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Hero Headline</label>
              <input
                type="text"
                value={form.heroHeadline}
                onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Hero Supporting Text</label>
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

        {/* Homepage Hero Image Slider Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4 text-red-700" />
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Homepage Hero Image Slider ({slides.filter((s) => s.enabled).length} Active / {slides.length} Total)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload photos, enter image URLs, reorder slides, choose the initial slide, and customize slide headings or CTAs. Click &quot;Publish Website Changes&quot; below to apply live.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetDefaultSlides}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {slides.map((slide, idx) => {
              const isDefault = form.defaultHeroSlideId === slide.id;
              return (
                <div
                  key={slide.id}
                  className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
                    slide.enabled
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-slate-100/80 border-slate-200 opacity-80'
                  }`}
                >
                  {/* Slide Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-extrabold text-slate-900 tabular-nums">
                        Slide #{idx + 1}
                      </span>

                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={slide.enabled}
                          onChange={(e) => handleUpdateSlideField(slide.id, 'enabled', e.target.checked)}
                          className="rounded border-slate-300 text-blue-700"
                        />
                        <span>{slide.enabled ? 'Enabled' : 'Disabled'}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, defaultHeroSlideId: slide.id }))}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                          isDefault
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-600'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isDefault ? 'fill-amber-500 text-amber-600' : ''}`} />
                        <span>{isDefault ? 'Default First Slide' : 'Set as Default First'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, -1)}
                        disabled={idx === 0}
                        aria-label={`Move slide ${idx + 1} up`}
                        className="p-2 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, 1)}
                        disabled={idx === slides.length - 1}
                        aria-label={`Move slide ${idx + 1} down`}
                        className="p-2 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(slide.id)}
                        disabled={slides.length <= 1}
                        aria-label={`Remove slide ${idx + 1}`}
                        className="p-2 rounded-lg bg-white hover:bg-red-50 disabled:opacity-40 border border-slate-300 text-red-700 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail + Inputs Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-4 space-y-2.5">
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-200 relative">
                        <img
                          src={slide.imageUrl}
                          alt={slide.alt || `Slide ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-blue-700" />
                          <span>
                            {uploadingSlideId === slide.id ? 'Processing...' : 'Upload Image'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSlideImageUpload(slide.id, e)}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Image URL / Asset Path
                        </label>
                        <input
                          type="text"
                          value={slide.imageUrl.startsWith('data:') ? 'Uploaded Custom Image (Embedded JPEG)' : slide.imageUrl}
                          onChange={(e) => {
                            if (!e.target.value.startsWith('Uploaded Custom Image')) {
                              handleUpdateSlideField(slide.id, 'imageUrl', e.target.value);
                            }
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Small Eyebrow Heading
                        </label>
                        <input
                          type="text"
                          value={slide.smallHeading || ''}
                          onChange={(e) => handleUpdateSlideField(slide.id, 'smallHeading', e.target.value)}
                          placeholder="ESTABLISHED 1988 | RAIPUR, CHHATTISGARH"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Image Alt Text (SEO &amp; Accessibility)
                        </label>
                        <input
                          type="text"
                          value={slide.alt}
                          onChange={(e) => handleUpdateSlideField(slide.id, 'alt', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Main Slide Headline
                        </label>
                        <input
                          type="text"
                          value={slide.heading || ''}
                          onChange={(e) => handleUpdateSlideField(slide.id, 'heading', e.target.value)}
                          placeholder="STRENGTH IN STEEL. BUILT FOR TOMORROW."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Supporting Description
                        </label>
                        <textarea
                          rows={2}
                          value={slide.description || ''}
                          onChange={(e) => handleUpdateSlideField(slide.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Primary Button Label
                        </label>
                        <input
                          type="text"
                          value={slide.primaryCtaLabel || ''}
                          onChange={(e) => handleUpdateSlideField(slide.id, 'primaryCtaLabel', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Primary Button Target
                        </label>
                        <input
                          type="text"
                          value={slide.primaryCtaTarget || ''}
                          onChange={(e) => handleUpdateSlideField(slide.id, 'primaryCtaTarget', e.target.value)}
                          placeholder="#products-section or /products"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Secondary Button Label
                        </label>
                        <input
                          type="text"
                          value={slide.secondaryCtaLabel || ''}
                          onChange={(e) => handleUpdateSlideField(slide.id, 'secondaryCtaLabel', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Secondary Button Target
                        </label>
                        <input
                          type="text"
                          value={slide.secondaryCtaTarget || ''}
                          onChange={(e) => handleUpdateSlideField(slide.id, 'secondaryCtaTarget', e.target.value)}
                          placeholder="/product-rates"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company CIN</label>
              <input
                type="text"
                value={form.cinNumber || 'U24132CT1988PTC004838'}
                onChange={(e) => setForm({ ...form, cinNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Established Year</label>
              <input
                type="text"
                value={form.establishedYear || '1988'}
                onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
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
