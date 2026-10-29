import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Users,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import {
  DailyUpdate,
  Customer,
  Product,
  CompanySettings,
  WhatsAppConfig,
  WhatsAppMessageRecord,
  SalesEnquiry,
  WhatsAppOrderEnquiryParsed,
  ActiveTab,
  CategoryBasicRates,
  CompanyGradeBasicRates,
  NanoBananaGeneratedPost,
  NanoBananaPostType,
} from '../types';
import { WhatsAppService } from '../services/whatsappService';
import { AIWhatsAppOrderCard } from './AIWhatsAppOrderCard';
import { parseWhatsAppCustomerMessage } from '../utils/whatsappOrderHelper';
import { NanoBananaPostService } from '../services/nanoBananaPostService';

interface WhatsAppCenterViewProps {
  dailyUpdates: DailyUpdate[];
  customers: Customer[];
  products: Product[];
  company: CompanySettings;
  whatsAppConfig: WhatsAppConfig;
  categoryBasicRates?: CategoryBasicRates;
  gradeBasicRates?: CompanyGradeBasicRates;
  preselectedUpdateId?: string;
  userRole?: 'Admin' | 'Sales' | 'Staff';
  onLogMessage: (record: WhatsAppMessageRecord) => void;
  onCreateEnquiryFromWebhook: (enquiry: SalesEnquiry) => void;
  onNavigateToCustomer: (customerId: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

type ShareContentMode = 'price-update' | 'product-update' | 'ai-generated-post';

export const WhatsAppCenterView: React.FC<WhatsAppCenterViewProps> = ({
  customers,
  products,
  company,
  categoryBasicRates,
  gradeBasicRates,
  onLogMessage,
  onCreateEnquiryFromWebhook,
  onNavigateTab,
}) => {
  // Simple 2-view toggle: 'share' (Simple WhatsApp Sharing) | 'enquiries' (Existing Customer Enquiry/Order Communication)
  const [activeView, setActiveView] = useState<'share' | 'enquiries'>('share');

  // Share Mode: Share Price Update | Share Product Update | Share AI-generated Post
  const [shareMode, setShareMode] = useState<ShareContentMode>('price-update');
  const [priceUpdateScope, setPriceUpdateScope] = useState<
    'medium-price-update' | 'sl-price-update' | 'all-products-price-update'
  >('all-products-price-update');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  // Generated Post & Image Preview State
  const [aiPostsHistory, setAiPostsHistory] = useState<NanoBananaGeneratedPost[]>(() =>
    NanoBananaPostService.getGeneratedPostsHistory()
  );
  const [selectedAiPostId, setSelectedAiPostId] = useState<string>(
    () => NanoBananaPostService.getGeneratedPostsHistory()[0]?.id || ''
  );
  const [livePost, setLivePost] = useState<NanoBananaGeneratedPost | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  // Customer Recipient Filter & Quick Send
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [sentCustomerId, setSentCustomerId] = useState<string | null>(null);

  // Existing Phase 3 Customer Enquiry / Order Communication State
  const [aiOrderSelectedCustomerId, setAiOrderSelectedCustomerId] = useState<string>(
    customers[0]?.id || ''
  );
  const [aiOrderSenderPhone, setAiOrderSenderPhone] = useState<string>(
    customers[0]?.whatsapp || '+91 97521 83053'
  );
  const [aiOrderUseCustomPhone, setAiOrderUseCustomPhone] = useState<boolean>(false);
  const [aiOrderMessage, setAiOrderMessage] = useState<string>(
    'MS Channel 125x65 Medium 20 MT chahiye'
  );
  const [aiOrderParsed, setAiOrderParsed] = useState<WhatsAppOrderEnquiryParsed | null>(() =>
    parseWhatsAppCustomerMessage({
      rawText: 'MS Channel 125x65 Medium 20 MT chahiye',
      senderPhone: customers[0]?.whatsapp || '+91 97521 83053',
      preselectedCustomerId: customers[0]?.id,
      customers,
      products,
      company,
    })
  );

  // Listen for newly generated Nano Banana AI posts
  useEffect(() => {
    const handleNewPost = () => {
      const updated = NanoBananaPostService.getGeneratedPostsHistory();
      setAiPostsHistory(updated);
      if (updated[0]) {
        setSelectedAiPostId(updated[0].id);
      }
    };
    window.addEventListener('navdurga_nano_banana_post_generated', handleNewPost);
    return () =>
      window.removeEventListener('navdurga_nano_banana_post_generated', handleNewPost);
  }, []);

  // Build or select the active post preview whenever shareMode, scope, product, or ERP rates change
  useEffect(() => {
    let isMounted = true;

    const prepareActivePost = async () => {
      if (shareMode === 'ai-generated-post') {
        const history = NanoBananaPostService.getGeneratedPostsHistory();
        setAiPostsHistory(history);
        const found =
          history.find((p) => p.id === selectedAiPostId) || history[0] || null;
        if (found) {
          if (isMounted) setLivePost(found);
          return;
        }
      }

      setIsGeneratingImage(true);
      try {
        const targetPostType: NanoBananaPostType =
          shareMode === 'product-update'
            ? 'product-update'
            : shareMode === 'price-update'
            ? priceUpdateScope
            : 'all-products-price-update';

        const generated = await NanoBananaPostService.generateNewPost({
          postType: targetPostType,
          products,
          company,
          categoryBasicRates,
          gradeBasicRates,
          selectedProductId,
          skipRemoteApi: true,
        });
        if (isMounted) {
          setLivePost(generated);
          setAiPostsHistory(NanoBananaPostService.getGeneratedPostsHistory());
        }
      } finally {
        if (isMounted) setIsGeneratingImage(false);
      }
    };

    prepareActivePost();
    return () => {
      isMounted = false;
    };
  }, [
    shareMode,
    priceUpdateScope,
    selectedProductId,
    selectedAiPostId,
    products,
    categoryBasicRates,
    gradeBasicRates,
    company,
  ]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.whatsapp || c.mobile || '').includes(q)
    );
  }, [customers, customerSearch]);

  // Download generated image
  const handleDownloadImage = () => {
    if (!livePost) return;
    const link = document.createElement('a');
    link.download = `NavDurga_WhatsApp_${livePost.postType}_${livePost.effectiveDate}.png`;
    link.href = livePost.imageDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusFeedback('Generated post image downloaded!');
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  // Copy WhatsApp message text
  const handleCopyMessage = async () => {
    if (!livePost) return;
    try {
      await navigator.clipboard.writeText(livePost.whatsappCaption);
      setCopied(true);
      setStatusFeedback('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setStatusFeedback(null), 3500);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  // Primary Action: Share on WhatsApp (General or to Specific Customer)
  const handleShareOnWhatsApp = async (customer?: Customer) => {
    if (!livePost) return;

    // If no specific customer is targeted, try native Web Share with image file first
    if (!customer && typeof navigator !== 'undefined' && navigator.share) {
      try {
        const res = await fetch(livePost.imageDataUrl);
        const blob = await res.blob();
        const file = new File(
          [blob],
          `NavDurga_${livePost.postType}_${livePost.effectiveDate}.png`,
          { type: 'image/png' }
        );
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: livePost.title,
            text: livePost.whatsappCaption,
            files: [file],
          });
          setStatusFeedback('Shared image and message on WhatsApp!');
          setTimeout(() => setStatusFeedback(null), 4000);
          return;
        }
      } catch {
        // Fallback to WhatsApp Web intent + image download
      }
    }

    // Download image so user can attach it + open WhatsApp / WhatsApp Web
    handleDownloadImage();
    const phone = customer ? customer.whatsapp || customer.mobile : '';
    const url = WhatsAppService.buildWhatsAppWebUrl(phone, livePost.whatsappCaption);
    window.open(url, '_blank', 'noopener,noreferrer');

    if (customer) {
      onLogMessage({
        id: `msg-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.companyName,
        whatsappNumber: phone,
        type: 'sent',
        message: livePost.whatsappCaption,
        imageUrl: livePost.imageDataUrl,
        timestamp: new Date().toISOString(),
        status: 'sent',
        source: 'manual',
        context: livePost.postTypeLabel,
      });
      setSentCustomerId(customer.id);
      setTimeout(() => setSentCustomerId(null), 3000);
    }

    setStatusFeedback(
      customer
        ? `Opened WhatsApp for ${customer.companyName} & downloaded post image to attach.`
        : 'Opened WhatsApp Web with message & downloaded post image to attach.'
    );
    setTimeout(() => setStatusFeedback(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* CLEAN HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            WhatsApp Sharing &amp; Communication
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Share verified ERP price updates, product updates, and Nano Banana AI posts on WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('share')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'share'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('enquiries')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'enquiries'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Customer Enquiries &amp; Orders</span>
          </button>

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('ai-post-generator')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Post Generator</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: SIMPLE WHATSAPP SHARING */}
      {activeView === 'share' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (5 COLS): SELECT WHAT TO SHARE & CUSTOMER LIST */}
          <div className="lg:col-span-5 space-y-5">
            {/* Step 1: Select What to Share */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                1. Select Update to Share
              </h2>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShareMode('price-update')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    shareMode === 'price-update'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      Share Price Update
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Medium, SL, or All Products rate sheet from ERP
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ERP Live
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShareMode('product-update')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    shareMode === 'product-update'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      Share Product Update
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Single product specification &amp; verified final rate
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Spotlight
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShareMode('ai-generated-post')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    shareMode === 'ai-generated-post'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      Share AI-Generated Post
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Share posts created in Nano Banana AI Post Generator
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    Nano Banana AI
                  </span>
                </button>
              </div>

              {/* Sub-selector for Price Update */}
              {shareMode === 'price-update' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Price Section
                  </label>
                  <select
                    value={priceUpdateScope}
                    onChange={(e) => setPriceUpdateScope(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="all-products-price-update">All Products Price Update</option>
                    <option value="medium-price-update">Medium Price Update</option>
                    <option value="sl-price-update">SL Price Update</option>
                  </select>
                </div>
              )}

              {/* Sub-selector for Product Update */}
              {shareMode === 'product-update' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select ERP Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {products.map((p) => {
                      const item = NanoBananaPostService.computeVerifiedProductItem(
                        p,
                        categoryBasicRates,
                        gradeBasicRates
                      );
                      return (
                        <option key={p.id} value={p.id}>
                          {item.productName} {item.size} ({item.grade}) — ₹
                          {item.finalRate.toLocaleString('en-IN')}/MT
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Sub-selector for AI-Generated Post */}
              {shareMode === 'ai-generated-post' && aiPostsHistory.length > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Generated AI Post
                  </label>
                  <select
                    value={selectedAiPostId}
                    onChange={(e) => setSelectedAiPostId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {aiPostsHistory.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.postTypeLabel} ({p.variationName}) — {p.timestamp}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Step 2: Send Directly to Customer */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Send to Customer ({filteredCustomers.length})</span>
                </h2>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customer or city..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
                {filteredCustomers.map((customer) => {
                  const isSent = sentCustomerId === customer.id;
                  return (
                    <div
                      key={customer.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {customer.companyName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {customer.name} • {customer.city}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-700 font-semibold">
                          {customer.whatsapp || customer.mobile}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleShareOnWhatsApp(customer)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {isSent ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Opened</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 COLS): PREVIEW & PRIMARY SHARE ON WHATSAPP ACTION */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    WhatsApp Post &amp; Caption Preview
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified ERP pricing: <strong>Final Rate = Basic Rate + Gauge Difference</strong>
                  </p>
                </div>

                {/* Primary Action Button: Share on WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleShareOnWhatsApp()}
                  className="py-2.5 px-5 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>

              {statusFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusFeedback}</span>
                </div>
              )}

              {/* Image Preview */}
              <div className="bg-slate-900/5 border border-slate-200 rounded-2xl p-3 flex items-center justify-center min-h-[380px]">
                {isGeneratingImage ? (
                  <div className="py-16 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Preparing verified ERP post image...</span>
                  </div>
                ) : livePost ? (
                  <img
                    src={livePost.imageDataUrl}
                    alt={livePost.title}
                    className="max-h-[540px] w-auto object-contain rounded-xl shadow-md border border-slate-300"
                  />
                ) : null}
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleShareOnWhatsApp()}
                  className="flex-1 min-w-[180px] py-3 px-4 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open WhatsApp / WhatsApp Web</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download Image</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy Message'}</span>
                </button>
              </div>

              {/* Formatted Message Preview */}
              {livePost && (
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    WhatsApp Message Text
                  </span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-44 overflow-y-auto">
                    {livePost.whatsappCaption}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EXISTING CUSTOMER ENQUIRY / ORDER COMMUNICATION (PHASE 3 PRESERVED) */}
      {activeView === 'enquiries' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer WhatsApp Enquiry &amp; Order Communication
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Parse incoming customer WhatsApp enquiries, calculate approved ERP rates, and create CRM enquiries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    1. Customer Sender
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAiOrderUseCustomPhone(false)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                        !aiOrderUseCustomPhone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Registered Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiOrderUseCustomPhone(true)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                        aiOrderUseCustomPhone
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      New Lead (#)
                    </button>
                  </div>
                </div>

                {!aiOrderUseCustomPhone ? (
                  <select
                    value={aiOrderSelectedCustomerId}
                    onChange={(e) => {
                      const cId = e.target.value;
                      setAiOrderSelectedCustomerId(cId);
                      const cust = customers.find((c) => c.id === cId);
                      const phone = cust?.whatsapp || cust?.mobile || '+91 97521 83053';
                      setAiOrderSenderPhone(phone);
                      setAiOrderParsed(
                        parseWhatsAppCustomerMessage({
                          rawText: aiOrderMessage,
                          senderPhone: phone,
                          preselectedCustomerId: cId,
                          customers,
                          products,
                          company,
                        })
                      );
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} • {c.name} ({c.whatsapp || c.mobile})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={aiOrderSenderPhone}
                    onChange={(e) => {
                      setAiOrderSenderPhone(e.target.value);
                      setAiOrderParsed(
                        parseWhatsAppCustomerMessage({
                          rawText: aiOrderMessage,
                          senderPhone: e.target.value,
                          customers,
                          products,
                          company,
                        })
                      );
                    }}
                    placeholder="+91 94252 11223"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono font-bold"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  2. Customer WhatsApp Message
                </label>
                <textarea
                  rows={3}
                  value={aiOrderMessage}
                  onChange={(e) => {
                    const txt = e.target.value;
                    setAiOrderMessage(txt);
                    setAiOrderParsed(
                      parseWhatsAppCustomerMessage({
                        rawText: txt,
                        senderPhone: aiOrderSenderPhone,
                        preselectedCustomerId: aiOrderUseCustomPhone
                          ? undefined
                          : aiOrderSelectedCustomerId,
                        customers,
                        products,
                        company,
                      })
                    );
                  }}
                  className="w-full p-3 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setAiOrderParsed(
                    parseWhatsAppCustomerMessage({
                      rawText: aiOrderMessage,
                      senderPhone: aiOrderSenderPhone,
                      preselectedCustomerId: aiOrderUseCustomPhone
                        ? undefined
                        : aiOrderSelectedCustomerId,
                      customers,
                      products,
                      company,
                    })
                  );
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                <span>Parse Customer Enquiry &amp; Calculate ERP Rate</span>
              </button>
            </div>

            <div className="lg:col-span-6">
              {aiOrderParsed && (
                <AIWhatsAppOrderCard
                  parsed={aiOrderParsed}
                  company={company}
                  customers={customers}
                  products={products}
                  onSelectClarification={(actionText) => {
                    setAiOrderMessage(actionText);
                    setAiOrderParsed(
                      parseWhatsAppCustomerMessage({
                        rawText: actionText,
                        senderPhone: aiOrderSenderPhone,
                        preselectedCustomerId: aiOrderUseCustomPhone
                          ? undefined
                          : aiOrderSelectedCustomerId,
                        customers,
                        products,
                        company,
                      })
                    );
                  }}
                  onCreateEnquiry={(enq) => {
                    onCreateEnquiryFromWebhook(enq);
                    onLogMessage({
                      id: `msg-${Date.now()}`,
                      customerId: enq.customerId,
                      customerName: enq.customerName,
                      whatsappNumber: aiOrderSenderPhone,
                      type: 'received',
                      message: aiOrderMessage,
                      timestamp: new Date().toISOString(),
                      status: 'inbound',
                      source: 'simulated',
                      context: `WhatsApp Enquiry: ${enq.enquiryNumber}`,
                    });
                  }}
                  onNavigateToEnquiries={() => onNavigateTab && onNavigateTab('enquiries')}
                  onNavigateToOrders={() => onNavigateTab && onNavigateTab('orders')}
                  onNavigateToWhatsApp={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
