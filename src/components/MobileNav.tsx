import React from 'react';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  MessageSquare,
  Users,
  HelpCircle,
  FileText,
  ShoppingCart,
  CalendarCheck,
  BarChart3,
  Settings,
  X,
  Calendar,
  Layers,
  Sparkles,
  Globe,
  Shield,
} from 'lucide-react';
import { ActiveTab, AppUser, CompanySettings, UserPermissions } from '../types';
import { NavDurgaLogo } from './NavDurgaLogo';

interface MobileNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingEnquiriesCount: number;
  company: CompanySettings;
  authUser?: AppUser | null;
  onOpenWhatsAppSystem?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  pendingEnquiriesCount,
  company,
  authUser,
  onOpenWhatsAppSystem,
}) => {
  const allTabs: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    requiredPerm?: keyof UserPermissions;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'Nav Durga AI Assistant', icon: Sparkles },
    { id: 'products', label: 'Products & Grades', icon: Package, requiredPerm: 'manageProducts' },
    { id: 'daily-rates', label: 'Daily Rate Management', icon: Calendar, requiredPerm: 'manageDailyRates' },
    { id: 'gauge-master', label: 'Gauge Difference Master', icon: Layers, requiredPerm: 'manageProducts' },
    { id: 'daily-updates', label: 'Daily Price Updates', icon: TrendingUp, requiredPerm: 'manageDailyRates' },
    { id: 'ai-post-generator', label: 'AI Post Generator', icon: Sparkles, requiredPerm: 'manageWhatsApp' },
    { id: 'whatsapp-center', label: 'WhatsApp Center', icon: MessageSquare, requiredPerm: 'manageWhatsApp' },
    { id: 'website-cms', label: 'Website CMS', icon: Globe, requiredPerm: 'manageWebsiteCms' },
    { id: 'customers', label: 'Customers', icon: Users, requiredPerm: 'manageEnquiries' },
    { id: 'enquiries', label: 'Enquiries', icon: HelpCircle, badge: pendingEnquiriesCount, requiredPerm: 'manageEnquiries' },
    { id: 'quotations', label: 'Quotations', icon: FileText, requiredPerm: 'manageQuotationsOrders' },
    { id: 'orders', label: 'Sales Orders', icon: ShoppingCart, requiredPerm: 'manageQuotationsOrders' },
    { id: 'follow-ups', label: 'Follow-ups', icon: CalendarCheck, requiredPerm: 'manageEnquiries' },
    { id: 'team-management', label: 'Team & Role Management', icon: Shield, requiredPerm: 'manageTeamUsers' },
    { id: 'reports', label: 'Reports', icon: BarChart3, requiredPerm: 'viewReports' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const isAllowed = (requiredPerm?: keyof UserPermissions) => {
    if (!authUser || !requiredPerm) return true;
    if (authUser.rbacRole === 'SUPER_ADMIN') return true;
    return Boolean(authUser.permissions?.[requiredPerm]);
  };

  const visibleTabs = allTabs.filter((t) => isAllowed(t.requiredPerm));

  const rawBottomItems: { id: ActiveTab; label: string; icon: React.ElementType; requiredPerm?: keyof UserPermissions }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'daily-rates', label: 'Rates', icon: Calendar, requiredPerm: 'manageDailyRates' },
    { id: 'products', label: 'Products', icon: Package, requiredPerm: 'manageProducts' },
    { id: 'whatsapp-center', label: 'WhatsApp', icon: MessageSquare, requiredPerm: 'manageWhatsApp' },
    { id: 'enquiries', label: 'Enquiries', icon: HelpCircle, requiredPerm: 'manageEnquiries' },
  ];
  const bottomItems = rawBottomItems.filter((t) => isAllowed(t.requiredPerm));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-200 ease-in-out md:hidden flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <NavDurgaLogo size="sm" withCard className="shrink-0" />
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 text-sm truncate">{company.companyName}</h2>
              <p className="text-[10px] text-slate-500 truncate">Nav Durga Business ERP</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {onOpenWhatsAppSystem && isAllowed('manageWhatsApp') && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWhatsAppSystem();
              }}
              className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>OPEN WHATSAPP SYSTEM</span>
            </button>
          )}

          {visibleTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div>Powered by <span className="font-semibold text-blue-600">{company.poweredBy}</span></div>
          <div className="text-[11px] text-slate-400 mt-0.5">Urla, Raipur (Chhattisgarh)</div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden flex items-center justify-around px-1 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] shadow-lg no-print">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-0.5 px-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400'}`} />
              <span className="mt-0.5 truncate w-full text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
