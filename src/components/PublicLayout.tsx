import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronDown,
  Lock,
  TrendingUp,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2,
  MessageSquare,
} from 'lucide-react';
import { AppUser, WebsiteCmsContent } from '../types';
import { NavDurgaLogo } from './NavDurgaLogo';

interface PublicLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  cms: WebsiteCmsContent;
  authUser: AppUser | null;
  onOpenQuoteModal: (presetProduct?: string, presetGrade?: string) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentPath,
  onNavigate,
  cms,
  authUser,
  onOpenQuoteModal,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/products', label: 'Products', hasSub: true },
    { path: '/product-rates', label: 'Live Rates', highlight: true },
    { path: '/industries', label: 'Industries' },
    { path: '/quality', label: 'Quality' },
    { path: '/resources', label: 'Resources' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleNavClick = (path: string) => {
    setMobileOpen(false);
    setProductsMenuOpen(false);
    onNavigate(path);
  };

  const whatsappDigits = (cms.contactWhatsapp || '919827100000').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappDigits.startsWith('91') ? whatsappDigits : `91${whatsappDigits}`}?text=${encodeURIComponent(
    'Hello Nav Durga Ispat Sales Team, I would like to enquire about structural steel products & today rates.'
  )}`;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col">
      {/* Top Announcement & Dispatch Strip (Light Industrial Red/Ivory) */}
      {cms.showAnnouncementBanner && cms.announcementBanner && (
        <div className="bg-red-50 border-b border-red-200/80 text-slate-800 text-xs no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium text-red-900">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0" />
              <span>{cms.announcementBanner}</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-red-700" />
                {cms.contactPhone}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-700" />
                {cms.dispatchHours}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Light Industrial Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-18 py-2.5 flex items-center justify-between gap-3">
            {/* Brand Anchor */}
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-3 text-left group cursor-pointer shrink-0"
            >
              <NavDurgaLogo size="md" withCard className="group-hover:scale-[1.02] transition-transform" priority />
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-tight">
                  NAV DURGA ISPAT
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-700">
                  Pvt. Ltd. • Industrial Steel
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.path === '/'
                    ? currentPath === '/'
                    : currentPath === item.path || currentPath.startsWith(`${item.path}/`);

                if (item.hasSub) {
                  return (
                    <div
                      key={item.path}
                      className="relative"
                      onMouseEnter={() => setProductsMenuOpen(true)}
                      onMouseLeave={() => setProductsMenuOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.path)}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          isActive
                            ? 'text-red-700 bg-red-50'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {productsMenuOpen && (
                        <div className="absolute left-0 top-full pt-1.5 w-64 z-50">
                          <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleNavClick('/products')}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                            >
                              <span>All Structural Products</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNavClick('/products/medium-section')}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer"
                            >
                              <div className="text-xs font-bold text-blue-800">Medium Section Steel</div>
                              <div className="text-[10px] text-slate-500">Nav Durga Ispat Pvt. Ltd.</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNavClick('/products/light-section')}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer"
                            >
                              <div className="text-xs font-bold text-red-700">Light Section Steel</div>
                              <div className="text-[10px] text-slate-500">Unit-2 NS Ispat (I) Pvt. Ltd.</div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      item.highlight
                        ? isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/80'
                        : isActive
                        ? 'text-red-700 bg-red-50'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.highlight && <TrendingUp className="w-3.5 h-3.5 shrink-0" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Actions + ERP LOGIN */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenQuoteModal()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 whitespace-nowrap transition-colors cursor-pointer"
              >
                <span>Request Quote</span>
              </button>

              {authUser ? (
                <button
                  type="button"
                  onClick={() => handleNavClick('/erp')}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs whitespace-nowrap transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Open ERP ({authUser.name.split(' ')[0]})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNavClick('/login')}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-red-700 hover:bg-red-800 text-white shadow-xs whitespace-nowrap transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>ERP LOGIN</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="xl:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileOpen && (
          <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left border cursor-pointer ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleNavClick('/products/medium-section')}
                className="px-3 py-2.5 rounded-xl text-xs font-bold text-left border bg-blue-50/70 text-blue-800 border-blue-200 cursor-pointer"
              >
                Medium Section
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/products/light-section')}
                className="px-3 py-2.5 rounded-xl text-xs font-bold text-left border bg-red-50/60 text-red-800 border-red-200 cursor-pointer"
              >
                Light Section
              </button>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenQuoteModal();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-800 cursor-pointer"
              >
                Request Quotation
              </button>
              <button
                type="button"
                onClick={() => handleNavClick(authUser ? '/erp' : '/login')}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-700 text-white cursor-pointer"
              >
                {authUser ? 'Open ERP Workspace' : 'ERP LOGIN'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Clean Light-Industrial Footer (Strictly NO Dark Theme) */}
      <footer className="bg-slate-100 border-t border-slate-200 text-slate-700 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand & Group Units */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <NavDurgaLogo size="md" withCard />
                <div>
                  <div className="font-display font-extrabold text-slate-900 text-base">
                    NAV DURGA ISPAT PVT. LTD.
                  </div>
                  <div className="text-[11px] font-semibold text-red-700">
                    Unit-2: NS Ispat (I) Pvt. Ltd.
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integrated structural steel rolling and fabrication-grade steel supplier based in Urla Industrial Area, Raipur — serving infrastructure, EPC, industrial sheds, and wholesale steel dealers across India.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Sales</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleNavClick('/product-rates')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                  <span>Live Rates</span>
                </button>
              </div>
            </div>

            {/* Product Portfolio */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3">
                Steel Product Sections
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/products/medium-section')}
                    className="hover:text-red-700 cursor-pointer text-left"
                  >
                    Medium Section (Nav Durga Ispat)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/products/light-section')}
                    className="hover:text-red-700 cursor-pointer text-left"
                  >
                    Light Section (Unit-2 NS Ispat)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/products')}
                    className="hover:text-red-700 cursor-pointer text-left"
                  >
                    MS Channels, Beams &amp; Angles
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/product-rates')}
                    className="hover:text-blue-700 font-bold text-blue-800 cursor-pointer text-left"
                  >
                    Today&apos;s Live Ex-Plant Rate Portal →
                  </button>
                </li>
              </ul>
            </div>

            {/* Company & Engineering */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3">
                Engineering &amp; Company
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li>
                  <button type="button" onClick={() => handleNavClick('/about')} className="hover:text-red-700 cursor-pointer">
                    About Nav Durga Group
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('/industries')} className="hover:text-red-700 cursor-pointer">
                    Industries &amp; Applications
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('/quality')} className="hover:text-red-700 cursor-pointer">
                    Quality Assurance &amp; BIS Standards
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('/resources')} className="hover:text-red-700 cursor-pointer">
                    Brochures, Catalogue &amp; Downloads
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('/contact')} className="hover:text-red-700 cursor-pointer">
                    Contact &amp; Plant Location
                  </button>
                </li>
              </ul>
            </div>

            {/* Registered Plant Address */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3">
                Plant &amp; Sales Desk
              </h4>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <span>{cms.contactAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="font-semibold text-slate-800">{cms.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{cms.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-mono text-[11px] font-semibold text-slate-700">
                    GSTIN: {cms.gstNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} Nav Durga Ispat Pvt. Ltd. &amp; Unit-2 NS Ispat (I) Pvt. Ltd. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-4 font-medium">
              <button type="button" onClick={() => handleNavClick('/privacy')} className="hover:text-slate-900 cursor-pointer">
                Privacy Policy
              </button>
              <button type="button" onClick={() => handleNavClick('/terms')} className="hover:text-slate-900 cursor-pointer">
                Terms &amp; Dispatch Conditions
              </button>
              <button
                type="button"
                onClick={() => handleNavClick(authUser ? '/erp' : '/login')}
                className="text-red-700 font-bold hover:underline cursor-pointer"
              >
                {authUser ? 'ERP Dashboard' : 'ERP Staff Login'}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
