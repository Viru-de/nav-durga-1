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
} from 'lucide-react';
import { ActiveTab } from '../types';
import { NavDurgaLogo } from './NavDurgaLogo';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingEnquiriesCount: number;
  pendingFollowUpsCount: number;
  todayOrdersCount: number;
  pendingWhatsAppCount?: number;
}

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeText?: string;
  badgeColor?: string;
  category?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingEnquiriesCount,
  pendingFollowUpsCount,
  todayOrdersCount,
  pendingWhatsAppCount = 0,
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
    },
    {
      id: 'daily-rates',
      label: 'Daily Rate Management',
      icon: Calendar,
      category: 'PRODUCTS & PRICING',
    },
    {
      id: 'gauge-master',
      label: 'Gauge Difference Master',
      icon: Layers,
      category: 'PRODUCTS & PRICING',
    },
    {
      id: 'daily-updates',
      label: 'Daily Price Updates',
      icon: TrendingUp,
      category: 'PRODUCTS & PRICING',
    },
    {
      id: 'ai-post-generator',
      label: 'AI Post Generator',
      icon: Sparkles,
      badgeText: 'Gemini AI',
      badgeColor: 'bg-blue-100 text-blue-900 font-semibold text-[9px] px-1.5 py-0.2 border border-blue-300 rounded',
      category: 'MARKETING & COMM',
    },
    {
      id: 'whatsapp-center',
      label: 'WhatsApp Inbox & Rates',
      icon: MessageSquare,
      badge: pendingWhatsAppCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
      category: 'MARKETING & COMM',
    },
    {
      id: 'customers',
      label: 'Customers Directory',
      icon: Users,
      category: 'COMMERCIAL',
    },
    {
      id: 'enquiries',
      label: 'Sales Enquiries',
      icon: HelpCircle,
      badge: pendingEnquiriesCount,
      badgeColor: 'bg-orange-100 text-orange-800 font-bold',
      category: 'COMMERCIAL',
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: FileText,
      category: 'COMMERCIAL',
    },
    {
      id: 'orders',
      label: 'Sales Orders',
      icon: ShoppingCart,
      badge: todayOrdersCount,
      badgeColor: 'bg-blue-100 text-blue-800 font-bold',
      category: 'COMMERCIAL',
    },
    {
      id: 'follow-ups',
      label: 'Follow-ups',
      icon: CalendarCheck,
      badge: pendingFollowUpsCount,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
      category: 'COMMERCIAL',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      category: 'SYSTEM',
    },
    {
      id: 'settings',
      label: 'ERP Settings',
      icon: Settings,
      category: 'SYSTEM',
    },
  ];

  let currentCategory = '';

  return (
    <aside className="w-56 lg:w-64 bg-white border border-slate-200 rounded-xl shrink-0 hidden md:flex flex-col justify-between py-2 px-2 lg:px-2.5 shadow-2xs select-none sticky top-20 h-[calc(100vh-5.5rem)] overflow-hidden">
      {/* Official Master Nav Durga Brand Anchor */}
      <div className="pb-2 mb-1 border-b border-slate-100 flex items-center justify-center shrink-0">
        <NavDurgaLogo size="md" withCard className="w-full flex justify-center py-0.5" />
      </div>

      <div className="space-y-0.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
        {navItems.map((item) => {
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
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] lg:text-[14px] leading-snug font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-blue-900 font-semibold border-l-[3px] border-blue-700 pl-[9px]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    <Icon
                      className={`w-[18px] h-[18px] ${
                        isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-800'
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

      {/* Industrial Plant Info Box at bottom of sidebar */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-200 px-1 text-xs shrink-0">
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
          <div className="mt-1 pt-1 border-t border-slate-200/70 flex items-center justify-between text-[9px] text-slate-500">
            <span>Powered by</span>
            <span className="font-semibold text-blue-700">Klyia Tech</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
