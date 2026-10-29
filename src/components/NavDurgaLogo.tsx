import React from 'react';

export interface NavDurgaLogoProps {
  /** Sizing preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Extra container styling */
  className?: string;
  /** Image-specific classes */
  imgClassName?: string;
  /** Wrap in clean white card with subtle border for high-contrast visibility */
  withCard?: boolean;
  /** Alternative custom height (e.g. "h-10") */
  heightClass?: string;
  /** Click handler */
  onClick?: () => void;
  /** Priority loading */
  priority?: boolean;
}

/**
 * NavDurgaLogo
 * Single Official Master Brand Logo Component for Nav Durga ERP.
 * References the official master logo asset at /assets/nav_durga_logo.png.
 * Preserves exact aspect ratio, colors, and branding elements.
 */
export const NavDurgaLogo: React.FC<NavDurgaLogoProps> = ({
  size = 'md',
  className = '',
  imgClassName = '',
  withCard = false,
  heightClass,
  onClick,
  priority = false,
}) => {
  // Sizing map (maintaining 500:360 / ~1.39:1 aspect ratio)
  const sizeMap = {
    xs: 'h-7 max-w-[110px]',
    sm: 'h-9 max-w-[140px]',
    md: 'h-11 max-w-[170px]',
    lg: 'h-14 max-w-[210px]',
    xl: 'h-20 max-w-[300px]',
    '2xl': 'h-28 max-w-[400px]',
  };

  const selectedHeight = heightClass || sizeMap[size];

  const logoImg = (
    <img
      src="/assets/nav_durga_logo.png"
      alt="Nav Durga Group - Official Logo"
      className={`object-contain transition-transform select-none ${selectedHeight} ${imgClassName}`}
      loading={priority ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
    />
  );

  if (withCard) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center p-1.5 bg-white/95 rounded-xl border border-slate-200/90 shadow-xs backdrop-blur-xs ${onClick ? 'cursor-pointer hover:border-orange-300' : ''} ${className}`}
      >
        {logoImg}
      </div>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className={`inline-flex items-center cursor-pointer ${className}`}>
        {logoImg}
      </div>
    );
  }

  return <div className={`inline-flex items-center ${className}`}>{logoImg}</div>;
};

/**
 * Direct path constant to the single official master logo asset.
 * Used by Canvas renderers, PDF generators, and AI image prompts.
 */
export const OFFICIAL_NAV_DURGA_LOGO_PATH = '/assets/nav_durga_logo.png';
export const OFFICIAL_NAV_DURGA_LOGO_SVG = '/assets/nav_durga_logo.svg';
