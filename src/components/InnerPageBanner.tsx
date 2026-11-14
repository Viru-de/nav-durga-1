import React, { useState } from 'react';
import { ChevronRight, Home } from 'lucide-react';

export type InnerBannerTheme =
  | 'about'
  | 'products'
  | 'services'
  | 'infrastructure'
  | 'quality'
  | 'projects'
  | 'contact';

export interface BannerBreadcrumbItem {
  label: string;
  path?: string;
}

interface InnerPageBannerProps {
  theme: InnerBannerTheme;
  title: string;
  subtitle?: string;
  breadcrumbs: BannerBreadcrumbItem[];
  onNavigate: (path: string) => void;
}

const BANNER_ASSETS: Record<
  InnerBannerTheme,
  { webp: string; jpg: string; alt: string }
> = {
  about: {
    webp: '/assets/inner-banners/about-facility.webp',
    jpg: '/assets/inner-banners/about-facility.jpg',
    alt: 'Modern steel manufacturing facility and rolling mill interior at Nav Durga Ispat Pvt. Ltd.',
  },
  products: {
    webp: '/assets/inner-banners/products-steel.webp',
    jpg: '/assets/inner-banners/products-steel.jpg',
    alt: 'Structural steel beams, MS channels, equal angles, and steel coils ready for dispatch',
  },
  services: {
    webp: '/assets/inner-banners/services-machinery.webp',
    jpg: '/assets/inner-banners/services-machinery.jpg',
    alt: 'Industrial steel processing and rolling mill machinery in operation',
  },
  infrastructure: {
    webp: '/assets/inner-banners/infrastructure-plant.webp',
    jpg: '/assets/inner-banners/infrastructure-plant.jpg',
    alt: 'Heavy steel manufacturing plant bay with overhead crane and billet storage infrastructure',
  },
  quality: {
    webp: '/assets/inner-banners/quality-inspection.webp',
    jpg: '/assets/inner-banners/quality-inspection.jpg',
    alt: 'Steel testing and dimensional quality inspection on structural steel sections',
  },
  projects: {
    webp: '/assets/inner-banners/projects-construction.webp',
    jpg: '/assets/inner-banners/projects-construction.jpg',
    alt: 'Industrial structural steel construction frame utilizing heavy beams and channels',
  },
  contact: {
    webp: '/assets/inner-banners/contact-exterior.webp',
    jpg: '/assets/inner-banners/contact-exterior.jpg',
    alt: 'Nav Durga Ispat Pvt. Ltd. corporate manufacturing campus and administrative entrance',
  },
};

export const InnerPageBanner: React.FC<InnerPageBannerProps> = ({
  theme,
  title,
  subtitle,
  breadcrumbs,
  onNavigate,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const asset = BANNER_ASSETS[theme] || BANNER_ASSETS.about;

  return (
    <section
      aria-label={`${title} page header`}
      className="relative w-full min-h-[230px] sm:min-h-[280px] lg:h-[340px] flex items-center overflow-hidden bg-[#0B3A60] border-b border-[#C7CED6] no-print"
    >
      {/* Edge-to-edge industrial photographic backdrop */}
      {!imgFailed ? (
        <picture className="absolute inset-0 w-full h-full">
          <source srcSet={asset.webp} type="image/webp" />
          <img
            src={asset.jpg}
            alt={asset.alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-center select-none"
          />
        </picture>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#0B3A60] via-[#105186] to-[#263442]"
        />
      )}

      {/* Measured brand-blue gradient overlays for crisp white text contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0B3A60]/92 via-[#0B3A60]/78 to-[#105186]/58"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0B3A60]/85 via-transparent to-[#0B3A60]/35"
      />

      {/* Subtle architectural accent rule at bottom */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#105186] via-[#EAF2F8]/50 to-transparent"
      />

      {/* Foreground Title & Breadcrumb */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-3xl space-y-3 nd-reveal">
          <h1
            className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-xs"
            style={{ textWrap: 'balance' }}
          >
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm sm:text-base text-[#EAF2F8]/90 leading-relaxed max-w-2xl font-medium">
              {subtitle}
            </p>
          )}

          {/* Clean unboxed breadcrumb navigation below title */}
          <nav
            aria-label="Breadcrumb"
            className="pt-1 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-[#EAF2F8]/85"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && (
                    <ChevronRight
                      className="w-3.5 h-3.5 text-[#C7CED6]/80 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {crumb.path && !isLast ? (
                    <button
                      type="button"
                      onClick={() => onNavigate(crumb.path!)}
                      className="inline-flex items-center gap-1 text-[#EAF2F8]/90 hover:text-white hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {index === 0 && (
                        <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      )}
                      <span>{crumb.label}</span>
                    </button>
                  ) : (
                    <span
                      aria-current={isLast ? 'page' : undefined}
                      className={
                        isLast
                          ? 'text-white font-semibold'
                          : 'text-[#EAF2F8]/80'
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
};
