import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Building2 } from 'lucide-react';

interface AdvantageBlock {
  numeral: string;
  title: string;
  description: string;
  highlight: string;
  imageWebp: string;
  imageJpg: string;
  imageAlt: string;
  actionPath?: string;
}

interface NavDurgaAdvantageSectionProps {
  establishedYear: string;
  activeProfilesCount: number;
  onConnectSalesDesk: () => void;
  onNavigate: (path: string) => void;
}

export const NavDurgaAdvantageSection: React.FC<NavDurgaAdvantageSectionProps> = ({
  establishedYear,
  activeProfilesCount,
  onConnectSalesDesk,
  onNavigate,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const profileCount = activeProfilesCount > 0 ? activeProfilesCount : 22;
  const estYear = establishedYear || '1988';

  const blocks: AdvantageBlock[] = [
    {
      numeral: '01',
      title: 'Established Industry Presence',
      description: `Serving industrial and structural steel requirements since ${estYear} as a registered private limited steel enterprise.`,
      highlight: `Since ${estYear} · Raipur`,
      imageWebp: '/assets/advantage/advantage-1-facility.webp',
      imageJpg: '/assets/advantage/advantage-1-facility.jpg',
      imageAlt: 'Modern industrial steel rolling mill manufacturing facility',
      actionPath: '/about',
    },
    {
      numeral: '02',
      title: 'ERP-Backed Steel Product Range',
      description:
        'Structural Medium Section and Light Section steel profiles synchronized directly from our Nav Durga ERP catalog.',
      highlight: `${profileCount} Active Profiles`,
      imageWebp: '/assets/advantage/advantage-2-profiles.webp',
      imageJpg: '/assets/advantage/advantage-2-profiles.jpg',
      imageAlt: 'Neatly arranged structural steel beams, MS channels, and equal angles',
      actionPath: '/products',
    },
    {
      numeral: '03',
      title: 'Convenient Product & Rate Info',
      description:
        'Check active sizes, gauge specifications, and published section basic rates anytime through the online rate portal.',
      highlight: 'Live Daily Pricing',
      imageWebp: '/assets/advantage/advantage-3-rate-portal.webp',
      imageJpg: '/assets/advantage/advantage-3-rate-portal.jpg',
      imageAlt: 'Digital steel rate portal and product specification workstation',
      actionPath: '/product-rates',
    },
    {
      numeral: '04',
      title: 'Customer-Focused Approach',
      description:
        'Straightforward commercial coordination from requirement enquiry through quotation and dispatch scheduling.',
      highlight: 'Direct Sales Desk',
      imageWebp: '/assets/advantage/advantage-4-sales-desk.webp',
      imageJpg: '/assets/advantage/advantage-4-sales-desk.jpg',
      imageAlt: 'Industrial steel sales engineers coordinating a customer order',
      actionPath: '/contact',
    },
    {
      numeral: '05',
      title: 'Urla Industrial Area Location',
      description:
        'Located in Plot No. 435-A, Sector-C, Urla Industrial Area — supporting buyers across regional industrial corridors.',
      highlight: 'Raipur, Chhattisgarh',
      imageWebp: '/assets/advantage/advantage-5-urla-yard.webp',
      imageJpg: '/assets/advantage/advantage-5-urla-yard.jpg',
      imageAlt: 'Industrial steel distribution warehouse and dispatch bay in Urla Industrial Area',
      actionPath: '/contact',
    },
    {
      numeral: '06',
      title: 'Digital Accessibility',
      description:
        'Quickly inspect 3D steel profiles, submit online quotation requests, or reach our commercial desk via WhatsApp.',
      highlight: 'Web & WhatsApp',
      imageWebp: '/assets/advantage/advantage-6-digital-3d.webp',
      imageJpg: '/assets/advantage/advantage-6-digital-3d.jpg',
      imageAlt: 'Interactive 3D structural steel profile rendered on an engineering workstation',
      actionPath: '/products',
    },
  ];

  // Clean architectural column & row separator rules across Mobile (1-col), Tablet (2-col), Desktop (3-col)
  const getCellDividerClasses = (idx: number): string => {
    switch (idx) {
      case 0:
        return 'md:border-r lg:border-r';
      case 1:
        return 'border-t md:border-t-0 lg:border-r';
      case 2:
        return 'border-t md:border-r lg:border-t-0 lg:border-r-0';
      case 3:
        return 'border-t lg:border-r';
      case 4:
        return 'border-t md:border-r lg:border-r';
      case 5:
      default:
        return 'border-t';
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="our-advantage-heading"
      className="bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF] to-[#F7F9FB] border-b border-[#C7CED6] nd-section-py"
    >
      <div className="nd-container space-y-10 sm:space-y-12">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl min-[1920px]:max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2.5">
              <span className="w-6 h-[2px] bg-[#105186]" aria-hidden="true" />
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#105186]">
                OUR ADVANTAGE
              </span>
            </div>
            <h2
              id="our-advantage-heading"
              className="font-display nd-h2-section font-extrabold text-[#263442] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Why Choose Nav Durga Ispat?
            </h2>
            <p className="nd-lead text-[#737D88] max-w-xl min-[1920px]:max-w-2xl">
              Building lasting business relationships through experience, steel products and a commitment to dependable service.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/about')}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] py-2.5 rounded-xl bg-[#F7F9FB] hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#263442] hover:text-[#105186] text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Since {estYear} · Raipur</span>
            </button>

            <button
              type="button"
              onClick={onConnectSalesDesk}
              className="inline-flex items-center gap-2 px-5 min-h-[44px] py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Connect With Sales Desk</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Staggered 3-Column Editorial Grid */}
        <div className="border-t border-b border-[#C7CED6]/80">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {blocks.map((block, idx) => {
              const imageFirst = idx % 2 === 1;
              const imgHasFailed = Boolean(failedImages[block.numeral]);

              return (
                <article
                  key={block.numeral}
                  style={{
                    transitionDelay: revealed ? `${idx * 60}ms` : '0ms',
                  }}
                  className={`group flex ${
                    imageFirst ? 'flex-col-reverse' : 'flex-col'
                  } justify-between gap-6 py-8 md:px-6 lg:px-7 border-[#C7CED6]/80 transition-all duration-500 ease-out motion-reduce:transition-none ${getCellDividerClasses(
                    idx
                  )} ${
                    revealed
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 motion-reduce:opacity-100 motion-reduce:translate-y-0'
                  }`}
                >
                  {/* Text Column Block */}
                  <div className="flex-1 flex flex-col justify-between gap-5 py-1">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#105186] tabular-nums">
                          {block.numeral}
                        </span>
                        <span className="h-px flex-1 bg-[#C7CED6]/70" aria-hidden="true" />
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#263442] tracking-tight group-hover:text-[#105186] transition-colors">
                        {block.title}
                      </h3>

                      <p className="text-sm text-[#737D88] leading-relaxed">
                        {block.description}
                      </p>
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-[#105186] tracking-wide">
                        <span className="w-4 h-[2px] bg-[#105186]" aria-hidden="true" />
                        <span>{block.highlight}</span>
                      </div>

                      {block.actionPath && (
                        <button
                          type="button"
                          onClick={() => onNavigate(block.actionPath!)}
                          aria-label={`Explore ${block.title}`}
                          className="text-xs font-semibold text-[#737D88] hover:text-[#105186] inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Industrial Photograph Block */}
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#EAF2F8] border border-[#C7CED6]/70 relative">
                    {!imgHasFailed ? (
                      <picture className="block w-full h-full">
                        <source srcSet={block.imageWebp} type="image/webp" />
                        <img
                          src={block.imageJpg}
                          alt={block.imageAlt}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [block.numeral]: true,
                            }))
                          }
                          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      </picture>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#EAF2F8] via-[#FFFFFF] to-[#F7F9FB] flex flex-col items-center justify-center p-6 text-center gap-2">
                        <Building2 className="w-8 h-8 text-[#105186]" aria-hidden="true" />
                        <span className="text-xs font-bold text-[#0B3A60]">
                          {block.title}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
