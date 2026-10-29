import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ShieldCheck,
  Clock,
  Users,
  Plus,
  Trash2,
  Edit3,
  X,
  Upload,
  AlertTriangle,
  Image as ImageIcon,
  Search,
} from 'lucide-react';
import {
  Product,
  Customer,
  CompanySettings,
  CategoryBasicRates,
  CompanyGradeBasicRates,
  RateChargesConfig,
  RateHistoryRecord,
  NanoBananaPostType,
  NanoBananaGeneratedPost,
  WhatsAppMessageRecord,
  ActiveTab,
  UserFestival,
} from '../types';
import {
  NanoBananaPostService,
  NANO_BANANA_POST_TYPES,
  NANO_BANANA_VARIATIONS,
} from '../services/nanoBananaPostService';
import { StorageService, DEFAULT_SYSTEM_FESTIVALS } from '../services/storageService';
import { WhatsAppService } from '../services/whatsappService';
import { NavDurgaLogo } from './NavDurgaLogo';
import { FestivalHeader, FestivalSelector } from './FestivalHeader';
import { calculateSimpleFinalRate, normalizeGrade } from '../utils/rateCalculator';

interface AIPostGeneratorViewProps {
  products: Product[];
  customers: Customer[];
  company: CompanySettings;
  categoryBasicRates?: CategoryBasicRates;
  gradeBasicRates?: CompanyGradeBasicRates;
  rateCharges?: RateChargesConfig;
  onSaveRates?: (
    updatedProducts: Product[],
    newHistory: RateHistoryRecord[],
    newCharges?: RateChargesConfig,
    updatedGradeBasicRates?: CompanyGradeBasicRates,
    updatedCategoryBasicRates?: CategoryBasicRates
  ) => void;
  onLogWhatsAppMessage?: (record: WhatsAppMessageRecord) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const AIPostGeneratorView: React.FC<AIPostGeneratorViewProps> = ({
  products,
  customers,
  company,
  categoryBasicRates,
  gradeBasicRates,
  rateCharges,
  onSaveRates,
  onLogWhatsAppMessage,
  onNavigateTab,
}) => {
  // Post Selection: 1. Medium + SL Base Rate, 2. All Medium + SL Products, 3. Festival + Product
  const [selectedPostType, setSelectedPostType] = useState<NanoBananaPostType>('base-rate');
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Aspect Ratio Selection: 1:1 Square (WhatsApp/Social) or 4:5 Portrait (Instagram)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '4:5'>('1:1');

  // Design Variation selector (Auto or user-selected specific theme)
  const [preferredVariationId, setPreferredVariationId] = useState<string>('auto');

  // Spotlight Product selection
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  // Custom Post options
  const [customHeadline, setCustomHeadline] = useState<string>('SPECIAL EX-WORKS MILL RATE BULLETIN');
  const [customNote, setCustomNote] = useState<string>('Ready stock available for immediate trailer dispatch from Urla, Raipur.');

  // Natural Language AI Post Editor State
  const [aiInstructionText, setAiInstructionText] = useState<string>('');

  // User-created Festivals Management (Festival Name input & prompt)
  const [selectedFestivalTitle, setSelectedFestivalTitle] = useState<string>('Holi');
  const [festivalSearchQuery, setFestivalSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>('English');
  const [includePricingInFestival, setIncludePricingInFestival] = useState<boolean>(true);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const activeFestivalName = useMemo(() => {
    if (!selectedFestivalTitle) return '';
    const clean = selectedFestivalTitle.trim();
    const lower = clean.toLowerCase();
    if (
      lower === '' ||
      lower === 'no festival' ||
      lower === 'none' ||
      lower === 'normal day' ||
      lower === 'no festival / normal day'
    ) {
      return '';
    }
    return clean;
  }, [selectedFestivalTitle]);

  const ALL_OCCASIONS = useMemo(
    () => [
      'No Festival / Normal Day',
      'Holi',
      'Diwali',
      'Dhanteras',
      'Govardhan Puja',
      'Bhai Dooj',
      'Dussehra',
      'Navratri',
      'Maha Navami',
      'Ganesh Chaturthi',
      'Raksha Bandhan',
      'Janmashtami',
      'Ram Navami',
      'Hanuman Jayanti',
      'Makar Sankranti',
      'Pongal',
      'Onam',
      'Maha Shivratri',
      'Akshaya Tritiya',
      'Guru Purnima',
      'Karwa Chauth',
      'Chhath Puja',
      'Basant Panchami',
      'Ugadi',
      'Gudi Padwa',
      'Baisakhi',
      'Bihu',
      'Christmas',
      'Eid',
      'Eid al-Adha',
      'Muharram',
      'Milad-un-Nabi',
      'Buddha Purnima',
      'Mahavir Jayanti',
      'Guru Nanak Jayanti',
      "Engineers' Day",
      "Teachers' Day",
      'Republic Day',
      'Independence Day',
      'Vishwakarma Puja',
      'Labor Day',
      'New Year',
    ],
    []
  );

  const filteredOccasions = useMemo(() => {
    const q = festivalSearchQuery.trim().toLowerCase();
    if (!q) return ALL_OCCASIONS;
    return ALL_OCCASIONS.filter((occ) => occ.toLowerCase().includes(q));
  }, [ALL_OCCASIONS, festivalSearchQuery]);

  const SUGGESTED_FESTIVALS = [
    'Diwali',
    'Dussehra',
    'Navratri',
    'Ganesh Chaturthi',
    'Makar Sankranti',
    'Holi',
    'Independence Day',
    'Republic Day',
    'Akshaya Tritiya',
    'New Year',
    'Christmas',
    'Eid',
    'Raksha Bandhan',
  ];

  const [festivalSectionFilter, setFestivalSectionFilter] = useState<
    'ALL' | 'MEDIUM' | 'SL' | 'CUSTOM'
  >('ALL');
  const [selectedCustomProductIds, setSelectedCustomProductIds] = useState<string[]>(() =>
    products.slice(0, 6).map((p) => p.id)
  );

  // Quick Inline ERP Rate Updater state (syncs directly with ERP pricing engine)
  const [showQuickRateEditor, setShowQuickRateEditor] = useState<boolean>(false);
  const [quickMediumRate, setQuickMediumRate] = useState<string>(
    String(categoryBasicRates?.['MEDIUM SECTION'] ?? 49711)
  );
  const [quickSlRate, setQuickSlRate] = useState<string>(
    String(
      gradeBasicRates?.['NAVDURGA ISPAT PVT. LTD.']?.SL ??
        categoryBasicRates?.['MEDIUM SECTION'] ??
        49711
    )
  );
  const [quickLightRate, setQuickLightRate] = useState<string>(
    String(categoryBasicRates?.['LIGHT SECTION'] ?? 42211)
  );
  const [rateUpdateToast, setRateUpdateToast] = useState<string | null>(null);

  // Sync quick rate inputs when external ERP rates change
  useEffect(() => {
    const med = categoryBasicRates?.['MEDIUM SECTION'] ?? 49711;
    const light = categoryBasicRates?.['LIGHT SECTION'] ?? 42211;
    const sl = gradeBasicRates?.['NAVDURGA ISPAT PVT. LTD.']?.SL ?? med;
    setQuickMediumRate(String(med));
    setQuickSlRate(String(sl));
    setQuickLightRate(String(light));
  }, [categoryBasicRates, gradeBasicRates]);

  // Generation state & history
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<NanoBananaGeneratedPost | null>(null);
  const [postHistory, setPostHistory] = useState<NanoBananaGeneratedPost[]>(() =>
    NanoBananaPostService.getGeneratedPostsHistory()
  );
  const [showRawAiImage, setShowRawAiImage] = useState<boolean>(false);
  const [showPromptInspector, setShowPromptInspector] = useState<boolean>(false);
  const [showVerifiedDataTable, setShowVerifiedDataTable] = useState<boolean>(false);

  // WhatsApp Sharing state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [shareStatusMsg, setShareStatusMsg] = useState<string | null>(null);

  // Compute live verified ERP items for current selection
  const verifiedData = useMemo(() => {
    return NanoBananaPostService.getVerifiedItemsForPostType({
      postType: selectedPostType,
      products,
      categoryBasicRates,
      gradeBasicRates,
      selectedProductId,
      selectedCustomProductIds,
      festivalSectionFilter,
      effectiveDate,
    });
  }, [
    selectedPostType,
    products,
    categoryBasicRates,
    gradeBasicRates,
    selectedProductId,
    selectedCustomProductIds,
    festivalSectionFilter,
    effectiveDate,
  ]);

  // Generate post automatically when configuration or ERP rates change (using local studio engine)
  useEffect(() => {
    let isMounted = true;
    const triggerReactive = async () => {
      setIsGenerating(true);
      try {
        const post = await NanoBananaPostService.generateNewPost({
          postType: selectedPostType,
          products,
          company,
          categoryBasicRates,
          gradeBasicRates,
          selectedProductId,
          selectedCustomProductIds,
          festivalName: activeFestivalName,
          festivalSectionFilter,
          customHeadline,
          customNote,
          preferredVariationId,
          effectiveDate,
          skipRemoteApi: true,
        });
        if (isMounted) {
          setCurrentPost(post);
          setPostHistory(NanoBananaPostService.getGeneratedPostsHistory());
        }
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    };
    triggerReactive();
    return () => {
      isMounted = false;
    };
  }, [
    selectedPostType,
    products,
    categoryBasicRates,
    gradeBasicRates,
    selectedProductId,
    selectedCustomProductIds,
    activeFestivalName,
    festivalSectionFilter,
    customHeadline,
    customNote,
    preferredVariationId,
    effectiveDate,
  ]);

  // Handler: Generate New Post / Festival Creative (Powered by Gemini AI)
  const handleGenerateNewPost = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setShowRawAiImage(false);
    try {
      const post = await NanoBananaPostService.generateNewPost({
        postType: selectedPostType,
        products,
        company,
        categoryBasicRates,
        gradeBasicRates,
        selectedProductId,
        selectedCustomProductIds,
        festivalName: activeFestivalName,
        language: selectedLanguage,
        aspectRatio: selectedAspectRatio,
        includePricing: includePricingInFestival,
        festivalSectionFilter,
        customHeadline,
        customNote,
        preferredVariationId,
        effectiveDate,
      });
      setCurrentPost(post);
      setPostHistory(NanoBananaPostService.getGeneratedPostsHistory());
      setShareStatusMsg(`Generated fresh "${post.variationName}" creative with Gemini AI!`);
      setTimeout(() => setShareStatusMsg(null), 4000);
    } catch (err: any) {
      console.error('Gemini AI generation error:', err);
      setGenerationError('Creative generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Apply Natural Language AI Instruction (Medium + SL Base Rate)
  const handleApplyAiInstruction = async () => {
    const text = aiInstructionText.trim();
    if (!text) return;

    setIsGenerating(true);
    setGenerationError(null);
    setShowRawAiImage(false);

    try {
      const lower = text.toLowerCase();

      // Festival Detection in Natural Language Prompt
      let festivalToUse = '';
      if (lower.includes('holi') || lower.includes('dhuleti') || lower.includes('rang')) {
        festivalToUse = 'Happy Holi';
      } else if (lower.includes('diwali') || lower.includes('deepawali') || lower.includes('deepavali') || lower.includes('dhanteras')) {
        festivalToUse = 'Happy Diwali';
      } else if (lower.includes('ganesh') || lower.includes('ganpati') || lower.includes('bappa') || lower.includes('vinayak')) {
        festivalToUse = 'Happy Ganesh Chaturthi';
      } else if (lower.includes('navratri') || lower.includes('durga') || lower.includes('garba')) {
        festivalToUse = 'Shubh Navratri';
      } else if (lower.includes('dussehra') || lower.includes('vijayadashami')) {
        festivalToUse = 'Happy Dussehra';
      } else if (lower.includes('sankranti') || lower.includes('pongal') || lower.includes('lohri')) {
        festivalToUse = 'Happy Makar Sankranti';
      } else if (lower.includes('independence') || lower.includes('republic') || lower.includes('tiranga') || lower.includes('flag')) {
        festivalToUse = 'Happy Independence Day';
      } else if (lower.includes('christmas')) {
        festivalToUse = 'Merry Christmas';
      } else if (lower.includes('new year')) {
        festivalToUse = 'Happy New Year';
      } else if (lower.includes('eid')) {
        festivalToUse = 'Eid Mubarak';
      } else if (lower.includes('raksha bandhan') || lower.includes('rakhi')) {
        festivalToUse = 'Happy Raksha Bandhan';
      } else if (lower.includes('akshaya tritiya')) {
        festivalToUse = 'Happy Akshaya Tritiya';
      } else {
        // Rule: If user does NOT mention a festival, keep normal message: "Wishing you a very happy and productive day."
        festivalToUse = '';
      }

      // Explicit Custom Rates Parsing from Prompt (e.g. "Medium ₹52,000 and SL ₹45,000")
      let overrideMedium: number | undefined = undefined;
      let overrideSl: number | undefined = undefined;

      const medMatch = lower.match(/(?:medium|med)\s*(?:rate|price|section)?\s*[:\=]?\s*₹?\s*(\d{2,3}[,\s]?\d{3})/i);
      if (medMatch && medMatch[1]) {
        const val = parseInt(medMatch[1].replace(/,/g, ''), 10);
        if (val > 10000 && val < 200000) overrideMedium = val;
      }

      const slMatch = lower.match(/(?:sl|light)\s*(?:rate|price|section)?\s*[:\=]?\s*₹?\s*(\d{2,3}[,\s]?\d{3})/i);
      if (slMatch && slMatch[1]) {
        const val = parseInt(slMatch[1].replace(/,/g, ''), 10);
        if (val > 10000 && val < 200000) overrideSl = val;
      }

      if (festivalToUse) {
        setSelectedFestivalTitle(festivalToUse);
      }

      const post = await NanoBananaPostService.generateNewPost({
        postType: 'base-rate',
        products,
        company,
        categoryBasicRates,
        gradeBasicRates,
        festivalName: festivalToUse,
        effectiveDate,
        overrideMediumRate: overrideMedium,
        overrideSlRate: overrideSl,
      });

      setCurrentPost(post);
      setPostHistory(NanoBananaPostService.getGeneratedPostsHistory());
      setShareStatusMsg(
        festivalToUse
          ? `AI updated poster for ${festivalToUse} with verified rates!`
          : 'AI updated poster with requested instruction!'
      );
      setTimeout(() => setShareStatusMsg(null), 4000);
    } catch (err: any) {
      console.error('AI instruction generation error:', err);
      setGenerationError('Failed to apply AI instruction. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Apply Quick ERP Basic Rate Update (Medium / SL / Light)
  const handleApplyQuickErpRateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveRates) return;

    const newMed = Number(quickMediumRate) || 49711;
    const newSl = Number(quickSlRate) || newMed;
    const newLight = Number(quickLightRate) || 42211;
    const today = effectiveDate;

    const updatedCategoryBasicRates: CategoryBasicRates = {
      ...categoryBasicRates,
      'MEDIUM SECTION': newMed,
      'LIGHT SECTION': newLight,
    };

    const updatedGradeBasicRates: CompanyGradeBasicRates = {
      ...gradeBasicRates,
      'NAVDURGA ISPAT PVT. LTD.': {
        ...(gradeBasicRates?.['NAVDURGA ISPAT PVT. LTD.'] || {}),
        Medium: newMed,
        SL: newSl,
      },
      'UNIT-2 - NS ISPAT (I) PVT. LTD.': {
        ...(gradeBasicRates?.['UNIT-2 - NS ISPAT (I) PVT. LTD.'] || {}),
        Medium: newLight,
        SL: newLight,
        '5 KG': newLight,
        '8 KG': newLight,
      },
    };

    const newHistory: RateHistoryRecord[] = [];
    const updatedProducts = products.map((p) => {
      const normG = normalizeGrade(p.grade || p.gaugeType);
      const isLightSec =
        p.section === 'LIGHT SECTION' || p.rateSource?.includes('NS ISPAT');

      let applicableBasic = newMed;
      if (isLightSec) {
        applicableBasic = newLight;
      } else if (normG === 'SL') {
        applicableBasic = newSl;
      } else {
        applicableBasic = newMed;
      }

      const gaugeDiff = Number(p.gaugeDifference) || 0;
      const finalRate = calculateSimpleFinalRate(applicableBasic, gaugeDiff);
      const prevPrice = p.currentPrice || finalRate;
      const diff = finalRate - prevPrice;

      if (diff !== 0) {
        newHistory.push({
          id: `rh-${Date.now()}-${p.id}`,
          date: today,
          effectiveFrom: today,
          rateSource: p.rateSource || 'NAVDURGA ISPAT PVT. LTD.',
          productId: p.id,
          productCategory: p.productCategory || p.category,
          productName: p.productName || p.name,
          size: p.size || '',
          gaugeType: normG,
          grade: normG,
          section: p.section,
          baseRate: applicableBasic,
          gaugeDifference: gaugeDiff,
          loadingCharge: 0,
          insuranceCharge: 0,
          otherCharges: 0,
          previousRate: prevPrice,
          finalRate,
          priceDifference: diff,
          updatedBy: 'Admin',
          timestamp: new Date().toISOString(),
        });
      }

      return {
        ...p,
        baseRate: applicableBasic,
        gaugeDifference: gaugeDiff,
        finalRate,
        currentPrice: finalRate,
        previousPrice: prevPrice,
        priceChange: diff,
        effectiveFrom: today,
        priceHistory: [
          {
            date: today,
            price: finalRate,
            changeReason: `ERP Basic Rate updated (Basic: ₹${applicableBasic.toLocaleString('en-IN')} + Gauge Diff: ₹${gaugeDiff.toLocaleString('en-IN')})`,
          },
          ...(p.priceHistory || []),
        ],
      };
    });

    onSaveRates(
      updatedProducts,
      newHistory,
      rateCharges,
      updatedGradeBasicRates,
      updatedCategoryBasicRates
    );

    setRateUpdateToast(
      `ERP Rates Updated! Medium Base Rate: ₹${newMed.toLocaleString('en-IN')}/MT, SL Base Rate: ₹${newSl.toLocaleString('en-IN')}/MT. Post automatically refreshed.`
    );
    setShowQuickRateEditor(false);
    setTimeout(() => setRateUpdateToast(null), 4500);
  };

  // Download Generated Post Image
  const handleDownloadImage = () => {
    if (!currentPost) return;
    const dataUrl =
      showRawAiImage && currentPost.rawAiImageDataUrl
        ? currentPost.rawAiImageDataUrl
        : currentPost.imageDataUrl;
    const link = document.createElement('a');
    link.download = `NavDurga_${currentPost.postType}_${currentPost.effectiveDate}_${currentPost.seed % 10000}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShareStatusMsg('Post image downloaded (PNG)!');
    setTimeout(() => setShareStatusMsg(null), 3500);
  };

  // Copy WhatsApp Caption
  const handleCopyCaption = async () => {
    if (!currentPost) return;
    try {
      await navigator.clipboard.writeText(currentPost.whatsappCaption);
      setCopiedCaption(true);
      setShareStatusMsg('WhatsApp caption copied to clipboard!');
      setTimeout(() => setCopiedCaption(false), 2500);
      setTimeout(() => setShareStatusMsg(null), 3500);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  // Primary Action: Share on WhatsApp
  const handleShareOnWhatsApp = async (targetCustomer?: Customer) => {
    if (!currentPost) return;

    const dataUrl =
      showRawAiImage && currentPost.rawAiImageDataUrl
        ? currentPost.rawAiImageDataUrl
        : currentPost.imageDataUrl;

    if (!targetCustomer && typeof navigator !== 'undefined' && navigator.share) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File(
          [blob],
          `NavDurga_${currentPost.postType}_${currentPost.effectiveDate}.png`,
          { type: 'image/png' }
        );
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: currentPost.title,
            text: currentPost.whatsappCaption,
            files: [file],
          });
          setShareStatusMsg('Shared post image & caption via system share!');
          setTimeout(() => setShareStatusMsg(null), 4000);
          return;
        }
      } catch {
        // Fallback to WhatsApp Web URL + image download
      }
    }

    handleDownloadImage();
    const phone = targetCustomer ? targetCustomer.whatsapp || targetCustomer.mobile : '';
    const waUrl = WhatsAppService.buildWhatsAppWebUrl(phone, currentPost.whatsappCaption);
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    if (targetCustomer && onLogWhatsAppMessage) {
      onLogWhatsAppMessage({
        id: `msg-${Date.now()}`,
        customerId: targetCustomer.id,
        customerName: targetCustomer.companyName,
        whatsappNumber: phone,
        type: 'sent',
        message: currentPost.whatsappCaption,
        imageUrl: dataUrl,
        timestamp: new Date().toISOString(),
        status: 'sent',
        source: 'manual',
        context: `AI Post Generator: ${currentPost.postTypeLabel}`,
      });
    }

    setShareStatusMsg(
      targetCustomer
        ? `Opened WhatsApp for ${targetCustomer.companyName} & downloaded post image!`
        : 'Opened WhatsApp Web with caption & downloaded post image!'
    );
    setTimeout(() => setShareStatusMsg(null), 4500);
  };

  const toggleCustomProduct = (id: string) => {
    setSelectedCustomProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="space-y-6">
      {/* MODULE HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <NavDurgaLogo size="lg" withCard className="shrink-0 hidden sm:inline-flex" priority />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                AI Post Generator
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-extrabold border border-indigo-300">
                Gemini AI
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                ERP Verified Pricing
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create professional festival creatives &amp; daily price posts powered by Gemini AI
            </p>
          </div>
        </div>

        {/* Live ERP Benchmark Rates Pill Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold">MEDIUM BASE RATE: </span>
            <strong className="font-mono font-black text-blue-700">
              ₹{verifiedData.mediumBasicRate.toLocaleString('en-IN')} / MT
            </strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold">SL BASE RATE: </span>
            <strong className="font-mono font-black text-amber-700">
              ₹{verifiedData.slBasicRate.toLocaleString('en-IN')} / MT
            </strong>
          </div>

          <button
            type="button"
            onClick={() => setShowQuickRateEditor(!showQuickRateEditor)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Update ERP Base Rates</span>
          </button>
        </div>
      </div>

      {/* QUICK ERP BASIC RATE UPDATER BAR */}
      {showQuickRateEditor && (
        <form
          onSubmit={handleApplyQuickErpRateUpdate}
          className="bg-blue-50/90 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Quick ERP Base Rate Update (Single Source of Truth)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Updating Base Rates here immediately recalculates{' '}
                <strong className="text-slate-900">Final Rate = Base Rate + Gauge Difference</strong>{' '}
                across all ERP products and refreshes the AI Post Generator.
              </p>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('daily-rates')}
                className="text-xs font-bold text-blue-700 hover:underline self-start sm:self-auto"
              >
                Open Full Daily Rate Card →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                MEDIUM BASE RATE (₹/MT)
              </label>
              <input
                type="number"
                value={quickMediumRate}
                onChange={(e) => setQuickMediumRate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                SL BASE RATE (₹/MT)
              </label>
              <input
                type="number"
                value={quickSlRate}
                onChange={(e) => setQuickSlRate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Light Section Base Rate (₹/MT)
              </label>
              <input
                type="number"
                value={quickLightRate}
                onChange={(e) => setQuickLightRate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Save &amp; Recalculate ERP Rates
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickMediumRate('49711');
                  setQuickSlRate('49711');
                  setQuickLightRate('42211');
                }}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 cursor-pointer"
                title="Restore default factory base rates (₹49,711/MT)"
              >
                Restore Defaults
              </button>
              <button
                type="button"
                onClick={() => setShowQuickRateEditor(false)}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {rateUpdateToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{rateUpdateToast}</span>
        </div>
      )}

      {/* MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (5 COLS): POST CONFIGURATION & ERP DATA SOURCE */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Post Configuration</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                ERP Pricing Mode
              </span>
            </h2>

            {/* SELECT POST CONFIGURATION OPTION: 1. Base Rate | 2. All Product | 3. Festival + Price Update */}
            <div>
              <label
                htmlFor="post-type-select"
                className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Select Post Type
              </label>
              <select
                id="post-type-select"
                value={selectedPostType}
                onChange={(e) => setSelectedPostType(e.target.value as NanoBananaPostType)}
                className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all cursor-pointer"
              >
                {NANO_BANANA_POST_TYPES.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {NANO_BANANA_POST_TYPES.find((t) => t.id === selectedPostType)?.shortDesc}
              </p>
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Effective Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* PRODUCT SPOTLIGHT CONTROLS */}
            {selectedPostType === 'product-update' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800">
                  Select ERP Product to Spotlight
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl"
                >
                  {products.map((p) => {
                    const item = NanoBananaPostService.computeVerifiedProductItem(
                      p,
                      categoryBasicRates,
                      gradeBasicRates,
                      effectiveDate
                    );
                    return (
                      <option key={p.id} value={p.id}>
                        {item.productName} {item.size} ({item.grade}) — Final: ₹
                        {item.finalRate.toLocaleString('en-IN')}/MT
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* BASE RATE FESTIVAL CONTROL & LIVE ERP PRICING SUMMARY */}
            {selectedPostType === 'base-rate' && (
              <div className="space-y-4">
                {/* FESTIVAL / SPECIAL DAY SEARCHABLE DROPDOWN CONTROL */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Select Festival / Special Day</span>
                    </label>
                    {activeFestivalName && (
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        Active Festive Theme
                      </span>
                    )}
                  </div>

                  {/* SEARCH INPUT FIELD & DROPDOWN */}
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={festivalSearchQuery}
                        onChange={(e) => {
                          setFestivalSearchQuery(e.target.value);
                          setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        placeholder="🔍 Search festival or special day (e.g. Holi, Diwali, Engineers' Day)..."
                        className="w-full pl-9 pr-8 py-2.5 text-xs font-bold text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 cursor-text"
                      />
                      {festivalSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setFestivalSearchQuery('');
                            setIsSearchOpen(true);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-extrabold text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* SEARCH FILTER DROPDOWN MENU */}
                    {isSearchOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border-2 border-slate-300 rounded-xl shadow-lg p-1 space-y-0.5">
                        {filteredOccasions.length > 0 ? (
                          filteredOccasions.map((occ) => {
                            const isSelected =
                              (occ === 'No Festival / Normal Day' && !activeFestivalName) ||
                              (activeFestivalName.toLowerCase() === occ.toLowerCase());
                            return (
                              <button
                                key={occ}
                                type="button"
                                onClick={() => {
                                  if (occ === 'No Festival / Normal Day') {
                                    setSelectedFestivalTitle('');
                                  } else {
                                    setSelectedFestivalTitle(occ);
                                  }
                                  setFestivalSearchQuery('');
                                  setIsSearchOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-blue-600 text-white font-black'
                                    : 'text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                <span>{occ}</span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-2 text-xs font-medium text-slate-500 italic">
                            No matching festival found. Type custom name or select below.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CURRENTLY SELECTED OCCASION DISPLAY */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-xs font-extrabold text-slate-700">
                        Selected Occasion:
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-black border border-amber-300 ml-1">
                          {activeFestivalName ? `🎉 ${activeFestivalName}` : '🏢 Normal Day (No Festival)'}
                        </span>
                      </div>

                      {activeFestivalName && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFestivalTitle('');
                            setFestivalSearchQuery('');
                          }}
                          className="text-[11px] font-extrabold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                        >
                          Clear (Normal Day)
                        </button>
                      )}
                    </div>

                    {/* QUICK POPULAR OCCASION CHIPS */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Popular:</span>
                      {['Normal Day', 'Holi', 'Diwali', "Engineers' Day", 'Republic Day', 'Dussehra'].map((chip) => {
                        const isChipSelected =
                          (chip === 'Normal Day' && !activeFestivalName) ||
                          (activeFestivalName.toLowerCase() === chip.toLowerCase());
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setSelectedFestivalTitle(chip === 'Normal Day' ? '' : chip);
                              setFestivalSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              isChipSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                            }`}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* GENERATE / REFRESH POSTER BUTTON */}
                  <button
                    type="button"
                    onClick={handleGenerateNewPost}
                    disabled={isGenerating}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    )}
                    <span>
                      {isGenerating
                        ? 'Rendering Festival Poster...'
                        : activeFestivalName
                        ? `Generate ${activeFestivalName} Poster`
                        : 'Generate Normal Rate Poster'}
                    </span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Verified ERP Base Rate Output (No Individual Product List)
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    NAV DURGA ISPAT PRIVATE LIMITED
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-600">
                    Effective Date: {effectiveDate}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 rounded-xl bg-white border border-blue-200">
                      <div className="text-[10px] font-extrabold uppercase text-slate-500">
                        MEDIUM BASE RATE
                      </div>
                      <div className="text-base font-mono font-black text-blue-700 mt-0.5">
                        ₹{verifiedData.mediumBasicRate.toLocaleString('en-IN')} / MT
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-amber-200">
                      <div className="text-[10px] font-extrabold uppercase text-slate-500">
                        SL BASE RATE
                      </div>
                      <div className="text-base font-mono font-black text-amber-700 mt-0.5">
                        ₹{verifiedData.slBasicRate.toLocaleString('en-IN')} / MT
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. FESTIVAL CREATIVE CONTROLS (GEMINI AI) */}
            {selectedPostType === 'festival-price-update' && (
              <div className="space-y-3.5">
                {/* SEARCHABLE FESTIVAL / SPECIAL DAY SELECTOR */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Select Festival / Special Day</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
                      Powered by Gemini AI
                    </span>
                  </div>

                  {/* SEARCH INPUT FIELD & DROPDOWN */}
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={festivalSearchQuery}
                        onChange={(e) => {
                          setFestivalSearchQuery(e.target.value);
                          setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        placeholder="🔍 Search festival or special day (e.g. Holi, Diwali, Engineers' Day)..."
                        className="w-full pl-9 pr-8 py-2.5 text-xs font-bold text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 cursor-text"
                      />
                      {festivalSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setFestivalSearchQuery('');
                            setIsSearchOpen(true);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-extrabold text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* SEARCH FILTER DROPDOWN MENU */}
                    {isSearchOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border-2 border-slate-300 rounded-xl shadow-lg p-1 space-y-0.5">
                        {filteredOccasions.length > 0 ? (
                          filteredOccasions.map((occ) => {
                            const isSelected =
                              (occ === 'No Festival / Normal Day' && !activeFestivalName) ||
                              (activeFestivalName.toLowerCase() === occ.toLowerCase());
                            return (
                              <button
                                key={occ}
                                type="button"
                                onClick={() => {
                                  if (occ === 'No Festival / Normal Day') {
                                    setSelectedFestivalTitle('');
                                  } else {
                                    setSelectedFestivalTitle(occ);
                                  }
                                  setFestivalSearchQuery('');
                                  setIsSearchOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-blue-600 text-white font-black'
                                    : 'text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                <span>{occ}</span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-2 text-xs font-medium text-slate-500 italic">
                            No matching festival found. Type custom name or select below.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CURRENTLY SELECTED OCCASION DISPLAY */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-xs font-extrabold text-slate-700">
                        Selected Occasion:
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-black border border-amber-300 ml-1">
                          {activeFestivalName ? `🎉 ${activeFestivalName}` : '🏢 Normal Day (No Festival)'}
                        </span>
                      </div>

                      {activeFestivalName && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFestivalTitle('');
                            setFestivalSearchQuery('');
                          }}
                          className="text-[11px] font-extrabold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                        >
                          Clear (Normal Day)
                        </button>
                      )}
                    </div>

                    {/* QUICK POPULAR OCCASION CHIPS */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Popular:</span>
                      {['Normal Day', 'Holi', 'Diwali', "Engineers' Day", 'Republic Day', 'Dussehra'].map((chip) => {
                        const isChipSelected =
                          (chip === 'Normal Day' && !activeFestivalName) ||
                          (activeFestivalName.toLowerCase() === chip.toLowerCase());
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setSelectedFestivalTitle(chip === 'Normal Day' ? '' : chip);
                              setFestivalSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              isChipSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                            }`}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LANGUAGE & PRICING CONTROLS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                        Creative Language
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value as 'English' | 'Hindi' | 'Hinglish')}
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Hinglish">Hinglish</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                        Include ERP Pricing
                      </label>
                      <select
                        value={includePricingInFestival ? 'yes' : 'no'}
                        onChange={(e) => setIncludePricingInFestival(e.target.value === 'yes')}
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="yes">Yes — Show Verified ERP Rates</option>
                        <option value="no">No — Brand &amp; Celebration Focus</option>
                      </select>
                    </div>
                  </div>

                  {/* GENERATE / REFRESH POSTER BUTTON */}
                  <button
                    type="button"
                    onClick={handleGenerateNewPost}
                    disabled={isGenerating}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    )}
                    <span>
                      {isGenerating
                        ? 'Rendering Festival Poster...'
                        : activeFestivalName
                        ? `Generate ${activeFestivalName} Poster`
                        : 'Generate Normal Rate Poster'}
                    </span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <label className="block text-xs font-extrabold text-amber-950 mb-1">
                    Products to include with Festival Post
                  </label>
                  <select
                    value={festivalSectionFilter}
                    onChange={(e) =>
                      setFestivalSectionFilter(
                        e.target.value as 'ALL' | 'MEDIUM' | 'SL' | 'CUSTOM'
                      )
                    }
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-amber-300 rounded-xl"
                  >
                    <option value="ALL">All Active ERP Products ({products.length} Products)</option>
                    <option value="MEDIUM">Medium Products Only</option>
                    <option value="SL">SL Products Only</option>
                    <option value="CUSTOM">Select Specific ERP Products...</option>
                  </select>

                  {festivalSectionFilter === 'CUSTOM' && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-amber-950">
                          Selected ERP Products ({selectedCustomProductIds.length})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomProductIds(products.map((p) => p.id))}
                            className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomProductIds([])}
                            className="text-[11px] font-bold text-slate-600 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto bg-white border border-amber-200 rounded-xl p-2 space-y-1">
                        {products.map((p) => {
                          const item = NanoBananaPostService.computeVerifiedProductItem(
                            p,
                            categoryBasicRates,
                            gradeBasicRates,
                            effectiveDate
                          );
                          const checked = selectedCustomProductIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-amber-50/50 text-xs cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleCustomProduct(p.id)}
                                  className="rounded text-blue-600"
                                />
                                <span className="font-bold text-slate-800">
                                  {item.productName} {item.size} ({item.grade})
                                </span>
                              </div>
                              <span className="font-mono font-bold text-blue-700">
                                ₹{item.finalRate.toLocaleString('en-IN')}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CUSTOM PRODUCT POST CONTROLS */}
            {selectedPostType === 'custom-product-post' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Custom Post Headline
                  </label>
                  <input
                    type="text"
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Dispatch / Special Note
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-extrabold text-slate-800">
                      Select ERP Products ({selectedCustomProductIds.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomProductIds(products.map((p) => p.id))}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl p-2 space-y-1">
                    {products.map((p) => {
                      const item = NanoBananaPostService.computeVerifiedProductItem(
                        p,
                        categoryBasicRates,
                        gradeBasicRates,
                        effectiveDate
                      );
                      const checked = selectedCustomProductIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCustomProduct(p.id)}
                              className="rounded text-blue-600"
                            />
                            <span className="font-bold text-slate-800">
                              {item.productName} {item.size} ({item.grade})
                            </span>
                          </div>
                          <span className="font-mono font-bold text-blue-700">
                            ₹{item.finalRate.toLocaleString('en-IN')}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ERROR ALERT IF GENERATION FAILS */}
            {generationError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center justify-between gap-3 shadow-2xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold">{generationError}</div>
                    <div className="text-[10px] text-rose-700 font-medium mt-0.5">
                      Ensure prompt and ERP configuration are set, then try again.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateNewPost}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  Retry Generation
                </button>
              </div>
            )}

            {/* PRIMARY ACTION BUTTON: GENERATE FESTIVAL CREATIVE / POST */}
            <button
              type="button"
              onClick={handleGenerateNewPost}
              disabled={isGenerating}
              className="w-full py-3.5 px-5 rounded-xl text-sm font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Gemini AI is creating your festival creative...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {selectedPostType === 'festival-price-update'
                      ? `Generate "${activeFestivalName}" Creative (Gemini AI)`
                      : 'Generate Post (Gemini AI)'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* VERIFIED ERP PRICING SOURCE OF TRUTH INSPECTOR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>
                    {selectedPostType === 'base-rate'
                      ? 'Verified ERP Base Rates'
                      : `Verified ERP Pricing Data (${verifiedData.items.length} Items)`}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  MEDIUM BASE RATE: <strong>₹{verifiedData.mediumBasicRate.toLocaleString('en-IN')}/MT</strong>{' '}
                  | SL BASE RATE: <strong>₹{verifiedData.slBasicRate.toLocaleString('en-IN')}/MT</strong>
                </p>
              </div>
              {selectedPostType !== 'base-rate' && (
                <button
                  type="button"
                  onClick={() => setShowVerifiedDataTable(!showVerifiedDataTable)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>{showVerifiedDataTable ? 'Hide Table' : 'View Rates'}</span>
                  {showVerifiedDataTable ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {selectedPostType !== 'base-rate' && showVerifiedDataTable && (
              <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold sticky top-0">
                    <tr>
                      <th className="py-2 px-2">S.No</th>
                      <th className="py-2 px-2">Product</th>
                      <th className="py-2 px-2">Size</th>
                      <th className="py-2 px-2 text-right">Gauge Difference</th>
                      <th className="py-2 px-2.5 text-right">Final Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {verifiedData.items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2 font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {it.productName} ({it.grade})
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-700">
                          {it.size}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono text-amber-700 font-semibold">
                          +₹{it.gaugeDifference.toLocaleString('en-IN')}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono font-black text-blue-700">
                          ₹{it.finalRate.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Nano Banana Prompt Inspector */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPromptInspector(!showPromptInspector)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <span>Gemini AI Image Prompt Engine</span>
                {showPromptInspector ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {showPromptInspector && currentPost && (
                <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {currentPost.prompt}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 COLS): GENERATED POST PREVIEW & SIMPLE WHATSAPP SHARING */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            {/* Preview Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Generated Post Preview
                  </h2>
                  {currentPost && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
                      {currentPost.variationName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every click on &ldquo;Generate New Post&rdquo; creates a genuinely new visual concept with verified ERP rates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {currentPost?.rawAiImageDataUrl && (
                  <button
                    type="button"
                    onClick={() => setShowRawAiImage(!showRawAiImage)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 cursor-pointer"
                  >
                    {showRawAiImage ? 'Show Verified ERP Layer' : 'Show Raw AI Backdrop'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleGenerateNewPost}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Fresh Variation</span>
                </button>
              </div>
            </div>

            {/* Feedback Banner */}
            {shareStatusMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{shareStatusMsg}</span>
              </div>
            )}

            {/* Poster Image Preview */}
            <div className="bg-slate-900/5 border border-slate-200 rounded-2xl p-3 flex items-center justify-center min-h-[420px]">
              {currentPost ? (
                <img
                  src={
                    showRawAiImage && currentPost.rawAiImageDataUrl
                      ? currentPost.rawAiImageDataUrl
                      : currentPost.imageDataUrl
                  }
                  alt={currentPost.title}
                  className="max-h-[640px] w-auto object-contain rounded-xl shadow-md border border-slate-300"
                />
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs">
                  Generating post preview...
                </div>
              )}
            </div>

            {/* LIVE ERP DATA VALIDATION INSPECTOR */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    ERP Pricing Data Integrity Verification
                  </span>
                </div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wide">
                  100% ERP Verified Data
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold">
                <div className="flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ERP Medium Base Rate: ₹{verifiedData.mediumBasicRate.toLocaleString('en-IN')}/MT</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ERP SL Base Rate: ₹{verifiedData.slBasicRate.toLocaleString('en-IN')}/MT</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Formula: Final Rate = Basic Rate + Gauge Difference</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Company: NAV DURGA ISPAT PRIVATE LIMITED</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Effective Date: {effectiveDate} Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Single Source of Truth: No Fake Statistics</span>
                </div>
              </div>
            </div>

            {/* PRIMARY WHATSAPP SHARING & DOWNLOAD CONTROLS */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleShareOnWhatsApp()}
                  className="flex-1 min-w-[200px] py-3 px-5 rounded-xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="py-3 px-4 rounded-xl text-xs font-extrabold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download Image</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="py-3 px-4 rounded-xl text-xs font-extrabold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCaption ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                  <span>{copiedCaption ? 'Copied Caption' : 'Copy Caption'}</span>
                </button>
              </div>

              {/* Direct Customer Send Row */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 shrink-0">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Send to Customer:</span>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.name} — {c.whatsapp || c.mobile})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    selectedCustomerObj && handleShareOnWhatsApp(selectedCustomerObj)
                  }
                  className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Customer WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Formatted WhatsApp Caption Preview */}
            {currentPost && (
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Verified WhatsApp Caption Text
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {currentPost.whatsappCaption}
                </div>
              </div>
            )}
          </div>

          {/* RECENT GENERATED POSTS GALLERY */}
          {postHistory.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Recent Generated Posts ({postHistory.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Click any post to load its image &amp; ERP rate snapshot
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {postHistory.slice(0, 4).map((hist) => {
                  const isActive = currentPost?.id === hist.id;
                  return (
                    <button
                      key={hist.id}
                      type="button"
                      onClick={() => setCurrentPost(hist)}
                      className={`text-left p-2 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <img
                        src={hist.imageDataUrl}
                        alt={hist.title}
                        className="w-full h-28 object-cover rounded-lg border border-slate-200 mb-1.5"
                      />
                      <div className="text-[11px] font-bold text-slate-900 truncate">
                        {hist.postTypeLabel}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {hist.variationName}
                      </div>
                      <div className="text-[10px] font-mono text-blue-700 font-bold mt-0.5">
                        Med: ₹{hist.mediumBasicRate.toLocaleString('en-IN')} | SL: ₹{hist.slBasicRate.toLocaleString('en-IN')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
