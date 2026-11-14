import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JourneyMilestoneItem, WebsiteCmsContent } from '../types';
import {
  DEFAULT_JOURNEY_DESCRIPTION,
  DEFAULT_JOURNEY_HEADING,
  DEFAULT_JOURNEY_MILESTONES,
  DEFAULT_JOURNEY_SUBHEADING,
} from '../data/journeyDefaults';

interface OurJourneyTimelineProps {
  cms: WebsiteCmsContent;
}

const MilestoneCardMedia: React.FC<{ imageUrl?: string; alt: string }> = ({ imageUrl, alt }) => {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) return null;

  return (
    <div className="aspect-[16/9] w-full overflow-hidden border-b border-[#C7CED6] bg-[#EAF2F8]">
      <img
        src={imageUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
};

function formatMilestoneHeading(milestone: JourneyMilestoneItem): string {
  const datePart = (milestone.dateLabel || '').trim();
  const titlePart = (milestone.title || '').trim();
  if (!datePart) return titlePart;
  if (titlePart.toLowerCase().startsWith(datePart.toLowerCase())) {
    return titlePart;
  }
  return `${datePart} – ${titlePart}`;
}

export const OurJourneyTimeline: React.FC<OurJourneyTimelineProps> = ({ cms }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const milestones = useMemo<JourneyMilestoneItem[]>(() => {
    const raw =
      cms.journeyMilestones && cms.journeyMilestones.length > 0
        ? cms.journeyMilestones
        : DEFAULT_JOURNEY_MILESTONES;
    return [...raw]
      .filter((m) => m.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [cms.journeyMilestones]);

  const heading = (cms.journeyHeading || '').trim() || DEFAULT_JOURNEY_HEADING;
  const subheading = (cms.journeySubheading || '').trim() || DEFAULT_JOURNEY_SUBHEADING;
  const description = (cms.journeyDescription || '').trim() || DEFAULT_JOURNEY_DESCRIPTION;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setScrollProgress(1);
      return;
    }

    let rafId = 0;
    const updateProgress = () => {
      rafId = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      // Map section position across viewport: starts filling as section enters lower 82%, completes by upper 28%
      const startY = vh * 0.85;
      const endY = vh * 0.25;
      const totalSpan = Math.max(1, startY - endY + rect.height * 0.35);
      const raw = (startY - rect.top) / totalSpan;
      const clamped = Math.max(0.18, Math.min(1, raw));
      setScrollProgress(clamped);
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [prefersReducedMotion, milestones.length]);

  if (milestones.length === 0) return null;

  const isScrollableDesktop = milestones.length > 5;
  const halfTrackPercent = milestones.length > 1 ? 100 / (milestones.length * 2) : 50;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="our-journey-heading"
      className="bg-white rounded-2xl border border-[#C7CED6] shadow-2xs overflow-hidden"
    >
      {/* Metallic-silver accent top strip */}
      <div
        className="h-1 w-full"
        style={{
          background: 'linear-gradient(90deg, #0B3A60 0%, #105186 45%, #C7CED6 100%)',
        }}
      />

      <div className="p-6 sm:p-8 lg:p-10 space-y-10 bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF] to-[#F7F9FB]">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[#C7CED6]/70">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#105186]">
              {heading}
            </div>
            <h2
              id="our-journey-heading"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[#263442] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              {subheading}
            </h2>
            <p className="text-sm sm:text-base text-[#737D88] leading-relaxed">
              {description}
            </p>
          </div>

          <div className="text-xs font-semibold text-[#737D88] shrink-0 flex items-center gap-2">
            <span className="text-[#0B3A60] font-bold tabular-nums">
              Since {cms.establishedYear || '1988'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Urla Industrial Area, Raipur</span>
          </div>
        </div>

        {/* DESKTOP: Alternating Horizontal Connected Timeline (lg and up) */}
        <div className="hidden lg:block">
          <div className={isScrollableDesktop ? 'overflow-x-auto pb-4' : ''}>
            <div
              className="relative grid grid-rows-[1fr_auto_1fr] gap-x-4"
              style={{
                gridTemplateColumns: isScrollableDesktop
                  ? `repeat(${milestones.length}, minmax(235px, 1fr))`
                  : `repeat(${milestones.length}, minmax(0, 1fr))`,
              }}
            >
              {/* Continuous Horizontal Connecting Track (spanning first marker center to last marker center) */}
              {milestones.length > 1 && (
                <div
                  aria-hidden="true"
                  className="row-start-2 col-span-full relative flex items-center pointer-events-none"
                >
                  <div
                    className="relative h-[3px] rounded-full bg-[#C7CED6]/80 overflow-hidden"
                    style={{
                      marginLeft: `${halfTrackPercent}%`,
                      marginRight: `${halfTrackPercent}%`,
                      width: `${100 - halfTrackPercent * 2}%`,
                    }}
                  >
                    <div
                      className="h-full w-full rounded-full transition-transform duration-300 ease-out"
                      style={{
                        background: 'linear-gradient(90deg, #105186 0%, #0B3A60 100%)',
                        transform: `scaleX(${scrollProgress})`,
                        transformOrigin: 'left center',
                      }}
                    />
                  </div>
                </div>
              )}

              {milestones.map((milestone, idx) => {
                const isTop = idx % 2 === 0;
                const threshold =
                  milestones.length > 1 ? idx / (milestones.length - 1) : 0;
                const isReached = scrollProgress >= threshold - 0.04;
                const stepNumber = String(idx + 1).padStart(2, '0');
                const dateText = (milestone.dateLabel || '').trim();
                const fullTitle = formatMilestoneHeading(milestone);

                return (
                  <React.Fragment key={milestone.id}>
                    {/* ROW 1: Top Alternating Card */}
                    <div
                      className="row-start-1 flex flex-col justify-end pb-2"
                      style={{ gridColumnStart: idx + 1 }}
                    >
                      {isTop && (
                        <div className="flex flex-col items-center">
                          <article
                            className="w-full bg-white rounded-xl border border-[#C7CED6] hover:border-[#105186] shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden"
                            style={{
                              opacity: isReached ? 1 : 0.72,
                              transform: isReached ? 'translateY(0)' : 'translateY(6px)',
                            }}
                          >
                            <div
                              className="h-[3px] w-full"
                              style={{
                                background:
                                  'linear-gradient(90deg, #105186 0%, #737D88 60%, #C7CED6 100%)',
                              }}
                            />
                            <MilestoneCardMedia
                              imageUrl={milestone.imageUrl}
                              alt={fullTitle}
                            />
                            <div className="p-4 space-y-2">
                              <div className="text-[11px] font-bold text-[#105186] tabular-nums flex items-center gap-1.5">
                                <span>{dateText || `Milestone ${stepNumber}`}</span>
                                {dateText === '1988' && idx === 0 && (
                                  <>
                                    <span aria-hidden="true" className="text-[#C7CED6]">
                                      ·
                                    </span>
                                    <span className="text-[#737D88]">Incorporation</span>
                                  </>
                                )}
                              </div>
                              <h3 className="font-display text-[15px] font-extrabold text-[#263442] leading-snug">
                                {fullTitle}
                              </h3>
                              <p className="text-xs text-[#737D88] leading-relaxed">
                                {milestone.description}
                              </p>
                            </div>
                          </article>

                          {/* Vertical Connector Stem Down to Axis */}
                          <div className="flex flex-col items-center" aria-hidden="true">
                            <div
                              className={`w-[2px] h-7 transition-colors duration-300 ${
                                isReached
                                  ? 'bg-gradient-to-b from-[#105186] to-[#0B3A60]'
                                  : 'bg-[#C7CED6]'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ROW 2: Central Axis Milestone Node */}
                    <div
                      className="row-start-2 flex items-center justify-center relative z-10 py-1"
                      style={{ gridColumnStart: idx + 1 }}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ring-4 ring-white transition-all duration-300 tabular-nums font-display font-extrabold text-xs ${
                          isReached
                            ? 'bg-[#105186] border-[#0B3A60] text-white shadow-sm'
                            : 'bg-[#EAF2F8] border-[#C7CED6] text-[#0B3A60]'
                        }`}
                        aria-label={
                          dateText
                            ? `Milestone ${stepNumber}, year ${dateText}`
                            : `Milestone ${stepNumber}`
                        }
                      >
                        {dateText || stepNumber}
                      </div>
                    </div>

                    {/* ROW 3: Bottom Alternating Card */}
                    <div
                      className="row-start-3 flex flex-col justify-start pt-2"
                      style={{ gridColumnStart: idx + 1 }}
                    >
                      {!isTop && (
                        <div className="flex flex-col items-center">
                          {/* Vertical Connector Stem Up to Axis */}
                          <div className="flex flex-col items-center" aria-hidden="true">
                            <div
                              className={`w-[2px] h-7 transition-colors duration-300 ${
                                isReached
                                  ? 'bg-gradient-to-t from-[#105186] to-[#0B3A60]'
                                  : 'bg-[#C7CED6]'
                              }`}
                            />
                          </div>

                          <article
                            className="w-full bg-white rounded-xl border border-[#C7CED6] hover:border-[#105186] shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden"
                            style={{
                              opacity: isReached ? 1 : 0.72,
                              transform: isReached ? 'translateY(0)' : 'translateY(6px)',
                            }}
                          >
                            <div
                              className="h-[3px] w-full"
                              style={{
                                background:
                                  'linear-gradient(90deg, #0B3A60 0%, #105186 55%, #C7CED6 100%)',
                              }}
                            />
                            <MilestoneCardMedia
                              imageUrl={milestone.imageUrl}
                              alt={fullTitle}
                            />
                            <div className="p-4 space-y-2">
                              <div className="text-[11px] font-bold text-[#105186] tabular-nums flex items-center gap-1.5">
                                <span>{dateText || `Milestone ${stepNumber}`}</span>
                              </div>
                              <h3 className="font-display text-[15px] font-extrabold text-[#263442] leading-snug">
                                {fullTitle}
                              </h3>
                              <p className="text-xs text-[#737D88] leading-relaxed">
                                {milestone.description}
                              </p>
                            </div>
                          </article>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* MOBILE & TABLET: Vertical Left-Track Timeline (below lg) */}
        <div className="lg:hidden relative">
          {/* Vertical Connecting Line on the Left */}
          {milestones.length > 1 && (
            <div
              aria-hidden="true"
              className="absolute left-5 top-5 bottom-5 w-[3px] rounded-full bg-[#C7CED6]/80 overflow-hidden"
            >
              <div
                className="w-full h-full rounded-full transition-transform duration-300 ease-out"
                style={{
                  background: 'linear-gradient(180deg, #105186 0%, #0B3A60 100%)',
                  transform: `scaleY(${scrollProgress})`,
                  transformOrigin: 'top center',
                }}
              />
            </div>
          )}

          <ol className="space-y-6 relative">
            {milestones.map((milestone, idx) => {
              const threshold =
                milestones.length > 1 ? idx / (milestones.length - 1) : 0;
              const isReached = scrollProgress >= threshold - 0.05;
              const stepNumber = String(idx + 1).padStart(2, '0');
              const dateText = (milestone.dateLabel || '').trim();
              const fullTitle = formatMilestoneHeading(milestone);

              return (
                <li key={milestone.id} className="relative pl-14">
                  {/* Left Marker Node */}
                  <div
                    className={`absolute left-0 top-1.5 w-10 h-10 rounded-full flex items-center justify-center border-2 ring-4 ring-[#F7F9FB] transition-colors duration-300 tabular-nums font-display font-extrabold text-[11px] z-10 ${
                      isReached
                        ? 'bg-[#105186] border-[#0B3A60] text-white shadow-xs'
                        : 'bg-[#EAF2F8] border-[#C7CED6] text-[#0B3A60]'
                    }`}
                    aria-hidden="true"
                  >
                    {dateText || stepNumber}
                  </div>

                  {/* Right Content Card */}
                  <article className="bg-white rounded-xl border border-[#C7CED6] shadow-2xs overflow-hidden">
                    <div
                      className="h-[3px] w-full"
                      style={{
                        background:
                          'linear-gradient(90deg, #105186 0%, #737D88 60%, #C7CED6 100%)',
                      }}
                    />
                    <MilestoneCardMedia
                      imageUrl={milestone.imageUrl}
                      alt={fullTitle}
                    />
                    <div className="p-4 sm:p-5 space-y-1.5">
                      <div className="text-[11px] font-bold text-[#105186] tabular-nums flex items-center gap-1.5">
                        <span>{dateText || `Milestone ${stepNumber}`}</span>
                        {dateText === '1988' && idx === 0 && (
                          <>
                            <span aria-hidden="true" className="text-[#C7CED6]">
                              ·
                            </span>
                            <span className="text-[#737D88]">Incorporation</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display text-base font-extrabold text-[#263442] leading-snug">
                        {fullTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#737D88] leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};
