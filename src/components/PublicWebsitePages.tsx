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
  Send,
  MessageSquare,
  Cpu,
  Search,
  Eye,
  X,
  Package,
  Compass,
  Handshake,
  Globe,
  Clock,
  SlidersHorizontal,
  Boxes,
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
import { DEFAULT_SOLUTIONS_SERVICES } from '../data/solutionsDefaults';
import { PlatformApi } from '../services/platformApi';

interface PublicWebsitePagesProps {
  currentPath: string;
  cms: WebsiteCmsContent;
  rates: PublicRatesPayload | null;
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

  const accentStroke = isMedium ? '#105186' : '#0B3A60';
  const accentFill = isMedium ? '#EAF2F8' : '#DCE9F5';

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#F7F9FB] via-[#FFFFFF] to-[#EAF2F8]/60 flex flex-col items-center justify-center relative px-6 py-4 select-none border-b border-[#C7CED6]">
      <div
        className="w-full h-full absolute inset-0 opacity-35 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
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
      <div className="relative z-10 mt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
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
  mapsApiKey,
  onNavigate,
  onOpenQuoteModal,
  onEnquirySubmitted,
}) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    city: '',
    product: 'Structural Steel Enquiry',
    quantity: '25',
    notes: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<SalesEnquiry | null>(null);

  // Homepage / Catalog interactive filters & Product Detail Modal
  const [productSearch, setProductSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'MEDIUM SECTION' | 'LIGHT SECTION'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [detailProduct, setDetailProduct] = useState<PublicRateProductItem | null>(null);

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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      setContactError('Name and phone/WhatsApp number are required.');
      return;
    }
    setContactSubmitting(true);
    try {
      const res = await PlatformApi.submitPublicEnquiry({
        name: contactForm.name.trim(),
        companyName: contactForm.companyName.trim(),
        phone: contactForm.phone.trim(),
        email: contactForm.email.trim(),
        city: contactForm.city.trim(),
        product: contactForm.product.trim(),
        grade: 'Standard Enquiry',
        quantity: Number(contactForm.quantity) || 10,
        unit: 'MT',
        notes: contactForm.notes.trim(),
      });
      setContactSuccess(res.enquiry);
      onEnquirySubmitted?.(res.enquiry);
      setContactForm({
        name: '',
        companyName: '',
        phone: '',
        email: '',
        city: '',
        product: 'Structural Steel Enquiry',
        quantity: '25',
        notes: '',
      });
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Could not submit enquiry');
    } finally {
      setContactSubmitting(false);
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

  const renderProductDetailModal = () => {
    if (!detailProduct) return null;
    const isMedium = detailProduct.section === 'MEDIUM SECTION';
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
          <div className="h-44 relative bg-slate-100">
            <ProductCardMedia item={detailProduct} />
            <button
              type="button"
              onClick={() => setDetailProduct(null)}
              aria-label="Close product details"
              className="absolute top-3 right-3 p-2 rounded-xl bg-white/95 hover:bg-white border border-slate-200 text-slate-700 shadow-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  isMedium
                    ? 'bg-[#EAF2F8] text-[#105186] border border-[#105186]/25'
                    : 'bg-[#F7F9FB] text-[#0B3A60] border border-[#C7CED6]'
                }`}
              >
                {detailProduct.section}
              </span>
              <span className="text-xs font-mono font-semibold text-[#737D88]">
                Code: {detailProduct.code}
              </span>
            </div>

            <div>
              <h3 id="product-modal-title" className="font-display text-2xl font-extrabold text-[#263442]">
                {detailProduct.name}
              </h3>
              <p className="text-sm text-[#737D88] mt-1">
                {detailProduct.description || `${detailProduct.category} (${detailProduct.size}) supplied by ${detailProduct.rateSource}.`}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F7F9FB] rounded-xl border border-[#C7CED6] p-4 text-xs">
              <div>
                <div className="text-[#737D88] font-semibold">Size / Spec</div>
                <div className="font-bold text-[#263442] mt-0.5 tabular-nums">{detailProduct.size || 'Standard'}</div>
              </div>
              <div>
                <div className="text-[#737D88] font-semibold">Category</div>
                <div className="font-bold text-[#263442] mt-0.5">{detailProduct.category}</div>
              </div>
              <div>
                <div className="text-[#737D88] font-semibold">Grade</div>
                <div className="font-bold text-[#263442] mt-0.5">{detailProduct.grade}</div>
              </div>
              <div>
                <div className="text-[#737D88] font-semibold">Unit</div>
                <div className="font-bold text-[#263442] mt-0.5">{detailProduct.unit || 'MT'}</div>
              </div>
              <div>
                <div className="text-[#737D88] font-semibold">Availability</div>
                <div className="font-bold text-emerald-700 mt-0.5">
                  {detailProduct.inStock ? 'Ready Stock' : 'Booking Open'}
                </div>
              </div>
              <div>
                <div className="text-[#737D88] font-semibold">Latest Rate</div>
                <div className="font-extrabold text-[#105186] mt-0.5 tabular-nums">
                  {formatRateText(detailProduct.finalRate)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-[#F7F9FB] hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#263442] text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = detailProduct;
                  setDetailProduct(null);
                  onOpenQuoteModal(`${target.name} (${target.size})`, target.grade);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Request a Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#EAF2F8] border border-[#105186]/25 text-[#105186] text-xs font-bold uppercase tracking-wider">
                Established Steel Industry • Raipur, Chhattisgarh
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#263442] tracking-tight">
                {cms.aboutTitle}
              </h1>
              <p className="text-base text-[#737D88] leading-relaxed">{cms.aboutSummary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white rounded-xl border border-[#C7CED6] p-4 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#105186]">Medium Section Division</div>
                  <div className="font-bold text-[#263442] text-sm">{cms.unit1Name}</div>
                  <div className="text-xs text-[#737D88]">
                    Structural steel profiles engineered for industrial and construction requirements.
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#C7CED6] p-4 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0B3A60]">Light Section Division</div>
                  <div className="font-bold text-[#263442] text-sm">{cms.unit2Name}</div>
                  <div className="text-xs text-[#737D88]">
                    Light structural sections and channels supporting fabrication and general engineering.
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Corporate Profile Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#C7CED6] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#C7CED6]/60 pb-3">
                <Building2 className="w-5 h-5 text-[#105186]" />
                <h2 className="font-display text-lg font-extrabold text-[#263442]">
                  Corporate Profile
                </h2>
              </div>
              <dl className="space-y-3 text-xs sm:text-sm">
                <div className="flex flex-col border-b border-slate-100 pb-2.5">
                  <dt className="text-[#737D88] font-semibold text-xs">Company Name</dt>
                  <dd className="font-bold text-[#263442] mt-0.5">Nav Durga Ispat Pvt. Ltd.</dd>
                </div>
                <div className="flex flex-col border-b border-slate-100 pb-2.5">
                  <dt className="text-[#737D88] font-semibold text-xs">Business</dt>
                  <dd className="font-semibold text-[#263442] mt-0.5">Steel manufacturing and steel products</dd>
                </div>
                <div className="flex flex-col border-b border-slate-100 pb-2.5">
                  <dt className="text-[#737D88] font-semibold text-xs">Company CIN</dt>
                  <dd className="font-mono font-bold text-[#263442] mt-0.5">{companyCin}</dd>
                </div>
                <div className="flex flex-col border-b border-slate-100 pb-2.5">
                  <dt className="text-[#737D88] font-semibold text-xs">Established</dt>
                  <dd className="font-bold text-[#263442] mt-0.5">{companyEst}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-[#737D88] font-semibold text-xs">Registered Location</dt>
                  <dd className="font-medium text-[#263442] mt-0.5 leading-relaxed">{cms.contactAddress}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-[#C7CED6] p-6 shadow-2xs space-y-2">
              <Award className="w-7 h-7 text-[#105186]" />
              <h2 className="font-display text-lg font-extrabold text-[#263442]">Our Vision</h2>
              <p className="text-sm text-[#737D88] leading-relaxed">{cms.visionText}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#C7CED6] p-6 shadow-2xs space-y-2">
              <Factory className="w-7 h-7 text-[#105186]" />
              <h2 className="font-display text-lg font-extrabold text-[#263442]">Our Mission</h2>
              <p className="text-sm text-[#737D88] leading-relaxed">{cms.missionText}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#C7CED6] p-6 shadow-2xs space-y-2">
              <ShieldCheck className="w-7 h-7 text-[#0B3A60]" />
              <h2 className="font-display text-lg font-extrabold text-[#263442]">Quality &amp; Reliability</h2>
              <p className="text-sm text-[#737D88] leading-relaxed">{cms.qualityCommitment}</p>
            </div>
          </section>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="bg-white rounded-2xl border border-[#C7CED6] p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#105186]">
                ERP Synchronized Product Catalogue
              </span>
              <h1 className="font-display text-3xl font-extrabold text-[#263442] tracking-tight">
                {activeSection === 'MEDIUM SECTION'
                  ? `Medium Section Steel — ${cms.unit1Name}`
                  : activeSection === 'LIGHT SECTION'
                  ? `Light Section Steel — ${cms.unit2Name}`
                  : 'Our Steel Products'}
              </h1>
              <p className="text-sm text-[#737D88]">
                Explore our available steel product range and current product information directly from Nav Durga Ispat ERP.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  activeSection === 'ALL'
                    ? 'bg-[#105186] text-white border-[#105186]'
                    : 'bg-[#F7F9FB] text-[#263442] border-[#C7CED6] hover:bg-[#EAF2F8]'
                }`}
              >
                All ({allProducts.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/products/medium-section')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  activeSection === 'MEDIUM SECTION'
                    ? 'bg-[#105186] text-white border-[#105186]'
                    : 'bg-[#F7F9FB] text-[#263442] border-[#C7CED6] hover:bg-[#EAF2F8]'
                }`}
              >
                Medium Section ({mediumProducts.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/products/light-section')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  activeSection === 'LIGHT SECTION'
                    ? 'bg-[#0B3A60] text-white border-[#0B3A60]'
                    : 'bg-[#F7F9FB] text-[#263442] border-[#C7CED6] hover:bg-[#EAF2F8]'
                }`}
              >
                Light Section ({lightProducts.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/product-rates')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EAF2F8] text-[#105186] border border-[#105186]/25 hover:bg-[#d8e8f4] cursor-pointer"
              >
                View Live Rates →
              </button>
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#C7CED6] p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-[#737D88] mx-auto" />
              <div className="font-display text-lg font-extrabold text-[#263442]">
                No active products available in this section
              </div>
              <p className="text-xs text-[#737D88] max-w-md mx-auto">
                Products added and activated in Nav Durga ERP automatically appear here. Contact our sales team for custom section enquiries.
              </p>
              <button
                type="button"
                onClick={() => onOpenQuoteModal('Custom Steel Requirement', '')}
                className="px-5 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer"
              >
                Request a Quote
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleItems.map((item) => {
                const isMedium = item.section === 'MEDIUM SECTION';
                const hasApprovedRate = item.finalRate > 0;
                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#C7CED6] hover:border-[#105186] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <div className="h-44 relative overflow-hidden">
                        <ProductCardMedia item={item} />
                        <span
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-xs z-20 ${
                            isMedium ? 'bg-[#105186] text-white' : 'bg-[#0B3A60] text-white'
                          }`}
                        >
                          {item.section}
                        </span>
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-bold text-[#737D88]">
                            {item.category} • {item.code}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#EAF2F8] border border-[#C7CED6] text-[11px] font-bold text-[#0B3A60]">
                            {item.grade}
                          </span>
                        </div>
                        <h2 className="font-display text-lg font-extrabold text-[#263442]">
                          {item.name} — {item.size}
                        </h2>
                        <p className="text-xs text-[#737D88] line-clamp-2">
                          {item.description || `${item.category} (${item.size}) • ${item.rateSource}`}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-4 bg-[#F7F9FB] border-t border-[#C7CED6] flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#737D88]">
                          Approved Rate
                        </div>
                        <div
                          className={`font-extrabold tabular-nums ${
                            hasApprovedRate ? 'text-base text-[#263442]' : 'text-xs text-[#105186]'
                          }`}
                        >
                          {formatRateText(item.finalRate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailProduct(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#263442] text-xs font-bold cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenQuoteModal(`${item.name} (${item.size})`, item.grade)}
                          className="px-3 py-2 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer transition-colors"
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
        {renderProductDetailModal()}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#105186]">
              Industries &amp; Applications
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#263442]">
              Serving Industrial, Structural &amp; Infrastructure Requirements
            </h1>
            <p className="text-sm sm:text-base text-[#737D88]">
              Delivering structural steel products from Urla Industrial Area, Raipur with straightforward service and reliable customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectors.map((sec) => (
              <div key={sec.title} className="bg-white rounded-2xl border border-[#C7CED6] p-6 shadow-xs space-y-3">
                <span className="inline-flex px-2.5 py-1 rounded-md bg-[#EAF2F8] text-[#105186] border border-[#105186]/25 text-[11px] font-bold">
                  {sec.specs}
                </span>
                <h2 className="font-display text-xl font-extrabold text-[#263442]">{sec.title}</h2>
                <p className="text-sm text-[#737D88] leading-relaxed">{sec.desc}</p>
                <button
                  type="button"
                  onClick={() => onOpenQuoteModal(sec.title, sec.specs)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#105186] hover:text-[#0B3A60] hover:underline cursor-pointer pt-1"
                >
                  <span>Request a Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Quality &amp; Customer Commitment
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
                Dependable Specifications &amp; Commercial Transparency
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {cms.qualityCommitment}
              </p>
              <div className="space-y-3 pt-2">
                {[
                  'Consistent product sizing and sectional accuracy across rolling batches',
                  'Clear documentation, weight verification, and straightforward billing terms',
                  'Live rate visibility synchronized directly with our ERP pricing system',
                  'Responsive commercial sales coordination from enquiry through dispatch',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="font-display text-lg font-extrabold text-slate-900">
                Company Credentials
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nav Durga Ispat Pvt. Ltd. serves industrial and infrastructure buyers from Urla Industrial Area, Raipur with a focus on long-term customer relationships.
              </p>
              <div className="space-y-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div>
                  <span className="text-slate-500 font-semibold">Company: </span>
                  <span className="font-bold text-slate-900">Nav Durga Ispat Pvt. Ltd.</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">CIN: </span>
                  <span className="font-mono font-bold text-slate-900">{companyCin}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Established: </span>
                  <span className="font-bold text-slate-900">{companyEst}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Location: </span>
                  <span className="font-medium text-slate-700">{cms.contactAddress}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenQuoteModal('Product Specification Enquiry', '')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer transition-colors"
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#105186]">
              Product Documentation
            </span>
            <h1 className="font-display text-3xl font-extrabold text-[#263442] mt-1">
              Specification Sheets &amp; Live Rate Portal
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-[#C7CED6] p-6 flex flex-col justify-between gap-4">
              <div>
                <FileText className="w-7 h-7 text-[#105186] mb-3" />
                <h2 className="font-display text-lg font-extrabold text-[#263442]">
                  Medium Section Product Sheet
                </h2>
                <p className="text-xs text-[#737D88] mt-1">
                  Current ERP product list and sizing for Medium Section products ({mediumProducts.length} active items).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadSpecSheet('Medium Section Specification', mediumProducts)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Medium Section Spec</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#C7CED6] p-6 flex flex-col justify-between gap-4">
              <div>
                <Layers className="w-7 h-7 text-[#0B3A60] mb-3" />
                <h2 className="font-display text-lg font-extrabold text-[#263442]">
                  Light Section Product Sheet
                </h2>
                <p className="text-xs text-[#737D88] mt-1">
                  Current ERP product list and gauge differences for Light Section products ({lightProducts.length} active items).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadSpecSheet('Light Section Specification', lightProducts)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3A60] hover:bg-[#105186] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Light Section Spec</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#C7CED6] p-6 flex flex-col justify-between gap-4 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-[#263442]">
                    Printable Live Rate Sheet PDF
                  </h2>
                  <p className="text-xs text-[#737D88] mt-1">
                    Open the Live Product Rate Portal and generate a formatted Ex-Plant Raipur PDF rate list directly from ERP pricing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/product-rates')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EAF2F8] hover:bg-[#d8e8f4] border border-[#105186]/25 text-[#105186] text-xs font-bold cursor-pointer shrink-0 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-[#105186]" />
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
          description={`Contact Nav Durga Ispat Pvt. Ltd. at ${cms.contactAddress}. Phone: ${cms.contactPhone}.`}
          canonicalPath="/contact"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#105186]">
                  Direct Commercial Sales Desk
                </span>
                <h1 className="font-display text-3xl font-extrabold text-[#263442] mt-1">
                  Connect With Our Team
                </h1>
                <p className="text-sm text-[#737D88] mt-2">
                  Submit your structural steel requirement or reach our Urla Industrial Area, Raipur desk for product availability and current rates.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#C7CED6] p-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#105186] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#263442]">Nav Durga Ispat Pvt. Ltd.</div>
                    <div className="text-xs text-[#737D88] mt-0.5">{cms.contactAddress}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#105186] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#263442]">Sales Helpline</div>
                    <div className="text-xs text-[#737D88] mt-0.5">{cms.contactPhone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#737D88] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#263442]">Official Email</div>
                    <div className="text-xs text-[#737D88] mt-0.5">{cms.contactEmail}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-[#737D88] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#263442]">Company CIN &amp; Timings</div>
                    <div className="text-xs text-[#737D88] mt-0.5">
                      CIN: {companyCin} • Est. {companyEst} • {cms.dispatchHours}
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat With Sales on WhatsApp</span>
              </a>
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#C7CED6] p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-extrabold text-[#263442] mb-4">
                Send Direct Commercial Enquiry
              </h2>

              {contactSuccess && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold">Enquiry Recorded ({contactSuccess.enquiryNumber}). </span>
                    Thank you! Our sales team has received your requirement in Nav Durga ERP.
                  </div>
                </div>
              )}

              {contactError && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900">
                  {contactError}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#263442] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#263442] mb-1">Company Name</label>
                    <input
                      type="text"
                      value={contactForm.companyName}
                      onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#263442] mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#263442] mb-1">City</label>
                    <input
                      type="text"
                      value={contactForm.city}
                      onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#263442] mb-1">Product Required</label>
                    <input
                      type="text"
                      value={contactForm.product}
                      onChange={(e) => setContactForm({ ...contactForm, product: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#263442] mb-1">Quantity (MT)</label>
                    <input
                      type="number"
                      min="1"
                      value={contactForm.quantity}
                      onChange={(e) => setContactForm({ ...contactForm, quantity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186] tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263442] mb-1">Requirement Details</label>
                  <textarea
                    rows={3}
                    value={contactForm.notes}
                    onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                    placeholder="Mention required sizes, grades (Medium / SL), length, and delivery location..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-sm font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{contactSubmitting ? 'Sending Enquiry...' : 'Submit Sales Enquiry'}</span>
                </button>
              </form>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
            <h1 className="font-display text-2xl font-extrabold text-slate-900">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Supply & Dispatch Conditions'}
            </h1>
            {isPrivacy ? (
              <p className="text-sm text-slate-600 leading-relaxed">
                Nav Durga Ispat Pvt. Ltd. collects commercial contact information submitted via quotation and enquiry forms solely for steel trade quotation, order processing, dispatch coordination, and customer service. Buyer contact data is never sold to third parties.
              </p>
            ) : (
              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
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
  // ROUTE: HOME (/) — Exact Requested Section Order + #105186 Light Industrial Theme
  // ===========================================================================
  const whyChooseFeatures = [
    {
      icon: Compass,
      title: 'Established Industry Presence',
      meta: `Since ${companyEst} · Raipur`,
      desc: `Serving industrial and structural steel requirements since ${companyEst} as a registered private limited steel enterprise.`,
    },
    {
      icon: Boxes,
      title: 'ERP-Backed Steel Product Range',
      meta: `${allProducts.length} Active Profiles`,
      desc: 'Structural Medium Section and Light Section steel profiles synchronized directly from our Nav Durga ERP catalog.',
    },
    {
      icon: TrendingUp,
      title: 'Convenient Product & Rate Info',
      meta: 'Live Daily Pricing',
      desc: 'Check active sizes, gauge specifications, and published section basic rates anytime through the online rate portal.',
    },
    {
      icon: Handshake,
      title: 'Customer-Focused Approach',
      meta: 'Direct Sales Desk',
      desc: 'Straightforward commercial coordination from requirement enquiry through quotation and dispatch scheduling.',
    },
    {
      icon: MapPin,
      title: 'Urla Industrial Area Location',
      meta: 'Raipur, Chhattisgarh',
      desc: 'Located in Plot No. 435-A, Sector-C, Urla Industrial Area — supporting buyers across regional industrial corridors.',
    },
    {
      icon: Globe,
      title: 'Digital Accessibility',
      meta: 'Web & WhatsApp',
      desc: 'Quickly inspect 3D steel profiles, submit online quotation requests, or reach our commercial desk via WhatsApp.',
    },
  ];

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

  return (
    <>
      <SeoHead
        title="Nav Durga Ispat Pvt. Ltd. | Strength in Steel. Built for Tomorrow."
        description="Nav Durga Ispat Pvt. Ltd. — Steel manufacturing and steel products in Urla Industrial Area, Raipur, Chhattisgarh. Explore our products and live rates."
        canonicalPath="/"
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

      {/* 1. EXISTING PREMIUM INDUSTRIAL IMAGE SLIDER (BELOW NAVBAR) */}
      <HeroImageSlider
        cms={cms}
        onNavigate={onNavigate}
        onExploreProducts={scrollToProductsSection}
      />

      {/* 2. WHY CHOOSE NAV DURGA ISPAT? */}
      <section className="bg-[#FFFFFF] border-b border-[#C7CED6] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#105186]">
                Nav Durga Ispat Advantage
              </span>
              <h2 className="font-display text-3xl font-extrabold text-[#263442] tracking-tight">
                Why Choose Nav Durga Ispat?
              </h2>
              <p className="text-sm sm:text-base text-[#737D88] leading-relaxed">
                Building lasting business relationships through experience, steel products and a commitment to dependable service.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenQuoteModal('General Industrial Steel Enquiry', '')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EAF2F8] hover:bg-[#105186] text-[#105186] hover:text-white border border-[#105186]/25 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              <span>Connect With Sales Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyChooseFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-[#F7F9FB] hover:bg-white rounded-2xl border border-[#C7CED6] hover:border-[#105186] p-6 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#EAF2F8] border border-[#105186]/20 flex items-center justify-center text-[#105186]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#737D88]">
                        {feat.meta}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-[#263442]">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#737D88] leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SOLUTIONS & SERVICES (ERP-GROUNDED PRODUCT OFFERINGS & BUSINESS SERVICES) */}
      <section className="bg-[#F7F9FB] border-b border-[#C7CED6] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#105186]">
                Products &amp; Commercial Services
              </span>
              <h2 className="font-display text-3xl font-extrabold text-[#263442] tracking-tight">
                Solutions &amp; Services
              </h2>
              <p className="text-sm sm:text-base text-[#737D88] leading-relaxed">
                Explore our steel product offerings and business services.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#263442] text-xs font-bold cursor-pointer transition-colors"
              >
                Explore All Products
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/product-rates')}
                className="px-4 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer transition-colors"
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
                  className="bg-white rounded-2xl border border-[#C7CED6] hover:border-[#105186] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {erpPhoto ? (
                      <div className="h-36 w-full overflow-hidden border-b border-[#C7CED6] bg-[#EAF2F8]">
                        <img
                          src={erpPhoto}
                          alt={sol.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="px-5 pt-5 flex items-center justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#EAF2F8] border border-[#105186]/20 flex items-center justify-center text-[#105186]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B3A60]">
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
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#105186]">
                          {isService
                            ? 'Business Service'
                            : count > 0
                            ? `${count} Active ERP ${count === 1 ? 'Product' : 'Products'}`
                            : 'Available on Request'}
                        </div>
                      )}
                      <h3 className="font-display text-lg font-extrabold text-[#263442]">
                        {sol.title}
                      </h3>
                      <p className="text-xs text-[#737D88] leading-relaxed">
                        {sol.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-[#F7F9FB] border-t border-[#C7CED6] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleSolutionCardAction(sol, isService || count > 0)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#105186] hover:text-[#0B3A60] cursor-pointer transition-colors"
                    >
                      <span>{ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-semibold text-[#737D88]">
                      {isService ? 'Commercial' : count > 0 ? 'ERP Synced' : 'Sales Desk'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. EXISTING ERP-CONNECTED PRODUCTS SHOWCASE + LIVE RATE SNAPSHOT */}
      <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 scroll-mt-20">
        {/* Live Section Basic Rate Summary Card */}
        <div className="bg-white rounded-2xl border border-[#C7CED6] p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#105186]">
              ERP Synchronized Daily Pricing
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#263442]">
              Current Structural Steel Section Basic Rates
            </h3>
            <p className="text-xs text-[#737D88]">
              Synced directly from Nav Durga Ispat ERP • Ex-Plant Urla, Raipur
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:min-w-[440px]">
            <div className="bg-[#EAF2F8] rounded-xl border border-[#105186]/25 px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#105186]">
                  Medium Section
                </div>
                <div className="text-xs font-semibold text-[#263442]">Nav Durga Ispat</div>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[#0B3A60] tabular-nums">
                {formatRateText(rates?.mediumSectionRate)}
              </div>
            </div>

            <div className="bg-[#F7F9FB] rounded-xl border border-[#C7CED6] px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#0B3A60]">
                  Light Section
                </div>
                <div className="text-xs font-semibold text-[#263442]">Unit-2 NS Ispat</div>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[#105186] tabular-nums">
                {formatRateText(rates?.lightSectionRate)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/product-rates')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold shadow-xs cursor-pointer shrink-0 transition-colors"
          >
            <span>View Live Rates</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#105186]">
              Live ERP Product Range
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[#263442]">
              Our Steel Products
            </h2>
            <p className="text-sm sm:text-base text-[#737D88]">
              Explore our available steel product range and current product information.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#263442] text-xs font-bold cursor-pointer transition-colors"
            >
              Full Product Catalogue ({allProducts.length})
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/product-rates')}
              className="px-4 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Rate Sheet Portal →
            </button>
          </div>
        </div>

        {/* ERP Product Filters */}
        <div className="bg-white rounded-2xl border border-[#C7CED6] p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737D88] absolute left-3.5 top-3" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search steel products by name, size (e.g. 100 x 50, 75 x 40), or grade..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C7CED6] bg-[#F7F9FB] focus:bg-white text-sm outline-none focus:ring-2 focus:ring-[#105186]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'MEDIUM SECTION', 'LIGHT SECTION'] as const).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSectionFilter(sec)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  sectionFilter === sec
                    ? 'bg-[#105186] text-white border-[#105186]'
                    : 'bg-[#F7F9FB] text-[#263442] border-[#C7CED6] hover:bg-[#EAF2F8]'
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
                className="px-3 py-2 rounded-xl text-xs font-bold border border-[#C7CED6] bg-white text-[#263442] outline-none cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-[#C7CED6] p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-[#737D88] mx-auto" />
            <h3 className="font-display text-lg font-extrabold text-[#263442]">
              Product Information Available on Request
            </h3>
            <p className="text-xs text-[#737D88] max-w-md mx-auto">
              Active steel products managed inside Nav Durga ERP will display here automatically. Connect with our sales team for current product availability and rates.
            </p>
            <button
              type="button"
              onClick={() => onOpenQuoteModal('Structural Steel Requirement', '')}
              className="px-5 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer"
            >
              Request a Quote
            </button>
          </div>
        ) : filteredHomeProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#C7CED6] p-10 text-center space-y-3">
            <div className="text-base font-bold text-[#263442]">No matching products found</div>
            <p className="text-xs text-[#737D88]">
              Try clearing your search or category filter to view all active ERP products.
            </p>
            <button
              type="button"
              onClick={() => {
                setProductSearch('');
                setSectionFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHomeProducts.slice(0, 9).map((item) => {
              const isMedium = item.section === 'MEDIUM SECTION';
              const hasApprovedRate = item.finalRate > 0;
              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#C7CED6] hover:border-[#105186] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="h-40 relative overflow-hidden">
                      <ProductCardMedia item={item} />
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-xs z-20 ${
                          isMedium ? 'bg-[#105186] text-white' : 'bg-[#0B3A60] text-white'
                        }`}
                      >
                        {item.section}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-semibold text-[#737D88]">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#EAF2F8] border border-[#C7CED6] text-[11px] font-bold text-[#0B3A60]">
                          {item.grade}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-extrabold text-[#263442]">
                        {item.name} — {item.size}
                      </h3>
                      <p className="text-xs text-[#737D88] line-clamp-2">
                        {item.description || `${item.category} (${item.size}) • ${item.rateSource}`}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-[#F7F9FB] border-t border-[#C7CED6] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#737D88]">
                        Approved Rate
                      </div>
                      <div
                        className={`font-extrabold tabular-nums ${
                          hasApprovedRate ? 'text-base text-[#263442]' : 'text-xs text-[#105186]'
                        }`}
                      >
                        {formatRateText(item.finalRate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDetailProduct(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#263442] text-xs font-bold cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenQuoteModal(`${item.name} (${item.size})`, item.grade)}
                        className="px-3 py-2 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer transition-colors"
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EAF2F8] hover:bg-[#105186] text-[#105186] hover:text-white border border-[#105186]/25 text-xs font-bold cursor-pointer transition-colors"
            >
              <span>View All {filteredHomeProducts.length} Active Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 5. OUR PRESENCE — URLA INDUSTRIAL AREA, RAIPUR + INTERACTIVE MAP */}
      <PresenceMapSection
        cms={cms}
        mapsApiKey={mapsApiKey}
        onOpenQuoteModal={onOpenQuoteModal}
      />

      {/* 6. ABOUT NAV DURGA ISPAT PVT. LTD. (FACTUAL OVERVIEW) */}
      <section className="bg-[#F7F9FB] border-b border-[#C7CED6] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#105186]">
              About Nav Durga Ispat
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[#263442]">
              {cms.aboutTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#737D88] leading-relaxed">
              {cms.aboutSummary}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/about')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <span>Company Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/quality')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#263442] text-xs font-bold cursor-pointer transition-colors"
              >
                <span>Quality &amp; Reliability</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#C7CED6] p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#737D88]">Established</div>
              <div className="font-display text-2xl font-extrabold text-[#263442] mt-1 tabular-nums">
                {companyEst}
              </div>
              <div className="text-xs text-[#737D88] mt-1">Steel industry presence</div>
            </div>
            <div className="bg-white rounded-2xl border border-[#C7CED6] p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#737D88]">Product Catalog</div>
              <div className="font-display text-2xl font-extrabold text-[#105186] mt-1 tabular-nums">
                {allProducts.length} Active
              </div>
              <div className="text-xs text-[#737D88] mt-1">Medium &amp; Light sections</div>
            </div>
            <div className="col-span-2 bg-white rounded-2xl border border-[#C7CED6] p-5 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#105186]">
                Registered Industrial Address
              </div>
              <div className="text-xs font-semibold text-[#263442] leading-relaxed">
                {cms.contactAddress}
              </div>
              <div className="text-[11px] font-mono font-bold text-[#737D88] pt-1">
                CIN: {companyCin}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUALITY AND MANUFACTURING / INTERACTIVE 3D ENGINEERING SHOWCASE */}
      <section className="bg-[#FFFFFF] border-b border-[#C7CED6] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#105186]">
                <Cpu className="w-3.5 h-3.5" />
                <span>Interactive 3D Engineering Preview</span>
              </span>
              <h2 className="font-display text-3xl font-extrabold text-[#263442] mt-1">
                Structural Steel Profiles in 3D
              </h2>
              <p className="text-sm text-[#737D88] mt-1">
                Inspect MS Channel, I-Beam, Equal Angle, and rolling pass geometry before requesting your commercial quote.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/product-rates')}
              className="px-4 py-2.5 rounded-xl bg-[#EAF2F8] hover:bg-[#105186] text-[#105186] hover:text-white border border-[#105186]/25 text-xs font-bold cursor-pointer shrink-0 transition-colors"
            >
              View Live Rates →
            </button>
          </div>

          <ThreeSteelShowcase
            initialMode="channel"
            onRequestQuote={(label) => onOpenQuoteModal(label, 'Standard')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-[#F7F9FB] rounded-2xl border border-[#C7CED6] p-6 sm:p-7 space-y-3 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#105186]">
                Industries &amp; Applications
              </span>
              <h3 className="font-display text-2xl font-extrabold text-[#263442]">
                Industrial, Structural &amp; Infrastructure Supply
              </h3>
              <p className="text-sm text-[#737D88] leading-relaxed">
                Supporting industrial buildings, structural fabrication workshops, infrastructure contractors, and regional steel dealers with consistent Medium &amp; Light structural sections.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/industries')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#105186] hover:text-[#0B3A60] hover:underline cursor-pointer pt-1"
              >
                <span>Explore Industries Served</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-[#F7F9FB] rounded-2xl border border-[#C7CED6] p-6 sm:p-7 space-y-3 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B3A60]">
                Quality &amp; Reliability
              </span>
              <h3 className="font-display text-2xl font-extrabold text-[#263442]">
                Consistent Specifications &amp; Dependable Service
              </h3>
              <p className="text-sm text-[#737D88] leading-relaxed">
                {cms.qualityCommitment}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/quality')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#105186] hover:text-[#0B3A60] hover:underline cursor-pointer pt-1"
              >
                <span>Read Quality Commitment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. EXISTING CONTACT / DIRECT ENQUIRY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl border border-[#C7CED6] p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#105186]">
              Contact Us
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#263442]">
              Connect With Our Sales Team
            </h2>
            <p className="text-sm text-[#737D88] leading-relaxed">
              Send your steel requirement directly to Nav Durga Ispat ERP or connect with our Raipur office for current dispatch rates.
            </p>
            <div className="space-y-2.5 text-xs text-[#263442] pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#105186] shrink-0 mt-0.5" />
                <span>{cms.contactAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#105186] shrink-0" />
                <span className="font-bold">{cms.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#737D88] shrink-0" />
                <span>{cms.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#737D88] shrink-0" />
                <span className="font-mono font-semibold">CIN: {companyCin}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {contactSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Enquiry Recorded ({contactSuccess.enquiryNumber}). </span>
                  Our commercial desk has received your request.
                </div>
              </div>
            )}
            {contactError && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900">
                {contactError}
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone / WhatsApp Number *"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                />
                <input
                  type="text"
                  placeholder="Company / Firm Name"
                  value={contactForm.companyName}
                  onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                />
                <input
                  type="text"
                  placeholder="Product & Quantity (e.g. MS Channel 25 MT)"
                  value={contactForm.product}
                  onChange={(e) => setContactForm({ ...contactForm, product: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
                />
              </div>
              <textarea
                rows={2}
                placeholder="City, required sizes, or commercial remarks..."
                value={contactForm.notes}
                onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] text-sm outline-none focus:ring-2 focus:ring-[#105186]"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{contactSubmitting ? 'Sending...' : 'Submit Sales Enquiry'}</span>
                </button>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Sales</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>

      {renderProductDetailModal()}
    </>
  );
};
