import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  X,
  Search,
  ChevronDown,
  Calendar,
  Flame,
  Award,
  Crown,
  Sun,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { NavDurgaLogo } from './NavDurgaLogo';
import { UserFestival } from '../types';

export interface FestivalTheme {
  id: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  badgeLabel: string;
  bgGradient: string;
  badgeBg: string;
  accentText: string;
  glowColor: string;
  iconType: 'diya' | 'flower' | 'crown' | 'flag' | 'gear' | 'sun' | 'star' | 'sparkle' | 'trishul';
}

export function getFestivalTheme(
  titleInput: string,
  yearStr?: string
): FestivalTheme {
  const currentYear = yearStr || new Date().getFullYear().toString();
  const title = titleInput.trim();
  const lower = title.toLowerCase();

  if (
    lower.includes('diwali') ||
    lower.includes('deepawali') ||
    lower.includes('deepavali') ||
    lower.includes('dhanteras')
  ) {
    return {
      id: 'diwali',
      title: title.startsWith('Happy') || title.startsWith('Shubh') ? title : `Happy ${title}`,
      eyebrow: `FESTIVAL SPECIAL • ${currentYear}`,
      subtitle: 'Wishing you prosperity, boundless joy & divine light across your business',
      badgeLabel: `Shubh Deepawali ${currentYear}`,
      bgGradient: 'from-amber-950 via-amber-900 to-stone-950',
      badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      accentText: 'text-amber-300',
      glowColor: 'rgba(251, 191, 36, 0.25)',
      iconType: 'diya',
    };
  }

  if (
    lower.includes('ganesh') ||
    lower.includes('ganpati') ||
    lower.includes('vinayak') ||
    lower.includes('bappa')
  ) {
    return {
      id: 'ganesh',
      title: title.startsWith('Happy') || title.startsWith('Shubh') ? title : `Happy ${title}`,
      eyebrow: `FESTIVAL SPECIAL • ${currentYear}`,
      subtitle: 'Auspicious beginnings, wisdom & unstoppable industrial success',
      badgeLabel: `Ganpati Bappa Morya ${currentYear}`,
      bgGradient: 'from-red-950 via-orange-950 to-amber-950',
      badgeBg: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
      accentText: 'text-orange-300',
      glowColor: 'rgba(249, 115, 22, 0.25)',
      iconType: 'crown',
    };
  }

  if (
    lower.includes('holi') ||
    lower.includes('dhuleti') ||
    lower.includes('color') ||
    lower.includes('colour') ||
    lower.includes('rang')
  ) {
    return {
      id: 'holi',
      title: title.startsWith('Happy') || title.startsWith('Shubh') ? title : `Happy ${title}`,
      eyebrow: `FESTIVAL SPECIAL • ${currentYear}`,
      subtitle: 'Celebrating vibrant colors of unity, progress & joyful steel growth',
      badgeLabel: `Holi Utsav ${currentYear}`,
      bgGradient: 'from-rose-950 via-purple-950 to-indigo-950',
      badgeBg: 'bg-pink-500/20 text-pink-200 border-pink-400/30',
      accentText: 'text-pink-300',
      glowColor: 'rgba(236, 72, 153, 0.25)',
      iconType: 'sparkle',
    };
  }

  if (
    lower.includes('navratri') ||
    lower.includes('mata') ||
    lower.includes('durga') ||
    lower.includes('garba')
  ) {
    return {
      id: 'navratri',
      title: title.startsWith('Shubh') || title.startsWith('Happy') ? title : `Shubh ${title}`,
      eyebrow: `FESTIVAL SPECIAL • ${currentYear}`,
      subtitle: 'May Maa Durga bless your business with unbreakable strength & fortitude',
      badgeLabel: `Jai Mata Di ${currentYear}`,
      bgGradient: 'from-red-950 via-rose-950 to-amber-950',
      badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
      accentText: 'text-rose-300',
      glowColor: 'rgba(244, 63, 94, 0.25)',
      iconType: 'trishul',
    };
  }

  if (
    lower.includes('dussehra') ||
    lower.includes('vijayadashami') ||
    lower.includes('dashami')
  ) {
    return {
      id: 'dussehra',
      title: title.startsWith('Happy') || title.startsWith('Shubh') ? title : `Happy ${title}`,
      eyebrow: `FESTIVAL SPECIAL • ${currentYear}`,
      subtitle: 'Celebrating the victory of virtue, uncompromised quality & leadership',
      badgeLabel: `Vijayadashami ${currentYear}`,
      bgGradient: 'from-amber-950 via-orange-900 to-red-950',
      badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      accentText: 'text-amber-300',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      iconType: 'crown',
    };
  }

  if (
    lower.includes('vishwakarma') ||
    lower.includes('biswakarma') ||
    lower.includes('factory') ||
    lower.includes('engineering') ||
    lower.includes('workshop')
  ) {
    return {
      id: 'vishwakarma',
      title: title.startsWith('Happy') || title.startsWith('Shubh') ? title : `Happy ${title}`,
      eyebrow: `FESTIVAL SPECIAL • ${currentYear}`,
      subtitle: 'Saluting the Divine Architect of the Universe & precision steel craftsmanship',
      badgeLabel: `Industrial Worship ${currentYear}`,
      bgGradient: 'from-slate-950 via-blue-950 to-amber-950',
      badgeBg: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
      accentText: 'text-sky-300',
      glowColor: 'rgba(56, 189, 248, 0.25)',
      iconType: 'gear',
    };
  }

  if (
    lower.includes('sankranti') ||
    lower.includes('uttarayan') ||
    lower.includes('pongal') ||
    lower.includes('lohri')
  ) {
    return {
      id: 'sankranti',
      title: title.startsWith('Happy') || title.startsWith('Shubh') ? title : `Happy ${title}`,
      eyebrow: `FESTIVAL SPECIAL • ${currentYear}`,
      subtitle: 'Soaring to soaring new heights of Uttarayan warmth & industrial growth',
      badgeLabel: `Makar Sankranti ${currentYear}`,
      bgGradient: 'from-blue-950 via-sky-950 to-amber-950',
      badgeBg: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
      accentText: 'text-sky-300',
      glowColor: 'rgba(14, 165, 233, 0.25)',
      iconType: 'sun',
    };
  }

  if (
    lower.includes('republic') ||
    lower.includes('independence') ||
    lower.includes('tiranga') ||
    lower.includes('flag') ||
    lower.includes('national')
  ) {
    return {
      id: 'national',
      title: title.startsWith('Happy') ? title : `Happy ${title}`,
      eyebrow: `NATIONAL CELEBRATION • ${currentYear}`,
      subtitle: 'Saluting national pride, industrial progress & structural steel excellence',
      badgeLabel: `Tiranga Pride ${currentYear}`,
      bgGradient: 'from-amber-950 via-slate-950 to-emerald-950',
      badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      accentText: 'text-emerald-300',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      iconType: 'flag',
    };
  }

  if (
    lower.includes('new year') ||
    lower.includes('samvat') ||
    lower.includes('financial year') ||
    lower.includes('opening')
  ) {
    return {
      id: 'new_year',
      title: title.startsWith('Happy') || title.startsWith('Shubh') ? title : `Happy ${title}`,
      eyebrow: `CELEBRATION • ${currentYear}`,
      subtitle: 'Wishing you new heights of commercial prosperity & milestone achievements',
      badgeLabel: `Shubh Labh ${currentYear}`,
      bgGradient: 'from-slate-950 via-indigo-950 to-blue-950',
      badgeBg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
      accentText: 'text-indigo-300',
      glowColor: 'rgba(99, 102, 241, 0.25)',
      iconType: 'star',
    };
  }

  return {
    id: 'custom_festival',
    title: title || 'Festive Greetings',
    eyebrow: `FESTIVAL SPECIAL • ${currentYear}`,
    subtitle: 'Wishing you prosperity, happiness, peace & continued commercial success',
    badgeLabel: `Festival Special ${currentYear}`,
    bgGradient: 'from-slate-950 via-amber-950 to-indigo-950',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    accentText: 'text-amber-300',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    iconType: 'sparkle',
  };
}

interface FestivalHeaderProps {
  festivalTitle: string;
  festivalLogoUrl?: string;
  companyName?: string;
  effectiveDate?: string;
}

export const FestivalHeader: React.FC<FestivalHeaderProps> = ({
  festivalTitle,
  festivalLogoUrl,
  companyName = 'NAV DURGA ISPAT PRIVATE LIMITED',
  effectiveDate,
}) => {
  const yearStr = effectiveDate
    ? effectiveDate.split('-')[0]
    : new Date().getFullYear().toString();
  const theme = useMemo(
    () => getFestivalTheme(festivalTitle, yearStr),
    [festivalTitle, yearStr]
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r ${theme.bgGradient} text-white p-5 sm:p-7 shadow-xl border border-white/15 transition-all duration-300 select-none`}
    >
      {/* Ambient background light particles & radial depth glow */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-60"
        style={{ backgroundColor: theme.glowColor }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-40"
        style={{ backgroundColor: theme.glowColor }}
      />

      {/* Subtle Micro-particle floating dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main Header Responsive Grid */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Column: Festival Identity */}
        <div className="space-y-2.5 max-w-2xl">
          {/* Eyebrow Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 ${theme.badgeBg}`}
            >
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>{theme.eyebrow}</span>
            </span>

            <span className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15 backdrop-blur-xs">
              {theme.badgeLabel}
            </span>
          </div>

          {/* Large Festival Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm flex items-center gap-2.5 flex-wrap">
            <span>{theme.title}</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-medium text-white/80 leading-relaxed max-w-lg">
            {theme.subtitle}
          </p>
        </div>

        {/* Right Column: Official Master Brand Logo */}
        <div className="shrink-0 flex items-center gap-3 flex-wrap self-start md:self-center">
          {/* Official Company Logo Presentation Container */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <NavDurgaLogo size="md" className="shrink-0" priority />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <div className="text-xs font-black text-slate-900 tracking-tight leading-none">
                {companyName}
              </div>
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                <span>Verified ERP Master Brand</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FestivalSelectorProps {
  userFestivals: UserFestival[];
  selectedFestivalTitle: string;
  onSelectFestival: (fest: UserFestival) => void;
  onOpenAddModal: () => void;
  onEditFestival: (fest: UserFestival) => void;
  onDeleteFestival: (id: string) => void;
}

export const FestivalSelector: React.FC<FestivalSelectorProps> = ({
  userFestivals,
  selectedFestivalTitle,
  onSelectFestival,
  onOpenAddModal,
  onEditFestival,
  onDeleteFestival,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFestivals = useMemo(() => {
    if (!searchTerm.trim()) return userFestivals;
    return userFestivals.filter((f) => f.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [userFestivals, searchTerm]);

  const selectedFestival = useMemo(() => {
    return userFestivals.find((f) => f.title === selectedFestivalTitle) || userFestivals[0];
  }, [userFestivals, selectedFestivalTitle]);

  const activeTheme = useMemo(
    () => getFestivalTheme(selectedFestivalTitle || 'Festive Greetings'),
    [selectedFestivalTitle]
  );

  return (
    <div className="space-y-3">
      {/* Modern Festival Selector Bar */}
      <div className="bg-white/90 rounded-2xl border border-amber-200/90 p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Festival / Occasion Title</span>
          </label>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="text-[11px] font-extrabold text-amber-900 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Add New Festival / Occasion</span>
          </button>
        </div>

        {/* Dropdown Container */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-300 hover:border-amber-400 text-left flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-800 text-xs font-black shrink-0">
                🎉
              </span>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-slate-900 truncate">
                  {selectedFestivalTitle || (userFestivals.length === 0 ? 'No festivals added yet' : 'Select Festival')}
                </div>
                <div className="text-[10px] text-amber-800 font-bold truncate">
                  {activeTheme.badgeLabel}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-amber-700 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Panel */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150 max-h-72 flex flex-col">
              {/* Search Box */}
              {userFestivals.length > 0 && (
                <div className="relative shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search festival or occasion title..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Items List */}
              <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                {filteredFestivals.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                    <p className="font-semibold">No festivals added yet</p>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAddModal();
                        setIsOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Festival / Occasion</span>
                    </button>
                  </div>
                ) : (
                  filteredFestivals.map((fest) => {
                    const isSelected = fest.title === selectedFestivalTitle;

                    return (
                      <div
                        key={fest.id}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100/80 text-amber-950 font-black border border-amber-300'
                            : 'hover:bg-slate-50 text-slate-800 font-semibold'
                        }`}
                        onClick={() => {
                          onSelectFestival(fest);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <span className="text-[10px] text-amber-700 font-bold shrink-0">✨</span>
                          <span className="truncate">{fest.title}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            title="Edit Festival Name"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditFestival(fest);
                              setIsOpen(false);
                            }}
                            className="p-1 rounded hover:bg-amber-200/80 text-amber-900 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Festival"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFestival(fest.id);
                              setIsOpen(false);
                            }}
                            className="p-1 rounded hover:bg-red-100 text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add New Option Button */}
              {userFestivals.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAddModal();
                    setIsOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Festival / Occasion</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
