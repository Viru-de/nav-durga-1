import React, { useState } from 'react';
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
  Truck,
  Sparkles,
} from 'lucide-react';
import {
  PublicRateProductItem,
  PublicRatesPayload,
  SalesEnquiry,
  WebsiteCmsContent,
} from '../types';
import { ThreeSteelShowcase } from './ThreeSteelShowcase';
import { SeoHead } from './SeoHead';
import { PlatformApi } from '../services/platformApi';

import heroRollingMillImg from '../assets/images/hero_rolling_mill_1794568664782.jpg';
import steelMediumImg from '../assets/images/steel_medium_section_1794568664705.jpg';
import steelLightImg from '../assets/images/steel_light_section_1794568666210.jpg';
import qualityLabImg from '../assets/images/quality_testing_lab_1794568667154.jpg';
import urlaCampusImg from '../assets/images/urla_facility_campus_1794568666377.jpg';

interface PublicWebsitePagesProps {
  currentPath: string;
  cms: WebsiteCmsContent;
  rates: PublicRatesPayload | null;
  onNavigate: (path: string) => void;
  onOpenQuoteModal: (presetProduct?: string, presetGrade?: string) => void;
  onEnquirySubmitted?: (enquiry: SalesEnquiry) => void;
}

function formatRateText(val?: number): string {
  if (!val || val <= 0) return 'Rate on request';
  return `₹${Math.round(val).toLocaleString('en-IN')} / MT`;
}

export const PublicWebsitePages: React.FC<PublicWebsitePagesProps> = ({
  currentPath,
  cms,
  rates,
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
    product: 'MS Channel / Structural Steel',
    quantity: '25',
    notes: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<SalesEnquiry | null>(null);

  const allProducts = rates?.products || [];
  const mediumProducts = allProducts.filter((p) => p.section === 'MEDIUM SECTION');
  const lightProducts = allProducts.filter((p) => p.section === 'LIGHT SECTION');

  const whatsappDigits = (cms.contactWhatsapp || '919827100000').replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${whatsappDigits.startsWith('91') ? whatsappDigits : `91${whatsappDigits}`}?text=${encodeURIComponent(
    'Hello Nav Durga Ispat Sales Team, I would like product details & today ex-plant rates.'
  )}`;

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
        grade: 'Standard / IS 2062',
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
        product: 'MS Channel / Structural Steel',
        quantity: '25',
        notes: '',
      });
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Could not submit enquiry');
    } finally {
      setContactSubmitting(false);
    }
  };

  // Helper to download a clean text/spec sheet or trigger PDF print
  const handleDownloadSpecSheet = (title: string, items: PublicRateProductItem[]) => {
    const lines = [
      `NAV DURGA ISPAT PVT. LTD. — ${title.toUpperCase()}`,
      `Plant: ${cms.contactAddress}`,
      `Phone: ${cms.contactPhone} | Email: ${cms.contactEmail} | GSTIN: ${cms.gstNumber}`,
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      `-------------------------------------------------------------------------`,
      ...items.map(
        (it) =>
          `${it.code} | ${it.name} | Size: ${it.size} | Grade: ${it.grade} | Section: ${it.section} | Rate: ${formatRateText(
            it.finalRate
          )}`
      ),
      `-------------------------------------------------------------------------`,
      `Note: Ex-Plant Urla, Raipur. GST 18% Extra. Final Rate = Basic Rate + Gauge Diff.`,
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

  // ===========================================================================
  // ROUTE: ABOUT US (/about)
  // ===========================================================================
  if (currentPath === '/about') {
    return (
      <>
        <SeoHead
          title="About Us | Nav Durga Ispat Pvt. Ltd. — Structural Steel Engineering"
          description="Learn about Nav Durga Ispat Pvt. Ltd. (Medium Section) and Unit-2 NS Ispat (I) Pvt. Ltd. (Light Section) in Urla Industrial Area, Raipur."
          canonicalPath="/about"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'About Us', path: '/about' },
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider">
                Industrial Heritage • Urla, Raipur
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {cms.aboutTitle}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">{cms.aboutSummary}</p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Unit 1</div>
                  <div className="font-bold text-slate-900 text-sm mt-1">{cms.unit1Name}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Medium Section Channels, Heavy Structural Joists &amp; Angles
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-700">Unit 2</div>
                  <div className="font-bold text-slate-900 text-sm mt-1">{cms.unit2Name}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Light Section Channels, Angles, Flats &amp; Precision Profiles
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <img
                src={urlaCampusImg}
                alt="Nav Durga Ispat Industrial Plant Campus Urla Raipur"
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-2">
              <Award className="w-7 h-7 text-red-700" />
              <h2 className="font-display text-lg font-extrabold text-slate-900">Our Vision</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{cms.visionText}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-2">
              <Factory className="w-7 h-7 text-blue-700" />
              <h2 className="font-display text-lg font-extrabold text-slate-900">Our Mission</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{cms.missionText}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-2">
              <ShieldCheck className="w-7 h-7 text-emerald-700" />
              <h2 className="font-display text-lg font-extrabold text-slate-900">Quality Commitment</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{cms.qualityCommitment}</p>
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
              ? 'Structural Steel Products Catalogue'
              : `${activeSection} Steel Products`
          } | Nav Durga Ispat Pvt. Ltd.`}
          description="Explore Medium Section (MS Channels, Joists, Angles) and Light Section (Channels, Angles, Flats, Square) from Nav Durga Ispat Pvt. Ltd. with live ERP rates."
          canonicalPath={currentPath}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
            ...(activeSection !== 'ALL' ? [{ name: activeSection, path: currentPath }] : []),
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                IS 2062 &amp; IS 808 Structural Portfolio
              </span>
              <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeSection === 'MEDIUM SECTION'
                  ? `Medium Section Steel — ${cms.unit1Name}`
                  : activeSection === 'LIGHT SECTION'
                  ? `Light Section Steel — ${cms.unit2Name}`
                  : 'Complete Structural Steel Product Range'}
              </h1>
              <p className="text-sm text-slate-600">
                Every size and grade below reflects our active rolling mill master and real-time ERP published ex-plant pricing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  activeSection === 'ALL'
                    ? 'bg-red-700 text-white border-red-700'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                All ({allProducts.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/products/medium-section')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  activeSection === 'MEDIUM SECTION'
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Medium Section ({mediumProducts.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/products/light-section')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  activeSection === 'LIGHT SECTION'
                    ? 'bg-red-700 text-white border-red-700'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Light Section ({lightProducts.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/product-rates')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                Live Rate Sheet →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleItems.map((item) => {
              const isMedium = item.section === 'MEDIUM SECTION';
              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      <img
                        src={isMedium ? steelMediumImg : steelLightImg}
                        alt={`${item.name} ${item.size}`}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-xs ${
                          isMedium
                            ? 'bg-blue-700 text-white'
                            : 'bg-red-700 text-white'
                        }`}
                      >
                        {item.section}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {item.code}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
                          {item.grade}
                        </span>
                      </div>
                      <h2 className="font-display text-lg font-extrabold text-slate-900">
                        {item.name} — {item.size}
                      </h2>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description || `${item.category} manufactured under strict metallurgical tolerances at ${item.rateSource}.`}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Live Ex-Plant Rate
                      </div>
                      <div className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatRateText(item.finalRate)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenQuoteModal(`${item.name} (${item.size})`, item.grade)}
                      className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Get Quote
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
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
        title: 'Pre-Engineered Buildings (PEB) & Industrial Sheds',
        desc: 'High-strength ISMC channels and ISMB joists engineered for wide-span factory trusses, warehouses, and crane girders.',
        specs: 'ISMC 100–250, ISMB Beams',
      },
      {
        title: 'Power Transmission & Telecom Towers',
        desc: 'Uniform-leg equal angles with clean galvanizing compatibility for transmission lattices, substations, and solar mounting.',
        specs: 'ISA 40×5 to 65×6, Light Sections',
      },
      {
        title: 'Bridges, Flyovers & Infrastructure EPC',
        desc: 'Ultrasonic and chemically tested structural profiles delivering predictable load bearing in civic infrastructure.',
        specs: 'IS 2062 E250 / Heavy Joists',
      },
      {
        title: 'Heavy Fabrication, Chassis & Machinery',
        desc: 'Precision-rolled channels, flats, and square bars for OEM frames, trailer bodies, conveyors, and agricultural equipment.',
        specs: 'MS Flats, Squares & Light Channels',
      },
    ];

    return (
      <>
        <SeoHead
          title="Industries Served | Nav Durga Ispat Pvt. Ltd."
          description="Structural steel supply for PEB sheds, power transmission towers, bridges, infrastructure EPC, and heavy machinery fabricators."
          canonicalPath="/industries"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Industries', path: '/industries' },
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              Industrial Applications
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
              Powering India&apos;s Core Infrastructure &amp; Manufacturing
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              From structural EPC contractors to regional fabrication wholesalers, Nav Durga Ispat ensures dimensional repeatability and reliable mill dispatch schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectors.map((sec) => (
              <div key={sec.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                <span className="inline-flex px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold">
                  {sec.specs}
                </span>
                <h2 className="font-display text-xl font-extrabold text-slate-900">{sec.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{sec.desc}</p>
                <button
                  type="button"
                  onClick={() => onOpenQuoteModal(sec.title, sec.specs)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:underline cursor-pointer pt-1"
                >
                  <span>Request Sector Supply Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <ThreeSteelShowcase
            initialMode="beam"
            onRequestQuote={(prof) => onOpenQuoteModal(prof, 'IS 2062')}
          />
        </div>
      </>
    );
  }

  // ===========================================================================
  // ROUTE: QUALITY ASSURANCE (/quality)
  // ===========================================================================
  if (currentPath === '/quality') {
    return (
      <>
        <SeoHead
          title="Quality Assurance & Testing Lab | Nav Durga Ispat Pvt. Ltd."
          description="Spectrometer chemical verification, UTM tensile testing, gauge tolerance inspection, and BIS IS 2062 compliance at Nav Durga Ispat Raipur."
          canonicalPath="/quality"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Quality Assurance', path: '/quality' },
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                IS 2062 • Spectrometer &amp; UTM Tested
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
                Metallurgical Precision in Every Rolled Heat
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {cms.qualityCommitment}
              </p>
              <div className="space-y-2.5 pt-2">
                {[
                  'Optical Emission Spectrometer (OES) carbon & manganese verification per billet heat',
                  'Universal Testing Machine (UTM) yield strength, tensile & elongation certification',
                  'Digital sectional gauge & flange thickness checks across rolling passes',
                  'Batch traceability & Mill Test Certificate (MTC) issued with commercial dispatches',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <img
                src={qualityLabImg}
                alt="Metallurgical Quality Testing Laboratory at Nav Durga Ispat"
                className="w-full h-80 sm:h-96 object-cover"
              />
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
          title="Resources, Brochures & Spec Downloads | Nav Durga Ispat Pvt. Ltd."
          description="Download product catalogues, Medium & Light Section steel rate sheets, and technical specifications from Nav Durga Ispat."
          canonicalPath="/resources"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Resources', path: '/resources' },
          ]}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              Engineering Documentation
            </span>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 mt-1">
              Technical Brochures &amp; Live Specification Sheets
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4">
              <div>
                <FileText className="w-7 h-7 text-red-700 mb-3" />
                <h2 className="font-display text-lg font-extrabold text-slate-900">
                  Medium Section Steel Catalogue (Unit-1)
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Complete dimensional &amp; current rate specification for MS Channels, Joists &amp; Medium Angles ({mediumProducts.length} active profiles).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadSpecSheet('Medium Section Specification', mediumProducts)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Medium Section Spec</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4">
              <div>
                <Layers className="w-7 h-7 text-blue-700 mb-3" />
                <h2 className="font-display text-lg font-extrabold text-slate-900">
                  Light Section Steel Catalogue (Unit-2)
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Full size &amp; SL/Light gauge differential chart for NS Ispat (I) Pvt. Ltd. products ({lightProducts.length} active profiles).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadSpecSheet('Light Section Specification', lightProducts)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Light Section Spec</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Printable Live Rate Sheet PDF
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Open the Live Product Rate Portal and generate a formatted Ex-Plant Raipur PDF rate list directly from ERP pricing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/product-rates')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-bold cursor-pointer shrink-0"
                >
                  <TrendingUp className="w-4 h-4 text-blue-700" />
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
          title="Contact Us | Nav Durga Ispat Pvt. Ltd. — Urla, Raipur"
          description={`Contact Nav Durga Ispat Pvt. Ltd. sales desk & Urla Raipur rolling mill plant. Phone: ${cms.contactPhone}.`}
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
                <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Direct Mill Sales Desk
                </span>
                <h1 className="font-display text-3xl font-extrabold text-slate-900 mt-1">
                  Connect With Our Steel Sales Team
                </h1>
                <p className="text-sm text-slate-600 mt-2">
                  Submit your structural steel requirement or reach our Urla Raipur dispatch desk for instant vehicle loading &amp; rate confirmation.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Manufacturing Plant &amp; Regd. Office</div>
                    <div className="text-xs text-slate-600 mt-0.5">{cms.contactAddress}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Sales &amp; Dispatch Helpline</div>
                    <div className="text-xs text-slate-600 mt-0.5">{cms.contactPhone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Official Email</div>
                    <div className="text-xs text-slate-600 mt-0.5">{cms.contactEmail}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">GSTIN &amp; Dispatch Timings</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {cms.gstNumber} • {cms.dispatchHours}
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

            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-extrabold text-slate-900 mb-4">
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
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800">
                  {contactError}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={contactForm.companyName}
                      onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={contactForm.city}
                      onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Product Required</label>
                    <input
                      type="text"
                      value={contactForm.product}
                      onChange={(e) => setContactForm({ ...contactForm, product: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (MT)</label>
                    <input
                      type="number"
                      min="1"
                      value={contactForm.quantity}
                      onChange={(e) => setContactForm({ ...contactForm, quantity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requirement Details</label>
                  <textarea
                    rows={3}
                    value={contactForm.notes}
                    onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                    placeholder="Mention required sizes, grades (Medium / SL), length, and delivery location..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-bold shadow-xs cursor-pointer"
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
          description="Commercial terms, rate validity, GST & weighbridge dispatch terms, and buyer privacy policy of Nav Durga Ispat Pvt. Ltd."
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
                <p>1. All published daily rates are Ex-Plant Urla, Raipur (Chhattisgarh) and exclude 18% GST unless explicitly stated on a formal signed quotation.</p>
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
  // ROUTE: HOME (/) — Signature Light Industrial Engineering Homepage
  // ===========================================================================
  return (
    <>
      <SeoHead
        title="Nav Durga Ispat Pvt. Ltd. | Structural Steel & Live Product Rates — Raipur"
        description="Engineering Strength. Delivering Excellence. Your Trusted Partner for Quality Steel Products and Industrial Solutions. View live Medium & Light Section steel rates."
        canonicalPath="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Nav Durga Ispat Pvt. Ltd.',
          telephone: cms.contactPhone,
          email: cms.contactEmail,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Plot 42-48, Urla Industrial Area',
            addressLocality: 'Raipur',
            addressRegion: 'Chhattisgarh',
            postalCode: '493221',
            addressCountry: 'IN',
          },
        }}
      />

      {/* 1. CINEMATIC LIGHT-INDUSTRIAL HERO SECTION */}
      <section className="relative bg-gradient-to-br from-white via-[#FAF9F6] to-slate-100 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-red-700" />
                <span>{cms.heroBadge}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.06]">
                {cms.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {cms.heroSubheadline}
              </p>

              {/* Required Primary Hero CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/products')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-bold shadow-sm cursor-pointer transition-colors"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/product-rates')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-sm cursor-pointer transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>View Live Rates</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold cursor-pointer transition-colors"
                >
                  <Phone className="w-4 h-4 text-red-700" />
                  <span>Contact Sales Team</span>
                </button>
              </div>

              {/* Engineering Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80">
                <div>
                  <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums">
                    2 Units
                  </div>
                  <div className="text-xs font-medium text-slate-500">Medium &amp; Light Mills</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums">
                    {allProducts.length || 22}+ Sizes
                  </div>
                  <div className="text-xs font-medium text-slate-500">IS 2062 Rolling Profiles</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-blue-800 tabular-nums">
                    Live ERP
                  </div>
                  <div className="text-xs font-medium text-slate-500">Transparent Daily Rates</div>
                </div>
              </div>
            </div>

            {/* Hero Industrial Photography Frame */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl">
                <img
                  src={heroRollingMillImg}
                  alt="Nav Durga Ispat Automated Structural Steel Rolling Mill Urla Raipur"
                  className="w-full h-[320px] sm:h-[420px] lg:h-[460px] object-cover"
                />
                <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                      Urla Industrial Complex • Raipur
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {cms.unit1Name} &amp; {cms.unit2Name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('/product-rates')}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold cursor-pointer"
                  >
                    Today&apos;s Dispatch Rates →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE RATE PREVIEW STRIP (Synced Directly with ERP Daily Rate Management) */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50/50 rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  Live Daily Market Rate Snapshot
                </span>
              </div>
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                Direct Mill Ex-Plant Basic Rates (Urla, Raipur)
              </h2>
              <p className="text-xs text-slate-500">
                Single source of truth synchronized from Nav Durga ERP • GST 18% Extra
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:min-w-[440px]">
              <div className="bg-white rounded-xl border border-blue-200 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Medium Section
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Nav Durga Ispat</div>
                </div>
                <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {formatRateText(rates?.mediumSectionRate)}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-red-200 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                    Light Section
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Unit-2 NS Ispat</div>
                </div>
                <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {formatRateText(rates?.lightSectionRate)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/product-rates')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0"
            >
              <span>Full Size-Wise Rate Sheet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. CORE STEEL DIVISIONS: MEDIUM SECTION & LIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              Dual Rolling Line Infrastructure
            </span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 mt-1">
              Medium &amp; Light Structural Steel Sections
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/products')}
            className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Browse All {allProducts.length} Active Sizes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {/* Medium Section Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-60 overflow-hidden relative">
                <img
                  src={steelMediumImg}
                  alt="Medium Section Structural Steel Channels and I Beams"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-lg border border-blue-200 text-xs font-extrabold text-blue-800">
                  {cms.unit1Name}
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-display text-2xl font-extrabold text-slate-900">
                  Medium Section Steel
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Heavy &amp; medium rolling profiles including ISMC Channels (100×50mm to 250×82mm), structural I-Beams / Joists, and medium structural angles engineered for industrial sheds, bridges, and PEB columns.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['MS Channel ISMC', 'MS Joist / I-Beam', 'Medium Angles', 'IS 2062 E250'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/products/medium-section')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                <span>Explore Medium Section</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onOpenQuoteModal('Medium Section Steel', 'IS 2062 Medium')}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
              >
                Enquire Medium
              </button>
            </div>
          </div>

          {/* Light Section Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-60 overflow-hidden relative">
                <img
                  src={steelLightImg}
                  alt="Light Section Structural Steel Angles Channels and Flats"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-lg border border-red-200 text-xs font-extrabold text-red-700">
                  {cms.unit2Name}
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-display text-2xl font-extrabold text-slate-900">
                  Light Section Steel
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Precision merchant &amp; light structural steel including MS Channel 70×35mm &amp; 75×40mm (SL/Medium), Equal Angles, MS Flats, and Square Bars built for fabrication, roofing trusses, and transmission towers.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['70×35 / 75×40 Channel', 'Equal Angles (ISA)', 'MS Flats & Squares', 'SL / Light Gauge'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/products/light-section')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:underline cursor-pointer"
              >
                <span>Explore Light Section</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onOpenQuoteModal('Light Section Steel', 'SL / Light Gauge')}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer"
              >
                Enquire Light
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE 3D STEEL PROFILE & ROLLING MILL SHOWCASE */}
      <section className="bg-slate-100/80 border-y border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                <Cpu className="w-3.5 h-3.5" />
                <span>Interactive Engineering Visualization</span>
              </span>
              <h2 className="font-display text-3xl font-extrabold text-slate-900 mt-1">
                Inspect Our Rolled Steel Profiles &amp; Mill Stand in 3D
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Drag to orbit, switch between MS Channel bundles, Heavy I-Beams, Equal Angles, or our automated rolling pass stand, and toggle exploded assembly view.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/product-rates')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold cursor-pointer shrink-0"
            >
              Check Matching Rates →
            </button>
          </div>

          <ThreeSteelShowcase
            initialMode="channel"
            onRequestQuote={(label) => onOpenQuoteModal(label, 'IS 2062')}
          />
        </div>
      </section>

      {/* 5. MANUFACTURING EXCELLENCE & QUALITY ASSURANCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <img
              src={qualityLabImg}
              alt="Metallurgical Quality Testing Lab"
              className="rounded-2xl border border-slate-200 h-56 w-full object-cover shadow-xs"
            />
            <img
              src={urlaCampusImg}
              alt="Urla Steel Plant and Dispatch Yard"
              className="rounded-2xl border border-slate-200 h-56 w-full object-cover shadow-xs mt-6"
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              Engineering &amp; Quality Assurance
            </span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900">
              Built for Dimensional Consistency &amp; Rapid Mill Dispatch
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{cms.qualityCommitment}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-xs">Spectrometer &amp; UTM</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Batch chemical &amp; tensile test certs</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                <Truck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-xs">Same-Day Loading</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Direct trailer dispatch from Urla, Raipur</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/quality')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold cursor-pointer"
              >
                Explore Quality Standards
              </button>
              <button
                type="button"
                onClick={() => onOpenQuoteModal('Custom Steel Dispatch', 'IS 2062')}
                className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer"
              >
                Request Plant Quotation
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
