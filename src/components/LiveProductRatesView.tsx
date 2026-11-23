import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  Printer,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { PublicRateProductItem, PublicRatesPayload, WebsiteCmsContent } from '../types';
import { PlatformApi } from '../services/platformApi';
import { SeoHead } from './SeoHead';
import { NavDurgaLogo } from './NavDurgaLogo';
import { InnerPageBanner } from './InnerPageBanner';

interface LiveProductRatesViewProps {
  initialRates: PublicRatesPayload | null;
  cms: WebsiteCmsContent;
  onOpenQuoteModal: (presetProduct?: string, presetGrade?: string) => void;
  onRatesRefreshed?: (rates: PublicRatesPayload) => void;
  onNavigate?: (path: string) => void;
}

function formatInr(amount: number): string {
  if (!amount || amount <= 0) return 'Request Latest Rate';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export const LiveProductRatesView: React.FC<LiveProductRatesViewProps> = ({
  initialRates,
  cms,
  onOpenQuoteModal,
  onRatesRefreshed,
  onNavigate,
}) => {
  const [rates, setRates] = useState<PublicRatesPayload | null>(initialRates);
  const [loading, setLoading] = useState(!initialRates);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'MEDIUM SECTION' | 'LIGHT SECTION'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');

  useEffect(() => {
    if (initialRates) {
      setRates(initialRates);
    }
  }, [initialRates]);

  const loadLatestRates = async () => {
    setRefreshing(true);
    try {
      const data = await PlatformApi.fetchPublicRates();
      setRates(data);
      onRatesRefreshed?.(data);
    } catch (err) {
      console.warn('Unable to refresh live rates:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLatestRates();
    const timer = window.setInterval(() => {
      PlatformApi.fetchPublicRates()
        .then((d) => {
          setRates(d);
          onRatesRefreshed?.(d);
        })
        .catch(() => {});
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const distinctGrades = useMemo(() => {
    const items = rates?.products || [];
    const set = new Set<string>();
    items.forEach((p) => {
      if (p.grade) set.add(p.grade);
    });
    return ['ALL', ...Array.from(set)];
  }, [rates]);

  const filteredProducts = useMemo(() => {
    const items = rates?.products || [];
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (sectionFilter !== 'ALL' && item.section !== sectionFilter) return false;
      if (gradeFilter !== 'ALL' && item.grade !== gradeFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.size.toLowerCase().includes(q) ||
        item.grade.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [rates, searchQuery, sectionFilter, gradeFilter]);

  const mediumProducts = useMemo(
    () => filteredProducts.filter((p) => p.section === 'MEDIUM SECTION'),
    [filteredProducts]
  );
  const lightProducts = useMemo(
    () => filteredProducts.filter((p) => p.section === 'LIGHT SECTION'),
    [filteredProducts]
  );

  const formattedUpdatedAt = useMemo(() => {
    if (!rates?.lastUpdated) return 'Live Market Feed';
    try {
      return new Date(rates.lastUpdated).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return rates.lastUpdated;
    }
  }, [rates?.lastUpdated]);

  const whatsappDigits = (cms.contactWhatsapp || '919827100000').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappDigits.startsWith('91') ? whatsappDigits : `91${whatsappDigits}`}?text=${encodeURIComponent(
    `Hello Nav Durga Ispat, I am checking today's Live Product Rates (Medium: ${
      rates?.mediumSectionRate ? `₹${rates.mediumSectionRate.toLocaleString('en-IN')}` : 'On Request'
    }, Light: ${
      rates?.lightSectionRate ? `₹${rates.lightSectionRate.toLocaleString('en-IN')}` : 'On Request'
    }). Please share dispatch availability.`
  )}`;

  const renderSectionTable = (
    title: string,
    subtitle: string,
    accent: 'primary' | 'deep',
    basicRate: number,
    items: PublicRateProductItem[]
  ) => {
    if (items.length === 0) return null;

    return (
      <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xs overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-amber)]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-navy)] text-[var(--color-linen)]">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-5 rounded-full ${
                  accent === 'primary' ? 'bg-[var(--color-amber)]' : 'bg-[var(--color-linen)]/70'
                }`}
                aria-hidden="true"
              />
              <h2 className="font-display text-lg font-extrabold text-[var(--color-linen)] tracking-tight">
                {title}
              </h2>
            </div>
            <p className="text-xs font-semibold text-[var(--color-linen)]/75 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3 bg-[var(--color-navy-hover)] px-4 py-2 rounded-xl border border-[var(--color-amber)]/40 shadow-2xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-linen)]/75">
                Section Basic Rate
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[var(--color-amber)] tabular-nums">
                {formatInr(basicRate)}{' '}
                {basicRate > 0 && <span className="text-xs font-semibold text-[var(--color-linen)]/75">/ MT</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View (< md) — Zero horizontal table scroll */}
        <div className="md:hidden print:hidden divide-y divide-[var(--color-border)]">
          {items.map((item) => {
            const hasRate = item.finalRate > 0;
            return (
              <div key={item.id} className="p-4 space-y-3 bg-[var(--color-surface)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[var(--color-navy)] leading-snug">{item.name}</div>
                    <div className="text-[11px] text-[var(--color-text-secondary)] font-mono mt-0.5 truncate">
                      {item.code} • {item.category}
                    </div>
                  </div>
                  {item.inStock ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-navy)] text-[var(--color-linen)] text-[10px] font-bold shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-[var(--color-amber)]" />
                      Ready Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--color-amber-soft)] border border-[var(--color-amber)] text-[var(--color-navy)] text-[10px] font-bold shrink-0">
                      Booking Open
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[var(--color-linen)]/55 rounded-xl border border-[var(--color-border)] p-2.5">
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[var(--color-text-secondary)]">Size</div>
                    <div className="font-bold text-[var(--color-navy)] mt-0.5">{item.size || 'Standard'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[var(--color-text-secondary)]">Grade</div>
                    <div className="font-bold text-[var(--color-navy)] mt-0.5">{item.grade}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[var(--color-text-secondary)]">Basic Rate</div>
                    <div className="font-semibold text-[var(--color-navy)] tabular-nums mt-0.5">
                      {item.baseRate > 0 ? formatInr(item.baseRate) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[var(--color-text-secondary)]">Gauge Diff.</div>
                    <div className="font-semibold text-[var(--color-navy)] tabular-nums mt-0.5">
                      {item.baseRate > 0 ? `+ ₹${Math.round(item.gaugeDifference).toLocaleString('en-IN')}` : '—'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Final Ex-Plant Rate
                    </div>
                    <div
                      className={`font-extrabold tabular-nums ${
                        hasRate ? 'text-base text-[var(--color-navy)]' : 'text-xs text-[var(--color-navy)]'
                      }`}
                    >
                      {formatInr(item.finalRate)}
                      {hasRate && (
                        <span className="text-[11px] font-medium text-[var(--color-text-secondary)] ml-1">/ {item.unit || 'MT'}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenQuoteModal(`${item.name} (${item.size})`, item.grade)}
                    className="nd-btn-primary min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0"
                  >
                    Quote
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tablet & Desktop Table View */}
        <div className="hidden md:block print:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-linen)] border-b border-[var(--color-border)] text-[11px] font-bold uppercase tracking-wider text-[var(--color-navy)]">
                <th className="py-3 px-4 sm:px-5">Product &amp; Code</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4 text-right">Basic Rate</th>
                <th className="py-3 px-4 text-right">Gauge Diff.</th>
                <th className="py-3 px-4 text-right">Final Ex-Plant Rate</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-xs sm:text-sm">
              {items.map((item) => {
                const hasRate = item.finalRate > 0;
                return (
                  <tr key={item.id} className="hover:bg-[var(--color-linen)]/45 transition-colors">
                    <td className="py-3 px-4 sm:px-5">
                      <div className="font-bold text-[var(--color-navy)]">{item.name}</div>
                      <div className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                        {item.code} • {item.category}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--color-navy)] whitespace-nowrap">
                      {item.size || 'Standard'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-[var(--color-linen)] border border-[var(--color-border)] text-[var(--color-navy)] text-[11px] font-bold">
                        {item.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--color-text-secondary)] tabular-nums whitespace-nowrap">
                      {item.baseRate > 0 ? formatInr(item.baseRate) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--color-text-secondary)] tabular-nums whitespace-nowrap">
                      {item.baseRate > 0 ? `+ ₹${Math.round(item.gaugeDifference).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-extrabold tabular-nums ${
                          hasRate ? 'text-[var(--color-navy)] text-sm sm:text-base' : 'text-[var(--color-navy)] text-xs'
                        }`}
                      >
                        {formatInr(item.finalRate)}
                      </span>
                      {hasRate && (
                        <span className="text-[11px] font-medium text-[var(--color-text-secondary)] ml-1">/ {item.unit || 'MT'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.inStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-navy)] text-[var(--color-linen)] text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-[var(--color-amber)]" />
                          Ready Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--color-amber-soft)] border border-[var(--color-amber)] text-[var(--color-navy)] text-[11px] font-bold">
                          Booking Open
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right no-print whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenQuoteModal(`${item.name} (${item.size})`, item.grade)}
                        className="nd-btn-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Quote
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  return (
    <>
      <SeoHead
        title="NAV DURGA ISPAT — LIVE PRODUCT RATES | Raipur Steel Rate Portal"
        description="Live structural steel product rates from Nav Durga Ispat Pvt. Ltd. (Medium Section) and Unit-2 NS Ispat (I) Pvt. Ltd. (Light Section), Raipur. Direct from Daily ERP Pricing."
        canonicalPath="/product-rates"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Live Product Rates', path: '/product-rates' },
        ]}
      />

      <InnerPageBanner
        theme="products"
        title="Live Product Rates"
        subtitle="Synced directly from Nav Durga Ispat ERP • Ex-Plant Urla, Raipur"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Live Product Rates' },
        ]}
        onNavigate={(path) => {
          if (onNavigate) {
            onNavigate(path);
          } else {
            window.history.pushState({}, '', path);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }}
      />

      <div className="nd-container py-8 sm:py-10 lg:py-12 space-y-6 xl:space-y-8">
        {/* Print-Only PDF Header */}
        <div className="hidden print:block border-b-2 border-[var(--color-navy)] pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NavDurgaLogo size="md" />
              <div>
                <h2 className="text-xl font-extrabold text-[var(--color-navy)]">
                  NAV DURGA ISPAT — LIVE PRODUCT RATES
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Nav Durga Ispat Pvt. Ltd. &amp; Unit-2 NS Ispat (I) Pvt. Ltd. • {cms.contactAddress}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-[var(--color-navy)]">
              <div className="font-bold">Updated: {formattedUpdatedAt}</div>
              <div>GST 18% Extra • Ex-Plant Raipur</div>
            </div>
          </div>
        </div>

        {/* Public Rate Portal Header */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7 shadow-xs no-print">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-navy)] border border-[var(--color-amber)]/40 text-[var(--color-amber)] text-[11px] font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Synced Live from ERP Daily Rate Management</span>
              </div>
              <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)] tracking-tight">
                NAV DURGA ISPAT — LIVE PRODUCT RATES
              </h2>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1.5 font-semibold text-[var(--color-navy)]">
                  <Clock className="w-4 h-4 text-[var(--color-navy)]" />
                  Last Updated: {formattedUpdatedAt}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-[var(--color-navy)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-navy)]" />
                  Status: {rates?.rateStatus || 'Published'}
                </span>
                <span className="font-semibold text-[var(--color-navy)]">
                  {rates?.gstNote || 'GST 18% Extra • Ex-Plant Urla, Raipur'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={loadLatestRates}
                disabled={refreshing}
                className="nd-btn-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Rates</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="nd-btn-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[var(--color-navy)]" />
                <span>Download Rate List PDF</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="nd-btn-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[var(--color-navy)]" />
                <span>WhatsApp Enquiry</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenQuoteModal('Structural Steel Rate List', 'Medium / Light Section')}
                className="nd-btn-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Request Quotation</span>
              </button>
            </div>
          </div>

          {/* Benchmark Section Rate Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--color-border)]">
            <div className="rounded-xl border border-[var(--color-amber)]/45 bg-[var(--color-navy)] text-[var(--color-linen)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-amber)]">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{cms.unit1Name || 'NAVDURGA ISPAT PVT. LTD.'}</span>
                </div>
                <div className="font-display text-lg font-extrabold text-[var(--color-linen)] mt-0.5">
                  MEDIUM SECTION BASIC RATE
                </div>
                <div className="text-xs text-[var(--color-linen)]/75 mt-0.5">
                  MS Channel (100mm–250mm), Heavy Beams &amp; Medium Angles • Gauge Diff Applied Per Size
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-amber)] tabular-nums">
                  {formatInr(rates?.mediumSectionRate || 0)}
                </div>
                <div className="text-[11px] font-bold text-[var(--color-linen)]/75">
                  {(rates?.mediumSectionRate || 0) > 0 ? '/ MT + GST 18%' : 'Contact Sales Desk'}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-amber)]/45 bg-[var(--color-navy)] text-[var(--color-linen)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-amber)]">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{cms.unit2Name || 'UNIT-2 - NS ISPAT (I) PVT. LTD.'}</span>
                </div>
                <div className="font-display text-lg font-extrabold text-[var(--color-linen)] mt-0.5">
                  LIGHT SECTION BASIC RATE
                </div>
                <div className="text-xs text-[var(--color-linen)]/75 mt-0.5">
                  MS Channel 70×35 / 75×40, Light Angles, Flats &amp; Square Sections • SL / Light Gauge
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-amber)] tabular-nums">
                  {formatInr(rates?.lightSectionRate || 0)}
                </div>
                <div className="text-[11px] font-bold text-[var(--color-linen)]/75">
                  {(rates?.lightSectionRate || 0) > 0 ? '/ MT + GST 18%' : 'Contact Sales Desk'}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, size (e.g. 100 x 50, 75 x 40), grade, or code..."
                className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-linen)]/45 focus:bg-white text-sm text-[var(--color-navy)] outline-none focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'MEDIUM SECTION', 'LIGHT SECTION'] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSectionFilter(sec)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                    sectionFilter === sec
                      ? 'bg-[var(--color-amber)] text-[var(--color-navy)] border-[var(--color-amber)]'
                      : 'bg-white text-[var(--color-navy)] border-[var(--color-border)] hover:bg-[var(--color-linen)]'
                  }`}
                >
                  {sec === 'ALL' ? 'All Sections' : sec}
                </button>
              ))}

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold border border-[var(--color-border)] bg-white text-[var(--color-navy)] outline-none focus:ring-2 focus:ring-[var(--color-amber)] cursor-pointer"
                aria-label="Filter by grade"
              >
                {distinctGrades.map((g) => (
                  <option key={g} value={g}>
                    {g === 'ALL' ? 'All Grades' : `Grade: ${g}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Rate Tables */}
        {loading ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-12 text-center text-sm font-semibold text-[var(--color-text-secondary)]">
            Loading live product rates from Nav Durga ERP...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-12 text-center space-y-2">
            <div className="text-base font-bold text-[var(--color-navy)]">No matching products found</div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Try clearing your search or section filter to view all structural steel items.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSectionFilter('ALL');
                setGradeFilter('ALL');
              }}
              className="nd-btn-primary mt-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {renderSectionTable(
              'MEDIUM SECTION',
              `${cms.unit1Name || 'NAVDURGA ISPAT PVT. LTD.'} • Heavy & Medium Structural Rolling Line`,
              'primary',
              rates?.mediumSectionRate || 0,
              mediumProducts
            )}
            {renderSectionTable(
              'LIGHT SECTION',
              `${cms.unit2Name || 'UNIT-2 - NS ISPAT (I) PVT. LTD.'} • Light Structural & Merchant Sections`,
              'deep',
              rates?.lightSectionRate || 0,
              lightProducts
            )}
          </div>
        )}

        {/* Rate Formula & Commercial Terms Note */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 text-xs text-[var(--color-text-secondary)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-[var(--color-navy)]">Pricing Transparency: </span>
            All published rates follow Nav Durga ERP formula (Final Rate = Basic Rate + Gauge Difference). Rates are Ex-Plant Urla, Raipur (Chhattisgarh) and exclude 18% GST, loading, and insurance unless specified in official quotation.
          </div>
          <div className="shrink-0 font-bold text-[var(--color-navy)]">
            Sales Helpline: {cms.contactPhone}
          </div>
        </div>
      </div>
    </>
  );
};
