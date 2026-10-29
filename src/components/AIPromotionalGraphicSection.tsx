import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Edit3,
  RefreshCw,
  Download,
  Share2,
  Copy,
  Check,
  MessageSquare,
  CheckCircle2,
  Lock,
  Info,
  TrendingUp,
  Clock,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Customer, CompanySettings } from '../types';
import {
  AIGraphicRenderer,
  RateRevisedPosterData,
  DEFAULT_RATE_REVISED_DATA,
} from '../services/aiGraphicRenderer';
import { WhatsAppService } from '../services/whatsappService';

const RATE_REVISED_STORAGE_KEY = 'navdurga_rate_revised_poster_data_v1';

interface AIPromotionalGraphicSectionProps {
  customers: Customer[];
  company: CompanySettings;
  userRole?: 'Admin' | 'Sales' | 'Staff';
  onLogWhatsAppActivity?: (
    action: string,
    customerName: string,
    phone: string,
    details?: string
  ) => void;
}

function loadSavedRateRevisedData(): RateRevisedPosterData {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_RATE_REVISED_DATA;
    const raw = localStorage.getItem(RATE_REVISED_STORAGE_KEY);
    if (!raw) return DEFAULT_RATE_REVISED_DATA;
    return { ...DEFAULT_RATE_REVISED_DATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_RATE_REVISED_DATA;
  }
}

function saveRateRevisedData(data: RateRevisedPosterData): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(RATE_REVISED_STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('Could not persist Rate Revised data:', e);
  }
}

export const AIPromotionalGraphicSection: React.FC<AIPromotionalGraphicSectionProps> = ({
  customers,
  company,
  userRole = 'Admin',
  onLogWhatsAppActivity,
}) => {
  // Active Role Switcher (Admin vs Sales/Staff)
  const [activeRole, setActiveRole] = useState<'Admin' | 'Sales' | 'Staff'>(userRole);
  const isAdmin = activeRole === 'Admin';

  // Persistent Rate Revised Poster Data
  const [posterData, setPosterData] = useState<RateRevisedPosterData>(() =>
    loadSavedRateRevisedData()
  );

  // Admin Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editMediumName, setEditMediumName] = useState<string>(posterData.mediumSectionName);
  const [editMediumRate, setEditMediumRate] = useState<number>(posterData.mediumSectionRate);
  const [editLightName, setEditLightName] = useState<string>(posterData.lightSectionName);
  const [editLightRate, setEditLightRate] = useState<number>(posterData.lightSectionRate);
  const [editTimeText, setEditTimeText] = useState<string>(posterData.timeText);
  const [editAmpmText, setEditAmpmText] = useState<string>(posterData.ampmText);
  const [editDayText, setEditDayText] = useState<string>(posterData.dayText);
  const [editDateText, setEditDateText] = useState<string>(posterData.dateText);
  const [editBoxHeaderTitle, setEditBoxHeaderTitle] = useState<string>(posterData.boxHeaderTitle);

  // Quick AI Command Text Input
  const [quickPrompt, setQuickPrompt] = useState<string>(
    'Medium Section – ₹44411/MT, Light Section – ₹38011/MT | 01.00 PM, TUESDAY, 18.08.2026'
  );

  // WhatsApp Share Target
  const testCustomer = WhatsAppService.getTestCustomer(customers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    testCustomer?.id || customers[0]?.id || ''
  );
  const [customPhone, setCustomPhone] = useState<string>('');
  const [useCustomPhone, setUseCustomPhone] = useState<boolean>(false);

  // Feedback States
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Canvas & Custom Base Image Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hasCustomBg, setHasCustomBg] = useState<boolean>(() =>
    AIGraphicRenderer.hasCustomTemplate()
  );

  const renderGraphic = useCallback(() => {
    if (canvasRef.current) {
      AIGraphicRenderer.renderRateRevisedPoster(canvasRef.current, posterData);
    }
  }, [posterData]);

  useEffect(() => {
    AIGraphicRenderer.preloadAssets(() => {
      setHasCustomBg(AIGraphicRenderer.hasCustomTemplate());
      renderGraphic();
    });
  }, [renderGraphic]);

  useEffect(() => {
    renderGraphic();
  }, [renderGraphic]);

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!isAdmin) return;
    setEditMediumName(posterData.mediumSectionName);
    setEditMediumRate(posterData.mediumSectionRate);
    setEditLightName(posterData.lightSectionName);
    setEditLightRate(posterData.lightSectionRate);
    setEditTimeText(posterData.timeText);
    setEditAmpmText(posterData.ampmText);
    setEditDayText(posterData.dayText);
    setEditDateText(posterData.dateText);
    setEditBoxHeaderTitle(posterData.boxHeaderTitle);
    setIsEditModalOpen(true);
  };

  // Fill Current Live Timestamp in Edit Modal
  const handleFillNowTimestamp = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeFormatted = `${String(hours).padStart(2, '0')}.${minutes}`;

    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const dayFormatted = days[now.getDay()];

    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateFormatted = `${dd}.${mm}.${yyyy}`;

    setEditTimeText(timeFormatted);
    setEditAmpmText(ampm);
    setEditDayText(dayFormatted);
    setEditDateText(dateFormatted);
  };

  // Save Modal Changes
  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const updated: RateRevisedPosterData = {
      mediumSectionName: editMediumName.trim() || 'Medium Section',
      mediumSectionRate: Number(editMediumRate) || 44411,
      lightSectionName: editLightName.trim() || 'Light Section',
      lightSectionRate: Number(editLightRate) || 38011,
      timeText: editTimeText.trim() || '01.00',
      ampmText: editAmpmText.trim().toUpperCase() || 'PM',
      dayText: editDayText.trim().toUpperCase() || 'TUESDAY',
      dateText: editDateText.trim() || '18.08.2026',
      boxHeaderTitle: editBoxHeaderTitle.trim().toUpperCase() || 'RATE REVISED',
      lastUpdated: new Date().toISOString(),
    };

    saveRateRevisedData(updated);
    setPosterData(updated);
    setIsEditModalOpen(false);

    setStatusMessage('Rate Revised graphic updated and saved immediately!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Reset to Original Reference Image Values
  const handleResetToDefault = () => {
    setEditMediumName(DEFAULT_RATE_REVISED_DATA.mediumSectionName);
    setEditMediumRate(DEFAULT_RATE_REVISED_DATA.mediumSectionRate);
    setEditLightName(DEFAULT_RATE_REVISED_DATA.lightSectionName);
    setEditLightRate(DEFAULT_RATE_REVISED_DATA.lightSectionRate);
    setEditTimeText(DEFAULT_RATE_REVISED_DATA.timeText);
    setEditAmpmText(DEFAULT_RATE_REVISED_DATA.ampmText);
    setEditDayText(DEFAULT_RATE_REVISED_DATA.dayText);
    setEditDateText(DEFAULT_RATE_REVISED_DATA.dateText);
    setEditBoxHeaderTitle(DEFAULT_RATE_REVISED_DATA.boxHeaderTitle);
  };

  // Parse Quick Text Input into Rate Revised Data
  const handleApplyQuickPrompt = () => {
    if (!isAdmin || !quickPrompt.trim()) return;

    const next = { ...posterData };
    const medMatch = quickPrompt.match(/medium(?:\s+section)?[^0-9₹]*₹?\s*([0-9]{2,3},?[0-9]{3})/i);
    if (medMatch?.[1]) {
      next.mediumSectionRate = Number(medMatch[1].replace(/,/g, '')) || next.mediumSectionRate;
    }

    const lightMatch = quickPrompt.match(/light(?:\s+section)?[^0-9₹]*₹?\s*([0-9]{2,3},?[0-9]{3})/i);
    if (lightMatch?.[1]) {
      next.lightSectionRate = Number(lightMatch[1].replace(/,/g, '')) || next.lightSectionRate;
    }

    const timeMatch = quickPrompt.match(/\b(\d{1,2}[:.]\d{2})\s*(AM|PM)\b/i);
    if (timeMatch) {
      next.timeText = timeMatch[1].replace(':', '.');
      next.ampmText = timeMatch[2].toUpperCase();
    }

    const dayMatch = quickPrompt.match(
      /\b(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\b/i
    );
    if (dayMatch) {
      next.dayText = dayMatch[1].toUpperCase();
    }

    const dateMatch = quickPrompt.match(/\b(\d{2}[./-]\d{2}[./-]\d{4})\b/);
    if (dateMatch) {
      next.dateText = dateMatch[1].replace(/[/-]/g, '.');
    }

    next.lastUpdated = new Date().toISOString();
    saveRateRevisedData(next);
    setPosterData(next);

    setStatusMessage('Parsed rates & timestamp from text and updated graphic!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Upload Custom Base Template Image
  const handleCustomTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (dataUrl) {
        AIGraphicRenderer.setCustomTemplateDataUrl(dataUrl, () => {
          setHasCustomBg(true);
          renderGraphic();
          setStatusMessage('Custom base image applied! Live rates & time overlaid.');
          setTimeout(() => setStatusMessage(null), 4000);
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetCustomTemplate = () => {
    AIGraphicRenderer.setCustomTemplateDataUrl(null, () => {
      setHasCustomBg(false);
      renderGraphic();
      setStatusMessage('Restored built-in Nav Durga Rate Revised template.');
      setTimeout(() => setStatusMessage(null), 3500);
    });
  };

  // Download PNG
  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      const datePart = new Date().toISOString().split('T')[0];
      link.download = `NavDurga_Rate_Revised_Graphic_${datePart}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);

      const targetCust = customers.find((c) => c.id === selectedCustomerId);
      if (onLogWhatsAppActivity) {
        onLogWhatsAppActivity(
          'Image Downloaded',
          targetCust?.name || 'Admin',
          targetCust?.whatsapp || targetCust?.mobile || '',
          `Downloaded Rate Revised Graphic (Medium: ₹${posterData.mediumSectionRate}, Light: ₹${posterData.lightSectionRate})`
        );
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Build WhatsApp Share Caption
  const buildShareCaption = () => {
    return (
      `*🇮🇳 NAVDURGA GROUP — MARKET OPENINGS*\n` +
      `*🕒 ${posterData.timeText} ${posterData.ampmText} , ${posterData.dayText} , ${posterData.dateText}*\n` +
      `*✳ Basic Rates (Ex-Works) — ${posterData.boxHeaderTitle} ✳*\n\n` +
      `🔴 *${posterData.mediumSectionName} – ₹${posterData.mediumSectionRate}/MT*\n` +
      `🔴 *${posterData.lightSectionName} – ₹${posterData.lightSectionRate}/MT*\n\n` +
      `🛡️ *PAYMENT TERMS:*\n` +
      `• Advance Payment Basis\n` +
      `• *₹ 300/MT extra* for next - day payment\n\n` +
      `⚠️ *IMPORTANT NOTICE:*\n` +
      `• Rates are indicative & subject to market fluctuations\n` +
      `• Please reconfirm before booking\n\n` +
      `📞 *CONTACT FOR ORDERS:*\n` +
      `9009544333 | 7000923464 | 9713144333\n` +
      `_Wishing you a very happy and productive day._`
    );
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(buildShareCaption());
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  const handleShareToWhatsApp = () => {
    handleDownload();

    const targetCust = customers.find((c) => c.id === selectedCustomerId);
    const destinationPhone = useCustomPhone
      ? customPhone
      : targetCust?.whatsapp || targetCust?.mobile || '9009544333';

    WhatsAppService.openChat(
      destinationPhone,
      buildShareCaption(),
      targetCust?.name || 'Customer'
    );

    setStatusMessage(
      'WhatsApp opened! High-resolution Rate Revised Graphic downloaded — attach it in the chat.'
    );
    setTimeout(() => setStatusMessage(null), 6000);

    if (onLogWhatsAppActivity) {
      onLogWhatsAppActivity(
        'WhatsApp Opened',
        targetCust?.name || 'Customer',
        destinationPhone,
        `Shared Rate Revised Graphic (Medium: ₹${posterData.mediumSectionRate}, Light: ₹${posterData.lightSectionRate})`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Title & Admin Role Switcher */}
      <div className="bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm border border-red-700/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide uppercase bg-amber-400 text-slate-950 shadow-2xs">
                📢 Official Rate Revised Template
              </span>
              <span className="text-xs text-amber-200 font-medium">
                Navdurga Group • Basic Rates (Ex-Works) • 1536×1024 High-Res
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>AI Promotional Graphic Generator (Rate Revised)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Displays the official <strong>NAVDURGA GROUP — RATE REVISED</strong> promotional graphic with timestamp banner, steel channel stockyard collage, and red-orange section rates. Administrators can edit the <strong>Medium Section</strong>, <strong>Light Section</strong>, and <strong>Time / Date</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
            {/* Role Verification Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-medium px-2">Role:</span>
              <button
                type="button"
                onClick={() => setActiveRole('Admin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  isAdmin
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('Sales')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  !isAdmin
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sales / Staff (View Only)
              </button>
            </div>

            {isAdmin ? (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-md transition-all cursor-pointer ring-2 ring-amber-300/40"
              >
                <Edit3 className="w-4 h-4 text-slate-950" />
                <span>Edit Rates & Time</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                <Lock className="w-3.5 h-3.5" />
                <span>Rates View-Only</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls | Right Live Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: RATE SUMMARY, QUICK PROMPT, & WHATSAPP SHARING (5 cols)      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Rates & Timestamp Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span>Current Revised Rates & Timestamp</span>
              </span>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              )}
            </div>

            {/* Black Timestamp Pill Preview */}
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 text-white flex items-center justify-between text-xs font-extrabold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <span className="text-amber-400">{posterData.timeText}</span>{' '}
                  <span>{posterData.ampmText}</span> , <span>{posterData.dayText}</span> ,{' '}
                  <span className="text-amber-400">{posterData.dateText}</span>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase">
                {posterData.boxHeaderTitle}
              </span>
            </div>

            {/* Rates Display Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
                    • {posterData.mediumSectionName}
                  </span>
                  <span className="text-lg font-black text-red-600">
                    ₹{posterData.mediumSectionRate}
                    <span className="text-xs font-bold text-red-500">/MT</span>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
                  Basic (Ex-Works)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
                    • {posterData.lightSectionName}
                  </span>
                  <span className="text-lg font-black text-red-600">
                    ₹{posterData.lightSectionRate}
                    <span className="text-xs font-bold text-red-500">/MT</span>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
                  Basic (Ex-Works)
                </span>
              </div>
            </div>

            {/* Quick Text Command Parser (Admin Only) */}
            {isAdmin && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                  <span>Quick Text Rate & Time Update</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickPrompt}
                    onChange={(e) => setQuickPrompt(e.target.value)}
                    placeholder="e.g. Medium 44411, Light 38011, 01.00 PM TUESDAY 18.08.2026"
                    className="flex-1 px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-slate-50/60 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyQuickPrompt}
                    className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Apply</span>
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isAdmin
                  ? 'Click "Edit Rates & Time" to adjust Medium Section, Light Section, or the clock/date banner. Changes save and render immediately.'
                  : 'You are viewing in Sales/Staff mode. Non-admin users can view, download, and share the graphic, but cannot edit rates.'}
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Share Recipient Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Target WhatsApp Recipient</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseCustomPhone(false)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !useCustomPhone
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  Pick from Customers ({customers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomPhone(true)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    useCustomPhone
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  Custom Mobile #
                </button>
              </div>

              {!useCustomPhone ? (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.name}) • {c.whatsapp || c.mobile}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="e.g. +91 9009544333"
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800"
                />
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share to WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>{downloadSuccess ? 'Downloaded! ✓' : 'Download PNG'}</span>
              </button>
            </div>

            {statusMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Formatted WhatsApp Broadcast Caption */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">WhatsApp Broadcast Text:</span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {copiedCaption ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto leading-snug border border-slate-100">
              {buildShareCaption()}
            </pre>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: HIGH-RES LIVE GRAPHIC PREVIEW (7 cols on lg)                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Rate Revised Graphic Live Preview</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 font-mono">
                    1536 × 1024 px • Rate Revised
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Fixed Navdurga Group Rate Revised layout with dynamically updated rates & timestamp
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleCustomTemplateUpload}
                  className="hidden"
                />

                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Upload custom base poster PNG/JPG to overlay live rates"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                      <span>{hasCustomBg ? 'Change Base Image' : 'Upload Base Image'}</span>
                    </button>

                    {hasCustomBg && (
                      <button
                        type="button"
                        onClick={handleResetCustomTemplate}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
                        title="Reset to built-in template"
                      >
                        <span>Reset</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleOpenEditModal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit Rates</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Canvas Preview Container */}
            <div className="w-full flex items-center justify-center bg-slate-900/5 rounded-2xl border border-slate-200/80 p-2 sm:p-4 overflow-hidden relative">
              <div className="w-full max-w-[760px] aspect-[1536/1024] shadow-lg rounded-xl overflow-hidden bg-white border border-slate-300 relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain block"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </div>

            {/* Template Information Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black block">
                  Timestamp
                </span>
                <span className="font-bold text-slate-800 truncate block">
                  {posterData.timeText} {posterData.ampmText} • {posterData.dateText}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black block">
                  {posterData.mediumSectionName}
                </span>
                <span className="font-bold text-red-600 truncate block">
                  ₹{posterData.mediumSectionRate}/MT
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black block">
                  {posterData.lightSectionName}
                </span>
                <span className="font-bold text-red-600 truncate block">
                  ₹{posterData.lightSectionRate}/MT
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black block">
                  Hotlines
                </span>
                <span className="font-bold text-slate-800 truncate block">
                  9009544333 (3 Lines)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADMIN-ONLY "EDIT RATES & TIME" MODAL                                      */}
      {/* ========================================================================= */}
      {isAdmin && isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Edit Rate Revised Graphic
                  </h3>
                  <p className="text-xs text-slate-500">
                    Admin Only • Updates rates & timestamp inside the graphic
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                Admin Mode
              </span>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-4 pt-4">
              {/* Timestamp & Header Section */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wide text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timestamp & Box Header</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFillNowTimestamp}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer transition-colors"
                  >
                    Use Current Time & Date
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      value={editTimeText}
                      onChange={(e) => setEditTimeText(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-800 border border-slate-700 text-amber-400"
                      placeholder="01.00"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      AM / PM
                    </label>
                    <select
                      value={editAmpmText}
                      onChange={(e) => setEditAmpmText(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Day
                    </label>
                    <input
                      type="text"
                      value={editDayText}
                      onChange={(e) => setEditDayText(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-800 border border-slate-700 text-white uppercase"
                      placeholder="TUESDAY"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Date (DD.MM.YYYY)
                    </label>
                    <input
                      type="text"
                      value={editDateText}
                      onChange={(e) => setEditDateText(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-800 border border-slate-700 text-amber-400"
                      placeholder="18.08.2026"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Red Box Header Label
                  </label>
                  <input
                    type="text"
                    value={editBoxHeaderTitle}
                    onChange={(e) => setEditBoxHeaderTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-extrabold rounded-lg bg-slate-800 border border-slate-700 text-red-400 uppercase"
                    placeholder="RATE REVISED"
                  />
                </div>
              </div>

              {/* Row 1: Medium Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Row 1: Medium Section
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black text-red-700 bg-red-100 border border-red-300 font-mono">
                    ₹{Number(editMediumRate || 0)}/MT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editMediumName}
                      onChange={(e) => setEditMediumName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
                      placeholder="Medium Section"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Rate (₹ / MT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={editMediumRate}
                        onChange={(e) => setEditMediumRate(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-xs font-mono font-black text-red-700 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white"
                        placeholder="44411"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400">Quick adjust:</span>
                  <button
                    type="button"
                    onClick={() => setEditMediumRate((r) => r - 1000)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                  >
                    - ₹1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMediumRate((r) => r - 500)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                  >
                    - ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMediumRate((r) => r + 500)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 cursor-pointer"
                  >
                    + ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMediumRate((r) => r + 1000)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 cursor-pointer"
                  >
                    + ₹1,000
                  </button>
                </div>
              </div>

              {/* Row 2: Light Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Row 2: Light Section
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black text-red-700 bg-red-100 border border-red-300 font-mono">
                    ₹{Number(editLightRate || 0)}/MT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editLightName}
                      onChange={(e) => setEditLightName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
                      placeholder="Light Section"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Rate (₹ / MT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={editLightRate}
                        onChange={(e) => setEditLightRate(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-xs font-mono font-black text-red-700 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white"
                        placeholder="38011"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400">Quick adjust:</span>
                  <button
                    type="button"
                    onClick={() => setEditLightRate((r) => r - 1000)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                  >
                    - ₹1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLightRate((r) => r - 500)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                  >
                    - ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLightRate((r) => r + 500)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 cursor-pointer"
                  >
                    + ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLightRate((r) => r + 1000)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 cursor-pointer"
                  >
                    + ₹1,000
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Reset to Original (₹44411 / ₹38011)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
