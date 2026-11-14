import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  Product,
  Customer,
  DailyUpdate,
  SalesEnquiry,
  SalesOrder,
  Quotation,
  WhatsAppMessageRecord,
  CompanySettings,
  WhatsAppConfig,
  WhatsAppConversation,
  WhatsAppChatMessage,
  WhatsAppChatStatus,
  AppUser,
  WebsiteCmsContent,
  PublicRatesPayload,
  RateChargesConfig,
  RateHistoryRecord,
  CompanyGradeBasicRates,
  CategoryBasicRates,
} from './types';
import { StorageService, AppFullState } from './services/storageService';
import { WhatsAppService } from './services/whatsappService';
import { PlatformApi } from './services/platformApi';
import { INITIAL_USERS } from './data/demoData';
import { DEFAULT_HERO_SLIDES } from './data/heroSlidesDefaults';
import {
  DEFAULT_JOURNEY_DESCRIPTION,
  DEFAULT_JOURNEY_HEADING,
  DEFAULT_JOURNEY_MILESTONES,
  DEFAULT_JOURNEY_SUBHEADING,
} from './data/journeyDefaults';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { DailyUpdatesView } from './components/DailyUpdatesView';
import { DailyUpdateFormModal } from './components/DailyUpdateFormModal';
import { CustomersView } from './components/CustomersView';
import { CustomerDetailView } from './components/CustomerDetailView';
import { CustomerFormModal } from './components/CustomerFormModal';
import { WhatsAppCenterView } from './components/WhatsAppCenterView';
import { EnquiriesView } from './components/EnquiriesView';
import { QuotationsView } from './components/QuotationsView';
import { OrdersView } from './components/OrdersView';
import { SettingsView } from './components/SettingsView';
import { PostGeneratorModal } from './components/PostGeneratorModal';
import { SendTestWhatsAppModal } from './components/SendTestWhatsAppModal';
import { DailyRateUpdateView } from './components/DailyRateUpdateView';
import { GaugeDifferenceMasterView } from './components/GaugeDifferenceMasterView';
import { AIAssistantView } from './components/AIAssistantView';
import { AIPostGeneratorView } from './components/AIPostGeneratorView';
import { PublicLayout } from './components/PublicLayout';
import { PublicWebsitePages } from './components/PublicWebsitePages';
import { LiveProductRatesView } from './components/LiveProductRatesView';
import { QuotationRequestModal } from './components/QuotationRequestModal';
import { LoginPage } from './components/LoginPage';
import { WebsiteCmsView } from './components/WebsiteCmsView';
import { TeamManagementView } from './components/TeamManagementView';
import { SeoHead } from './components/SeoHead';
import { CheckCircle2, X, CalendarCheck, BarChart3, MessageSquare } from 'lucide-react';
import { NavDurgaLogo } from './components/NavDurgaLogo';

const DEFAULT_CMS_FALLBACK: WebsiteCmsContent = {
  id: 'main',
  heroBadge: 'ESTABLISHED 1988 | RAIPUR, CHHATTISGARH',
  heroHeadline: 'STRENGTH IN STEEL. BUILT FOR TOMORROW.',
  heroSubheadline:
    'Steel products for industrial, structural and infrastructure requirements. Explore our products and connect with our team.',
  heroSlides: DEFAULT_HERO_SLIDES,
  defaultHeroSlideId: DEFAULT_HERO_SLIDES[0].id,
  journeyHeading: DEFAULT_JOURNEY_HEADING,
  journeySubheading: DEFAULT_JOURNEY_SUBHEADING,
  journeyDescription: DEFAULT_JOURNEY_DESCRIPTION,
  journeyMilestones: DEFAULT_JOURNEY_MILESTONES,
  announcementBanner:
    'Nav Durga Ispat Pvt. Ltd. — Direct Commercial Enquiries & Live Structural Steel Rates (Urla Industrial Area, Raipur)',
  showAnnouncementBanner: true,
  aboutTitle: 'Nav Durga Ispat Pvt. Ltd. — Structural Steel & Industrial Supply',
  aboutSummary:
    'Nav Durga Ispat Pvt. Ltd. is an established steel industry company based in the Urla Industrial Area, Raipur, Chhattisgarh. The company serves the steel market with a focus on structural steel products and dependable customer service.',
  visionText:
    'To serve industrial, structural, and infrastructure requirements with dependable steel supply, clear pricing, and lasting customer relationships.',
  missionText:
    'Provide structural steel products backed by responsive sales coordination, live product rate transparency, and reliable service from Urla, Raipur.',
  qualityCommitment:
    'We focus on consistent product specifications, careful rolling inspection, and clear commercial documentation across every order.',
  contactPhone: '+91 771 4208900',
  contactWhatsapp: '+91 97521 83053',
  contactEmail: 'sales@navdurgasteel.com',
  contactAddress: 'Plot No. 435-A, Sector-C, Urla Industrial Area, Raipur, Chhattisgarh – 493221, India',
  unit1Name: 'NAVDURGA ISPAT PVT. LTD. (Medium Section)',
  unit2Name: 'UNIT-2 — NS ISPAT (I) PVT. LTD. (Light Section)',
  dispatchHours: 'Mon - Sat: 09:00 AM - 07:30 PM IST',
  gstNumber: '',
  cinNumber: 'U24132CT1988PTC004838',
  establishedYear: '1988',
  updatedAt: new Date().toISOString(),
  updatedBy: 'System',
};

function normalizePath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return clean;
}

export default function App() {
  const [appState, setAppState] = useState<AppFullState>(() => StorageService.loadState());
  const [routePath, setRoutePath] = useState<string>(() => normalizePath(window.location.pathname));

  // Authenticated RBAC user + bootstrap state
  const [authUser, setAuthUser] = useState<AppUser | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [websiteCms, setWebsiteCms] = useState<WebsiteCmsContent>(DEFAULT_CMS_FALLBACK);
  const [publicRates, setPublicRates] = useState<PublicRatesPayload | null>(null);
  const [ratesLoading, setRatesLoading] = useState<boolean>(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // Public Quotation Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quotePresetProduct, setQuotePresetProduct] = useState('');
  const [quotePresetGrade, setQuotePresetGrade] = useState('');

  // ERP UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [erpBanner, setErpBanner] = useState<string | null>(null);

  // Modals state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalUpdate, setPostModalUpdate] = useState<DailyUpdate | null>(null);
  const [isSendTestModalOpen, setIsSendTestModalOpen] = useState(false);
  const [testModalUpdate, setTestModalUpdate] = useState<DailyUpdate | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDailyUpdateFormOpen, setIsDailyUpdateFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Active Team User session for WhatsApp ERP communications
  const [activeAppUser, setActiveAppUser] = useState<AppUser>(() => {
    return appState.users && appState.users.length > 0 ? appState.users[0] : INITIAL_USERS[0];
  });

  // Save ERP local cache cleanly
  useEffect(() => {
    StorageService.saveState(appState);
  }, [appState]);

  // Listen to browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      setRoutePath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const mergeWithCmsDefaults = useCallback((incoming: WebsiteCmsContent): WebsiteCmsContent => {
    return {
      ...DEFAULT_CMS_FALLBACK,
      ...incoming,
      journeyHeading: incoming.journeyHeading || DEFAULT_JOURNEY_HEADING,
      journeySubheading: incoming.journeySubheading || DEFAULT_JOURNEY_SUBHEADING,
      journeyDescription: incoming.journeyDescription || DEFAULT_JOURNEY_DESCRIPTION,
      journeyMilestones:
        Array.isArray(incoming.journeyMilestones) && incoming.journeyMilestones.length > 0
          ? incoming.journeyMilestones
          : DEFAULT_JOURNEY_MILESTONES,
    };
  }, []);

  const refreshPublicRates = useCallback(async () => {
    setRatesLoading((prev) => (publicRates === null ? true : prev));
    try {
      const rates = await PlatformApi.fetchPublicRates();
      setPublicRates(rates);
      setRatesError(null);
    } catch (err) {
      setRatesError(err instanceof Error ? err.message : 'Unable to fetch latest ERP rates');
    } finally {
      setRatesLoading(false);
    }
  }, [publicRates]);

  const navigateToPath = useCallback((path: string) => {
    const clean = normalizePath(path);
    if (window.location.pathname !== clean) {
      window.history.pushState({}, '', clean);
    }
    setRoutePath(clean);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!clean.startsWith('/erp') && clean !== '/login') {
      PlatformApi.fetchPublicRates()
        .then((rates) => {
          setPublicRates(rates);
          setRatesError(null);
        })
        .catch((err) => {
          setRatesError((prev) => prev || (err instanceof Error ? err.message : 'Unable to load latest rates'));
        })
        .finally(() => setRatesLoading(false));
      PlatformApi.fetchPublicWebsite()
        .then((res) => {
          if (res?.cms) setWebsiteCms(mergeWithCmsDefaults(res.cms));
        })
        .catch(() => {});
    }
  }, [mergeWithCmsDefaults]);

  // Load Public CMS + Public Rates + Auth Session on boot
  const hydrateAuthenticatedErp = useCallback(async (user: AppUser) => {
    setAuthUser(user);
    setActiveAppUser(user);
    try {
      const boot = await PlatformApi.fetchErpBootstrap();
      setWebsiteCms(mergeWithCmsDefaults(boot.cms));
      setPublicRates(boot.publicRates);
      setRatesError(null);
      setRatesLoading(false);
      setAppState((prev) => {
        // Merge server enquiries (preferring authoritative server updates) while keeping local-only items
        const serverMap = new Map<string, SalesEnquiry>();
        for (const srv of boot.enquiries || []) {
          serverMap.set(srv.id, srv);
        }
        const mergedLocal = prev.enquiries.map((localEnq) => serverMap.get(localEnq.id) || localEnq);
        const existingIds = new Set(prev.enquiries.map((e) => e.id));
        const newServerEnquiries = (boot.enquiries || []).filter((e) => !existingIds.has(e.id));
        return {
          ...prev,
          enquiries: [...newServerEnquiries, ...mergedLocal],
          users: boot.users && boot.users.length > 0 ? boot.users : prev.users,
        };
      });
    } catch (err) {
      console.warn('ERP bootstrap sync warning:', err);
    }
  }, [mergeWithCmsDefaults]);

  useEffect(() => {
    let active = true;
    PlatformApi.fetchPublicWebsite()
      .then((res) => {
        if (active && res?.cms) setWebsiteCms(mergeWithCmsDefaults(res.cms));
      })
      .catch(() => {});

    PlatformApi.fetchPublicRates()
      .then((rates) => {
        if (active) {
          setPublicRates(rates);
          setRatesError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setRatesError(err instanceof Error ? err.message : 'Unable to load latest ERP rates');
        }
      })
      .finally(() => {
        if (active) setRatesLoading(false);
      });

    PlatformApi.fetchCurrentUser()
      .then(async (res) => {
        if (!active) return;
        if (res.authenticated && res.user) {
          await hydrateAuthenticatedErp(res.user);
        } else {
          setAuthUser(null);
        }
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });

    return () => {
      active = false;
    };
  }, [hydrateAuthenticatedErp, mergeWithCmsDefaults]);

  // Keep public homepage & catalogue synchronized with ERP rate updates
  useEffect(() => {
    if (routePath.startsWith('/erp') || routePath === '/login' || routePath === '/product-rates') {
      return;
    }
    const timer = window.setInterval(() => {
      PlatformApi.fetchPublicRates()
        .then((rates) => {
          setPublicRates(rates);
          setRatesError(null);
        })
        .catch(() => {});
    }, 30000);
    return () => window.clearInterval(timer);
  }, [routePath]);

  // Synchronize ERP rates & active catalog directly to Backend Public Rate Portal (Single Source of Truth)
  const syncRatesToPublicServer = useCallback(
    async (
      nextProducts: Product[],
      nextCategoryBasicRates?: CategoryBasicRates,
      nextGradeBasicRates?: CompanyGradeBasicRates
    ) => {
      const mediumBase =
        nextCategoryBasicRates?.['MEDIUM SECTION'] ??
        nextGradeBasicRates?.['NAVDURGA ISPAT PVT. LTD.']?.Medium ??
        appState.categoryBasicRates?.['MEDIUM SECTION'];
      const lightBase =
        nextCategoryBasicRates?.['LIGHT SECTION'] ??
        nextGradeBasicRates?.['NS ISPAT (INDIA) PVT. LTD. UNIT-II']?.Medium ??
        appState.categoryBasicRates?.['LIGHT SECTION'];

      try {
        const res = await PlatformApi.saveErpRates({
          categoryBasicRates: {
            'MEDIUM SECTION': mediumBase,
            'LIGHT SECTION': lightBase,
          },
          products: nextProducts.map((p) => {
            const section =
              p.section === 'LIGHT SECTION' || p.rateSource?.includes('NS ISPAT')
                ? 'LIGHT SECTION'
                : 'MEDIUM SECTION';
            return {
              id: p.id,
              code: p.code,
              name: p.productName || p.name,
              category: p.productCategory || p.category,
              section,
              size: p.size,
              grade: p.grade || p.gaugeType,
              unit: p.unit,
              rateSource: p.rateSource,
              gaugeDifference: p.gaugeDifference,
              finalRate: p.finalRate ?? p.currentPrice,
              inStock: p.inStock,
              status: p.status,
              description: p.description,
              image: p.image,
            };
          }),
          rateStatus: 'Published',
          syncCatalog: true,
        });
        if (res?.publicRates) {
          setPublicRates(res.publicRates);
        }
      } catch (err) {
        console.warn('Server public rate sync queued locally:', err);
      }
    },
    [appState.categoryBasicRates]
  );

  // Auth Actions
  const handleLoginSuccess = async (user: AppUser) => {
    await hydrateAuthenticatedErp(user);
    if (routePath === '/erp/whatsapp') {
      navigateToPath('/erp/whatsapp');
    } else {
      navigateToPath('/erp');
    }
  };

  const handleLogout = async () => {
    await PlatformApi.logout();
    setAuthUser(null);
    navigateToPath('/');
  };

  const handleOpenQuoteModal = (presetProduct = '', presetGrade = '') => {
    setQuotePresetProduct(presetProduct);
    setQuotePresetGrade(presetGrade);
    setQuoteModalOpen(true);
  };

  // Derived counts for badges
  const newEnquiriesCount = appState.enquiries.filter((e) => e.status === 'New').length;
  const pendingOrdersCount = appState.orders.filter(
    (o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing'
  ).length;
  const pendingFollowUpsCount = appState.followUps.filter((f) => f.status === 'Pending').length;
  const pendingWhatsAppCount = (appState.conversations || []).filter((c) => c.status === 'New').length;

  // ERP Navigation Handlers
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSelectedCustomer(null);
    if (routePath !== '/erp') {
      navigateToPath('/erp');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenWhatsAppSystem = () => {
    navigateToPath('/erp/whatsapp');
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveTab('customers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCustomerById = (customerId: string) => {
    const cust = appState.customers.find((c) => c.id === customerId);
    if (cust) {
      setSelectedCustomer(cust);
      setActiveTab('customers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenPostGenerator = (update?: DailyUpdate) => {
    const targetUpdate = update || appState.dailyUpdates[0];
    setPostModalUpdate(targetUpdate);
    setIsPostModalOpen(true);
  };

  const handleOpenSendTestWhatsApp = (update?: DailyUpdate) => {
    const targetUpdate = update || appState.dailyUpdates[0];
    setTestModalUpdate(targetUpdate);
    setIsSendTestModalOpen(true);
  };

  const [dailyRatesPreselection, setDailyRatesPreselection] = useState<{
    category: 'MEDIUM SECTION' | 'LIGHT SECTION' | 'ALL';
    search?: string;
  }>({ category: 'MEDIUM SECTION', search: '' });

  const handleOpenDailyRatesForSection = (
    category: 'MEDIUM SECTION' | 'LIGHT SECTION' | 'ALL',
    search?: string
  ) => {
    setDailyRatesPreselection({ category, search });
    setActiveTab('daily-rates');
  };

  // Product Actions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductDetailOpen(false);
    setIsProductFormOpen(true);
  };

  const handleViewProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setIsProductDetailOpen(true);
  };

  const handleSaveProduct = (data: Partial<Product>) => {
    let nextProducts: Product[];
    if (editingProduct) {
      nextProducts = appState.products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...data,
              productName: data.productName || data.name || p.productName || p.name,
              productCategory: data.productCategory || data.category || p.productCategory || p.category,
              category: data.productCategory || data.category || p.category,
              name: data.productName || data.name || p.name,
              size: data.size || p.size,
              grade: data.grade || p.grade,
              gaugeType: data.gaugeType || p.gaugeType,
              rateSource: data.rateSource || p.rateSource,
              baseRate: data.baseRate ?? p.baseRate,
              gaugeDifference: data.gaugeDifference ?? p.gaugeDifference,
              loadingCharge: data.loadingCharge ?? p.loadingCharge,
              insuranceCharge: data.insuranceCharge ?? p.insuranceCharge,
              otherCharges: data.otherCharges ?? p.otherCharges,
              finalRate: data.finalRate ?? data.currentPrice ?? p.finalRate ?? p.currentPrice,
              currentPrice: data.finalRate ?? data.currentPrice ?? p.currentPrice,
              previousPrice: data.previousPrice ?? p.previousPrice,
              priceChange:
                (data.finalRate ?? data.currentPrice ?? p.currentPrice) -
                (data.previousPrice ?? p.previousPrice),
            }
          : p
      );
    } else {
      const currentRate = data.finalRate || data.currentPrice || 48106;
      const prevRate = data.previousPrice || currentRate;
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: data.productName || data.name || 'MS Channel',
        productName: data.productName || data.name || 'MS Channel',
        productCategory: data.productCategory || data.category || 'MS Channel',
        category: data.productCategory || data.category || 'MS Channel',
        size: data.size || '70 × 35 mm',
        grade: data.grade || `${data.size || '70 × 35 mm'} (${data.gaugeType || 'SL'})`,
        gaugeType: data.gaugeType || 'SL',
        rateSource: data.rateSource || 'NS ISPAT (INDIA) PVT. LTD. UNIT-II',
        code: data.code || `ND-${Math.floor(100 + Math.random() * 900)}`,
        unit: data.unit || 'MT',
        baseRate: data.baseRate || 40211,
        gaugeDifference: data.gaugeDifference !== undefined ? data.gaugeDifference : 7500,
        loadingCharge: data.loadingCharge !== undefined ? data.loadingCharge : 365,
        insuranceCharge: data.insuranceCharge !== undefined ? data.insuranceCharge : 30,
        otherCharges: data.otherCharges || 0,
        finalRate: currentRate,
        currentPrice: currentRate,
        previousPrice: prevRate,
        priceChange: currentRate - prevRate,
        minOrderQty: data.minOrderQty || 5,
        description: data.description || '',
        inStock: data.inStock ?? true,
        status: data.status || 'Active',
        priceHistory: data.priceHistory || [
          {
            date: new Date().toISOString().split('T')[0],
            price: currentRate,
            changeReason: 'Initial specification registration',
          },
        ],
      };
      nextProducts = [newProd, ...appState.products];
    }
    setAppState({ ...appState, products: nextProducts });
    syncRatesToPublicServer(nextProducts);
  };

  // Daily Rate Management Batch Handler
  const handleSaveDailyRateBatch = (
    updatedProducts: Product[],
    newHistory: RateHistoryRecord[],
    newCharges?: RateChargesConfig,
    updatedGradeBasicRates?: CompanyGradeBasicRates,
    updatedCategoryBasicRates?: CategoryBasicRates
  ) => {
    const mappedProducts = updatedProducts.map((p) => {
      const final = p.finalRate ?? p.currentPrice;
      const prev = p.previousPrice ?? final;
      return {
        ...p,
        finalRate: final,
        currentPrice: final,
        previousPrice: prev,
        priceChange: final - prev,
      };
    });

    setAppState((prev) => ({
      ...prev,
      products: mappedProducts,
      rateHistory: [...newHistory, ...(prev.rateHistory || [])],
      rateCharges: newCharges || prev.rateCharges,
      gradeBasicRates: updatedGradeBasicRates || prev.gradeBasicRates,
      categoryBasicRates: updatedCategoryBasicRates || prev.categoryBasicRates,
    }));

    syncRatesToPublicServer(mappedProducts, updatedCategoryBasicRates, updatedGradeBasicRates);
  };

  const handleUpdateGaugeDifferenceProducts = (updatedProducts: Product[]) => {
    setAppState((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
    syncRatesToPublicServer(updatedProducts);
  };

  const handleToggleProductStatus = (productId: string) => {
    const updated = appState.products.map((p) =>
      p.id === productId ? { ...p, status: (p.status === 'Active' ? 'Inactive' : 'Active') as Product['status'] } : p
    );
    setAppState({ ...appState, products: updated });
    syncRatesToPublicServer(updated);
  };

  const handleQuickUpdateProductPrice = (productId: string, newPrice: number, reason: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = appState.products.map((p) => {
      if (p.id === productId) {
        const diff = newPrice - p.currentPrice;
        const newHistory = [{ date: today, price: newPrice, changeReason: reason }, ...(p.priceHistory || [])];
        return {
          ...p,
          previousPrice: p.currentPrice,
          currentPrice: newPrice,
          finalRate: newPrice,
          priceChange: diff,
          priceHistory: newHistory,
        };
      }
      return p;
    });
    setAppState({ ...appState, products: updated });
    syncRatesToPublicServer(updated);
    if (selectedProduct && selectedProduct.id === productId) {
      const found = updated.find((p) => p.id === productId);
      if (found) setSelectedProduct(found);
    }
  };

  const handleSaveDailyUpdate = (newUpdate: DailyUpdate, openGenerator = false) => {
    const updatedList = [newUpdate, ...appState.dailyUpdates];
    const updatedProducts = appState.products.map((prod) => {
      const itemMatch = newUpdate.items.find((it) => it.productId === prod.id || it.grade === prod.grade);
      if (itemMatch) {
        return {
          ...prod,
          previousPrice: prod.currentPrice,
          currentPrice: itemMatch.price,
          finalRate: itemMatch.price,
          priceChange: itemMatch.price - prod.currentPrice,
          priceHistory: [
            {
              date: newUpdate.date,
              price: itemMatch.price,
              changeReason: `Daily rate update: ${newUpdate.title}`,
            },
            ...(prod.priceHistory || []),
          ],
        };
      }
      return prod;
    });

    setAppState((prev: AppFullState) => ({
      ...prev,
      products: updatedProducts,
      dailyUpdates: updatedList,
    }));
    syncRatesToPublicServer(updatedProducts);

    if (openGenerator) {
      setPostModalUpdate(newUpdate);
      setIsPostModalOpen(true);
    }
  };

  const handleUpdateSectionPrices = (
    updatedProducts: Product[],
    newHistory: RateHistoryRecord[],
    sectionName?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const changedProducts = updatedProducts.filter((p) => {
      const orig = appState.products.find((o) => o.id === p.id);
      return orig && orig.currentPrice !== p.currentPrice;
    });

    let updatedDailyUpdates = appState.dailyUpdates;
    if (changedProducts.length > 0) {
      const newDailyUpdate: DailyUpdate = {
        id: `upd-${Date.now()}`,
        date: today,
        title: `${sectionName || 'Section'} Daily Price Revision (${changedProducts.length} items)`,
        items: updatedProducts
          .filter((p) => (sectionName ? p.section === sectionName : true))
          .map((p) => ({
            productId: p.id,
            productName: p.name,
            grade: p.grade,
            price: p.currentPrice,
            previousPrice: p.previousPrice,
            unit: p.unit || 'MT',
            availability: p.inStock ? 'Available' : 'Booking Open',
            changeNote:
              p.priceChange > 0
                ? `+₹${p.priceChange} / ${p.unit}`
                : p.priceChange < 0
                ? `-₹${Math.abs(p.priceChange)} / ${p.unit}`
                : 'Stable',
          })),
        remarks: `Official Daily Price Revision for ${sectionName || 'Section'}. Ex-plant Raipur. GST 18% extra.`,
        status: 'Published',
        createdAt: new Date().toISOString(),
        createdBy: authUser?.name || 'Admin',
      };
      updatedDailyUpdates = [newDailyUpdate, ...appState.dailyUpdates];
    }

    const nextCategoryRates: CategoryBasicRates = { ...(appState.categoryBasicRates || {}) };
    const nextGradeRates: CompanyGradeBasicRates = { ...(appState.gradeBasicRates || {}) };

    changedProducts.forEach((p) => {
      if (p.baseRate && p.baseRate > 0) {
        const isLight = p.section === 'LIGHT SECTION' || p.rateSource?.includes('NS ISPAT');
        const g = (p.grade || p.gaugeType || '').toUpperCase();
        if (isLight) {
          nextCategoryRates['LIGHT SECTION'] = p.baseRate;
        } else if (g === 'SL') {
          nextGradeRates['NAVDURGA ISPAT PVT. LTD.'] = {
            ...(nextGradeRates['NAVDURGA ISPAT PVT. LTD.'] || {}),
            SL: p.baseRate,
          };
        } else {
          nextCategoryRates['MEDIUM SECTION'] = p.baseRate;
          nextGradeRates['NAVDURGA ISPAT PVT. LTD.'] = {
            ...(nextGradeRates['NAVDURGA ISPAT PVT. LTD.'] || {}),
            Medium: p.baseRate,
          };
        }
      }
    });

    setAppState((prev: AppFullState) => ({
      ...prev,
      products: updatedProducts,
      rateHistory: [...newHistory, ...(prev.rateHistory || [])],
      dailyUpdates: updatedDailyUpdates,
      categoryBasicRates: nextCategoryRates,
      gradeBasicRates: nextGradeRates,
    }));
    syncRatesToPublicServer(updatedProducts, nextCategoryRates, nextGradeRates);
  };

  // Customer Actions
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerFormOpen(true);
  };

  const handleEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust);
    setIsCustomerFormOpen(true);
  };

  const handleSaveCustomer = (data: Partial<Customer>) => {
    if (editingCustomer) {
      const updated = appState.customers.map((c) =>
        c.id === editingCustomer.id ? { ...c, ...data } : c
      );
      setAppState({ ...appState, customers: updated });
      if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
        setSelectedCustomer({ ...selectedCustomer, ...data });
      }
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: data.name || 'New Customer',
        companyName: data.companyName || 'Industrial Firm',
        mobile: data.mobile || '+91 98271 00000',
        whatsapp: data.whatsapp || data.mobile || '+91 98271 00000',
        email: data.email || '',
        address: data.address || '',
        city: data.city || 'Raipur',
        state: data.state || 'Chhattisgarh',
        gstin: data.gstin || '22AABC00000',
        customerType: data.customerType || 'Contractor',
        interestedProducts: data.interestedProducts || ['MS Channel'],
        notes: data.notes || '',
        status: data.status || 'Active',
        creditDays: data.creditDays || 7,
        createdDate: new Date().toISOString().split('T')[0],
      };
      setAppState({ ...appState, customers: [newCust, ...appState.customers] });
      setSelectedCustomer(newCust);
    }
  };

  const handleLogWhatsAppMessage = (record: WhatsAppMessageRecord) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      whatsAppMessages: [record, ...prev.whatsAppMessages],
    }));
  };

  const handleAddEnquiry = (enquiryData: Partial<SalesEnquiry>) => {
    const newEnq: SalesEnquiry = {
      id: enquiryData.id || `enq-${Date.now()}`,
      enquiryNumber: enquiryData.enquiryNumber || `ENQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: enquiryData.customerId || appState.customers[0]?.id || 'c1',
      customerName: enquiryData.customerName || 'Customer',
      product: enquiryData.product || 'MS Channel',
      grade: enquiryData.grade || 'Medium / IS 2062',
      quantity: enquiryData.quantity || 10,
      unit: enquiryData.unit || 'MT',
      quotedPrice: enquiryData.quotedPrice,
      source: enquiryData.source || 'WhatsApp',
      status: enquiryData.status || 'New',
      notes: enquiryData.notes || '',
      followUpDate: enquiryData.followUpDate,
      date: enquiryData.date || new Date().toISOString().split('T')[0],
    };
    setAppState((prev: AppFullState) => ({
      ...prev,
      enquiries: [newEnq, ...prev.enquiries],
    }));
  };

  const handleUpdateEnquiryStatus = (enquiryId: string, newStatus: SalesEnquiry['status']) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e)),
    }));
    PlatformApi.updateErpEnquiry(enquiryId, { status: newStatus }).catch(() => {});
  };

  const handleUpdateEnquiry = (enquiryId: string, patch: Partial<SalesEnquiry>) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) => (e.id === enquiryId ? { ...e, ...patch } : e)),
    }));
    PlatformApi.updateErpEnquiry(enquiryId, patch).catch(() => {});
  };

  const handleConvertEnquiryToQuotation = (enq: SalesEnquiry) => {
    const cust = appState.customers.find((c) => c.id === enq.customerId);
    const subtotal = (enq.quantity || 10) * (enq.quotedPrice || 58500);
    const taxAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + taxAmount;
    const standardTerms = appState.company.standardTerms;

    const newQuot: Quotation = {
      id: `quot-${Date.now()}`,
      quotationNumber: `NDI-QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: enq.customerId,
      customerName: enq.customerName,
      customerContact: cust?.name || enq.customerName,
      customerMobile: cust?.mobile || '+91 98261 00000',
      customerGstin: cust?.gstin || '22AABC00000',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          productId: 'p1',
          productName: enq.product,
          grade: enq.grade,
          quantity: enq.quantity,
          unit: enq.unit,
          rate: enq.quotedPrice || 58500,
          amount: subtotal,
          unitPrice: enq.quotedPrice || 58500,
          total: subtotal,
        },
      ],
      subtotal,
      taxRate: 18,
      taxAmount,
      grandTotal,
      total: grandTotal,
      terms: {
        delivery: standardTerms?.deliveryTerms || 'Ex-plant Urla, Raipur',
        payment: standardTerms?.paymentTerms || '100% advance RTGS',
        validity: standardTerms?.validityTerms || '24 hours',
      },
      status: 'Sent',
    };

    setAppState((prev: AppFullState) => ({
      ...prev,
      quotations: [newQuot, ...prev.quotations],
      enquiries: prev.enquiries.map((e) => (e.id === enq.id ? { ...e, status: 'Quoted' } : e)),
    }));
    setActiveTab('quotations');
  };

  const handleConvertEnquiryToOrder = (enq: SalesEnquiry) => {
    const subtotal = (enq.quantity || 10) * (enq.quotedPrice || 58500);
    const item = {
      productId: 'p1',
      productName: enq.product,
      grade: enq.grade,
      quantity: enq.quantity,
      unit: enq.unit,
      rate: enq.quotedPrice || 58500,
      amount: subtotal,
      unitPrice: enq.quotedPrice || 58500,
      total: subtotal,
    };

    const newOrder: SalesOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `NDI-ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: enq.customerId,
      customerName: enq.customerName,
      products: [item],
      items: [item],
      total: subtotal,
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryLocation: 'Naya Raipur Site Godown',
    };

    setAppState((prev: AppFullState) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      enquiries: prev.enquiries.map((e) => (e.id === enq.id ? { ...e, status: 'Won' } : e)),
    }));
    setActiveTab('orders');
  };

  const handleAddQuotation = (quotation: Quotation) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      quotations: [quotation, ...prev.quotations],
    }));
  };

  const handleUpdateQuotationStatus = (id: string, status: Quotation['status']) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      quotations: prev.quotations.map((q: Quotation) => (q.id === id ? { ...q, status } : q)),
    }));
  };

  const handleAddOrder = (order: SalesOrder) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      orders: [order, ...prev.orders],
    }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: SalesOrder['orderStatus']) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      orders: prev.orders.map((o: SalesOrder) => (o.id === orderId ? { ...o, orderStatus: status } : o)),
    }));
  };

  const handleUpdatePaymentStatus = (orderId: string, status: SalesOrder['paymentStatus']) => {
    setAppState((prev: AppFullState) => ({
      ...prev,
      orders: prev.orders.map((o: SalesOrder) => (o.id === orderId ? { ...o, paymentStatus: status } : o)),
    }));
  };

  const handleSaveCompanySettings = (updated: CompanySettings) => {
    setAppState((prev: AppFullState) => ({ ...prev, company: updated }));
  };

  const handleSaveWhatsAppConfig = (updated: WhatsAppConfig) => {
    setAppState((prev: AppFullState) => ({ ...prev, whatsAppConfig: updated }));
  };

  const handleResetDemoData = () => {
    StorageService.resetToFactoryDefaults();
    setAppState(StorageService.loadState());
    setActiveTab('dashboard');
  };

  const handleSendChatMessage = async (conversationId: string, text: string) => {
    if (!text.trim()) return;
    const conv = (appState.conversations || []).find((c) => c.id === conversationId);
    if (!conv) return;

    const newMsg: WhatsAppChatMessage = {
      id: `wamsg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      customerId: conv.customerId,
      senderType: 'team',
      senderName: activeAppUser.name,
      senderId: activeAppUser.id,
      text,
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };

    const updatedConv: WhatsAppConversation = {
      ...conv,
      lastMessage: text,
      lastMessageTime: new Date().toISOString(),
      lastSenderType: 'team',
      unreadCount: 0,
      status: conv.status === 'New' ? 'Open' : conv.status,
    };

    setAppState((prev) => ({
      ...prev,
      conversations: (prev.conversations || []).map((c) => (c.id === conversationId ? updatedConv : c)),
      chatMessages: [...(prev.chatMessages || []), newMsg],
    }));

    StorageService.saveChatMessageToFirestore(newMsg);
    StorageService.saveConversationToFirestore(updatedConv);

    try {
      await WhatsAppService.sendDirectReply({
        conversationId: conv.id,
        customerId: conv.customerId,
        customerPhone: conv.phoneNumber,
        messageText: text,
        sender: activeAppUser,
      });
    } catch (e) {
      console.warn('Direct reply delivery queued/logged:', e);
    }
  };

  const handleUpdateConversationStatus = (conversationId: string, status: WhatsAppChatStatus) => {
    setAppState((prev) => ({
      ...prev,
      conversations: (prev.conversations || []).map((c) => {
        if (c.id === conversationId) {
          const updated = { ...c, status };
          StorageService.saveConversationToFirestore(updated);
          return updated;
        }
        return c;
      }),
    }));
  };

  const handleAssignConversation = (conversationId: string, userId: string, userName: string) => {
    setAppState((prev) => ({
      ...prev,
      conversations: (prev.conversations || []).map((c) => {
        if (c.id === conversationId) {
          const updated = { ...c, assignedToUserId: userId, assignedToName: userName };
          StorageService.saveConversationToFirestore(updated);
          return updated;
        }
        return c;
      }),
    }));
  };

  const handleUpdateConversationNotes = (conversationId: string, notes: string, followUpDate?: string) => {
    setAppState((prev) => ({
      ...prev,
      conversations: (prev.conversations || []).map((c) => {
        if (c.id === conversationId) {
          const updated = { ...c, internalNotes: notes, followUpDate: followUpDate || c.followUpDate };
          StorageService.saveConversationToFirestore(updated);
          return updated;
        }
        return c;
      }),
    }));
  };

  const handleBroadcastRates = async (params: {
    recipients: Customer[];
    isRevision: boolean;
    customNote?: string;
    includeImage?: boolean;
  }) => {
    const mediumBase =
      appState.categoryBasicRates?.['MEDIUM SECTION'] ??
      appState.gradeBasicRates?.['NAV DURGA ISPAT PVT. LTD.']?.Medium ??
      49711;
    const slBase =
      appState.categoryBasicRates?.['LIGHT SECTION'] ??
      appState.gradeBasicRates?.['NS ISPAT (INDIA) PVT. LTD. UNIT-II']?.Medium ??
      42211;
    const dateStr = new Date().toISOString().split('T')[0];

    const record = await WhatsAppService.broadcastApprovedRates({
      recipients: params.recipients,
      mediumRate: mediumBase,
      slRate: slBase,
      dateStr,
      sender: activeAppUser,
      isRevision: params.isRevision,
      customNote: params.customNote,
      imageUrl: params.includeImage ? '/market_opening_template.jpg' : undefined,
    });

    setAppState((prev) => ({ ...prev, rateBroadcasts: [record, ...(prev.rateBroadcasts || [])] }));
    StorageService.saveRateBroadcastToFirestore(record);
  };

  const handleRetryBroadcast = async (broadcastId: string) => {
    const existing = (appState.rateBroadcasts || []).find((b) => b.id === broadcastId);
    if (!existing) return;
    const updated = await WhatsAppService.retryFailedRecipients(existing);
    setAppState((prev) => ({
      ...prev,
      rateBroadcasts: (prev.rateBroadcasts || []).map((b) => (b.id === broadcastId ? updated : b)),
    }));
    StorageService.saveRateBroadcastToFirestore(updated);
  };

  const handleAddTeamMember = (userData: Omit<AppUser, 'id'>) => {
    const newUser: AppUser = { ...userData, id: `usr-${Date.now()}` };
    const updatedUsers = [...(appState.users || []), newUser];
    setAppState((prev) => ({ ...prev, users: updatedUsers }));
    StorageService.saveUsers(updatedUsers);
  };

  const handleToggleBroadcastOptIn = (customerId: string, optedIn: boolean) => {
    setAppState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === customerId ? { ...c, optedInForBroadcast: optedIn, broadcastRecipient: optedIn } : c
      ),
    }));
  };

  // ===========================================================================
  // ROUTE DISPATCHER: /login, /erp, /erp/whatsapp, /product-rates, Public Site
  // ===========================================================================
  const isErpRoute = routePath === '/erp' || routePath.startsWith('/erp/');
  const isWhatsAppStandalone = routePath === '/erp/whatsapp';

  // 1. LOGIN PAGE (/login) or Unauthenticated visit to protected /erp/*
  if (routePath === '/login' || (isErpRoute && authChecked && !authUser)) {
    if (authUser && routePath === '/login') {
      navigateToPath('/erp');
    }
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToWebsite={() => navigateToPath('/')}
      />
    );
  }

  // Wait briefly while session token validates for /erp/*
  if (isErpRoute && !authChecked) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <NavDurgaLogo size="lg" withCard priority />
        <div className="text-sm font-bold text-slate-700">Verifying Nav Durga ERP Session...</div>
      </div>
    );
  }

  // 2. DEDICATED STANDALONE WHATSAPP SYSTEM (/erp/whatsapp)
  if (isWhatsAppStandalone && authUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <SeoHead
          title="Nav Durga WhatsApp Sales Desk | Internal ERP"
          description="Internal Nav Durga Ispat ERP WhatsApp communications console."
          canonicalPath="/erp/whatsapp"
          noIndex
        />
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <NavDurgaLogo size="sm" withCard priority />
            <div>
              <div className="font-display font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Nav Durga WhatsApp System</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  Human Sales Desk
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Signed in: {authUser.name} ({authUser.rbacRole || authUser.role})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToPath('/erp')}
              className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold cursor-pointer"
            >
              ← Return to ERP Dashboard
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
          <WhatsAppCenterView
            dailyUpdates={appState.dailyUpdates}
            customers={appState.customers}
            products={appState.products}
            company={appState.company}
            whatsAppConfig={appState.whatsAppConfig}
            categoryBasicRates={appState.categoryBasicRates}
            gradeBasicRates={appState.gradeBasicRates}
            conversations={appState.conversations || []}
            chatMessages={appState.chatMessages || []}
            rateBroadcasts={appState.rateBroadcasts || []}
            users={appState.users || []}
            activeUser={activeAppUser}
            onChangeActiveUser={setActiveAppUser}
            onAddTeamMember={handleAddTeamMember}
            onSendMessage={handleSendChatMessage}
            onUpdateConversationStatus={handleUpdateConversationStatus}
            onAssignConversation={handleAssignConversation}
            onUpdateConversationNotes={handleUpdateConversationNotes}
            onBroadcastRates={handleBroadcastRates}
            onRetryBroadcast={handleRetryBroadcast}
            onLogMessage={handleLogWhatsAppMessage}
            onCreateEnquiryFromWebhook={(enq) => {
              setAppState((prev) => ({ ...prev, enquiries: [enq, ...prev.enquiries] }));
            }}
            onNavigateToCustomer={(cid) => {
              handleSelectCustomerById(cid);
              navigateToPath('/erp');
            }}
            onNavigateTab={handleTabChange}
            onReturnToErp={() => navigateToPath('/erp')}
          />
        </main>
      </div>
    );
  }

  // 3. PUBLIC WEBSITE & LIVE PRODUCT RATE PORTAL (/ and /product-rates and public pages)
  if (!isErpRoute) {
    return (
      <>
        <PublicLayout
          currentPath={routePath}
          onNavigate={navigateToPath}
          cms={websiteCms}
          authUser={authUser}
          onOpenQuoteModal={handleOpenQuoteModal}
        >
          {routePath === '/product-rates' ? (
            <LiveProductRatesView
              initialRates={publicRates}
              cms={websiteCms}
              onOpenQuoteModal={handleOpenQuoteModal}
              onRatesRefreshed={setPublicRates}
              onNavigate={navigateToPath}
            />
          ) : (
            <PublicWebsitePages
              currentPath={routePath}
              cms={websiteCms}
              rates={publicRates}
              ratesLoading={ratesLoading}
              ratesError={ratesError}
              onRefreshRates={refreshPublicRates}
              onNavigate={navigateToPath}
              onOpenQuoteModal={handleOpenQuoteModal}
              onEnquirySubmitted={(enq) => handleAddEnquiry(enq)}
            />
          )}
        </PublicLayout>

        <QuotationRequestModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          presetProduct={quotePresetProduct}
          presetGrade={quotePresetGrade}
          products={publicRates?.products || []}
          contactWhatsapp={websiteCms.contactWhatsapp}
          onEnquirySubmitted={(enq) => handleAddEnquiry(enq)}
        />
      </>
    );
  }

  // 4. PROTECTED ERP WORKSPACE (/erp)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <SeoHead
        title="Nav Durga Ispat ERP Workspace"
        description="Internal enterprise resource planning console for Nav Durga Ispat Pvt. Ltd."
        canonicalPath="/erp"
        noIndex
      />
      <Header
        company={appState.company}
        currentTab={activeTab}
        onNavigate={handleTabChange}
        mobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setIsMobileMenuOpen}
        pendingEnquiriesCount={newEnquiriesCount}
        authUser={authUser}
        onOpenWhatsAppSystem={handleOpenWhatsAppSystem}
        onViewWebsite={() => navigateToPath('/')}
        onSignOut={handleLogout}
      />

      {erpBanner && (
        <div className="max-w-7xl lg:max-w-none w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 no-print">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              {erpBanner}
            </span>
            <button type="button" onClick={() => setErpBanner(null)} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex w-full max-w-7xl lg:max-w-none mx-auto px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6 gap-6">
        <Sidebar
          currentTab={activeTab}
          onSelectTab={handleTabChange}
          pendingEnquiriesCount={newEnquiriesCount}
          pendingFollowUpsCount={pendingFollowUpsCount}
          todayOrdersCount={pendingOrdersCount}
          pendingWhatsAppCount={pendingWhatsAppCount}
          authUser={authUser}
          onOpenWhatsAppSystem={handleOpenWhatsAppSystem}
          onOpenPublicSite={navigateToPath}
        />

        <main className="flex-1 min-w-0 pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              products={appState.products}
              customers={appState.customers}
              dailyUpdates={appState.dailyUpdates}
              enquiries={appState.enquiries}
              orders={appState.orders}
              followUps={appState.followUps}
              whatsAppMessages={appState.whatsAppMessages}
              onNavigate={handleTabChange}
              onOpenWhatsAppSystem={handleOpenWhatsAppSystem}
              onOpenCreateUpdate={() => setIsDailyUpdateFormOpen(true)}
              onOpenCreateEnquiry={() => {
                handleAddEnquiry({});
                setActiveTab('enquiries');
              }}
              onOpenCreateOrder={() => setActiveTab('orders')}
              onOpenAddCustomer={handleAddCustomer}
              onOpenAddProduct={handleAddProduct}
              onViewCustomerDetail={handleSelectCustomerById}
              onViewProductDetail={(productId: string) => {
                const prod = appState.products.find((p) => p.id === productId);
                if (prod) handleViewProduct(prod);
              }}
              onGeneratePostForUpdate={(u) => handleOpenPostGenerator(u)}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AIAssistantView
              products={appState.products}
              rateHistory={appState.rateHistory || []}
              dailyUpdates={appState.dailyUpdates}
              company={appState.company}
              categoryBasicRates={appState.categoryBasicRates}
              gradeBasicRates={appState.gradeBasicRates}
              rateCharges={appState.rateCharges}
              customers={appState.customers}
              enquiries={appState.enquiries}
              orders={appState.orders}
              whatsAppConfig={appState.whatsAppConfig}
              onApplyRateBatch={handleSaveDailyRateBatch}
              onSaveDailyUpdate={(u) => handleSaveDailyUpdate(u)}
              onNavigateTab={handleTabChange}
              onOpenDailyRatesForSection={handleOpenDailyRatesForSection}
              onLogWhatsAppMessage={handleLogWhatsAppMessage}
              onAddEnquiry={handleAddEnquiry}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={appState.products}
              rateCharges={appState.rateCharges}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onViewProduct={handleViewProduct}
              onToggleStatus={handleToggleProductStatus}
              onQuickUpdatePrice={handleQuickUpdateProductPrice}
              onOpenDailyRates={() => setActiveTab('daily-rates')}
              onOpenGaugeMaster={() => setActiveTab('gauge-master')}
            />
          )}

          {activeTab === 'daily-rates' && (
            <DailyRateUpdateView
              products={appState.products}
              rateCharges={appState.rateCharges}
              rateHistory={appState.rateHistory || []}
              categoryBasicRates={appState.categoryBasicRates}
              gradeBasicRates={appState.gradeBasicRates}
              initialCategory={dailyRatesPreselection.category}
              initialSearch={dailyRatesPreselection.search || ''}
              onSaveRates={handleSaveDailyRateBatch}
              onOpenGaugeMaster={() => setActiveTab('gauge-master')}
              onOpenWhatsAppBroadcast={() => handleOpenPostGenerator()}
            />
          )}

          {activeTab === 'gauge-master' && (
            <GaugeDifferenceMasterView
              products={appState.products}
              rateCharges={appState.rateCharges}
              categoryBasicRates={appState.categoryBasicRates}
              gradeBasicRates={appState.gradeBasicRates}
              onUpdateProducts={handleUpdateGaugeDifferenceProducts}
              onOpenDailyRates={() => setActiveTab('daily-rates')}
            />
          )}

          {activeTab === 'daily-updates' && (
            <DailyUpdatesView
              products={appState.products}
              dailyUpdates={appState.dailyUpdates}
              company={appState.company}
              rateHistory={appState.rateHistory || []}
              onOpenCreateUpdate={() => setIsDailyUpdateFormOpen(true)}
              onGeneratePost={(u) => handleOpenPostGenerator(u)}
              onNavigateToWhatsAppCenter={handleOpenWhatsAppSystem}
              onSendTestWhatsApp={handleOpenSendTestWhatsApp}
              onUpdateSectionPrices={handleUpdateSectionPrices}
            />
          )}

          {activeTab === 'customers' &&
            (selectedCustomer ? (
              <CustomerDetailView
                customer={selectedCustomer}
                enquiries={appState.enquiries}
                orders={appState.orders}
                quotations={appState.quotations}
                followUps={appState.followUps}
                whatsAppMessages={appState.whatsAppMessages}
                conversations={appState.conversations || []}
                chatMessages={appState.chatMessages || []}
                onBack={() => setSelectedCustomer(null)}
                onEditCustomer={handleEditCustomer}
                onUpdateConversationStatus={handleUpdateConversationStatus}
                onToggleBroadcastOptIn={handleToggleBroadcastOptIn}
                onCreateEnquiryForCustomer={(c) => {
                  handleAddEnquiry({ customerId: c.id, customerName: c.companyName });
                  setActiveTab('enquiries');
                }}
                onCreateQuotationForCustomer={() => setActiveTab('quotations')}
                onCreateOrderForCustomer={() => setActiveTab('orders')}
                onScheduleFollowUp={(c) => {
                  setErpBanner(`Follow-up scheduled for ${c.companyName} and recorded in timeline.`);
                }}
                onSendCustomWhatsApp={async (c, msg) => {
                  const phoneDigits = (c.whatsapp || c.mobile || '').replace(/\D/g, '');
                  const conv = (appState.conversations || []).find(
                    (cv) =>
                      cv.customerId === c.id ||
                      (cv.phoneNumber && cv.phoneNumber.replace(/\D/g, '').endsWith(phoneDigits.slice(-10)))
                  );
                  if (conv) {
                    await handleSendChatMessage(conv.id, msg);
                  } else {
                    handleLogWhatsAppMessage({
                      id: `msg-${Date.now()}`,
                      customerId: c.id,
                      customerName: c.companyName,
                      whatsappNumber: c.whatsapp || c.mobile,
                      type: 'sent',
                      message: msg,
                      timestamp: new Date().toISOString(),
                      status: 'sent',
                      source: 'manual',
                      context: 'Customer Direct Chat',
                    });
                  }
                }}
              />
            ) : (
              <CustomersView
                customers={appState.customers}
                onSelectCustomer={handleSelectCustomer}
                onAddCustomer={handleAddCustomer}
                onEditCustomer={handleEditCustomer}
              />
            ))}

          {activeTab === 'ai-post-generator' && (
            <AIPostGeneratorView
              products={appState.products}
              customers={appState.customers}
              company={appState.company}
              categoryBasicRates={appState.categoryBasicRates}
              gradeBasicRates={appState.gradeBasicRates}
              rateCharges={appState.rateCharges}
              onSaveRates={handleSaveDailyRateBatch}
              onLogWhatsAppMessage={handleLogWhatsAppMessage}
              onNavigateTab={handleTabChange}
            />
          )}

          {(activeTab === 'whatsapp' || activeTab === 'whatsapp-center') && (
            <WhatsAppCenterView
              dailyUpdates={appState.dailyUpdates}
              customers={appState.customers}
              products={appState.products}
              company={appState.company}
              whatsAppConfig={appState.whatsAppConfig}
              categoryBasicRates={appState.categoryBasicRates}
              gradeBasicRates={appState.gradeBasicRates}
              conversations={appState.conversations || []}
              chatMessages={appState.chatMessages || []}
              rateBroadcasts={appState.rateBroadcasts || []}
              users={appState.users || []}
              activeUser={activeAppUser}
              onChangeActiveUser={setActiveAppUser}
              onAddTeamMember={handleAddTeamMember}
              onSendMessage={handleSendChatMessage}
              onUpdateConversationStatus={handleUpdateConversationStatus}
              onAssignConversation={handleAssignConversation}
              onUpdateConversationNotes={handleUpdateConversationNotes}
              onBroadcastRates={handleBroadcastRates}
              onRetryBroadcast={handleRetryBroadcast}
              onLogMessage={handleLogWhatsAppMessage}
              onCreateEnquiryFromWebhook={(enq) => {
                setAppState((prev: AppFullState) => ({ ...prev, enquiries: [enq, ...prev.enquiries] }));
              }}
              onNavigateToCustomer={handleSelectCustomerById}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'website-cms' && (
            <WebsiteCmsView
              cms={websiteCms}
              onCmsUpdated={setWebsiteCms}
              onOpenPublicSite={navigateToPath}
            />
          )}

          {activeTab === 'team-management' && authUser && (
            <TeamManagementView
              currentUser={authUser}
              onUsersSynced={(users) => setAppState((prev) => ({ ...prev, users }))}
            />
          )}

          {activeTab === 'enquiries' && (
            <EnquiriesView
              enquiries={appState.enquiries}
              customers={appState.customers}
              products={appState.products}
              users={appState.users || []}
              onAddEnquiry={handleAddEnquiry}
              onUpdateStatus={handleUpdateEnquiryStatus}
              onUpdateEnquiry={handleUpdateEnquiry}
              onConvertToQuotation={handleConvertEnquiryToQuotation}
              onConvertToOrder={handleConvertEnquiryToOrder}
              onSelectCustomer={handleSelectCustomerById}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationsView
              quotations={appState.quotations}
              customers={appState.customers}
              products={appState.products}
              company={appState.company}
              onAddQuotation={handleAddQuotation}
              onUpdateStatus={handleUpdateQuotationStatus}
              onSelectCustomer={handleSelectCustomerById}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={appState.orders}
              customers={appState.customers}
              products={appState.products}
              company={appState.company}
              onAddOrder={handleAddOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onSelectCustomer={handleSelectCustomerById}
            />
          )}

          {activeTab === 'follow-ups' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-700" />
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Scheduled Customer Follow-ups ({appState.followUps.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleOpenWhatsAppSystem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open WhatsApp System</span>
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {appState.followUps.map((f) => (
                  <div key={f.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{f.customerName}</div>
                      <div className="text-slate-600 mt-0.5">{f.notes}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Due: {f.followUpDate} {f.followUpTime} • Officer: {f.salesperson}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAppState((prev) => ({
                          ...prev,
                          followUps: prev.followUps.map((item) =>
                            item.id === f.id
                              ? { ...item, status: item.status === 'Completed' ? 'Pending' : 'Completed' }
                              : item
                          ),
                        }))
                      }
                      className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer shrink-0 ${
                        f.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {f.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BarChart3 className="w-5 h-5 text-blue-700" />
                <h2 className="text-lg font-extrabold text-slate-900">Commercial Reports &amp; Analytics</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 font-semibold">Active Steel Products</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {appState.products.length}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="text-blue-800 font-semibold">Total Enquiries</div>
                  <div className="text-2xl font-extrabold text-blue-900 mt-1 tabular-nums">
                    {appState.enquiries.length}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="text-emerald-800 font-semibold">Sales Orders Value</div>
                  <div className="text-2xl font-extrabold text-emerald-900 mt-1 tabular-nums">
                    ₹{(appState.orders.reduce((s, o) => s + o.total, 0) / 100000).toFixed(2)}L
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
                  <div className="text-red-800 font-semibold">Rate Revisions Logged</div>
                  <div className="text-2xl font-extrabold text-red-900 mt-1 tabular-nums">
                    {(appState.rateHistory || []).length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsView
              company={appState.company}
              whatsAppConfig={appState.whatsAppConfig}
              onSaveCompany={handleSaveCompanySettings}
              onSaveWhatsAppConfig={handleSaveWhatsAppConfig}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      <MobileNav
        currentTab={activeTab}
        onSelectTab={handleTabChange}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pendingEnquiriesCount={newEnquiriesCount}
        company={appState.company}
        authUser={authUser}
        onOpenWhatsAppSystem={handleOpenWhatsAppSystem}
      />

      <PostGeneratorModal
        update={postModalUpdate || appState.dailyUpdates[0]}
        company={appState.company}
        products={appState.products}
        commonProductImages={appState.commonProductImages || []}
        gradeBasicRates={appState.gradeBasicRates}
        categoryBasicRates={appState.categoryBasicRates}
        onSaveCommonProductImages={(imgs) => {
          setAppState((prev) => ({ ...prev, commonProductImages: imgs }));
          StorageService.saveCommonProductImages(imgs);
        }}
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onNavigateToWhatsAppCenter={() => {
          setIsPostModalOpen(false);
          handleOpenWhatsAppSystem();
        }}
        onOpenSendTest={(u) => handleOpenSendTestWhatsApp(u)}
      />

      {isSendTestModalOpen && (
        <SendTestWhatsAppModal
          isOpen={isSendTestModalOpen}
          onClose={() => setIsSendTestModalOpen(false)}
          update={testModalUpdate || appState.dailyUpdates[0]}
          company={appState.company}
        />
      )}

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductDetailOpen}
        onClose={() => setIsProductDetailOpen(false)}
        onEdit={handleEditProduct}
        onQuickUpdatePrice={handleQuickUpdateProductPrice}
      />

      <ProductFormModal
        product={editingProduct}
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSave={handleSaveProduct}
      />

      <DailyUpdateFormModal
        products={appState.products}
        isOpen={isDailyUpdateFormOpen}
        onClose={() => setIsDailyUpdateFormOpen(false)}
        onSave={handleSaveDailyUpdate}
        onUpdateSectionPrices={handleUpdateSectionPrices}
      />

      <CustomerFormModal
        customer={editingCustomer}
        isOpen={isCustomerFormOpen}
        onClose={() => setIsCustomerFormOpen(false)}
        onSave={handleSaveCustomer}
        availableProducts={appState.products.map((p: Product) => `${p.name} ${p.grade}`)}
      />
    </div>
  );
}
