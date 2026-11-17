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
      <section className="bg-white rounded-2xl border border-[#C7CED6] shadow-xs overflow-hidden">
        <div
          className={`px-5 sm:px-6 py-4 border-b border-[#C7CED6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            accent === 'primary' ? 'bg-[#EAF2F8]' : 'bg-[#F7F9FB]'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-extrabold text-[#263442] tracking-tight">
                {title}
              </h2>
            </div>
            <p className="text-xs font-semibold text-[#737D88] mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Section Basic Rate
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                {formatInr(basicRate)}{' '}
                {basicRate > 0 && <span className="text-xs font-semibold text-slate-500">/ MT</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View (< md) — Zero horizontal table scroll */}
        <div className="md:hidden print:hidden divide-y divide-slate-200">
          {items.map((item) => {
            const hasRate = item.finalRate > 0;
            return (
              <div key={item.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-900 leading-snug">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                      {item.code} • {item.category}
                    </div>
                  </div>
                  {item.inStock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold shrink-0">
                      Booking Open
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F7F9FB] rounded-xl border border-slate-200 p-2.5">
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-slate-500">Size</div>
                    <div className="font-bold text-slate-800 mt-0.5">{item.size || 'Standard'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-slate-500">Grade</div>
                    <div className="font-bold text-slate-800 mt-0.5">{item.grade}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-slate-500">Basic Rate</div>
                    <div className="font-semibold text-slate-700 tabular-nums mt-0.5">
                      {item.baseRate > 0 ? formatInr(item.baseRate) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-slate-500">Gauge Diff.</div>
                    <div className="font-semibold text-slate-700 tabular-nums mt-0.5">
                      {item.baseRate > 0 ? `+ ₹${Math.round(item.gaugeDifference).toLocaleString('en-IN')}` : '—'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Final Ex-Plant Rate
                    </div>
                    <div
                      className={`font-extrabold tabular-nums ${
                        hasRate ? 'text-base text-slate-900' : 'text-xs text-amber-700'
                      }`}
                    >
                      {formatInr(item.finalRate)}
                      {hasRate && (
                        <span className="text-[11px] font-medium text-slate-500 ml-1">/ {item.unit || 'MT'}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenQuoteModal(`${item.name} (${item.size})`, item.grade)}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-[#EAF2F8] hover:bg-[#105186] text-[#105186] hover:text-white border border-[#105186]/25 text-xs font-bold transition-colors cursor-pointer shrink-0"
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
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
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
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {items.map((item) => {
                const hasRate = item.finalRate > 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 sm:px-5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.code} • {item.category}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {item.size || 'Standard'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
                        {item.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600 tabular-nums whitespace-nowrap">
                      {item.baseRate > 0 ? formatInr(item.baseRate) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600 tabular-nums whitespace-nowrap">
                      {item.baseRate > 0 ? `+ ₹${Math.round(item.gaugeDifference).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-extrabold tabular-nums ${
                          hasRate ? 'text-slate-900 text-sm sm:text-base' : 'text-amber-700 text-xs'
                        }`}
                      >
                        {formatInr(item.finalRate)}
                      </span>
                      {hasRate && (
                        <span className="text-[11px] font-medium text-slate-500 ml-1">/ {item.unit || 'MT'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.inStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                          Booking Open
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right no-print whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenQuoteModal(`${item.name} (${item.size})`, item.grade)}
                        className="px-3 py-1.5 rounded-lg bg-[#EAF2F8] hover:bg-[#105186] text-[#105186] hover:text-white border border-[#105186]/25 text-xs font-bold transition-colors cursor-pointer"
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
        <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NavDurgaLogo size="md" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  NAV DURGA ISPAT — LIVE PRODUCT RATES
                </h2>
                <p className="text-xs text-slate-600">
                  Nav Durga Ispat Pvt. Ltd. &amp; Unit-2 NS Ispat (I) Pvt. Ltd. • {cms.contactAddress}
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold">Updated: {formattedUpdatedAt}</div>
              <div>GST 18% Extra • Ex-Plant Raipur</div>
            </div>
          </div>
        </div>

        {/* Public Rate Portal Header */}
        <div className="bg-white rounded-2xl border border-[#C7CED6] p-5 sm:p-7 shadow-xs no-print">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EAF2F8] border border-[#105186]/25 text-[#105186] text-[11px] font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Synced Live from ERP Daily Rate Management</span>
              </div>
              <h2 className="font-display nd-h2-section font-extrabold text-[#263442] tracking-tight">
                NAV DURGA ISPAT — LIVE PRODUCT RATES
              </h2>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#737D88]">
                <span className="flex items-center gap-1.5 font-semibold text-[#263442]">
                  <Clock className="w-4 h-4 text-[#105186]" />
                  Last Updated: {formattedUpdatedAt}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  Status: {rates?.rateStatus || 'Published'}
                </span>
                <span className="font-semibold text-[#0B3A60]">
                  {rates?.gstNote || 'GST 18% Extra • Ex-Plant Urla, Raipur'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={loadLatestRates}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F7F9FB] hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#263442] text-xs font-bold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Rates</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#263442] text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#105186]" />
                <span>Download Rate List PDF</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Enquiry</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenQuoteModal('Structural Steel Rate List', 'Medium / Light Section')}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Request Quotation</span>
              </button>
            </div>
          </div>

          {/* Benchmark Section Rate Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#C7CED6]">
            <div className="rounded-xl border border-[#105186]/25 bg-gradient-to-br from-[#EAF2F8] via-white to-[#F7F9FB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#105186]">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{cms.unit1Name || 'NAVDURGA ISPAT PVT. LTD.'}</span>
                </div>
                <div className="font-display text-lg font-extrabold text-[#263442] mt-0.5">
                  MEDIUM SECTION BASIC RATE
                </div>
                <div className="text-xs text-[#737D88] mt-0.5">
                  MS Channel (100mm–250mm), Heavy Beams &amp; Medium Angles • Gauge Diff Applied Per Size
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#105186] tabular-nums">
                  {formatInr(rates?.mediumSectionRate || 0)}
                </div>
                <div className="text-[11px] font-bold text-[#737D88]">
                  {(rates?.mediumSectionRate || 0) > 0 ? '/ MT + GST 18%' : 'Contact Sales Desk'}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#C7CED6] bg-gradient-to-br from-[#F7F9FB] via-white to-[#EAF2F8]/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0B3A60]">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{cms.unit2Name || 'UNIT-2 - NS ISPAT (I) PVT. LTD.'}</span>
                </div>
                <div className="font-display text-lg font-extrabold text-[#263442] mt-0.5">
                  LIGHT SECTION BASIC RATE
                </div>
                <div className="text-xs text-[#737D88] mt-0.5">
                  MS Channel 70×35 / 75×40, Light Angles, Flats &amp; Square Sections • SL / Light Gauge
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A60] tabular-nums">
                  {formatInr(rates?.lightSectionRate || 0)}
                </div>
                <div className="text-[11px] font-bold text-[#737D88]">
                  {(rates?.lightSectionRate || 0) > 0 ? '/ MT + GST 18%' : 'Contact Sales Desk'}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#737D88] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, size (e.g. 100 x 50, 75 x 40), grade, or code..."
                className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-[#C7CED6] bg-[#F7F9FB] focus:bg-white text-sm outline-none focus:ring-2 focus:ring-[#105186]"
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
                      ? 'bg-[#105186] text-white border-[#105186]'
                      : 'bg-white text-[#263442] border-[#C7CED6] hover:bg-[#EAF2F8]/60'
                  }`}
                >
                  {sec === 'ALL' ? 'All Sections' : sec}
                </button>
              ))}

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-700 outline-none cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm font-semibold text-slate-600">
            Loading live product rates from Nav Durga ERP...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
            <div className="text-base font-bold text-slate-900">No matching products found</div>
            <p className="text-xs text-slate-500">
              Try clearing your search or section filter to view all structural steel items.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSectionFilter('ALL');
                setGradeFilter('ALL');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer transition-colors"
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
        <div className="bg-slate-100 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-800">Pricing Transparency: </span>
            All published rates follow Nav Durga ERP formula (Final Rate = Basic Rate + Gauge Difference). Rates are Ex-Plant Urla, Raipur (Chhattisgarh) and exclude 18% GST, loading, and insurance unless specified in official quotation.
          </div>
          <div className="shrink-0 font-bold text-slate-800">
            Sales Helpline: {cms.contactPhone}
          </div>
        </div>
      </div>
    </>
  );
};
