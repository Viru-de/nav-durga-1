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
    { path: '/about', label: 'About' },
    { path: '/products', label: 'Products', hasSub: true },
    { path: '/industries', label: 'Industries' },
    { path: '/quality', label: 'Quality' },
    { path: '/contact', label: 'Contact' },
    { path: '/product-rates', label: 'Live Product Rates', highlight: true },
  ];

  const handleNavClick = (path: string) => {
    setMobileOpen(false);
    setProductsMenuOpen(false);
    onNavigate(path);
  };

  const whatsappDigits = (cms.contactWhatsapp || '919752183053').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappDigits.startsWith('91') ? whatsappDigits : `91${whatsappDigits}`}?text=${encodeURIComponent(
    'Hello Nav Durga Ispat Sales Team, I would like to enquire about structural steel products & today rates.'
  )}`;

  const companyCin = cms.cinNumber || 'U24132CT1988PTC004838';
  const companyEst = cms.establishedYear || '1988';

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex flex-col overflow-x-hidden">
      {/* Top Info & Dispatch Strip (Deep Navy with Amber Icons) */}
      {cms.showAnnouncementBanner && cms.announcementBanner && (
        <div className="bg-[var(--color-navy)] border-b border-[var(--color-amber)]/30 text-[var(--color-linen)] text-xs no-print">
          <div className="nd-container py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-[var(--color-linen)] min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] shrink-0 hidden sm:inline-block" aria-hidden="true" />
              <span className="truncate sm:whitespace-normal">{cms.announcementBanner}</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[11px] font-semibold text-[var(--color-linen)]/90 shrink-0">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Phone className="w-3 h-3 text-[var(--color-amber)]" />
                {cms.contactPhone}
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Clock className="w-3 h-3 text-[var(--color-amber)]" />
                {cms.dispatchHours}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Linen Navbar with Deep Navy Text & Amber Active/Hover Underlines */}
      <header className="sticky top-0 z-40 bg-[var(--color-linen)]/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-2xs no-print">
        <div className="nd-container">
          <div className="min-h-[68px] py-2 flex items-center justify-between gap-2 sm:gap-4">
            {/* Brand Anchor */}
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer min-w-0 shrink"
            >
              <NavDurgaLogo size="md" withCard className="group-hover:scale-[1.02] transition-transform shrink-0" priority />
              <div className="flex flex-col min-w-0">
                <span className="font-display font-extrabold text-[var(--color-navy)] text-xs min-[360px]:text-sm sm:text-base tracking-tight leading-tight whitespace-nowrap truncate">
                  NAV DURGA ISPAT
                </span>
                <span className="text-[9.5px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] whitespace-nowrap truncate">
                  Pvt. Ltd. • Est. {companyEst}
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1.5">
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
                        className={`relative inline-flex items-center gap-1 px-3 py-2 text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                          isActive
                            ? 'text-[var(--color-navy)] border-[var(--color-amber)]'
                            : 'text-[var(--color-navy)]/85 border-transparent hover:text-[var(--color-navy)] hover:border-[var(--color-amber)]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {productsMenuOpen && (
                        <div className="absolute left-0 top-full pt-2 w-64 z-50">
                          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg p-1.5 space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleNavClick('/products')}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[var(--color-navy)] hover:bg-[var(--color-linen)] cursor-pointer flex items-center justify-between transition-colors"
                            >
                              <span>All Structural Products</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNavClick('/products/medium-section')}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-linen)] cursor-pointer transition-colors"
                            >
                              <div className="text-xs font-bold text-[var(--color-navy)]">Medium Section Steel</div>
                              <div className="text-[10px] text-[var(--color-text-secondary)]">Nav Durga Ispat Pvt. Ltd.</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNavClick('/products/light-section')}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-linen)] cursor-pointer transition-colors"
                            >
                              <div className="text-xs font-bold text-[var(--color-navy)]">Light Section Steel</div>
                              <div className="text-[10px] text-[var(--color-text-secondary)]">Unit-2 NS Ispat (I) Pvt. Ltd.</div>
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
                    className={
                      item.highlight
                        ? `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                            isActive
                              ? 'bg-[var(--color-amber)] text-[var(--color-navy)] border-[var(--color-amber)] shadow-xs'
                              : 'bg-[var(--color-surface)] text-[var(--color-navy)] border-[var(--color-border)] hover:border-[var(--color-amber)] hover:bg-[var(--color-amber)]/15'
                          }`
                        : `inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                            isActive
                              ? 'text-[var(--color-navy)] border-[var(--color-amber)]'
                              : 'text-[var(--color-navy)]/85 border-transparent hover:text-[var(--color-navy)] hover:border-[var(--color-amber)]'
                          }`
                    }
                  >
                    {item.highlight && (
                      <TrendingUp
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[var(--color-navy)]' : 'text-[var(--color-navy)]'
                        }`}
                      />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Actions + ERP LOGIN */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {authUser ? (
                <button
                  type="button"
                  onClick={() => handleNavClick('/erp')}
                  className="nd-btn-primary inline-flex items-center gap-1.5 px-2.5 sm:px-4 min-h-[40px] py-2 rounded-xl text-[11px] sm:text-xs font-bold shadow-xs whitespace-nowrap cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden min-[380px]:inline">Open ERP ({authUser.name.split(' ')[0]})</span>
                  <span className="min-[380px]:hidden">ERP</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNavClick('/login')}
                  className="nd-btn-primary inline-flex items-center gap-1.5 px-2.5 sm:px-4 min-h-[40px] py-2 rounded-xl text-[11px] sm:text-xs font-bold shadow-xs whitespace-nowrap cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden min-[360px]:inline">ERP Login</span>
                  <span className="min-[360px]:hidden">Login</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="xl:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[var(--color-navy)] bg-[var(--color-surface)] hover:border-[var(--color-navy)] border border-[var(--color-border)] cursor-pointer transition-colors"
                aria-label="Toggle Menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileOpen && (
          <div className="xl:hidden bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-4 space-y-2.5 shadow-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`px-3 min-h-[44px] py-2.5 rounded-xl text-xs font-bold text-left border cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[var(--color-navy)] text-[var(--color-linen)] border-[var(--color-amber)]'
                        : 'bg-[var(--color-linen)] text-[var(--color-navy)] border-[var(--color-border)] hover:border-[var(--color-navy)]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleNavClick('/products/medium-section')}
                className={`px-3 min-h-[44px] py-2.5 rounded-xl text-xs font-bold text-left border cursor-pointer transition-colors ${
                  currentPath === '/products/medium-section'
                    ? 'bg-[var(--color-navy)] text-[var(--color-linen)] border-[var(--color-amber)]'
                    : 'bg-[var(--color-linen)] text-[var(--color-navy)] border-[var(--color-border)] hover:border-[var(--color-navy)]'
                }`}
              >
                Medium Section
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/products/light-section')}
                className={`px-3 min-h-[44px] py-2.5 rounded-xl text-xs font-bold text-left border cursor-pointer transition-colors ${
                  currentPath === '/products/light-section'
                    ? 'bg-[var(--color-navy)] text-[var(--color-linen)] border-[var(--color-amber)]'
                    : 'bg-[var(--color-linen)] text-[var(--color-navy)] border-[var(--color-border)] hover:border-[var(--color-navy)]'
                }`}
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
                className="nd-btn-secondary flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Request Quotation
              </button>
              <button
                type="button"
                onClick={() => handleNavClick(authUser ? '/erp' : '/login')}
                className="nd-btn-primary flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                {authUser ? 'Open ERP Workspace' : 'ERP LOGIN'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Deep Navy Corporate Footer with Linen Text & Amber Highlights */}
      <footer className="bg-[var(--color-navy)] text-[var(--color-linen)] no-print">
        <div className="h-1 w-full bg-[var(--color-amber)]" />
        <div className="nd-container py-12 lg:py-14 2xl:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
            {/* Brand & Group Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <NavDurgaLogo size="md" withCard />
                <div>
                  <div className="font-display font-extrabold text-white text-base">
                    NAV DURGA ISPAT PVT. LTD.
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--color-amber)]">
                    Steel Manufacturing &amp; Steel Products • Est. {companyEst}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--color-linen)]/80 leading-relaxed">
                Nav Durga Ispat Pvt. Ltd. is an established steel industry company based in the Urla Industrial Area, Raipur, Chhattisgarh, serving industrial, structural, and infrastructure requirements.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nd-btn-amber inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Sales</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleNavClick('/product-rates')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-transparent hover:bg-[var(--color-linen)]/10 border border-[var(--color-linen)]/30 hover:border-[var(--color-amber)] text-[var(--color-linen)] hover:text-[var(--color-amber)] text-xs font-bold cursor-pointer transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--color-amber)]" />
                  <span>Live Rates</span>
                </button>
              </div>
            </div>

            {/* Product Portfolio */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-amber)] mb-3">
                Steel Product Sections
              </h4>
              <ul className="space-y-2 text-xs font-medium text-[var(--color-linen)]/85">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/products/medium-section')}
                    className="hover:text-[var(--color-amber)] cursor-pointer text-left transition-colors"
                  >
                    Medium Section Products
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/products/light-section')}
                    className="hover:text-[var(--color-amber)] cursor-pointer text-left transition-colors"
                  >
                    Light Section Products
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/products')}
                    className="hover:text-[var(--color-amber)] cursor-pointer text-left transition-colors"
                  >
                    All Available ERP Products
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/product-rates')}
                    className="hover:text-[var(--color-linen)] font-bold text-[var(--color-amber)] cursor-pointer text-left transition-colors"
                  >
                    Today&apos;s Live Product Rates →
                  </button>
                </li>
              </ul>
            </div>

            {/* Company & Engineering */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-amber)] mb-3">
                Company &amp; Standards
              </h4>
              <ul className="space-y-2 text-xs font-medium text-[var(--color-linen)]/85">
                <li>
                  <button type="button" onClick={() => handleNavClick('/about')} className="hover:text-[var(--color-amber)] cursor-pointer transition-colors">
                    About Nav Durga Ispat
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('/industries')} className="hover:text-[var(--color-amber)] cursor-pointer transition-colors">
                    Industries &amp; Applications
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('/quality')} className="hover:text-[var(--color-amber)] cursor-pointer transition-colors">
                    Quality &amp; Reliability
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('/resources')} className="hover:text-[var(--color-amber)] cursor-pointer transition-colors">
                    Specification Sheets &amp; Rate Portal
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('/contact')} className="hover:text-[var(--color-amber)] cursor-pointer transition-colors">
                    Contact &amp; Raipur Address
                  </button>
                </li>
              </ul>
            </div>

            {/* Registered Plant Address */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-amber)] mb-3">
                Registered Location &amp; Desk
              </h4>
              <div className="space-y-2.5 text-xs text-[var(--color-linen)]/85">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-amber)] shrink-0 mt-0.5" />
                  <span className="text-[var(--color-linen)]">{cms.contactAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--color-amber)] shrink-0" />
                  <span className="font-semibold text-[var(--color-linen)]">{cms.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--color-amber)] shrink-0" />
                  <span>{cms.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Building2 className="w-4 h-4 text-[var(--color-amber)] shrink-0" />
                  <span className="font-mono text-[11px] font-semibold text-[var(--color-linen)]">
                    CIN: {companyCin}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[var(--color-linen)]/15 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-3.5 gap-y-2 text-xs text-[var(--color-linen)]/75 text-center">
            <span>
              © {new Date().getFullYear()} Nav Durga Ispat Pvt. Ltd. • CIN: {companyCin} • Raipur, Chhattisgarh.
            </span>
            <span aria-hidden="true" className="hidden lg:inline text-[var(--color-linen)]/30">|</span>
            <button type="button" onClick={() => handleNavClick('/privacy')} className="hover:text-[var(--color-amber)] cursor-pointer transition-colors">
              Privacy Policy
            </button>
            <span aria-hidden="true" className="text-[var(--color-linen)]/30">|</span>
            <button type="button" onClick={() => handleNavClick('/terms')} className="hover:text-[var(--color-amber)] cursor-pointer transition-colors">
              Terms &amp; Dispatch Conditions
            </button>
            <span aria-hidden="true" className="text-[var(--color-linen)]/30">|</span>
            <button
              type="button"
              onClick={() => handleNavClick(authUser ? '/erp' : '/login')}
              className="text-[var(--color-amber)] font-bold hover:text-[var(--color-linen)] hover:underline cursor-pointer transition-colors"
            >
              {authUser ? 'ERP Dashboard' : 'ERP Login'}
            </button>
            <span aria-hidden="true" className="text-[var(--color-linen)]/30">|</span>
            <span>
              Developed by{' '}
              <a
                href="https://klyiatechnology.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[var(--color-amber)] hover:text-[var(--color-linen)] hover:underline underline-offset-2 transition-colors"
              >
                Klyia Technology
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
