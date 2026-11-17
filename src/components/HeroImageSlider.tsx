import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp, Factory } from 'lucide-react';
import { HeroSlideItem, WebsiteCmsContent } from '../types';
import { DEFAULT_HERO_SLIDES } from '../data/heroSlidesDefaults';

interface HeroImageSliderProps {
  cms: WebsiteCmsContent;
  onNavigate: (path: string) => void;
  onExploreProducts: () => void;
}

const AUTO_ROTATE_INTERVAL_MS = 5500;
const INTERACTION_PAUSE_MS = 9000;

export const HeroImageSlider: React.FC<HeroImageSliderProps> = ({
  cms,
  onNavigate,
  onExploreProducts,
}) => {
  const slides: HeroSlideItem[] = useMemo(() => {
    const source =
      cms.heroSlides && cms.heroSlides.length > 0 ? cms.heroSlides : DEFAULT_HERO_SLIDES;
    const sorted = [...source].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const enabled = sorted.filter((s) => s.enabled !== false);
    if (enabled.length > 0) return enabled;
    return sorted.length > 0 ? [sorted[0]] : [DEFAULT_HERO_SLIDES[0]];
  }, [cms.heroSlides]);

  const initialSlideIndex = useMemo(() => {
    if (!cms.defaultHeroSlideId) return 0;
    const idx = slides.findIndex((s) => s.id === cms.defaultHeroSlideId);
    return idx >= 0 ? idx : 0;
  }, [slides, cms.defaultHeroSlideId]);

  const [activeIndex, setActiveIndex] = useState<number>(initialSlideIndex);
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => {
    const initial = new Set<number>([initialSlideIndex]);
    if (slides.length > 1) {
      initial.add((initialSlideIndex + 1) % slides.length);
    }
    return initial;
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [imageStage, setImageStage] = useState<Record<string, 'primary' | 'fallback' | 'broken'>>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const pauseTimeoutRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Sync activeIndex when defaultHeroSlideId or slides list changes via CMS
  useEffect(() => {
    setActiveIndex(initialSlideIndex);
  }, [initialSlideIndex]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  // Preload initial/active slide and adjacent slides lazily as user navigates
  useEffect(() => {
    setLoadedIndices((prev) => {
      const next = new Set(prev);
      next.add(activeIndex);
      if (slides.length > 1) {
        next.add((activeIndex + 1) % slides.length);
        next.add((activeIndex - 1 + slides.length) % slides.length);
      }
      if (next.size === prev.size) return prev;
      return next;
    });
  }, [activeIndex, slides.length]);

  // Listen to OS reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current !== null) {
        window.clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  const triggerInteractionPause = useCallback(() => {
    setIsInteractionPaused(true);
    if (pauseTimeoutRef.current !== null) {
      window.clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = window.setTimeout(() => {
      setIsInteractionPaused(false);
    }, INTERACTION_PAUSE_MS);
  }, []);

  const goToSlide = useCallback(
    (nextIndex: number, fromUserInteraction = false) => {
      const normalized = ((nextIndex % slides.length) + slides.length) % slides.length;
      setActiveIndex(normalized);
      if (fromUserInteraction) {
        triggerInteractionPause();
      }
    },
    [slides.length, triggerInteractionPause]
  );

  const handleNext = useCallback(
    (fromUser = true) => {
      goToSlide(activeIndex + 1, fromUser);
    },
    [activeIndex, goToSlide]
  );

  const handlePrev = useCallback(
    (fromUser = true) => {
      goToSlide(activeIndex - 1, fromUser);
    },
    [activeIndex, goToSlide]
  );

  // Automatic rotation timer (pauses on hover, focus, user interaction, or reduced-motion)
  useEffect(() => {
    if (
      slides.length <= 1 ||
      isHovered ||
      isFocusWithin ||
      isInteractionPaused ||
      prefersReducedMotion
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_ROTATE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [slides.length, isHovered, isFocusWithin, isInteractionPaused, prefersReducedMotion]);

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || slides.length <= 1) {
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        handleNext(true);
      } else {
        handlePrev(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (slides.length <= 1) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext(true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev(true);
    }
  };

  const handleCtaAction = (target?: string, fallbackAction?: () => void) => {
    const clean = (target || '').trim();
    if (!clean) {
      fallbackAction?.();
      return;
    }
    if (clean === '#products-section') {
      onExploreProducts();
      return;
    }
    if (clean.startsWith('#')) {
      const targetEl = document.getElementById(clean.slice(1));
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    onNavigate(clean);
  };

  const activeSlide = slides[activeIndex] || slides[0];
  const smallHeading =
    activeSlide.smallHeading || cms.heroBadge || 'ESTABLISHED 1988 | RAIPUR, CHHATTISGARH';
  const mainHeadline =
    activeSlide.heading || cms.heroHeadline || 'STRENGTH IN STEEL. BUILT FOR TOMORROW.';
  const supportingText =
    activeSlide.description ||
    cms.heroSubheadline ||
    'Steel products for industrial, structural and infrastructure requirements. Explore our products and connect with our team.';
  const primaryLabel = activeSlide.primaryCtaLabel || 'EXPLORE OUR PRODUCTS';
  const primaryTarget = activeSlide.primaryCtaTarget || '#products-section';
  const secondaryLabel = activeSlide.secondaryCtaLabel || 'VIEW LIVE RATES';
  const secondaryTarget = activeSlide.secondaryCtaTarget || '/product-rates';

  return (
    <section
      aria-label="Nav Durga Ispat Industrial Showcase"
      aria-roledescription="carousel"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocusWithin(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      className="relative w-full overflow-hidden border-b border-[#C7CED6] h-[62vh] min-h-[450px] max-h-[640px] md:h-[70vh] md:min-h-[520px] lg:h-[76vh] lg:min-h-[600px] lg:max-h-[840px] min-[2200px]:max-h-[960px] flex items-center bg-[#EAF2F8] outline-none focus-visible:ring-2 focus-visible:ring-[#105186]"
    >
      {/* Full-Width Slide Stack */}
      <div className="absolute inset-0 w-full h-full select-none" aria-hidden="true">
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;
          const isInitial = idx === initialSlideIndex;
          const shouldRenderMedia = loadedIndices.has(idx) || isActive || isInitial;
          const stage = imageStage[slide.id] || 'primary';
          const fallbackSrc = slide.fallbackUrl || '/assets/hero-slides/slide-1-rolling-mill.jpg';
          const currentImgSrc = stage === 'fallback' ? fallbackSrc : slide.imageUrl;
          const showWebpSource = stage === 'primary' && Boolean(slide.webpUrl);

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full ${
                prefersReducedMotion
                  ? ''
                  : 'transition-opacity duration-700 ease-out'
              } ${isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              {stage === 'broken' ? (
                <div className="w-full h-full bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Factory className="w-12 h-12 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Nav Durga Ispat — Industrial Rolling Mill
                    </span>
                  </div>
                </div>
              ) : shouldRenderMedia ? (
                <picture className="block w-full h-full">
                  {showWebpSource && (
                    <source srcSet={slide.webpUrl} type="image/webp" />
                  )}
                  <img
                    src={currentImgSrc}
                    alt={slide.alt || 'Nav Durga Ispat industrial steel manufacturing'}
                    loading={isInitial ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={isInitial ? 'high' : 'auto'}
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setImageStage((prev) => {
                        const prevStage = prev[slide.id] || 'primary';
                        if (prevStage === 'primary' && fallbackSrc && fallbackSrc !== slide.imageUrl) {
                          return { ...prev, [slide.id]: 'fallback' };
                        }
                        return { ...prev, [slide.id]: 'broken' };
                      });
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Subtle Light-to-Dark Overlay Only Over Hero Media for WCAG Text Readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] bg-gradient-to-r from-slate-950/75 via-slate-900/50 to-slate-900/20 pointer-events-none"
      />

      {/* Consistent Foreground Hero Copy & Dual Primary CTAs */}
      <div
        aria-live="polite"
        className="relative z-[3] nd-container py-10 sm:py-16"
      >
        <div
          key={activeSlide.id}
          className={`max-w-3xl min-[1920px]:max-w-4xl space-y-4 sm:space-y-5 ${
            prefersReducedMotion ? '' : 'transition-opacity duration-500 ease-out'
          }`}
        >
          <p className="inline-block px-3 sm:px-3.5 py-1.5 rounded-lg bg-white/95 border border-[#C7CED6] text-[#105186] text-[10px] sm:text-xs font-extrabold uppercase tracking-widest shadow-xs">
            {smallHeading}
          </p>

          <h1 className="font-display nd-h1-hero font-extrabold text-white tracking-tight uppercase drop-shadow-xs">
            {mainHeadline}
          </h1>

          <p className="nd-lead text-slate-100 max-w-2xl min-[1920px]:max-w-3xl font-medium">
            {supportingText}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={() => handleCtaAction(primaryTarget, onExploreProducts)}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 min-h-[44px] py-2.5 sm:py-3.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs sm:text-sm font-bold uppercase tracking-wide shadow-md cursor-pointer transition-colors"
            >
              <span>{primaryLabel}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleCtaAction(secondaryTarget, () => onNavigate('/product-rates'))}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 min-h-[44px] py-2.5 sm:py-3.5 rounded-xl bg-white hover:bg-[#EAF2F8] text-[#263442] text-xs sm:text-sm font-bold uppercase tracking-wide shadow-md cursor-pointer transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-[#105186] shrink-0" />
              <span>{secondaryLabel}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Previous & Next Slide Arrow Controls */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => handlePrev(true)}
            aria-label="Previous slide"
            className="hidden sm:inline-flex items-center justify-center absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-[4] min-h-[44px] min-w-[44px] rounded-xl bg-white/90 hover:bg-white text-slate-900 border border-slate-200/80 shadow-md cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleNext(true)}
            aria-label="Next slide"
            className="hidden sm:inline-flex items-center justify-center absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-[4] min-h-[44px] min-w-[44px] rounded-xl bg-white/90 hover:bg-white text-slate-900 border border-slate-200/80 shadow-md cursor-pointer transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Compact Mobile Prev/Next + Bottom Indicator Dots */}
          <div className="absolute bottom-5 inset-x-0 z-[4] flex items-center justify-center gap-3 px-4">
            <button
              type="button"
              onClick={() => handlePrev(true)}
              aria-label="Previous slide"
              className="sm:hidden inline-flex items-center justify-center min-h-[38px] min-w-[38px] rounded-lg bg-white/90 hover:bg-white text-slate-900 shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              role="tablist"
              aria-label="Choose hero slide"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-xs border border-slate-200/80 shadow-sm"
            >
              {slides.map((slide, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`Slide ${idx + 1} of ${slides.length}: ${slide.alt}`}
                    onClick={() => goToSlide(idx, true)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? 'w-6 bg-[#105186]'
                        : 'w-2 bg-[#C7CED6] hover:bg-[#737D88]'
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleNext(true)}
              aria-label="Next slide"
              className="sm:hidden inline-flex items-center justify-center min-h-[38px] min-w-[38px] rounded-lg bg-white/90 hover:bg-white text-slate-900 shadow-sm cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </section>
  );
};
