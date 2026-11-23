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
      className="relative w-full min-h-[210px] sm:min-h-[270px] lg:h-[330px] min-[1920px]:h-[360px] min-[2560px]:h-[380px] flex items-center overflow-hidden bg-[var(--color-navy)] border-b border-[var(--color-border)] no-print"
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
          className="absolute inset-0 bg-gradient-to-br from-[#14213D] via-[#1B2B4E] to-[#0E182D]"
        />
      )}

      {/* Measured Deep Navy gradient overlays for crisp text contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#14213D]/90 via-[#14213D]/72 to-[#14213D]/38"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#14213D]/78 via-transparent to-[#14213D]/28"
      />

      {/* Subtle Amber architectural accent rule at bottom */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#FFB020] via-[#FFB020]/55 to-transparent"
      />

      {/* Foreground Title & Breadcrumb */}
      <div className="relative z-10 nd-container py-9 sm:py-12">
        <div className="max-w-3xl min-[1920px]:max-w-4xl space-y-3 nd-reveal">
          <div className="w-10 h-[3px] bg-[var(--color-amber)]" aria-hidden="true" />
          <h1
            className="font-display nd-h1-banner font-extrabold text-white tracking-tight drop-shadow-xs"
            style={{ textWrap: 'balance' }}
          >
            {title}
          </h1>

          {subtitle && (
            <p className="nd-lead text-[var(--color-linen)]/90 max-w-2xl min-[1920px]:max-w-3xl font-medium">
              {subtitle}
            </p>
          )}

          {/* Clean unboxed breadcrumb navigation below title */}
          <nav
            aria-label="Breadcrumb"
            className="pt-1 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--color-linen)]/85"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && (
                    <ChevronRight
                      className="w-3.5 h-3.5 text-[var(--color-amber)] shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {crumb.path && !isLast ? (
                    <button
                      type="button"
                      onClick={() => onNavigate(crumb.path!)}
                      className="inline-flex items-center gap-1 text-[var(--color-linen)]/90 hover:text-[var(--color-amber)] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
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
                          ? 'text-[var(--color-amber)] font-semibold'
                          : 'text-[var(--color-linen)]/85'
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
