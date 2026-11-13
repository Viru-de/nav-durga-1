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
  ChevronRight,
  Sparkles,
  Layers,
  Calendar,
  Globe,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab, AppUser, UserPermissions } from '../types';
import { NavDurgaLogo } from './NavDurgaLogo';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingEnquiriesCount: number;
  pendingFollowUpsCount: number;
  todayOrdersCount: number;
  pendingWhatsAppCount?: number;
  authUser?: AppUser | null;
  onOpenWhatsAppSystem?: () => void;
  onOpenPublicSite?: (path: string) => void;
}

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeText?: string;
  badgeColor?: string;
  category?: string;
  requiredPerm?: keyof UserPermissions;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingEnquiriesCount,
  pendingFollowUpsCount,
  todayOrdersCount,
  pendingWhatsAppCount = 0,
  authUser,
  onOpenWhatsAppSystem,
  onOpenPublicSite,
}) => {
  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      category: 'MAIN',
    },
    {
      id: 'ai-assistant',
      label: 'Nav Durga AI Assistant',
      icon: Sparkles,
      badgeText: 'AI',
      badgeColor: 'bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded',
      category: 'MAIN',
    },
    {
      id: 'products',
      label: 'Products & Grades',
      icon: Package,
      category: 'PRODUCTS & PRICING',
      requiredPerm: 'manageProducts',
    },
    {
      id: 'daily-rates',
      label: 'Daily Rate Management',
      icon: Calendar,
      category: 'PRODUCTS & PRICING',
      requiredPerm: 'manageDailyRates',
    },
    {
      id: 'gauge-master',
      label: 'Gauge Difference Master',
      icon: Layers,
      category: 'PRODUCTS & PRICING',
      requiredPerm: 'manageProducts',
    },
    {
      id: 'daily-updates',
      label: 'Daily Price Updates',
      icon: TrendingUp,
      category: 'PRODUCTS & PRICING',
      requiredPerm: 'manageDailyRates',
    },
    {
      id: 'ai-post-generator',
      label: 'AI Post Generator',
      icon: Sparkles,
      badgeText: 'Posters',
      badgeColor: 'bg-blue-100 text-blue-900 font-semibold text-[9px] px-1.5 py-0.2 border border-blue-300 rounded',
      category: 'MARKETING & COMM',
      requiredPerm: 'manageWhatsApp',
    },
    {
      id: 'whatsapp-center',
      label: 'WhatsApp Inbox & Rates',
      icon: MessageSquare,
      badge: pendingWhatsAppCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
      category: 'MARKETING & COMM',
      requiredPerm: 'manageWhatsApp',
    },
    {
      id: 'website-cms',
      label: 'Website CMS',
      icon: Globe,
      category: 'PUBLIC PORTAL',
      requiredPerm: 'manageWebsiteCms',
    },
    {
      id: 'customers',
      label: 'Customers Directory',
      icon: Users,
      category: 'COMMERCIAL',
      requiredPerm: 'manageEnquiries',
    },
    {
      id: 'enquiries',
      label: 'Sales Enquiries',
      icon: HelpCircle,
      badge: pendingEnquiriesCount,
      badgeColor: 'bg-orange-100 text-orange-800 font-bold',
      category: 'COMMERCIAL',
      requiredPerm: 'manageEnquiries',
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: FileText,
      category: 'COMMERCIAL',
      requiredPerm: 'manageQuotationsOrders',
    },
    {
      id: 'orders',
      label: 'Sales Orders',
      icon: ShoppingCart,
      badge: todayOrdersCount,
      badgeColor: 'bg-blue-100 text-blue-800 font-bold',
      category: 'COMMERCIAL',
      requiredPerm: 'manageQuotationsOrders',
    },
    {
      id: 'follow-ups',
      label: 'Follow-ups',
      icon: CalendarCheck,
      badge: pendingFollowUpsCount,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
      category: 'COMMERCIAL',
      requiredPerm: 'manageEnquiries',
    },
    {
      id: 'team-management',
      label: 'Team & Role Management',
      icon: Shield,
      category: 'ADMIN & SYSTEM',
      requiredPerm: 'manageTeamUsers',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      category: 'ADMIN & SYSTEM',
      requiredPerm: 'viewReports',
    },
    {
      id: 'settings',
      label: 'ERP Settings',
      icon: Settings,
      category: 'ADMIN & SYSTEM',
    },
  ];

  const isAllowed = (item: NavItemConfig) => {
    if (!authUser || !item.requiredPerm) return true;
    if (authUser.rbacRole === 'SUPER_ADMIN') return true;
    return Boolean(authUser.permissions?.[item.requiredPerm]);
  };

  const visibleItems = navItems.filter(isAllowed);
  const canWhatsApp =
    !authUser ||
    authUser.rbacRole === 'SUPER_ADMIN' ||
    authUser.permissions?.manageWhatsApp !== false;

  let currentCategory = '';

  return (
    <aside className="w-56 lg:w-64 bg-white border border-slate-200 rounded-xl shrink-0 hidden md:flex flex-col justify-between py-2 px-2 lg:px-2.5 shadow-2xs select-none sticky top-20 h-[calc(100vh-5.5rem)] overflow-hidden">
      {/* Brand + Dedicated WhatsApp Action */}
      <div className="pb-2 mb-1 border-b border-slate-100 space-y-2 shrink-0">
        <div className="flex items-center justify-center">
          <NavDurgaLogo size="md" withCard className="w-full flex justify-center py-0.5" />
        </div>
        {canWhatsApp && onOpenWhatsAppSystem && (
          <button
            type="button"
            onClick={onOpenWhatsAppSystem}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold tracking-wide shadow-2xs cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span>OPEN WHATSAPP SYSTEM</span>
          </button>
        )}
      </div>

      <div className="space-y-0.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
        {visibleItems.map((item) => {
          const isCategoryChange = item.category && item.category !== currentCategory;
          if (isCategoryChange) {
            currentCategory = item.category || '';
          }

          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              {isCategoryChange && (
                <div className="pt-2 pb-0.5 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] lg:text-[14px] leading-snug font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-blue-900 font-semibold border-l-[3px] border-blue-700 pl-[9px]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    <Icon
                      className={`w-[18px] h-[18px] ${
                        isActive ? 'text-blue-700' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {(item.badgeText || (item.badge !== undefined && item.badge > 0)) && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded ${
                        item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badgeText || item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-700 shrink-0" />}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom Portal Shortcuts & Plant Info */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-200 px-1 text-xs shrink-0 space-y-1.5">
        {onOpenPublicSite && (
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => onOpenPublicSite('/')}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Website</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenPublicSite('/product-rates')}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold cursor-pointer"
            >
              <TrendingUp className="w-3 h-3" />
              <span>Live Rates</span>
            </button>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <div className="flex items-center justify-between font-semibold text-slate-800 text-[11px]">
            <span>Nav Durga Ispat</span>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded text-[9px] font-bold">
              Urla Mill
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
            Raipur, Chhattisgarh (493221)
          </p>
        </div>
      </div>
    </aside>
  );
};
