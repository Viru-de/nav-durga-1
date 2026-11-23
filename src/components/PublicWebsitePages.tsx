import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Factory,
  ShieldCheck,
  TrendingUp,
  Layers,
  Award,
  Phone,
  Mail,
  MapPin,
  Download,
  FileText,
  Building2,
  MessageSquare,
  Cpu,
  Search,
  Eye,
  Package,
  Wrench,
} from 'lucide-react';
import {
  PublicRateProductItem,
  PublicRatesPayload,
  SalesEnquiry,
  SolutionServiceCmsItem,
  WebsiteCmsContent,
} from '../types';
import { ThreeSteelShowcase } from './ThreeSteelShowcase';
import { SeoHead } from './SeoHead';
import { HeroImageSlider } from './HeroImageSlider';
import { PresenceMapSection } from './PresenceMapSection';
import { OurJourneyTimeline } from './OurJourneyTimeline';
import { FaqSection, buildFaqJsonLd, buildPublicFaqs } from './FaqSection';
import { QuickEnquiryForm } from './QuickEnquiryForm';
import { InnerPageBanner } from './InnerPageBanner';
import { NavDurgaAdvantageSection } from './NavDurgaAdvantageSection';
import { DEFAULT_SOLUTIONS_SERVICES } from '../data/solutionsDefaults';

interface PublicWebsitePagesProps {
  currentPath: string;
  cms: WebsiteCmsContent;
  rates: PublicRatesPayload | null;
  ratesLoading?: boolean;
  ratesError?: string | null;
  onRefreshRates?: () => void;
  mapsApiKey?: string;
  onNavigate: (path: string) => void;
  onOpenQuoteModal: (presetProduct?: string, presetGrade?: string) => void;
  onEnquirySubmitted?: (enquiry: SalesEnquiry) => void;
}

function formatRateText(val?: number): string {
  if (!val || val <= 0) return 'Request Latest Rate';
  return `₹${Math.round(val).toLocaleString('en-IN')} / MT`;
}

/**
 * Clean technical SVG cross-section fallback rendered when an ERP product does not have an uploaded image.
 * Avoids misrepresenting generic stock photos as company facilities.
 */
const SteelProfileVisual: React.FC<{
  category: string;
  name: string;
  section: string;
}> = ({ category, name, section }) => {
  const isMedium = section === 'MEDIUM SECTION';
  const label = `${category} ${name}`.toLowerCase();
  const isBeam = label.includes('beam') || label.includes('joist');
  const isAngle = label.includes('angle') || label.includes('isa');
  const isFlat = label.includes('flat') || label.includes('bar') || label.includes('square');

  const accentStroke = '#14213D';
  const accentFill = isMedium ? 'rgba(255, 176, 32, 0.16)' : '#F1ECE3';

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#F1ECE3]/75 via-[#FFFFFF] to-[#F1ECE3]/40 flex flex-col items-center justify-center relative px-6 py-4 select-none border-b border-[var(--color-border)]">
      <div
        className="w-full h-full absolute inset-0 opacity-35 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(20, 33, 61, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 33, 61, 0.14) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <svg
        viewBox="0 0 180 100"
        className="w-36 h-20 relative z-10 drop-shadow-xs"
        aria-hidden="true"
      >
        {isBeam ? (
          <g stroke={accentStroke} strokeWidth="2.5" fill={accentFill}>
            <path d="M40 16 H140 V28 H100 V72 H140 V84 H40 V72 H80 V28 H40 Z" />
          </g>
        ) : isAngle ? (
          <g stroke={accentStroke} strokeWidth="2.5" fill={accentFill}>
            <path d="M52 16 H68 V70 H128 V84 H52 Z" />
          </g>
        ) : isFlat ? (
          <g stroke={accentStroke} strokeWidth="2.5" fill={accentFill}>
            <rect x="34" y="38" width="112" height="24" rx="2" />
          </g>
        ) : (
          <g stroke={accentStroke} strokeWidth="2.5" fill={accentFill}>
            <path d="M46 18 H134 V32 H66 V68 H134 V82 H46 Z" />
          </g>
        )}
      </svg>
      <div className="relative z-10 mt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
        {isMedium ? 'Medium Structural Profile' : 'Light Structural Profile'}
      </div>
    </div>
  );
};

const ProductCardMedia: React.FC<{ item: PublicRateProductItem }> = ({ item }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (item.image && !imgFailed) {
    return (
      <img
        src={item.image}
        alt={`${item.name} ${item.size}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return <SteelProfileVisual category={item.category} name={item.name} section={item.section} />;
};

export const PublicWebsitePages: React.FC<PublicWebsitePagesProps> = ({
  currentPath,
  cms,
  rates,
  ratesLoading = false,
  ratesError = null,
  onRefreshRates,
  mapsApiKey,
  onNavigate,
  onOpenQuoteModal,
  onEnquirySubmitted,
}) => {
  // Homepage / Catalog interactive filters
  const [productSearch, setProductSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'MEDIUM SECTION' | 'LIGHT SECTION'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Reduced-motion support for smooth anchor scrolling
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const allProducts = rates?.products || [];
  const formattedRatesUpdatedAt = useMemo(() => {
    if (!rates?.lastUpdated) return null;
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
  const mediumProducts = useMemo(
    () => allProducts.filter((p) => p.section === 'MEDIUM SECTION'),
    [allProducts]
  );
  const lightProducts = useMemo(
    () => allProducts.filter((p) => p.section === 'LIGHT SECTION'),
    [allProducts]
  );

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [allProducts]);

  const filteredHomeProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return allProducts.filter((item) => {
      if (sectionFilter !== 'ALL' && item.section !== sectionFilter) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.size.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.grade.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
      );
    });
  }, [allProducts, productSearch, sectionFilter, categoryFilter]);

  const companyCin = cms.cinNumber || 'U24132CT1988PTC004838';
  const companyEst = cms.establishedYear || '1988';

  const whatsappDigits = (cms.contactWhatsapp || '919752183053').replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${whatsappDigits.startsWith('91') ? whatsappDigits : `91${whatsappDigits}`}?text=${encodeURIComponent(
    'Hello Nav Durga Ispat Sales Team, I would like product details & today ex-plant rates.'
  )}`;

  const scrollToProductsSection = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    } else {
      onNavigate('/products');
    }
  };

  const handleDownloadSpecSheet = (title: string, items: PublicRateProductItem[]) => {
    const lines = [
      `NAV DURGA ISPAT PVT. LTD. — ${title.toUpperCase()}`,
      `Registered Location: ${cms.contactAddress}`,
      `CIN: ${companyCin} | Est.: ${companyEst}`,
      `Phone: ${cms.contactPhone} | Email: ${cms.contactEmail}`,
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      `-------------------------------------------------------------------------`,
      ...items.map(
        (it) =>
          `${it.code} | ${it.name} | Size: ${it.size} | Grade: ${it.grade} | Section: ${it.section} | Rate: ${formatRateText(
            it.finalRate
          )}`
      ),
      `-------------------------------------------------------------------------`,
      `Note: Ex-Plant Urla, Raipur. GST Extra as applicable. Contact sales team to confirm dispatch rates.`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper for product detail page navigation URL
  const getProductDetailPath = (item: PublicRateProductItem) =>
    `/products/${encodeURIComponent(item.id)}`;

  // ===========================================================================
  // ROUTE: ABOUT US (/about)
  // ===========================================================================
  if (currentPath === '/about') {
    return (
      <>
        <SeoHead
          title="About Us | Nav Durga Ispat Pvt. Ltd. — Urla Industrial Area, Raipur"
          description="Nav Durga Ispat Pvt. Ltd. is an established steel industry company based in Urla Industrial Area, Raipur, Chhattisgarh."
          canonicalPath="/about"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]}
        />
        <InnerPageBanner
          theme="about"
          title="About Us"
          subtitle={`Nav Durga Ispat Pvt. Ltd. • Established ${companyEst} in Urla Industrial Area, Raipur`}
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'About Us' },
          ]}
          onNavigate={onNavigate}
        />
        <div className="nd-container nd-section-py space-y-12 xl:space-y-14">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[var(--color-navy)] border border-[var(--color-amber)]/40 text-[var(--color-amber)] text-xs font-bold uppercase tracking-wider">
                Established Steel Industry • Raipur, Chhattisgarh
              </span>
              <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)] tracking-tight">
                {cms.aboutTitle}
              </h2>
              <p className="nd-lead text-[var(--color-text-secondary)]">{cms.aboutSummary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 space-y-1">
                  <div className="h-[2.5px] w-8 bg-[var(--color-amber)] mb-1" aria-hidden="true" />
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">Medium Section Division</div>
                  <div className="font-bold text-[var(--color-navy)] text-sm">{cms.unit1Name}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    Structural steel profiles engineered for industrial and construction requirements.
                  </div>
                </div>
                <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 space-y-1">
                  <div className="h-[2.5px] w-8 bg-[var(--color-amber)] mb-1" aria-hidden="true" />
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">Light Section Division</div>
                  <div className="font-bold text-[var(--color-navy)] text-sm">{cms.unit2Name}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    Light structural sections and channels supporting fabrication and general engineering.
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Corporate Profile Card */}
            <div className="lg:col-span-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                <Building2 className="w-5 h-5 text-[var(--color-navy)]" />
                <h2 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                  Corporate Profile
                </h2>
              </div>
              <dl className="space-y-3 text-xs sm:text-sm">
                <div className="flex flex-col border-b border-[var(--color-border)]/70 pb-2.5">
                  <dt className="text-[var(--color-text-secondary)] font-semibold text-xs">Company Name</dt>
                  <dd className="font-bold text-[var(--color-navy)] mt-0.5">Nav Durga Ispat Pvt. Ltd.</dd>
                </div>
                <div className="flex flex-col border-b border-[var(--color-border)]/70 pb-2.5">
                  <dt className="text-[var(--color-text-secondary)] font-semibold text-xs">Business</dt>
                  <dd className="font-semibold text-[var(--color-navy)] mt-0.5">Steel manufacturing and steel products</dd>
                </div>
                <div className="flex flex-col border-b border-[var(--color-border)]/70 pb-2.5">
                  <dt className="text-[var(--color-text-secondary)] font-semibold text-xs">Company CIN</dt>
                  <dd className="font-mono font-bold text-[var(--color-navy)] mt-0.5">{companyCin}</dd>
                </div>
                <div className="flex flex-col border-b border-[var(--color-border)]/70 pb-2.5">
                  <dt className="text-[var(--color-text-secondary)] font-semibold text-xs">Established</dt>
                  <dd className="font-bold text-[var(--color-navy)] mt-0.5">{companyEst}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-[var(--color-text-secondary)] font-semibold text-xs">Registered Location</dt>
                  <dd className="font-medium text-[var(--color-navy)] mt-0.5 leading-relaxed">{cms.contactAddress}</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* OUR JOURNEY TIMELINE (About Us Page Only) */}
          <OurJourneyTimeline cms={cms} />

          {/* Structural Steel Product Gallery & Approved Visuals */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <figure className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-2xs">
              <div className="aspect-[16/9] w-full bg-[var(--color-linen)] overflow-hidden">
                <picture>
                  <source srcSet="/assets/hero-slides/slide-2-structural-products.webp" type="image/webp" />
                  <img
                    src="/assets/hero-slides/slide-2-structural-products.jpg"
                    alt="Structural steel beams, MS channels, and equal angles"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
              </div>
              <figcaption className="px-5 py-3.5 text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                <span className="font-semibold text-[var(--color-navy)]">
                  Medium &amp; Light Structural Steel Sections
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/products')}
                  className="font-bold text-[var(--color-navy)] hover:underline cursor-pointer shrink-0"
                >
                  Browse Catalogue →
                </button>
              </figcaption>
            </figure>

            <figure className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-2xs">
              <div className="aspect-[16/9] w-full bg-[var(--color-linen)] overflow-hidden">
                <picture>
                  <source srcSet="/assets/hero-slides/slide-5-finished-steel.webp" type="image/webp" />
                  <img
                    src="/assets/hero-slides/slide-5-finished-steel.jpg"
                    alt="Finished structural steel channels ready for industrial and construction applications"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
              </div>
              <figcaption className="px-5 py-3.5 text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                <span className="font-semibold text-[var(--color-navy)]">
                  Finished Structural Profiles &amp; Live ERP Pricing
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/product-rates')}
                  className="font-bold text-[var(--color-navy)] hover:underline cursor-pointer shrink-0"
                >
                  Live Rate Portal →
                </button>
              </figcaption>
            </figure>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] text-[var(--color-amber)] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="font-display text-lg font-extrabold text-[var(--color-navy)]">Our Vision</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{cms.visionText}</p>
            </div>
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] text-[var(--color-amber)] flex items-center justify-center">
                <Factory className="w-5 h-5" />
              </div>
              <h2 className="font-display text-lg font-extrabold text-[var(--color-navy)]">Our Mission</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{cms.missionText}</p>
            </div>
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] text-[var(--color-amber)] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="font-display text-lg font-extrabold text-[var(--color-navy)]">Quality &amp; Documentation</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{cms.qualityCommitment}</p>
              <div className="pt-1 flex flex-wrap gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => onNavigate('/quality')}
                  className="text-[var(--color-navy)] hover:underline cursor-pointer"
                >
                  Quality Overview →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/resources')}
                  className="text-[var(--color-navy)] hover:underline cursor-pointer"
                >
                  Specification Sheets →
                </button>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  // ===========================================================================
  // ROUTE: DEDICATED PRODUCT DETAIL PAGE (/products/:productId)
  // ===========================================================================
  if (
    currentPath.startsWith('/products/') &&
    currentPath !== '/products/medium-section' &&
    currentPath !== '/products/light-section'
  ) {
    const slug = decodeURIComponent(currentPath.slice('/products/'.length)).trim();
    const matchedItem = allProducts.find(
      (p) =>
        p.id === slug ||
        p.code.toLowerCase() === slug.toLowerCase() ||
        `${p.name}-${p.size}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
    );

    if (!matchedItem) {
      return (
        <>
          <SeoHead
            title="Product Specification | Nav Durga Ispat Pvt. Ltd."
            description="View active structural steel products, sizes, and live ex-plant rates from Nav Durga Ispat Pvt. Ltd., Raipur."
            canonicalPath={currentPath}
            noIndex
          />
          <InnerPageBanner
            theme="products"
            title={ratesLoading ? 'Loading Product Specification' : 'Product Specification'}
            subtitle="Nav Durga Ispat Structural Steel Catalogue"
            breadcrumbs={[
              { label: 'Home', path: '/' },
              { label: 'Products', path: '/products' },
              { label: 'Specification' },
            ]}
            onNavigate={onNavigate}
          />
          <div className="nd-container-narrow nd-section-py text-center space-y-4">
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 sm:p-10 space-y-4 shadow-xs">
              <Package className="w-10 h-10 text-[var(--color-navy)] mx-auto" />
              <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)]">
                {ratesLoading ? 'Loading Product Specification...' : 'Product Unavailable or Inactive'}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {ratesLoading
                  ? 'Fetching live structural steel catalog details from Nav Durga ERP...'
                  : 'This steel item is currently not listed as an active ERP product. Browse our active catalog or submit a custom enquiry.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/products')}
                  className="nd-btn-primary min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  View All Active Products
                </button>
                <button
                  type="button"
                  onClick={() => onOpenQuoteModal(slug, 'Standard')}
                  className="nd-btn-secondary min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Request Custom Quote
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    const isMedium = matchedItem.section === 'MEDIUM SECTION';
    const sectionPath = isMedium ? '/products/medium-section' : '/products/light-section';
    const relatedProducts = allProducts
      .filter((p) => p.id !== matchedItem.id && p.section === matchedItem.section)
      .slice(0, 3);
    const hasApprovedRate = matchedItem.finalRate > 0;
    const itemWaHref = `https://wa.me/${whatsappDigits.startsWith('91') ? whatsappDigits : `91${whatsappDigits}`}?text=${encodeURIComponent(
      `Hello Nav Durga Ispat Sales Desk, I would like a quotation for ${matchedItem.name} (${matchedItem.size}, Grade: ${matchedItem.grade}, Code: ${matchedItem.code}).`
    )}`;

    const productJsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${matchedItem.name} ${matchedItem.size}`.trim(),
      sku: matchedItem.code,
      category: matchedItem.category,
      description:
        matchedItem.description ||
        `${matchedItem.name} ${matchedItem.size} (${matchedItem.grade}) supplied by Nav Durga Ispat Pvt. Ltd., Raipur.`,
      brand: {
        '@type': 'Brand',
        name: 'Nav Durga Ispat Pvt. Ltd.',
      },
      ...(matchedItem.image && !matchedItem.image.startsWith('data:') ? { image: matchedItem.image } : {}),
      ...(hasApprovedRate
        ? {
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: Math.round(matchedItem.finalRate),
              availability: matchedItem.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/PreOrder',
            },
          }
        : {}),
    };

    return (
      <>
        <SeoHead
          title={`${matchedItem.name} ${matchedItem.size} | Nav Durga Ispat`}
          description={`${matchedItem.name} ${matchedItem.size} (${matchedItem.grade}) — ${matchedItem.section} structural steel from Nav Durga Ispat Pvt. Ltd., Urla Industrial Area, Raipur.`}
          canonicalPath={`/products/${encodeURIComponent(matchedItem.id)}`}
          ogType="product"
          ogImage={matchedItem.image}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
            { name: matchedItem.section, path: sectionPath },
            { name: `${matchedItem.name} ${matchedItem.size}`, path: `/products/${encodeURIComponent(matchedItem.id)}` },
          ]}
          jsonLd={productJsonLd}
        />

        <InnerPageBanner
          theme="products"
          title={`${matchedItem.name} — ${matchedItem.size}`}
          subtitle={`${matchedItem.category} · Grade: ${matchedItem.grade} · ${matchedItem.section}`}
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Products', path: '/products' },
            { label: matchedItem.section, path: sectionPath },
            { label: `${matchedItem.name} ${matchedItem.size}` },
          ]}
          onNavigate={onNavigate}
        />

        <div className="nd-container nd-section-py space-y-10">
          {/* Main Product Detail Card */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 h-64 sm:h-80 lg:h-auto min-h-[280px] min-[1920px]:min-h-[380px] relative bg-[var(--color-linen)]/55 border-b lg:border-b-0 lg:border-r border-[var(--color-border)]">
              <ProductCardMedia item={matchedItem} />
              <span
                className={`absolute top-4 left-4 px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider shadow-xs z-20 bg-[var(--color-navy)] ${
                  isMedium
                    ? 'text-[var(--color-amber)] border border-[var(--color-amber)]/45'
                    : 'text-[var(--color-linen)] border border-white/20'
                }`}
              >
                {matchedItem.section}
              </span>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-8 xl:p-10 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">
                    {matchedItem.category} • Code: {matchedItem.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[var(--color-linen)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-navy)]">
                    Grade: {matchedItem.grade}
                  </span>
                </div>

                <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)] tracking-tight">
                  {matchedItem.name} — {matchedItem.size}
                </h2>

                <p className="nd-body text-[var(--color-text-secondary)]">
                  {matchedItem.description ||
                    `${matchedItem.name} (${matchedItem.size}, Grade: ${matchedItem.grade}) supplied under ${matchedItem.section} from Urla Industrial Area, Raipur, Chhattisgarh.`}
                </p>

                {/* ERP Spec Grid */}
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[var(--color-linen)]/55 rounded-xl border border-[var(--color-border)] p-4 text-xs">
                  <div>
                    <dt className="text-[var(--color-text-secondary)] font-semibold">Size / Spec</dt>
                    <dd className="font-bold text-[var(--color-navy)] mt-0.5 tabular-nums">
                      {matchedItem.size || 'Standard'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-secondary)] font-semibold">Rolling Section</dt>
                    <dd className="font-bold text-[var(--color-navy)] mt-0.5">{matchedItem.section}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-secondary)] font-semibold">Unit</dt>
                    <dd className="font-bold text-[var(--color-navy)] mt-0.5">{matchedItem.unit || 'MT'}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-secondary)] font-semibold">Supplying Division</dt>
                    <dd className="font-bold text-[var(--color-navy)] mt-0.5">{matchedItem.rateSource}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-secondary)] font-semibold">Availability</dt>
                    <dd className="font-bold text-[var(--color-navy)] mt-0.5">
                      {matchedItem.inStock ? 'Ready Stock' : 'Booking Open'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-secondary)] font-semibold">Ex-Plant Rate</dt>
                    <dd className="font-extrabold text-[var(--color-navy)] mt-0.5 tabular-nums">
                      {formatRateText(matchedItem.finalRate)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-[var(--color-text-secondary)]">
                  Synced from Nav Durga ERP • Ex-Plant Urla, Raipur (GST 18% Extra)
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={itemWaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nd-btn-secondary min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Enquire on WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onOpenQuoteModal(`${matchedItem.name} (${matchedItem.size})`, matchedItem.grade)}
                    className="nd-btn-primary min-h-[44px] inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>Request a Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold text-[var(--color-navy)]">
                  More {matchedItem.section} Steel Products
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate(sectionPath)}
                  className="text-xs font-bold text-[var(--color-navy)] hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedProducts.map((rel) => (
                  <article
                    key={rel.id}
                    className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-navy)] p-5 flex flex-col justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                        {rel.category} • {rel.code}
                      </div>
                      <h3 className="font-display text-base font-extrabold text-[var(--color-navy)] mt-1">
                        {rel.name} — {rel.size}
                      </h3>
                      <div className="text-xs font-bold text-[var(--color-navy)] mt-1 tabular-nums">
                        {formatRateText(rel.finalRate)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate(getProductDetailPath(rel))}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-navy)] hover:underline cursor-pointer"
                    >
                      <span>View Specification</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </>
    );
  }

  // ===========================================================================
  // ROUTE: PRODUCTS / MEDIUM SECTION / LIGHT SECTION
  // ===========================================================================
  if (
    currentPath === '/products' ||
    currentPath === '/products/medium-section' ||
    currentPath === '/products/light-section'
  ) {
    const activeSection =
      currentPath === '/products/medium-section'
        ? 'MEDIUM SECTION'
        : currentPath === '/products/light-section'
        ? 'LIGHT SECTION'
        : 'ALL';

    const visibleItems =
      activeSection === 'MEDIUM SECTION'
        ? mediumProducts
        : activeSection === 'LIGHT SECTION'
        ? lightProducts
        : allProducts;

    return (
      <>
        <SeoHead
          title={`${
            activeSection === 'ALL'
              ? 'Our Steel Products'
              : `${activeSection} Steel Products`
          } | Nav Durga Ispat Pvt. Ltd.`}
          description="Explore available structural steel products and live product rate information synced from Nav Durga Ispat ERP."
          canonicalPath={currentPath}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
            ...(activeSection !== 'ALL' ? [{ name: activeSection, path: currentPath }] : []),
          ]}
        />
        <InnerPageBanner
          theme={activeSection === 'ALL' ? 'products' : 'infrastructure'}
          title={
            activeSection === 'MEDIUM SECTION'
              ? 'Medium Section Steel'
              : activeSection === 'LIGHT SECTION'
              ? 'Light Section Steel'
              : 'Our Steel Products'
          }
          subtitle={
            activeSection === 'MEDIUM SECTION'
              ? cms.unit1Name
              : activeSection === 'LIGHT SECTION'
              ? cms.unit2Name
              : 'Structural steel channels, beams, angles, and merchant sections synced with Nav Durga ERP'
          }
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Products', path: activeSection === 'ALL' ? undefined : '/products' },
            ...(activeSection !== 'ALL'
              ? [{ label: activeSection === 'MEDIUM SECTION' ? 'Medium Section' : 'Light Section' }]
              : []),
          ]}
          onNavigate={onNavigate}
        />
        <div className="nd-container nd-section-py space-y-8 xl:space-y-10">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
                <span className="w-6 h-[2.5px] bg-[var(--color-amber)]" aria-hidden="true" />
                <span>ERP Synchronized Product Catalogue</span>
              </span>
              <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)] tracking-tight">
                {activeSection === 'MEDIUM SECTION'
                  ? `Medium Section Steel — ${cms.unit1Name}`
                  : activeSection === 'LIGHT SECTION'
                  ? `Light Section Steel — ${cms.unit2Name}`
                  : 'Available Structural Steel Catalogue'}
              </h2>
              <p className="nd-body text-[var(--color-text-secondary)]">
                Explore our available steel product range and current product information directly from Nav Durga Ispat ERP.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  activeSection === 'ALL'
                    ? 'bg-[var(--color-amber)] text-[var(--color-navy)] border-[var(--color-amber)]'
                    : 'bg-[var(--color-linen)]/55 text-[var(--color-navy)] border-[var(--color-border)] hover:bg-[var(--color-linen)]'
                }`}
              >
                All ({allProducts.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/products/medium-section')}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  activeSection === 'MEDIUM SECTION'
                    ? 'bg-[var(--color-amber)] text-[var(--color-navy)] border-[var(--color-amber)]'
                    : 'bg-[var(--color-linen)]/55 text-[var(--color-navy)] border-[var(--color-border)] hover:bg-[var(--color-linen)]'
                }`}
              >
                Medium Section ({mediumProducts.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/products/light-section')}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  activeSection === 'LIGHT SECTION'
                    ? 'bg-[var(--color-amber)] text-[var(--color-navy)] border-[var(--color-amber)]'
                    : 'bg-[var(--color-linen)]/55 text-[var(--color-navy)] border-[var(--color-border)] hover:bg-[var(--color-linen)]'
                }`}
              >
                Light Section ({lightProducts.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/product-rates')}
                className="nd-btn-primary min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                View Live Rates →
              </button>
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-[var(--color-text-secondary)] mx-auto" />
              <div className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                No active products available in this section
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                Products added and activated in Nav Durga ERP automatically appear here. Contact our sales team for custom section enquiries.
              </p>
              <button
                type="button"
                onClick={() => onOpenQuoteModal('Custom Steel Requirement', '')}
                className="nd-btn-primary min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Request a Quote
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1920px]:grid-cols-4 gap-5 xl:gap-6">
              {visibleItems.map((item) => {
                const isMedium = item.section === 'MEDIUM SECTION';
                const hasApprovedRate = item.finalRate > 0;
                return (
                  <article
                    key={item.id}
                    className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-navy)] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <div className="h-44 min-[1920px]:h-48 relative overflow-hidden">
                        <ProductCardMedia item={item} />
                        <span
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-xs z-20 bg-[var(--color-navy)] ${
                            isMedium
                              ? 'text-[var(--color-amber)] border border-[var(--color-amber)]/45'
                              : 'text-[var(--color-linen)] border border-white/20'
                          }`}
                        >
                          {item.section}
                        </span>
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-bold text-[var(--color-text-secondary)]">
                            {item.category} • {item.code}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[var(--color-linen)] border border-[var(--color-border)] text-[11px] font-bold text-[var(--color-navy)]">
                            {item.grade}
                          </span>
                        </div>
                        <h2 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                          {item.name} — {item.size}
                        </h2>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                          {item.description || `${item.category} (${item.size}) • ${item.rateSource}`}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-4 bg-[var(--color-linen)]/50 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2.5">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                          Approved Rate
                        </div>
                        <div
                          className={`font-extrabold tabular-nums ${
                            hasApprovedRate ? 'text-base text-[var(--color-navy)]' : 'text-xs text-[var(--color-navy)]'
                          }`}
                        >
                          {formatRateText(item.finalRate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onNavigate(getProductDetailPath(item))}
                          className="nd-btn-secondary min-h-[40px] inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenQuoteModal(`${item.name} (${item.size})`, item.grade)}
                          className="nd-btn-primary min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Quote
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  // ===========================================================================
  // ROUTE: INDUSTRIES (/industries)
  // ===========================================================================
  if (currentPath === '/industries') {
    const sectors = [
      {
        title: 'Industrial Structures & Plant Facilities',
        desc: 'Structural steel sections supporting factory sheds, industrial frames, material-handling bays, and heavy commercial developments.',
        specs: 'Medium & Light Structural Sections',
      },
      {
        title: 'Construction & Infrastructure Projects',
        desc: 'Channels, beams, and angles supplied for civil infrastructure works, support frames, and structural fabrication packages.',
        specs: 'MS Channels, Joists & Angles',
      },
      {
        title: 'Structural Fabrication & Engineering',
        desc: 'Consistent rolling profiles tailored for fabrication workshops, trusses, equipment frames, and general steel assemblies.',
        specs: 'Standard Rolling Sizes',
      },
      {
        title: 'Steel Trade & Regional Distribution',
        desc: 'Dependable commercial coordination and transparent live rate visibility for regional dealers, stockists, and project buyers.',
        specs: 'Direct Ex-Plant Urla Supply',
      },
    ];

    return (
      <>
        <SeoHead
          title="Industries & Applications | Nav Durga Ispat Pvt. Ltd."
          description="Structural steel products supporting industrial, structural fabrication, construction, and infrastructure requirements."
          canonicalPath="/industries"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Industries', path: '/industries' },
          ]}
        />
        <InnerPageBanner
          theme="projects"
          title="Industries & Projects"
          subtitle="Serving industrial structures, structural fabrication, and infrastructure projects"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Industries & Applications' },
          ]}
          onNavigate={onNavigate}
        />
        <div className="nd-container nd-section-py space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
              <span className="w-6 h-[2.5px] bg-[var(--color-amber)]" aria-hidden="true" />
              <span>Industries &amp; Applications</span>
            </span>
            <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)]">
              Serving Industrial, Structural &amp; Infrastructure Requirements
            </h2>
            <p className="nd-lead text-[var(--color-text-secondary)]">
              Delivering structural steel products from Urla Industrial Area, Raipur with straightforward service and reliable customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
            {sectors.map((sec) => (
              <div key={sec.title} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-xs space-y-3">
                <span className="inline-flex px-2.5 py-1 rounded-md bg-[var(--color-linen)] text-[var(--color-navy)] border border-[var(--color-border)] text-[11px] font-bold">
                  {sec.specs}
                </span>
                <h2 className="font-display text-xl font-extrabold text-[var(--color-navy)]">{sec.title}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{sec.desc}</p>
                <button
                  type="button"
                  onClick={() => onOpenQuoteModal(sec.title, sec.specs)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-navy)] hover:underline cursor-pointer pt-1"
                >
                  <span>Request a Quote</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-amber)]" />
                </button>
              </div>
            ))}
          </div>

          <ThreeSteelShowcase
            initialMode="beam"
            onRequestQuote={(prof) => onOpenQuoteModal(prof, 'Standard')}
          />
        </div>
      </>
    );
  }

  // ===========================================================================
  // ROUTE: QUALITY & RELIABILITY (/quality)
  // ===========================================================================
  if (currentPath === '/quality') {
    return (
      <>
        <SeoHead
          title="Quality & Reliability | Nav Durga Ispat Pvt. Ltd."
          description="Quality, specification consistency, and dependable customer service from Nav Durga Ispat Pvt. Ltd., Raipur."
          canonicalPath="/quality"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Quality', path: '/quality' },
          ]}
        />
        <InnerPageBanner
          theme="quality"
          title="Quality & Reliability"
          subtitle="Consistent rolling specifications, weight verification, and commercial transparency"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Quality' },
          ]}
          onNavigate={onNavigate}
        />
        <div className="nd-container nd-section-py space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-navy)] border border-[var(--color-amber)]/40 text-[var(--color-amber)] text-xs font-bold uppercase tracking-wider">
                Quality &amp; Customer Commitment
              </span>
              <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)]">
                Dependable Specifications &amp; Commercial Transparency
              </h2>
              <p className="nd-lead text-[var(--color-text-secondary)]">
                {cms.qualityCommitment}
              </p>
              <div className="space-y-3 pt-2">
                {[
                  'Consistent product sizing and sectional accuracy across rolling batches',
                  'Clear documentation, weight verification, and straightforward billing terms',
                  'Live rate visibility synchronized directly with our ERP pricing system',
                  'Responsive commercial sales coordination from enquiry through dispatch',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5 text-sm text-[var(--color-navy)]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-navy)] shrink-0 mt-1" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-xs space-y-4">
              <h2 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                Company Credentials
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Nav Durga Ispat Pvt. Ltd. serves industrial and infrastructure buyers from Urla Industrial Area, Raipur with a focus on long-term customer relationships.
              </p>
              <div className="space-y-2.5 text-xs bg-[var(--color-linen)]/55 rounded-xl border border-[var(--color-border)] p-4">
                <div>
                  <span className="text-[var(--color-text-secondary)] font-semibold">Company: </span>
                  <span className="font-bold text-[var(--color-navy)]">Nav Durga Ispat Pvt. Ltd.</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)] font-semibold">CIN: </span>
                  <span className="font-mono font-bold text-[var(--color-navy)]">{companyCin}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)] font-semibold">Established: </span>
                  <span className="font-bold text-[var(--color-navy)]">{companyEst}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)] font-semibold">Location: </span>
                  <span className="font-medium text-[var(--color-navy)]">{cms.contactAddress}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenQuoteModal('Product Specification Enquiry', '')}
                className="nd-btn-primary w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Connect With Our Sales Team
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ===========================================================================
  // ROUTE: RESOURCES / DOWNLOADS (/resources)
  // ===========================================================================
  if (currentPath === '/resources') {
    return (
      <>
        <SeoHead
          title="Specification Sheets & Rate Portal | Nav Durga Ispat Pvt. Ltd."
          description="Download product specification sheets and view live ERP product rates from Nav Durga Ispat Pvt. Ltd."
          canonicalPath="/resources"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Resources', path: '/resources' },
          ]}
        />
        <InnerPageBanner
          theme="services"
          title="Services & Resources"
          subtitle="Technical specification downloads and live ERP rate documentation"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Resources' },
          ]}
          onNavigate={onNavigate}
        />
        <div className="nd-container-narrow nd-section-py space-y-6">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
              <span className="w-6 h-[2.5px] bg-[var(--color-amber)]" aria-hidden="true" />
              <span>Product Documentation</span>
            </span>
            <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)] mt-1">
              Specification Sheets &amp; Live Rate Portal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 xl:gap-6">
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] text-[var(--color-amber)] flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                  Medium Section Product Sheet
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Current ERP product list and sizing for Medium Section products ({mediumProducts.length} active items).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadSpecSheet('Medium Section Specification', mediumProducts)}
                className="nd-btn-primary min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Medium Section Spec</span>
              </button>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] text-[var(--color-amber)] flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                  Light Section Product Sheet
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Current ERP product list and gauge differences for Light Section products ({lightProducts.length} active items).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadSpecSheet('Light Section Specification', lightProducts)}
                className="nd-btn-primary min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Light Section Spec</span>
              </button>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 flex flex-col justify-between gap-4 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                    Printable Live Rate Sheet PDF
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Open the Live Product Rate Portal and generate a formatted Ex-Plant Raipur PDF rate list directly from ERP pricing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/product-rates')}
                  className="nd-btn-secondary min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shrink-0"
                >
                  <TrendingUp className="w-4 h-4 text-[var(--color-navy)]" />
                  <span>Open Live Rate Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ===========================================================================
  // ROUTE: CONTACT US (/contact)
  // ===========================================================================
  if (currentPath === '/contact') {
    return (
      <>
        <SeoHead
          title="Contact Us | Nav Durga Ispat Pvt. Ltd. — Urla Industrial Area, Raipur"
          description={`Contact Nav Durga Ispat Pvt. Ltd. at ${cms.contactAddress}. Phone: ${cms.contactPhone}. Submit structural steel enquiries directly to our ERP sales desk.`}
          canonicalPath="/contact"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Nav Durga Ispat Pvt. Ltd.',
            telephone: cms.contactPhone,
            email: cms.contactEmail,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Plot No. 435-A, Sector-C, Urla Industrial Area',
              addressLocality: 'Raipur',
              addressRegion: 'Chhattisgarh',
              postalCode: '493221',
              addressCountry: 'IN',
            },
          }}
        />
        <InnerPageBanner
          theme="contact"
          title="Contact Us"
          subtitle="Urla Industrial Area, Raipur • Direct Commercial Sales Desk"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Contact Us' },
          ]}
          onNavigate={onNavigate}
        />
        <div className="nd-container nd-section-py">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10">
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
                  <span className="w-6 h-[2.5px] bg-[var(--color-amber)]" aria-hidden="true" />
                  <span>Direct Commercial Sales Desk</span>
                </span>
                <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)] mt-1">
                  Connect With Our Team
                </h2>
                <p className="nd-body text-[var(--color-text-secondary)] mt-2">
                  Submit your structural steel requirement or reach our Urla Industrial Area, Raipur desk for product availability and current rates.
                </p>
              </div>

              <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[var(--color-navy)] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[var(--color-navy)]">Nav Durga Ispat Pvt. Ltd.</div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{cms.contactAddress}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[var(--color-navy)] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[var(--color-navy)]">Sales Helpline</div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{cms.contactPhone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--color-navy)] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[var(--color-navy)]">Official Email</div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{cms.contactEmail}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-[var(--color-navy)] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[var(--color-navy)]">Company CIN &amp; Timings</div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      CIN: {companyCin} • Est. {companyEst} • {cms.dispatchHours}
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="nd-btn-primary w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat With Sales on WhatsApp</span>
              </a>
            </div>

            <div className="lg:col-span-7 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-extrabold text-[var(--color-navy)] mb-1">
                Send Direct Commercial Enquiry
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mb-5">
                Select your steel product, size or specification, and quantity to log a direct enquiry in Nav Durga ERP.
              </p>

              <QuickEnquiryForm
                products={allProducts}
                contactWhatsapp={cms.contactWhatsapp}
                onEnquirySubmitted={onEnquirySubmitted}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ===========================================================================
  // ROUTE: PRIVACY & TERMS (/privacy, /terms)
  // ===========================================================================
  if (currentPath === '/privacy' || currentPath === '/terms') {
    const isPrivacy = currentPath === '/privacy';
    return (
      <>
        <SeoHead
          title={`${isPrivacy ? 'Privacy Policy' : 'Terms & Dispatch Conditions'} | Nav Durga Ispat Pvt. Ltd.`}
          description="Commercial terms, rate validity, weighbridge dispatch terms, and buyer privacy policy of Nav Durga Ispat Pvt. Ltd."
          canonicalPath={currentPath}
        />
        <InnerPageBanner
          theme="infrastructure"
          title={isPrivacy ? 'Privacy Policy' : 'Terms & Dispatch Conditions'}
          subtitle="Nav Durga Ispat Pvt. Ltd. • Commercial & Documentation Standards"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: isPrivacy ? 'Privacy Policy' : 'Terms & Dispatch Conditions' },
          ]}
          onNavigate={onNavigate}
        />
        <div className="nd-container-narrow nd-section-py">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 xl:p-10 space-y-4">
            <h2 className="font-display text-2xl font-extrabold text-[var(--color-navy)]">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Supply & Dispatch Conditions'}
            </h2>
            {isPrivacy ? (
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Nav Durga Ispat Pvt. Ltd. collects commercial contact information submitted via quotation and enquiry forms solely for steel trade quotation, order processing, dispatch coordination, and customer service. Buyer contact data is never sold to third parties.
              </p>
            ) : (
              <div className="space-y-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                <p>1. All published daily rates are Ex-Plant Urla, Raipur (Chhattisgarh) and exclude applicable GST unless explicitly stated on a formal signed quotation.</p>
                <p>2. Material weight as recorded on our calibrated plant weighbridge shall be final and binding for billing.</p>
                <p>3. Standard rates apply for rolling mill lengths; random or custom cut lengths carry commercial adjustments as defined in ERP pricing.</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ===========================================================================
  // ROUTE: HOME (/) — Exact Requested Section Order + 60/30/10 Linen/Navy/Amber Theme
  // ===========================================================================

  const configuredSolutions: SolutionServiceCmsItem[] = (
    cms.solutionsServices && cms.solutionsServices.length > 0
      ? cms.solutionsServices
      : DEFAULT_SOLUTIONS_SERVICES
  ).filter((item) => item.enabled !== false);

  const getSolutionErpMatch = (item: SolutionServiceCmsItem) => {
    const key = item.key.toLowerCase();
    if (key === 'steel-enquiries' || key === 'rate-information' || item.kind === 'service') {
      return { matchingProducts: [] as PublicRateProductItem[], isService: true };
    }
    if (key === 'medium-section') {
      return { matchingProducts: mediumProducts, isService: false };
    }
    if (key === 'light-section') {
      return { matchingProducts: lightProducts, isService: false };
    }
    if (key === 'beams-joists') {
      const matched = allProducts.filter((p) => {
        const text = `${p.name} ${p.category} ${p.description}`.toLowerCase();
        return text.includes('beam') || text.includes('joist') || text.includes('ismb');
      });
      return { matchingProducts: matched, isService: false };
    }
    if (key === 'ms-channels') {
      const matched = allProducts.filter((p) => {
        const text = `${p.name} ${p.category} ${p.description}`.toLowerCase();
        return text.includes('channel') || text.includes('ismc');
      });
      return { matchingProducts: matched, isService: false };
    }
    if (key === 'ms-angles') {
      const matched = allProducts.filter((p) => {
        const text = `${p.name} ${p.category} ${p.description}`.toLowerCase();
        return text.includes('angle') || text.includes('isa');
      });
      return { matchingProducts: matched, isService: false };
    }
    return { matchingProducts: allProducts, isService: false };
  };

  const handleSolutionCardAction = (item: SolutionServiceCmsItem, hasMatchedProducts: boolean) => {
    const key = item.key.toLowerCase();
    if (key === 'rate-information') {
      onNavigate('/product-rates');
      return;
    }
    if (key === 'steel-enquiries' || !hasMatchedProducts) {
      onOpenQuoteModal(item.title, '');
      return;
    }
    if (key === 'medium-section') {
      onNavigate('/products/medium-section');
      return;
    }
    if (key === 'light-section') {
      onNavigate('/products/light-section');
      return;
    }
    if (key === 'beams-joists') {
      setSectionFilter('ALL');
      setCategoryFilter('ALL');
      setProductSearch('Joist');
      scrollToProductsSection();
      return;
    }
    if (key === 'ms-channels') {
      setSectionFilter('ALL');
      setCategoryFilter('ALL');
      setProductSearch('Channel');
      scrollToProductsSection();
      return;
    }
    if (key === 'ms-angles') {
      setSectionFilter('ALL');
      setCategoryFilter('ALL');
      setProductSearch('Angle');
      scrollToProductsSection();
      return;
    }
    setSectionFilter('ALL');
    setCategoryFilter('ALL');
    setProductSearch('');
    scrollToProductsSection();
  };

  const getSolutionIcon = (item: SolutionServiceCmsItem) => {
    const key = item.key.toLowerCase();
    if (key === 'steel-enquiries') return MessageSquare;
    if (key === 'rate-information') return TrendingUp;
    if (key === 'medium-section' || key === 'light-section') return Factory;
    if (key === 'beams-joists' || key === 'ms-channels' || key === 'ms-angles') return Wrench;
    return Layers;
  };

  const homeFaqs = buildPublicFaqs(cms);

  return (
    <>
      <SeoHead
        title="Nav Durga Ispat Pvt. Ltd. | Structural Steel in Raipur"
        description="Steel manufacturer in Raipur, Chhattisgarh supplying Medium & Light Section MS Channels, Beams, Joists & Equal Angles with live ERP-synced steel rates."
        canonicalPath="/"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Nav Durga Ispat Pvt. Ltd.',
            foundingDate: companyEst,
            telephone: cms.contactPhone,
            email: cms.contactEmail,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Plot No. 435-A, Sector-C, Urla Industrial Area',
              addressLocality: 'Raipur',
              addressRegion: 'Chhattisgarh',
              postalCode: '493221',
              addressCountry: 'IN',
            },
          },
          buildFaqJsonLd(homeFaqs),
        ]}
      />

      {/* 1. EXISTING PREMIUM INDUSTRIAL IMAGE SLIDER (BELOW NAVBAR) */}
      <HeroImageSlider
        cms={cms}
        onNavigate={onNavigate}
        onExploreProducts={scrollToProductsSection}
      />

      {/* 2. ERP SYNCHRONIZED DAILY PRICING (DIRECTLY BELOW HERO SLIDER) */}
      <section
        aria-labelledby="erp-daily-pricing-heading"
        className="bg-[var(--color-linen)] border-b border-[var(--color-border)] py-6 sm:py-8"
      >
        <div className="nd-container">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] border-t-4 border-t-[var(--color-amber)] p-5 sm:p-6 xl:p-7 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--color-navy)]">
                <span className="w-6 h-[2.5px] bg-[var(--color-amber)]" aria-hidden="true" />
                <span>ERP Synchronized Daily Pricing</span>
              </div>
              <h2
                id="erp-daily-pricing-heading"
                className="font-display text-xl xl:text-2xl font-extrabold text-[var(--color-navy)]"
              >
                Current Structural Steel Section Basic Rates
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                <span>Synced directly from Nav Durga Ispat ERP • Ex-Plant Urla, Raipur</span>
                {formattedRatesUpdatedAt && (
                  <>
                    <span aria-hidden="true"> · </span>
                    <span className="font-semibold text-[var(--color-navy)] tabular-nums">
                      Updated {formattedRatesUpdatedAt}
                    </span>
                  </>
                )}
              </p>
            </div>

            {ratesLoading && !rates ? (
              <div
                aria-live="polite"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-auto xl:min-w-[460px] min-[1920px]:min-w-[540px]"
              >
                <div className="bg-[var(--color-navy)] text-[var(--color-linen)] rounded-xl border border-[var(--color-amber)]/40 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-amber)]">
                      Medium Section
                    </div>
                    <div className="text-xs font-semibold text-[var(--color-linen)]">Nav Durga Ispat</div>
                  </div>
                  <div className="text-xs font-bold text-[var(--color-amber)]">Syncing ERP rates...</div>
                </div>

                <div className="bg-[var(--color-navy)] text-[var(--color-linen)] rounded-xl border border-[var(--color-amber)]/40 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-amber)]">
                      Light Section
                    </div>
                    <div className="text-xs font-semibold text-[var(--color-linen)]">Unit-2 NS Ispat</div>
                  </div>
                  <div className="text-xs font-bold text-[var(--color-amber)]">Syncing ERP rates...</div>
                </div>
              </div>
            ) : ratesError && !rates ? (
              <div
                role="status"
                className="bg-[var(--color-linen)]/65 rounded-xl border border-[var(--color-border)] px-4 py-3 flex flex-wrap items-center justify-between gap-3 w-full xl:w-auto xl:min-w-[460px] min-[1920px]:min-w-[540px]"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[var(--color-navy)]">
                    Live ERP rate feed temporarily unavailable
                  </div>
                  <div className="text-[11px] text-[var(--color-text-secondary)]">
                    Retry connection or view the Live Rate Portal.
                  </div>
                </div>
                {onRefreshRates && (
                  <button
                    type="button"
                    onClick={onRefreshRates}
                    className="nd-btn-secondary min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-auto xl:min-w-[460px] min-[1920px]:min-w-[540px]">
                <div className="bg-[var(--color-navy)] text-[var(--color-linen)] rounded-xl border border-[var(--color-amber)]/40 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-amber)]">
                      Medium Section
                    </div>
                    <div className="text-xs font-semibold text-[var(--color-linen)]/85">Nav Durga Ispat</div>
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-[var(--color-amber)] tabular-nums">
                    {formatRateText(rates?.mediumSectionRate)}
                  </div>
                </div>

                <div className="bg-[var(--color-navy)] text-[var(--color-linen)] rounded-xl border border-[var(--color-amber)]/40 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-amber)]">
                      Light Section
                    </div>
                    <div className="text-xs font-semibold text-[var(--color-linen)]/85">Unit-2 NS Ispat</div>
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-[var(--color-amber)] tabular-nums">
                    {formatRateText(rates?.lightSectionRate)}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('/product-rates')}
              className="nd-btn-primary w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold shadow-xs cursor-pointer shrink-0"
            >
              <span>View Live Rates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE NAV DURGA ISPAT? (STAGGERED EDITORIAL INDUSTRIAL LAYOUT) */}
      <NavDurgaAdvantageSection
        establishedYear={companyEst}
        activeProfilesCount={allProducts.length}
        onConnectSalesDesk={() => onOpenQuoteModal('General Industrial Steel Enquiry', '')}
        onNavigate={onNavigate}
      />

      {/* 4. SOLUTIONS & SERVICES (ERP-GROUNDED PRODUCT OFFERINGS & BUSINESS SERVICES) */}
      <section className="bg-[var(--color-linen)] border-b border-[var(--color-border)] nd-section-py">
        <div className="nd-container space-y-8 xl:space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 xl:gap-6">
            <div className="max-w-3xl space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--color-navy)]">
                <span className="w-6 h-[2.5px] bg-[var(--color-amber)]" aria-hidden="true" />
                <span>Products &amp; Commercial Services</span>
              </span>
              <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)] tracking-tight">
                Solutions &amp; Services
              </h2>
              <p className="nd-lead text-[var(--color-text-secondary)]">
                Explore our steel product offerings and business services.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="nd-btn-secondary min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Explore All Products
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/product-rates')}
                className="nd-btn-primary min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Live Rate Portal →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {configuredSolutions.map((sol) => {
              const { matchingProducts, isService } = getSolutionErpMatch(sol);
              const erpPhoto = sol.imageUrl || matchingProducts.find((p) => Boolean(p.image))?.image;
              const Icon = getSolutionIcon(sol);
              const count = matchingProducts.length;
              const ctaText =
                sol.key === 'rate-information'
                  ? 'View Live Rates'
                  : sol.key === 'steel-enquiries'
                  ? 'Request a Quote'
                  : count > 0
                  ? 'Explore Section'
                  : 'Enquire Availability';

              return (
                <article
                  key={sol.id}
                  className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-navy)] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {erpPhoto ? (
                      <div className="h-36 w-full overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-linen)]">
                        <img
                          src={erpPhoto}
                          alt={sol.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="px-5 pt-5 flex items-center justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] border border-[var(--color-amber)]/35 flex items-center justify-center text-[var(--color-amber)]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-navy)]">
                          {isService
                            ? 'Business Service'
                            : count > 0
                            ? `${count} ERP ${count === 1 ? 'Item' : 'Items'}`
                            : 'On Enquiry'}
                        </span>
                      </div>
                    )}

                    <div className="p-5 space-y-2">
                      {erpPhoto && (
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-navy)]">
                          {isService
                            ? 'Business Service'
                            : count > 0
                            ? `${count} Active ERP ${count === 1 ? 'Product' : 'Products'}`
                            : 'Available on Request'}
                        </div>
                      )}
                      <h3 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                        {sol.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        {sol.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-[var(--color-linen)]/50 border-t border-[var(--color-border)] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleSolutionCardAction(sol, isService || count > 0)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-navy)] hover:underline cursor-pointer"
                    >
                      <span>{ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--color-amber)]" />
                    </button>
                    <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                      {isService ? 'Commercial' : count > 0 ? 'ERP Synced' : 'Sales Desk'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. EXISTING ERP-CONNECTED PRODUCTS SHOWCASE */}
      <section id="products-section" className="nd-container nd-section-py space-y-8 xl:space-y-10 scroll-mt-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 xl:gap-6">
          <div className="max-w-3xl space-y-1.5">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
              <span className="w-6 h-[2.5px] bg-[var(--color-amber)]" aria-hidden="true" />
              <span>Live ERP Product Range</span>
            </span>
            <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)]">
              Our Steel Products
            </h2>
            <p className="nd-lead text-[var(--color-text-secondary)]">
              Explore our available steel product range and current product information.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="nd-btn-secondary min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Full Product Catalogue ({allProducts.length})
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/product-rates')}
              className="nd-btn-primary min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Rate Sheet Portal →
            </button>
          </div>
        </div>

        {/* ERP Product Filters */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search steel products by name, size (e.g. 100 x 50, 75 x 40), or grade..."
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
                    : 'bg-[var(--color-linen)]/55 text-[var(--color-navy)] border-[var(--color-border)] hover:bg-[var(--color-linen)]'
                }`}
              >
                {sec === 'ALL' ? 'All Sections' : sec === 'MEDIUM SECTION' ? 'Medium Section' : 'Light Section'}
              </button>
            ))}

            {availableCategories.length > 2 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by product category"
                className="min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold border border-[var(--color-border)] bg-white text-[var(--color-navy)] outline-none focus:ring-2 focus:ring-[var(--color-amber)] cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* ERP Product Grid or Empty State */}
        {allProducts.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-[var(--color-text-secondary)] mx-auto" />
            <h3 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
              Product Information Available on Request
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
              Active steel products managed inside Nav Durga ERP will display here automatically. Connect with our sales team for current product availability and rates.
            </p>
            <button
              type="button"
              onClick={() => onOpenQuoteModal('Structural Steel Requirement', '')}
              className="nd-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Request a Quote
            </button>
          </div>
        ) : filteredHomeProducts.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-10 text-center space-y-3">
            <div className="text-base font-bold text-[var(--color-navy)]">No matching products found</div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Try clearing your search or category filter to view all active ERP products.
            </p>
            <button
              type="button"
              onClick={() => {
                setProductSearch('');
                setSectionFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="nd-btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
            {filteredHomeProducts.slice(0, 9).map((item) => {
              const isMedium = item.section === 'MEDIUM SECTION';
              const hasApprovedRate = item.finalRate > 0;
              return (
                <article
                  key={item.id}
                  className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-navy)] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="h-40 min-[1920px]:h-48 relative overflow-hidden">
                      <ProductCardMedia item={item} />
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-xs z-20 bg-[var(--color-navy)] ${
                          isMedium
                            ? 'text-[var(--color-amber)] border border-[var(--color-amber)]/45'
                            : 'text-[var(--color-linen)] border border-white/20'
                        }`}
                      >
                        {item.section}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-semibold text-[var(--color-text-secondary)]">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[var(--color-linen)] border border-[var(--color-border)] text-[11px] font-bold text-[var(--color-navy)]">
                          {item.grade}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                        {item.name} — {item.size}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                        {item.description || `${item.category} (${item.size}) • ${item.rateSource}`}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-[var(--color-linen)]/50 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2.5">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                        Approved Rate
                      </div>
                      <div
                        className={`font-extrabold tabular-nums ${
                          hasApprovedRate ? 'text-base text-[var(--color-navy)]' : 'text-xs text-[var(--color-navy)]'
                        }`}
                      >
                        {formatRateText(item.finalRate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onNavigate(getProductDetailPath(item))}
                        className="nd-btn-secondary min-h-[40px] inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenQuoteModal(`${item.name} (${item.size})`, item.grade)}
                        className="nd-btn-primary min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Request a Quote
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {filteredHomeProducts.length > 9 && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="nd-btn-secondary min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold cursor-pointer"
            >
              <span>View All {filteredHomeProducts.length} Active Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 6. ABOUT NAV DURGA ISPAT PVT. LTD. (DEEP NAVY CORPORATE FEATURE BAND) */}
      <section className="bg-[var(--color-navy)] text-[var(--color-linen)] border-y border-[var(--color-amber)]/35 nd-section-py">
        <div className="nd-container grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-amber)]">
              <span className="w-6 h-[2.5px] bg-[var(--color-amber)]" aria-hidden="true" />
              <span>About Nav Durga Ispat</span>
            </span>
            <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-linen)]">
              {cms.aboutTitle}
            </h2>
            <p className="nd-lead text-[var(--color-linen)]/85">
              {cms.aboutSummary}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/about')}
                className="nd-btn-amber min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                <span>Company Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/quality')}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 text-[var(--color-linen)] text-xs font-bold cursor-pointer transition-colors"
              >
                <span>Quality &amp; Reliability</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
            <div className="bg-[var(--color-navy-hover)] rounded-2xl border border-[var(--color-amber)]/30 p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-linen)]/75">Established</div>
              <div className="font-display text-2xl font-extrabold text-[var(--color-amber)] mt-1 tabular-nums">
                {companyEst}
              </div>
              <div className="text-xs text-[var(--color-linen)]/80 mt-1">Steel industry presence</div>
            </div>
            <div className="bg-[var(--color-navy-hover)] rounded-2xl border border-[var(--color-amber)]/30 p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-linen)]/75">Product Catalog</div>
              <div className="font-display text-2xl font-extrabold text-[var(--color-amber)] mt-1 tabular-nums">
                {allProducts.length} Active
              </div>
              <div className="text-xs text-[var(--color-linen)]/80 mt-1">Medium &amp; Light sections</div>
            </div>
            <div className="min-[380px]:col-span-2 bg-[var(--color-navy-hover)] rounded-2xl border border-[var(--color-amber)]/30 p-5 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-amber)]">
                Registered Industrial Address
              </div>
              <div className="text-xs font-semibold text-[var(--color-linen)] leading-relaxed">
                {cms.contactAddress}
              </div>
              <div className="text-[11px] font-mono font-bold text-[var(--color-linen)]/75 pt-1">
                CIN: {companyCin}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUALITY AND MANUFACTURING / INTERACTIVE 3D ENGINEERING SHOWCASE */}
      <section className="bg-[var(--color-surface)] border-b border-[var(--color-border)] nd-section-py">
        <div className="nd-container space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 xl:gap-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
                <Cpu className="w-3.5 h-3.5 text-[var(--color-navy)]" />
                <span>Interactive 3D Engineering Preview</span>
              </span>
              <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)] mt-1">
                Structural Steel Profiles in 3D
              </h2>
              <p className="nd-lead text-[var(--color-text-secondary)] mt-1">
                Inspect MS Channel, I-Beam, Equal Angle, and rolling pass geometry before requesting your commercial quote.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/product-rates')}
              className="nd-btn-primary min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer shrink-0"
            >
              View Live Rates →
            </button>
          </div>

          <ThreeSteelShowcase
            initialMode="channel"
            onRequestQuote={(label) => onOpenQuoteModal(label, 'Standard')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-[var(--color-linen)]/65 rounded-2xl border border-[var(--color-border)] p-6 sm:p-7 space-y-3 shadow-2xs">
              <div className="h-[2.5px] w-8 bg-[var(--color-amber)]" aria-hidden="true" />
              <span className="block text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
                Industries &amp; Applications
              </span>
              <h3 className="font-display text-2xl font-extrabold text-[var(--color-navy)]">
                Industrial, Structural &amp; Infrastructure Supply
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Supporting industrial buildings, structural fabrication workshops, infrastructure contractors, and regional steel dealers with consistent Medium &amp; Light structural sections.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/industries')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-navy)] hover:underline cursor-pointer pt-1"
              >
                <span>Explore Industries Served</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--color-amber)]" />
              </button>
            </div>

            <div className="bg-[var(--color-linen)]/65 rounded-2xl border border-[var(--color-border)] p-6 sm:p-7 space-y-3 shadow-2xs">
              <div className="h-[2.5px] w-8 bg-[var(--color-amber)]" aria-hidden="true" />
              <span className="block text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
                Quality &amp; Reliability
              </span>
              <h3 className="font-display text-2xl font-extrabold text-[var(--color-navy)]">
                Consistent Specifications &amp; Dependable Service
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {cms.qualityCommitment}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/quality')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-navy)] hover:underline cursor-pointer pt-1"
              >
                <span>Read Quality Commitment</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--color-amber)]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9B. AEO FREQUENTLY ASKED QUESTIONS SECTION */}
      <FaqSection cms={cms} onNavigate={onNavigate} />

      {/* 10. CUSTOMER QUICK ENQUIRY SECTION (ERP-CONNECTED) */}
      <section
        id="quick-enquiry-section"
        aria-labelledby="quick-enquiry-heading"
        className="nd-container nd-section-py scroll-mt-20"
      >
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 bg-[var(--color-navy)] text-[var(--color-linen)] p-6 sm:p-8 xl:p-10 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-amber)]">
                <span className="w-6 h-[2.5px] bg-[var(--color-amber)]" aria-hidden="true" />
                <span>Customer Quick Enquiry</span>
              </span>
              <h2
                id="quick-enquiry-heading"
                className="font-display nd-h2-section font-extrabold text-[var(--color-linen)]"
              >
                Request Steel Products &amp; Latest Ex-Plant Rates
              </h2>
              <p className="text-sm text-[var(--color-linen)]/80 leading-relaxed">
                Choose a steel product and size directly from our active ERP catalog, enter your required quantity, and submit your enquiry straight to our Urla Industrial Area sales desk.
              </p>
            </div>

            <div className="space-y-3 text-xs text-[var(--color-linen)] pt-4 border-t border-white/15">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[var(--color-amber)] shrink-0 mt-0.5" />
                <span>{cms.contactAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[var(--color-amber)] shrink-0" />
                <span className="font-bold">{cms.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[var(--color-amber)] shrink-0" />
                <span>{cms.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[var(--color-amber)] shrink-0" />
                <span className="font-mono font-semibold text-[var(--color-linen)]/85">CIN: {companyCin}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 xl:p-10">
            <QuickEnquiryForm
              products={allProducts}
              contactWhatsapp={cms.contactWhatsapp}
              compact
              onEnquirySubmitted={onEnquirySubmitted}
            />
          </div>
        </div>
      </section>

      {/* OUR PRESENCE — REGISTERED PLANT & OFFICE LOCATION (IMMEDIATELY ABOVE FOOTER) */}
      <PresenceMapSection
        cms={cms}
        mapsApiKey={mapsApiKey}
        onOpenQuoteModal={onOpenQuoteModal}
      />
    </>
  );
};
