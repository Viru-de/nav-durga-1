import React, { useMemo } from 'react';
import {
  Menu,
  X,
  Bell,
  Sparkles,
  Calendar,
  MessageSquare,
  Globe,
  LogOut,
} from 'lucide-react';
import { ActiveTab, AppUser, CompanySettings } from '../types';
import { NavDurgaLogo } from './NavDurgaLogo';

interface HeaderProps {
  company: CompanySettings;
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  pendingEnquiriesCount: number;
  authUser?: AppUser | null;
  onOpenWhatsAppSystem?: () => void;
  onViewWebsite?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  currentTab,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
  pendingEnquiriesCount,
  authUser,
  onOpenWhatsAppSystem,
  onViewWebsite,
  onSignOut,
}) => {
  const formattedCurrentDate = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
    ];
    return `${day} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  const canOpenWhatsApp =
    !authUser ||
    authUser.rbacRole === 'SUPER_ADMIN' ||
    authUser.permissions?.manageWhatsApp !== false;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="w-full max-w-7xl lg:max-w-none mx-auto px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-10">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand Left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
            >
              <NavDurgaLogo
                size="md"
                withCard
                className="shrink-0 group-hover:scale-105 transition-transform"
                priority
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="font-bold text-slate-900 text-sm sm:text-base md:text-lg tracking-tight leading-tight truncate">
                    {company.companyName}
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                    ERP
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  <span>Powered by</span>
                  <span className="text-blue-600 font-semibold truncate">
                    {company.poweredBy}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Info Ticker */}
          <div className="hidden xl:flex items-center text-xs">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800 whitespace-nowrap">{formattedCurrentDate}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                Raipur Market Active
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onViewWebsite && (
              <button
                type="button"
                onClick={onViewWebsite}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer whitespace-nowrap"
                title="View Public Website"
              >
                <Globe className="w-3.5 h-3.5 text-blue-700" />
                <span>Website</span>
              </button>
            )}

            {canOpenWhatsApp && onOpenWhatsAppSystem && (
              <button
                type="button"
                onClick={onOpenWhatsAppSystem}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer whitespace-nowrap transition-colors"
                title="Open Dedicated WhatsApp System"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">OPEN WHATSAPP SYSTEM</span>
                <span className="lg:hidden">WhatsApp</span>
              </button>
            )}

            {/* Quick AI Assistant button (Light theme) */}
            <button
              type="button"
              onClick={() => onNavigate('ai-assistant')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer whitespace-nowrap ${
                currentTab === 'ai-assistant'
                  ? 'bg-blue-700 text-white ring-2 ring-blue-300'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
              }`}
              title="Open Nav Durga AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">AI ERP</span>
            </button>

            {/* Notification Badge */}
            <button
              type="button"
              onClick={() => onNavigate('enquiries')}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="View Enquiries"
            >
              <Bell className="w-5 h-5" />
              {pendingEnquiriesCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingEnquiriesCount}
                </span>
              )}
            </button>

            {/* Authenticated RBAC Profile */}
            {authUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-800 border border-red-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {authUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {authUser.name}
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold">
                    {authUser.rbacRole || authUser.role}
                  </span>
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
