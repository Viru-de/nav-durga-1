import {
  Product,
  CompanySettings,
  CategoryBasicRates,
  CompanyGradeBasicRates,
  NanoBananaPostType,
  NanoBananaVerifiedItem,
  NanoBananaGeneratedPost,
} from '../types';
import {
  calculateSimpleFinalRate,
  normalizeGrade,
  resolveProductCategoryBasicRate,
} from '../utils/rateCalculator';

import maaDurgaPortraitUrl from '../assets/images/maa_durga_lion_portrait_1790863911321.jpg';
import steelBuildingUrl from '../assets/images/steel_building_construction_1790863925525.jpg';
import steelPipesUrl from '../assets/images/steel_square_pipes_1790863937734.jpg';
import steelTmtUrl from '../assets/images/steel_tmt_bars_1790863948524.jpg';
import steelChannelsTopUrl from '../assets/images/steel_channels_bundle_top_1790865061499.jpg';
import steelChannelsGreenUrl from '../assets/images/steel_channels_green_ends_1790865075262.jpg';
import steelUChannelsUrl from '../assets/images/steel_uchannels_closeup_1790865086930.jpg';

const NANO_BANANA_HISTORY_KEY = 'navdurga_nano_banana_posts_v1';

/**
 * POST CONFIGURATION OPTIONS (AI Post Generator Module)
 * All Post Types available with verified ERP pricing
 */
export const NANO_BANANA_POST_TYPES: {
  id: NanoBananaPostType;
  label: string;
  shortDesc: string;
}[] = [
  {
    id: 'base-rate',
    label: '1. Medium + SL Base Rate',
    shortDesc:
      'Professional daily price update showing ONLY Medium Base Rate & SL Base Rate (no individual product list).',
  },
  {
    id: 'all-products-price-update',
    label: '2. All Medium + SL Products',
    shortDesc:
      'Complete product price list separated into Medium and SL (Super Light) sections with S.No, Size, Gauge Diff & Final Rate.',
  },
  {
    id: 'festival-price-update',
    label: '3. Festival + Product',
    shortDesc:
      'Recognizable festival theme (Diwali, Ganesh, Holi, Patriotic, Navratri, etc.) combined with verified ERP prices.',
  },
  {
    id: 'medium-price-update',
    label: 'Medium Section Products Only',
    shortDesc:
      'All Medium grade structural steel products with verified Basic Rate + Gauge Diff.',
  },
  {
    id: 'sl-price-update',
    label: 'SL Section Products Only',
    shortDesc:
      'All SL (Super Light) steel channels & structural products with latest ERP rates.',
  },
  {
    id: 'product-update',
    label: 'Single Product Spotlight',
    shortDesc:
      'Dedicated spotlight post for a specific ERP steel product with full rate breakdown.',
  },
  {
    id: 'custom-product-post',
    label: 'Custom Product Bulletin',
    shortDesc:
      'Select custom ERP products & headline while strictly using verified ERP prices.',
  },
];

export type SceneCompositionType =
  | 'molten_furnace_monolith'
  | 'gantry_crane_blueprint'
  | 'royal_arch_stockyard'
  | 'diagonal_forge_cascade'
  | 'skyscraper_truss_command'
  | 'ceremonial_mandap_pavilion'
  | 'twin_pillar_industrial'
  | 'isometric_mill_horizon';

export interface NanoBananaVisualVariation {
  index: number;
  id: string;
  name: string;
  sceneType: SceneCompositionType;
  cardArrangement: 'stacked' | 'side_by_side' | 'staggered_arch' | 'command_vault';
  bgTop: string;
  bgMid: string;
  bgBottom: string;
  headerBg: string;
  accentPrimary: string;
  accentSecondary: string;
  cardBg: string;
  cardBorder: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  rowEvenBg: string;
  rowOddBg: string;
  textPrimary: string;
  textMuted: string;
  priceHighlight: string;
  badgeBg: string;
  badgeText: string;
  isLightMode?: boolean;
}

export const NANO_BANANA_VARIATIONS: NanoBananaVisualVariation[] = [
  {
    index: 0,
    id: 'molten_furnace_monolith',
    name: 'Concept 1: Molten Furnace Pour & Twin Monoliths',
    sceneType: 'molten_furnace_monolith',
    cardArrangement: 'stacked',
    bgTop: '#08142c',
    bgMid: '#0f2547',
    bgBottom: '#060e1f',
    headerBg: '#102a56',
    accentPrimary: '#f59e0b',
    accentSecondary: '#38bdf8',
    cardBg: 'rgba(15, 32, 67, 0.94)',
    cardBorder: '#f59e0b',
    tableHeaderBg: '#1e3a8a',
    tableHeaderText: '#fef08a',
    rowEvenBg: 'rgba(30, 58, 138, 0.36)',
    rowOddBg: 'rgba(15, 23, 42, 0.58)',
    textPrimary: '#ffffff',
    textMuted: '#cbd5e1',
    priceHighlight: '#fde047',
    badgeBg: '#dc2626',
    badgeText: '#ffffff',
  },
  {
    index: 1,
    id: 'gantry_crane_blueprint',
    name: 'Concept 2: Overhead Gantry Crane & Engineering Rig',
    sceneType: 'gantry_crane_blueprint',
    cardArrangement: 'side_by_side',
    bgTop: '#07192f',
    bgMid: '#0c2d48',
    bgBottom: '#051324',
    headerBg: '#0284c7',
    accentPrimary: '#38bdf8',
    accentSecondary: '#facc15',
    cardBg: 'rgba(12, 34, 60, 0.94)',
    cardBorder: '#38bdf8',
    tableHeaderBg: '#0369a1',
    tableHeaderText: '#ffffff',
    rowEvenBg: 'rgba(2, 132, 199, 0.25)',
    rowOddBg: 'rgba(7, 25, 47, 0.62)',
    textPrimary: '#ffffff',
    textMuted: '#bae6fd',
    priceHighlight: '#facc15',
    badgeBg: '#f59e0b',
    badgeText: '#0f172a',
  },
  {
    index: 2,
    id: 'royal_arch_stockyard',
    name: 'Concept 3: Royal Mill Crest Arch & Stockyard Showcase',
    sceneType: 'royal_arch_stockyard',
    cardArrangement: 'staggered_arch',
    bgTop: '#3b0711',
    bgMid: '#5c0c1b',
    bgBottom: '#1f0409',
    headerBg: '#7f1d1d',
    accentPrimary: '#fbbf24',
    accentSecondary: '#fde047',
    cardBg: 'rgba(69, 10, 10, 0.94)',
    cardBorder: '#fbbf24',
    tableHeaderBg: '#991b1b',
    tableHeaderText: '#fef9c3',
    rowEvenBg: 'rgba(127, 29, 29, 0.45)',
    rowOddBg: 'rgba(45, 7, 12, 0.65)',
    textPrimary: '#ffffff',
    textMuted: '#fecaca',
    priceHighlight: '#fde047',
    badgeBg: '#f59e0b',
    badgeText: '#1c1917',
  },
  {
    index: 3,
    id: 'diagonal_forge_cascade',
    name: 'Concept 4: Diagonal Steel Girder Forge & Spark Cascade',
    sceneType: 'diagonal_forge_cascade',
    cardArrangement: 'command_vault',
    bgTop: '#0f172a',
    bgMid: '#1e293b',
    bgBottom: '#090d16',
    headerBg: '#1e293b',
    accentPrimary: '#f97316',
    accentSecondary: '#fbbf24',
    cardBg: 'rgba(15, 23, 42, 0.95)',
    cardBorder: '#f97316',
    tableHeaderBg: '#334155',
    tableHeaderText: '#fed7aa',
    rowEvenBg: 'rgba(51, 65, 85, 0.45)',
    rowOddBg: 'rgba(15, 23, 42, 0.65)',
    textPrimary: '#f8fafc',
    textMuted: '#94a3b8',
    priceHighlight: '#fb923c',
    badgeBg: '#ea580c',
    badgeText: '#ffffff',
  },
  {
    index: 4,
    id: 'skyscraper_truss_command',
    name: 'Concept 5: High-Rise Structural Truss & Daylight Bulletin',
    sceneType: 'skyscraper_truss_command',
    cardArrangement: 'stacked',
    bgTop: '#fffbeb',
    bgMid: '#fef3c7',
    bgBottom: '#fde68a',
    headerBg: '#881337',
    accentPrimary: '#b91c1c',
    accentSecondary: '#1d4ed8',
    cardBg: 'rgba(255, 255, 255, 0.97)',
    cardBorder: '#dc2626',
    tableHeaderBg: '#1e293b',
    tableHeaderText: '#facc15',
    rowEvenBg: '#f8fafc',
    rowOddBg: '#ffffff',
    textPrimary: '#0f172a',
    textMuted: '#475569',
    priceHighlight: '#b91c1c',
    badgeBg: '#1e3a8a',
    badgeText: '#ffffff',
    isLightMode: true,
  },
  {
    index: 5,
    id: 'twin_pillar_industrial',
    name: 'Concept 6: Prime Mill Emerald & Twin Pillar Vault',
    sceneType: 'twin_pillar_industrial',
    cardArrangement: 'side_by_side',
    bgTop: '#042f2e',
    bgMid: '#064e3b',
    bgBottom: '#021f1e',
    headerBg: '#047857',
    accentPrimary: '#fbbf24',
    accentSecondary: '#34d399',
    cardBg: 'rgba(6, 55, 48, 0.94)',
    cardBorder: '#fbbf24',
    tableHeaderBg: '#065f46',
    tableHeaderText: '#fef08a',
    rowEvenBg: 'rgba(5, 150, 105, 0.28)',
    rowOddBg: 'rgba(4, 47, 46, 0.65)',
    textPrimary: '#ffffff',
    textMuted: '#a7f3d0',
    priceHighlight: '#fde047',
    badgeBg: '#eab308',
    badgeText: '#064e3b',
  },
  {
    index: 6,
    id: 'isometric_mill_horizon',
    name: 'Concept 7: Architectural Steel Horizon & Platinum Grid',
    sceneType: 'isometric_mill_horizon',
    cardArrangement: 'staggered_arch',
    bgTop: '#f1f5f9',
    bgMid: '#e2e8f0',
    bgBottom: '#cbd5e1',
    headerBg: '#0f172a',
    accentPrimary: '#1d4ed8',
    accentSecondary: '#dc2626',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    cardBorder: '#1e3a8a',
    tableHeaderBg: '#1e3a8a',
    tableHeaderText: '#ffffff',
    rowEvenBg: '#eff6ff',
    rowOddBg: '#ffffff',
    textPrimary: '#0f172a',
    textMuted: '#475569',
    priceHighlight: '#1d4ed8',
    badgeBg: '#dc2626',
    badgeText: '#ffffff',
    isLightMode: true,
  },
  {
    index: 7,
    id: 'ceremonial_mandap_pavilion',
    name: 'Concept 8: Ceremonial Festive Mandap & Golden Toran',
    sceneType: 'ceremonial_mandap_pavilion',
    cardArrangement: 'command_vault',
    bgTop: '#451a03',
    bgMid: '#78350f',
    bgBottom: '#290f02',
    headerBg: '#9a3412',
    accentPrimary: '#fde047',
    accentSecondary: '#fb923c',
    cardBg: 'rgba(69, 26, 3, 0.94)',
    cardBorder: '#fde047',
    tableHeaderBg: '#b45309',
    tableHeaderText: '#fef9c3',
    rowEvenBg: 'rgba(180, 83, 9, 0.38)',
    rowOddBg: 'rgba(69, 26, 3, 0.65)',
    textPrimary: '#ffffff',
    textMuted: '#fde68a',
    priceHighlight: '#fde047',
    badgeBg: '#dc2626',
    badgeText: '#ffffff',
  },
];

// Preloaded image cache for instant crisp rendering
const imageCache: Record<string, HTMLImageElement> = {};
const ASSET_URLS: Record<string, string> = {
  masterOfficialLogo: '/assets/nav_durga_logo.png',
  maaDurga: maaDurgaPortraitUrl,
  steelBuilding: steelBuildingUrl,
  steelPipes: steelPipesUrl,
  steelTmt: steelTmtUrl,
  steelChannelsTop: steelChannelsTopUrl,
  steelChannelsGreen: steelChannelsGreenUrl,
  steelUChannels: steelUChannelsUrl,
};

export type FestivalThemeCategory =
  | 'diwali'
  | 'holi'
  | 'ganesh'
  | 'navratri'
  | 'national'
  | 'vishwakarma'
  | 'dussehra'
  | 'sankranti'
  | 'new_year'
  | 'akshaya_tritiya'
  | 'ram_navami'
  | 'mahashivratri'
  | 'engineers'
  | 'teachers'
  | 'rakhi'
  | 'generic_festival';

export class NanoBananaPostService {
  private static lastVariationIndex = -1;
  private static generationCounter = 0;

  public static async preloadAssets(): Promise<void> {
    const promises = Object.entries(ASSET_URLS).map(([key, url]) => {
      if (imageCache[key]?.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageCache[key] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = url;
      });
    });
    await Promise.all(promises);
  }

  /**
   * Performs automatic ERP data integrity check
   */
  public static validateLogoAndData(
    post: Partial<NanoBananaGeneratedPost>,
    items: NanoBananaVerifiedItem[],
    mediumBasicRate: number,
    slBasicRate: number
  ) {
    const mediumRateMatches = post.mediumBasicRate === mediumBasicRate;
    const slRateMatches = post.slBasicRate === slBasicRate;
    const productRatesMatches = items.every(
      (it) => it.finalRate === it.basicRate + it.gaugeDifference
    );
    const companyNameMatches = true;
    const dateMatches = Boolean(post.effectiveDate);

    const dataValidationStatus = {
      mediumRateMatches,
      slRateMatches,
      productRatesMatches,
      companyNameMatches,
      dateMatches,
      allPassed:
        mediumRateMatches &&
        slRateMatches &&
        productRatesMatches &&
        companyNameMatches &&
        dateMatches,
    };

    return { dataValidationStatus };
  }

  /**
   * Detects which specific festival theme category is active so the visual composition
   * is genuinely recognizable for any selected festival title.
   */
  public static detectFestivalCategory(festivalName?: string): FestivalThemeCategory {
    const lower = (festivalName || '').toLowerCase();
    if (
      lower.includes('diwali') ||
      lower.includes('deepawali') ||
      lower.includes('deepavali') ||
      lower.includes('dhanteras')
    ) {
      return 'diwali';
    }
    if (
      lower.includes('holi') ||
      lower.includes('dhuleti') ||
      lower.includes('color') ||
      lower.includes('colour') ||
      lower.includes('rang')
    ) {
      return 'holi';
    }
    if (
      lower.includes('ganesh') ||
      lower.includes('ganpati') ||
      lower.includes('vinayak') ||
      lower.includes('bappa')
    ) {
      return 'ganesh';
    }
    if (
      lower.includes('republic') ||
      lower.includes('independence') ||
      lower.includes('tiranga') ||
      lower.includes('flag') ||
      lower.includes('national')
    ) {
      return 'national';
    }
    if (
      lower.includes('engineer') ||
      lower.includes('technical') ||
      lower.includes('architect')
    ) {
      return 'engineers';
    }
    if (
      lower.includes('teacher') ||
      lower.includes('guru') ||
      lower.includes('purnima') ||
      lower.includes('mentor') ||
      lower.includes('educator')
    ) {
      return 'teachers';
    }
    if (lower.includes('raksha') || lower.includes('bandhan') || lower.includes('rakhi')) {
      return 'rakhi';
    }
    if (
      lower.includes('vishwakarma') ||
      lower.includes('biswakarma') ||
      lower.includes('factory') ||
      lower.includes('workshop')
    ) {
      return 'vishwakarma';
    }
    if (
      lower.includes('navratri') ||
      lower.includes('mata') ||
      lower.includes('durga') ||
      lower.includes('garba')
    ) {
      return 'navratri';
    }
    if (
      lower.includes('dussehra') ||
      lower.includes('vijayadashami') ||
      lower.includes('dashami')
    ) {
      return 'dussehra';
    }
    if (
      lower.includes('sankranti') ||
      lower.includes('uttarayan') ||
      lower.includes('pongal') ||
      lower.includes('lohri')
    ) {
      return 'sankranti';
    }
    if (lower.includes('akshaya') || lower.includes('tritiya')) {
      return 'akshaya_tritiya';
    }
    if (lower.includes('ram') || lower.includes('navami')) {
      return 'ram_navami';
    }
    if (lower.includes('shivratri') || lower.includes('mahadev') || lower.includes('shiva')) {
      return 'mahashivratri';
    }
    if (
      lower.includes('financial year') ||
      lower.includes('new year') ||
      lower.includes('samvat') ||
      lower.includes('opening')
    ) {
      return 'new_year';
    }
    return 'generic_festival';
  }

  /**
   * Resolves the exact verified ERP pricing for a single product.
   * Formula strictly enforced: Final Rate = Basic Rate + Gauge Difference
   */
  public static computeVerifiedProductItem(
    product: Product,
    categoryBasicRates?: CategoryBasicRates,
    gradeBasicRates?: CompanyGradeBasicRates,
    effectiveDate?: string
  ): NanoBananaVerifiedItem {
    const normGrade = normalizeGrade(product.grade || product.gaugeType);
    const section =
      product.section ||
      (product.rateSource?.includes('NS ISPAT') ? 'LIGHT SECTION' : 'MEDIUM SECTION');
    const rateSource =
      product.rateSource ||
      (section === 'LIGHT SECTION'
        ? 'UNIT-2 - NS ISPAT (I) PVT. LTD.'
        : 'NAVDURGA ISPAT PVT. LTD.');

    const gaugeDifference = Number(product.gaugeDifference) || 0;
    let basicRate = resolveProductCategoryBasicRate(product, categoryBasicRates);

    const slExplicitRate = gradeBasicRates?.['NAVDURGA ISPAT PVT. LTD.']?.SL;
    const medExplicitRate =
      categoryBasicRates?.['MEDIUM SECTION'] ??
      gradeBasicRates?.['NAVDURGA ISPAT PVT. LTD.']?.Medium;
    const lightExplicitRate = categoryBasicRates?.['LIGHT SECTION'];

    if (
      product.baseRate &&
      product.baseRate > 0 &&
      product.currentPrice === product.baseRate + gaugeDifference
    ) {
      basicRate = product.baseRate;
    } else if (section === 'LIGHT SECTION' && lightExplicitRate !== undefined) {
      basicRate = lightExplicitRate;
    } else if (normGrade === 'SL' && slExplicitRate !== undefined) {
      basicRate = slExplicitRate;
    } else if (section === 'MEDIUM SECTION' && medExplicitRate !== undefined) {
      basicRate = medExplicitRate;
    } else if (product.baseRate && product.baseRate > 0) {
      basicRate = product.baseRate;
    }

    // Strict ERP Formula: Final Rate = Basic Rate + Gauge Difference
    const finalRate = calculateSimpleFinalRate(basicRate, gaugeDifference);
    const previousRate =
      product.previousPrice && product.previousPrice > 0 ? product.previousPrice : finalRate;
    const priceChange =
      product.priceChange !== undefined ? product.priceChange : finalRate - previousRate;

    return {
      id: product.id,
      productName: product.productName || product.name,
      code: product.code || 'ND-01',
      size: product.size || product.grade || '',
      gauge: product.gaugeType || normGrade,
      grade: normGrade,
      section,
      rateSource,
      basicRate,
      gaugeDifference,
      finalRate,
      previousRate,
      priceChange,
      effectiveDate:
        effectiveDate ||
        product.effectiveFrom ||
        new Date().toISOString().split('T')[0],
      unit: product.unit || 'MT',
    };
  }

  /**
   * Filters and computes verified ERP items for the selected Post Type
   */
  public static getVerifiedItemsForPostType(params: {
    postType: NanoBananaPostType;
    products: Product[];
    categoryBasicRates?: CategoryBasicRates;
    gradeBasicRates?: CompanyGradeBasicRates;
    selectedProductId?: string;
    selectedCustomProductIds?: string[];
    festivalSectionFilter?: 'MEDIUM' | 'SL' | 'ALL' | 'CUSTOM';
    effectiveDate?: string;
  }): {
    items: NanoBananaVerifiedItem[];
    mediumBasicRate: number;
    slBasicRate: number;
    lightBasicRate: number;
  } {
    const {
      postType,
      products,
      categoryBasicRates,
      gradeBasicRates,
      selectedProductId,
      selectedCustomProductIds,
      festivalSectionFilter = 'ALL',
      effectiveDate,
    } = params;

    const activeProducts = products.filter((p) => p.status === 'Active' || !p.status);
    const allVerified = activeProducts.map((p) =>
      this.computeVerifiedProductItem(p, categoryBasicRates, gradeBasicRates, effectiveDate)
    );

    const medItems = allVerified.filter(
      (i) => i.section === 'MEDIUM SECTION' && i.grade === 'Medium'
    );
    const slMedItems = allVerified.filter((i) => i.grade === 'SL');
    const lightItems = allVerified.filter((i) => i.section === 'LIGHT SECTION');

    const mediumBasicRate =
      categoryBasicRates?.['MEDIUM SECTION'] ??
      gradeBasicRates?.['NAVDURGA ISPAT PVT. LTD.']?.Medium ??
      medItems[0]?.basicRate ??
      49711;
    const lightBasicRate =
      categoryBasicRates?.['LIGHT SECTION'] ??
      lightItems[0]?.basicRate ??
      42211;
    const slBasicRate =
      gradeBasicRates?.['NAVDURGA ISPAT PVT. LTD.']?.SL ??
      slMedItems[0]?.basicRate ??
      mediumBasicRate;

    let filtered: NanoBananaVerifiedItem[] = [];

    switch (postType) {
      case 'base-rate':
        // Base Rate post contains ONLY Company Name, Effective Date, MEDIUM BASE RATE, SL BASE RATE (no individual product list)
        filtered = [];
        break;

      case 'all-product':
      case 'all-products-price-update':
        filtered = allVerified;
        break;

      case 'medium-price-update':
        filtered = allVerified.filter(
          (item) => item.section === 'MEDIUM SECTION' && item.grade === 'Medium'
        );
        if (filtered.length === 0) {
          filtered = allVerified.filter((item) => item.grade === 'Medium');
        }
        break;

      case 'sl-price-update':
        filtered = allVerified.filter((item) => item.grade === 'SL');
        break;

      case 'product-update':
        if (selectedProductId) {
          filtered = allVerified.filter((item) => item.id === selectedProductId);
        }
        if (filtered.length === 0 && allVerified.length > 0) {
          filtered = [allVerified[0]];
        }
        break;

      case 'festival-price-update':
        if (festivalSectionFilter === 'CUSTOM' && selectedCustomProductIds && selectedCustomProductIds.length > 0) {
          const idSet = new Set(selectedCustomProductIds);
          filtered = allVerified.filter((item) => idSet.has(item.id));
        } else if (festivalSectionFilter === 'MEDIUM') {
          filtered = allVerified.filter(
            (item) => item.section === 'MEDIUM SECTION' && item.grade === 'Medium'
          );
        } else if (festivalSectionFilter === 'SL') {
          filtered = allVerified.filter((item) => item.grade === 'SL');
        } else {
          filtered = allVerified;
        }
        break;

      case 'custom-product-post':
        if (selectedCustomProductIds && selectedCustomProductIds.length > 0) {
          const idSet = new Set(selectedCustomProductIds);
          filtered = allVerified.filter((item) => idSet.has(item.id));
        }
        if (filtered.length === 0) {
          filtered = allVerified.slice(0, 6);
        }
        break;
    }

    return {
      items: filtered,
      mediumBasicRate,
      slBasicRate,
      lightBasicRate,
    };
  }

  /**
   * NANO BANANA IMAGE PROMPT ENGINE
   * Uses Nano Banana strictly for the creative visual/design layer while ERP data remains the sole source of truth.
   * Each click produces a genuinely new visual concept (scene, composition, subject arrangement, festive/industrial storytelling).
   */
  public static buildNanoBananaPrompt(params: {
    postType: NanoBananaPostType;
    items: NanoBananaVerifiedItem[];
    company: CompanySettings;
    mediumBasicRate: number;
    slBasicRate: number;
    lightBasicRate: number;
    effectiveDate: string;
    variation: NanoBananaVisualVariation;
    conceptIndex: number;
    festivalName?: string;
    customHeadline?: string;
    customNote?: string;
  }): string {
    const {
      postType,
      items,
      mediumBasicRate,
      slBasicRate,
      effectiveDate,
      variation,
      conceptIndex,
      festivalName,
    } = params;

    const sceneDescriptions: Record<SceneCompositionType, string> = {
      molten_furnace_monolith:
        'Dramatic wide-angle steel rolling mill interior where a glowing ladle pours molten golden steel into billets, framed by heavy structural I-beams and twin industrial monolith podiums.',
      gantry_crane_blueprint:
        'Overhead industrial gantry crane lifting freshly rolled MS Channel bundles inside a high-bay steel plant, overlaid with architectural isometric CAD truss schematics and precision engineering geometry.',
      royal_arch_stockyard:
        'Grand ceremonial industrial archway overlooking a sunlit steel stockyard stacked with prime MS Angles, Channels, and Joists ready for heavy trailer dispatch.',
      diagonal_forge_cascade:
        'Dynamic 15-degree angled structural steel girder composition with hot rolling mill rollers, glowing forge sparks cascading across brushed titanium steel plates.',
      skyscraper_truss_command:
        'Modern high-rise steel skyscraper construction silhouette against a golden horizon with cantilevered structural steel trusses and clean editorial framing.',
      ceremonial_mandap_pavilion:
        'Auspicious Indian ceremonial mandap pavilion blending traditional festive torans, brass temple bells, and golden mandala artistry with heavy structural steel pillars.',
      twin_pillar_industrial:
        'Symmetrical twin structural steel H-beam columns supporting an executive industrial vault with metallic reflections and prime mill certification seals.',
      isometric_mill_horizon:
        'Panoramic bird-eye industrial steel plant skyline in Raipur with cooling beds, structural rolling stands, and crisp geometric grid lines.',
    };

    const sceneNarrative = sceneDescriptions[variation.sceneType];

    let generatedPrompt = '';
    if (postType === 'base-rate') {
      if (festivalName && festivalName.trim()) {
        const festCat = this.detectFestivalCategory(festivalName);
        const festivalPrompts: Record<FestivalThemeCategory, string> = {
          diwali: 'Transform the festival visual layer of the existing Nav Durga Medium + SL Base Rate poster into a premium Diwali theme with elegant diyas, warm golden festive lighting, subtle fireworks and refined Indian festive decoration. Preserve the existing poster layout and all business information.',
          holi: 'Transform the festival visual layer of the existing Nav Durga Medium + SL Base Rate poster into a premium Holi theme with tasteful colorful powder accents, dynamic but professional color splashes and festive energy. Preserve the existing poster layout and all business information.',
          engineers: 'Transform the festival visual layer into a premium Engineers\' Day industrial theme using structural steel, engineering drawings, technical lines and modern industrial visual elements. Preserve the existing poster layout and all business information.',
          teachers: 'Transform the festival visual layer into a professional Teachers\' Day theme with knowledge, light, and wisdom motifs, royal blue & gold accents, and educational tribute. Preserve the existing poster layout and all business information.',
          national: 'Transform the festival visual layer into a patriotic tricolour theme featuring the Indian national flag colors (saffron, white, green), Ashoka Chakra accents, and corporate strength. Preserve the existing poster layout and all business information.',
          dussehra: 'Transform the festival visual layer into a premium Dussehra theme with golden victory bow & arrow motifs, Apta gold leaves, and traditional marigold festive arches. Preserve the existing poster layout and all business information.',
          ganesh: 'Transform the festival visual layer into a premium Ganesh Chaturthi theme with divine Lord Ganesha medallion, warm amber festive lighting, and marigold garlands. Preserve the existing poster layout and all business information.',
          navratri: 'Transform the festival visual layer into a sacred Navratri theme with Maa Durga strength motifs, crimson-and-gold chunari, and garba celebration accents. Preserve the existing poster layout and all business information.',
          vishwakarma: 'Transform the festival visual layer into a Vishwakarma Puja industrial theme with golden precision gears, anvil, hammer, and sacred mill furnace homage. Preserve the existing poster layout and all business information.',
          sankranti: 'Transform the festival visual layer into a Makar Sankranti theme with soaring kites, radiant sunrise, and sky blue festive energy. Preserve the existing poster layout and all business information.',
          new_year: 'Transform the festival visual layer into a prosperous New Financial Year opening theme with Shubh-Labh swastika, sacred kalash, and golden ledger motifs. Preserve the existing poster layout and all business information.',
          akshaya_tritiya: 'Transform the festival visual layer into an Akshaya Tritiya theme with cascading gold coins, lotus motifs, and eternal wealth symbols. Preserve the existing poster layout and all business information.',
          ram_navami: 'Transform the festival visual layer into a Ram Navami theme with golden bow & arrow, saffron flags, and temple arch motifs. Preserve the existing poster layout and all business information.',
          mahashivratri: 'Transform the festival visual layer into a Mahashivratri theme with sacred golden Trishul, Damaru, and glowing Om medallion. Preserve the existing poster layout and all business information.',
          rakhi: 'Transform the festival visual layer into a Raksha Bandhan theme with golden Rakhi thread, silk tassels, and rose gold festive accents. Preserve the existing poster layout and all business information.',
          generic_festival: `Transform the festival visual layer into a festive celebration for '${festivalName}' with marigold toran garlands, glowing brass lamps, and golden festive accents. Preserve the existing poster layout and all business information.`,
        };

        generatedPrompt = `${festivalPrompts[festCat] || festivalPrompts.generic_festival}
Strict ERP Verified Data Layer (Application-Controlled — Do NOT invent or alter any numbers):
- Company: NAV DURGA ISPAT PRIVATE LIMITED
- Effective Date: ${effectiveDate}
- MEDIUM BASE RATE: ₹${mediumBasicRate.toLocaleString('en-IN')} / MT
- SL BASE RATE: ₹${slBasicRate.toLocaleString('en-IN')} / MT`;
      } else {
        generatedPrompt = `Create a fresh, original visual concept (Concept #${conceptIndex + 1}: ${variation.name}) for a professional industrial Base Rate announcement poster.
Scene & Composition: ${sceneNarrative}
Strict ERP Verified Data Layer (Application-Controlled — Do NOT invent or alter any numbers):
- Company: NAV DURGA ISPAT PRIVATE LIMITED
- Effective Date: ${effectiveDate}
- MEDIUM BASE RATE: ₹${mediumBasicRate.toLocaleString('en-IN')} / MT
- SL BASE RATE: ₹${slBasicRate.toLocaleString('en-IN')} / MT
Do NOT show individual product rows. Create a clean, high-contrast industrial background scene with zero hallucinated text.`;
      }
    } else if (postType === 'all-product' || postType === 'all-products-price-update') {
      const productPreview = items
        .slice(0, 10)
        .map(
          (it, idx) =>
            `${idx + 1}. ${it.productName} | ${it.size} | Gauge Diff: +₹${it.gaugeDifference.toLocaleString('en-IN')} | Final Rate: ₹${it.finalRate.toLocaleString('en-IN')}/MT`
        )
        .join('\n');

      generatedPrompt = `Create a fresh, original visual concept (Concept #${conceptIndex + 1}: ${variation.name}) for a complete ERP Product Rate List poster.
Scene & Composition: ${sceneNarrative}
Strict Data Hierarchy (Application-Controlled ERP Source of Truth):
First Row: MEDIUM BASE RATE: ₹${mediumBasicRate.toLocaleString('en-IN')} / MT | SL BASE RATE: ₹${slBasicRate.toLocaleString('en-IN')} / MT
Below That (${items.length} Verified ERP Products — S.No | Product | Size | Gauge Difference | Final Rate):
${productPreview}
Use Nano Banana strictly for the creative industrial background layer.`;
    } else if (postType === 'festival-price-update') {
      const festCat = this.detectFestivalCategory(festivalName);
      const festivalVisualBriefs: Record<FestivalThemeCategory, string> = {
        diwali:
          'Genuine Shubh Deepawali (Diwali) visual storytelling: ornate glowing terracotta and brass Diyas with flickering flames, hanging Akash Kandil lanterns, marigold and ashoka leaf Toran garlands, golden Rangoli mandala geometry, and festive firework sparkles integrated with structural steel beams and industrial atmosphere.',
        holi:
          'Genuine Happy Holi celebration visual storytelling: vibrant celebratory gulal powder splashes, rainbow colour explosions, traditional brass pichkari, marigold garlands, and festive energy blended with heavy structural steel girders.',
        ganesh:
          'Genuine Ganesh Chaturthi visual storytelling: auspicious Lord Ganesha (Ganpati) emblem with royal crown, sacred trunk, tilak, Modak bowl, blooming red hibiscus and Durva garlands, hanging brass temple bells (Ghanta), and Ashtavinayak temple arch integrated professionally with structural steel pillars.',
        navratri:
          'Genuine Shubh Navratri & Jai Mata Di visual storytelling: sacred Maa Durga & Lion crest, golden Trishul (Trident) & Damaru, nine glowing Navadurga Garba Kalash lamps, royal crimson-and-gold Chunari drapery, and festive marigold garlands integrated with steel strength.',
        national:
          'Genuine Indian National Celebration (Republic Day / Independence Day) visual storytelling: saffron, white, and green Tiranga tricolor waves, golden Ashoka Chakra emblem, patriotic triumph banners, and rising high-rise structural steel pillars.',
        vishwakarma:
          'Genuine Vishwakarma Puja industrial worship storytelling: divine engineering homage featuring a golden precision mechanical gear Chakra, sacred forging Anvil & Hammer, rolling mill rollers, crane hook, ceremonial Kalash with coconut and mango leaves, marigold garlands draped over heavy steel I-beams, and sacred furnace fire.',
        dussehra:
          'Genuine Happy Vijayadashami (Dussehra) visual storytelling: golden Victory Bow & Arrow (Dhanush-Baan), auspicious Sona (Apta/Shami) gold leaves, royal victory arch, and marigold garlands crowning structural steel towers.',
        sankranti:
          'Genuine Makar Sankranti visual storytelling: radiant Uttarayan rising Sun (Surya Dev), vibrant diamond kites and spools soaring across the sky alongside high-rise structural steel cranes, and festive harvest motifs.',
        new_year:
          'Genuine New Financial Year Opening visual storytelling: auspicious Shubh-Labh Swastika, sacred Kalash, traditional crimson Bahi-Khata ledger with gold emblem, and rising structural steel towers symbolizing industrial prosperity.',
        akshaya_tritiya:
          'Genuine Akshaya Tritiya visual storytelling: divine gold coins cascading into a sacred brass Kalash, golden lotus motifs, auspicious Swastika, and unbreakable structural steel pillars symbolizing enduring wealth.',
        ram_navami:
          'Genuine Ram Navami visual storytelling: sacred golden Bow & Arrow (Dhanush), auspicious saffron flags, marigold flower arch, and grand temple pillars merged with structural steel strength.',
        mahashivratri:
          'Genuine Mahashivratri visual storytelling: sacred golden Trishul (Trident), Damaru, glowing Om medallion, sacred Bilva leaves, and monumental steel structural beams.',
        engineers:
          'Genuine Engineers\' Day industrial storytelling: engineering CAD drawing grid, precision gear & compass motifs, metallic steel blue atmosphere, and structural steel beams.',
        teachers:
          'Genuine Teachers\' Day storytelling: book of knowledge, glowing lamp of wisdom, royal blue & gold accents, and educational tribute integrated with steel strength.',
        rakhi:
          'Genuine Raksha Bandhan storytelling: golden Rakhi thread, silk tassels, rose gold festive accents, and unbreakable steel bonding.',
        generic_festival:
          `Genuine Indian festive celebration for "${festivalName || 'Festive Greetings'}" featuring ornate marigold toran garlands, glowing brass oil lamps, golden mandala geometry, and industrial steel mill aesthetics.`,
      };

      generatedPrompt = `Create a fresh, original festive + industrial visual concept (Concept #${conceptIndex + 1}: ${variation.name}) for NAV DURGA ISPAT PRIVATE LIMITED.
Festival / Occasion: ${festivalName || 'Festive Greetings'}
Festival Visual Storytelling: ${festivalVisualBriefs[festCat]}
Scene & Composition: ${sceneNarrative}
Verified ERP Data Layer (Application-Controlled):
- Effective Date: ${effectiveDate}
- MEDIUM BASE RATE: ₹${mediumBasicRate.toLocaleString('en-IN')} / MT | SL BASE RATE: ₹${slBasicRate.toLocaleString('en-IN')} / MT
- Included Verified ERP Products: ${items.length} items`;
    } else if (postType === 'medium-price-update') {
      generatedPrompt = `Create a professional industrial steel price update poster for NAV DURGA ISPAT PRIVATE LIMITED (Concept #${conceptIndex + 1}: ${variation.name}).
Post Type: MEDIUM PRICE UPDATE
Effective Date: ${effectiveDate}
Medium Section Basic Rate: ₹${mediumBasicRate.toLocaleString('en-IN')}/MT
Verified ERP Medium Products (${items.length} items):
${items.slice(0, 10).map((it) => `- ${it.productName} ${it.size}: Basic ₹${it.basicRate} + Gauge ₹${it.gaugeDifference} = Final ₹${it.finalRate}/MT`).join('\n')}
Scene & Composition: ${sceneNarrative}`;
    } else if (postType === 'sl-price-update') {
      generatedPrompt = `Create a professional industrial steel price update poster for NAV DURGA ISPAT PRIVATE LIMITED (Concept #${conceptIndex + 1}: ${variation.name}).
Post Type: SL (SUPER LIGHT) PRICE UPDATE
Effective Date: ${effectiveDate}
SL Basic Rate: ₹${slBasicRate.toLocaleString('en-IN')}/MT
Verified ERP SL Products (${items.length} items):
${items.slice(0, 10).map((it) => `- ${it.productName} ${it.size}: Basic ₹${it.basicRate} + Gauge ₹${it.gaugeDifference} = Final ₹${it.finalRate}/MT`).join('\n')}
Scene & Composition: ${sceneNarrative}`;
    } else if (postType === 'product-update' && items[0]) {
      const it = items[0];
      generatedPrompt = `Create a high-impact single steel product spotlight poster for NAV DURGA ISPAT PRIVATE LIMITED (Concept #${conceptIndex + 1}: ${variation.name}).
Post Type: PRODUCT UPDATE
Effective Date: ${effectiveDate}
Featured Product: ${it.productName} ${it.size} (${it.grade})
Basic Rate: ₹${it.basicRate.toLocaleString('en-IN')}/MT | Gauge Difference: ₹${it.gaugeDifference.toLocaleString('en-IN')}/MT | Final Rate: ₹${it.finalRate.toLocaleString('en-IN')}/${it.unit}
Scene & Composition: ${sceneNarrative}`;
    } else if (postType === 'custom-product-post') {
      generatedPrompt = `Create a custom industrial steel rate bulletin poster for NAV DURGA ISPAT PRIVATE LIMITED (Concept #${conceptIndex + 1}: ${variation.name}).
Headline: ${params.customHeadline || 'SPECIAL MILL RATE BULLETIN'}
Note: ${params.customNote || 'Ex-Works Raipur Dispatch'}
Effective Date: ${effectiveDate}
Verified ERP Products (${items.length} items):
${items.slice(0, 10).map((it) => `- ${it.productName} ${it.size}: Final ₹${it.finalRate}/MT`).join('\n')}
Scene & Composition: ${sceneNarrative}`;
    } else {
      generatedPrompt = `Create a professional industrial steel price update poster for NAV DURGA ISPAT PRIVATE LIMITED (${variation.name}, Effective Date: ${effectiveDate}).`;
    }

    return generatedPrompt;
  }

  /**
   * Formats the accompanying WhatsApp text caption using strictly verified ERP rates
   */
  public static buildWhatsAppCaption(params: {
    postType: NanoBananaPostType;
    postTypeLabel: string;
    items: NanoBananaVerifiedItem[];
    company: CompanySettings;
    mediumBasicRate: number;
    slBasicRate: number;
    lightBasicRate: number;
    effectiveDate: string;
    festivalName?: string;
    customHeadline?: string;
    customNote?: string;
  }): string {
    const {
      postType,
      items,
      mediumBasicRate,
      slBasicRate,
      effectiveDate,
      festivalName,
      customHeadline,
      customNote,
    } = params;

    // 1. Base Rate Caption: ONLY Company Name, Effective Date, MEDIUM BASE RATE, SL BASE RATE
    if (postType === 'base-rate') {
      return [
        `🏭 *NAV DURGA ISPAT PRIVATE LIMITED*`,
        `📅 *Effective Date:* ${effectiveDate}`,
        ``,
        `🔹 *MEDIUM BASE RATE*`,
        `*₹${mediumBasicRate.toLocaleString('en-IN')} / MT*`,
        ``,
        `🔸 *SL BASE RATE*`,
        `*₹${slBasicRate.toLocaleString('en-IN')} / MT*`,
      ].join('\n');
    }

    // 2. Product Spotlight Caption
    if (postType === 'product-update' && items[0]) {
      const it = items[0];
      return [
        `🏭 *NAV DURGA ISPAT PRIVATE LIMITED*`,
        `📍 _Urla Industrial Area, Raipur (C.G.)_`,
        ``,
        `📢 *PRODUCT RATE SPOTLIGHT*`,
        `📅 *Effective Date:* ${effectiveDate}`,
        ``,
        `🔹 *${it.productName}* [Size: ${it.size}]`,
        `Grade: ${it.grade} | Mill: ${it.rateSource}`,
        `• Basic Rate: ₹${it.basicRate.toLocaleString('en-IN')}/MT`,
        `• Gauge Difference: +₹${it.gaugeDifference.toLocaleString('en-IN')}/MT`,
        `➔ *FINAL RATE: ₹${it.finalRate.toLocaleString('en-IN')}/${it.unit}*`,
        ``,
        `📐 _Formula: Final Rate = Basic Rate + Gauge Difference_`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📞 *Orders & Booking:* 9009544333 | 7000923464 | 9713144333`,
      ].join('\n');
    }

    // 3. All Product, Medium, SL, Festival, and Custom Post Caption
    const lines: string[] = [];
    lines.push(`🏭 *NAV DURGA ISPAT PRIVATE LIMITED*`);
    if (postType === 'festival-price-update' && festivalName) {
      lines.push(`✨ *${festivalName.toUpperCase()}* ✨`);
    } else if (postType === 'custom-product-post' && customHeadline) {
      lines.push(`📢 *${customHeadline.toUpperCase()}*`);
    }
    lines.push(`📅 *Effective Date:* ${effectiveDate}`);
    lines.push('');
    lines.push(
      `*MEDIUM BASE RATE:* ₹${mediumBasicRate.toLocaleString('en-IN')} / MT  |  *SL BASE RATE:* ₹${slBasicRate.toLocaleString('en-IN')} / MT`
    );
    lines.push('━━━━━━━━━━━━━━━━━━━━');

    items.forEach((it, idx) => {
      const sign = it.gaugeDifference >= 0 ? '+' : '-';
      lines.push(
        `${idx + 1}. *${it.productName}* | Size: *${it.size}* | Gauge Diff: ${sign}₹${Math.abs(it.gaugeDifference).toLocaleString('en-IN')} ➔ *Final Rate: ₹${it.finalRate.toLocaleString('en-IN')}/${it.unit}*`
      );
    });

    if (customNote && postType === 'custom-product-post') {
      lines.push('');
      lines.push(`📌 *Note:* ${customNote}`);
    }

    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`📞 *Contact:* 9009544333 | 7000923464 | 9713144333`);

    return lines.join('\n');
  }

  /**
   * Guarantees a genuinely fresh visual concept every single click (never repeating the immediate previous one)
   */
  public static pickNextVariation(
    postType: NanoBananaPostType,
    preferredVariationId?: string
  ): { variation: NanoBananaVisualVariation; conceptIndex: number } {
    this.generationCounter += 1;

    if (preferredVariationId && preferredVariationId !== 'auto') {
      const found = NANO_BANANA_VARIATIONS.find((v) => v.id === preferredVariationId);
      if (found) {
        this.lastVariationIndex = found.index;
        return { variation: found, conceptIndex: this.generationCounter };
      }
    }

    const candidates = NANO_BANANA_VARIATIONS.filter(
      (v) => v.index !== this.lastVariationIndex
    );
    const picked =
      candidates[(this.generationCounter + Math.floor(Math.random() * candidates.length)) % candidates.length] ||
      NANO_BANANA_VARIATIONS[0];
    this.lastVariationIndex = picked.index;
    return { variation: picked, conceptIndex: this.generationCounter };
  }

  /**
   * Generates a complete Nano Banana Post:
   * Post Configuration -> Select Base Rate / All Product / Festival + Price Update
   * -> Load latest ERP verified data
   * -> Generate fresh Nano Banana visual concept
   * -> Apply exact ERP pricing/data as application-controlled layer
   */
  public static async generateNewPost(params: {
    postType: NanoBananaPostType;
    products: Product[];
    company: CompanySettings;
    categoryBasicRates?: CategoryBasicRates;
    gradeBasicRates?: CompanyGradeBasicRates;
    selectedProductId?: string;
    selectedCustomProductIds?: string[];
    festivalName?: string;
    festivalLogoUrl?: string;
    festivalSectionFilter?: 'MEDIUM' | 'SL' | 'ALL' | 'CUSTOM';
    customHeadline?: string;
    customNote?: string;
    preferredVariationId?: string;
    effectiveDate?: string;
    language?: 'English' | 'Hindi' | 'Hinglish';
    aspectRatio?: '1:1' | '4:5' | '3:4';
    includePricing?: boolean;
    skipRemoteApi?: boolean;
    overrideMediumRate?: number;
    overrideSlRate?: number;
  }): Promise<NanoBananaGeneratedPost> {
    await this.preloadAssets();

    const effectiveDate =
      params.effectiveDate || new Date().toISOString().split('T')[0];

    const verified =
      this.getVerifiedItemsForPostType({
        postType: params.postType,
        products: params.products,
        categoryBasicRates: params.categoryBasicRates,
        gradeBasicRates: params.gradeBasicRates,
        selectedProductId: params.selectedProductId,
        selectedCustomProductIds: params.selectedCustomProductIds,
        festivalSectionFilter: params.festivalSectionFilter,
        effectiveDate,
      });

    const items = verified.items;
    const mediumBasicRate = params.overrideMediumRate ?? verified.mediumBasicRate;
    const slBasicRate = params.overrideSlRate ?? verified.slBasicRate;
    const lightBasicRate = verified.lightBasicRate;

    const postTypeMeta =
      NANO_BANANA_POST_TYPES.find((t) => t.id === params.postType) || {
        id: params.postType,
        label:
          params.postType === 'base-rate'
            ? 'Base Rate'
            : params.postType === 'all-product'
            ? 'All Product'
            : params.postType === 'festival-price-update'
            ? 'Festival + Price Update'
            : 'Price Update',
        shortDesc: '',
      };

    const { variation, conceptIndex } = this.pickNextVariation(
      params.postType,
      'auto'
    );
    const seed = Date.now() + Math.floor(Math.random() * 90000) + conceptIndex * 137;

    const prompt = this.buildNanoBananaPrompt({
      postType: params.postType,
      items,
      company: params.company,
      mediumBasicRate,
      slBasicRate,
      lightBasicRate,
      effectiveDate,
      variation,
      conceptIndex,
      festivalName: params.festivalName,
      customHeadline: params.customHeadline,
      customNote: params.customNote,
    });

    let rawAiImageDataUrl: string | undefined;
    let modelUsed = 'Gemini AI Studio Engine';
    let dynamicTagline = 'Stronger Steel For A Brighter Tomorrow • IS:2062 Certified';
    let dynamicBadge = 'EX-WORKS RAIPUR';

    if (!params.skipRemoteApi) {
      try {
        const response = await fetch('/api/ai/nano-banana-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            postType: params.postType,
            festivalName: params.festivalName,
            language: params.language || 'English',
            aspectRatio: params.aspectRatio || '4:5',
            includePricing: params.includePricing ?? true,
            seed,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.aiImageDataUrl) {
            rawAiImageDataUrl = data.aiImageDataUrl;
            modelUsed = data.modelUsed || modelUsed;
          } else if (data.styleConfig) {
            modelUsed = data.modelUsed || modelUsed;
            if (data.styleConfig.tagline) dynamicTagline = data.styleConfig.tagline;
            if (data.styleConfig.badgeText) dynamicBadge = data.styleConfig.badgeText;
          }
        }
      } catch {
        // Fallback silently to studio renderer
      }
    }

    // Render high-resolution poster with 100% verified ERP prices in an application-controlled layer
    const canvas = document.createElement('canvas');
    await this.renderVerifiedPostToCanvas({
      canvas,
      postType: params.postType,
      postTypeLabel: postTypeMeta.label,
      items,
      company: params.company,
      mediumBasicRate,
      slBasicRate,
      lightBasicRate,
      effectiveDate,
      variation,
      conceptIndex,
      seed,
      rawAiImageDataUrl,
      festivalName: params.festivalName,
      festivalLogoUrl: params.festivalLogoUrl,
      customHeadline: params.customHeadline,
      customNote: params.customNote,
      dynamicTagline,
      dynamicBadge,
    });

    const imageDataUrl = canvas.toDataURL('image/png');
    const whatsappCaption = this.buildWhatsAppCaption({
      postType: params.postType,
      postTypeLabel: postTypeMeta.label,
      items,
      company: params.company,
      mediumBasicRate,
      slBasicRate,
      lightBasicRate,
      effectiveDate,
      festivalName: params.festivalName,
      customHeadline: params.customHeadline,
      customNote: params.customNote,
    });

    const generatedPost: NanoBananaGeneratedPost = {
      id: `nb-post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      postType: params.postType,
      postTypeLabel: postTypeMeta.label,
      title:
        params.postType === 'festival-price-update' && params.festivalName
          ? `${params.festivalName} — Steel Rate Update`
          : params.postType === 'base-rate'
          ? `Nav Durga Base Rate Update`
          : `Nav Durga ${postTypeMeta.label}`,
      subtitle: dynamicTagline,
      effectiveDate,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      prompt,
      seed,
      variationIndex: variation.index,
      variationName: variation.name,
      colorScheme: variation.id,
      imageDataUrl,
      rawAiImageDataUrl,
      whatsappCaption,
      verifiedItems: items,
      mediumBasicRate,
      slBasicRate,
      lightBasicRate,
      festivalName: params.festivalName,
      customHeadline: params.customHeadline,
      customNote: params.customNote,
      modelUsed,
    };

    this.savePostToHistory(generatedPost);
    return generatedPost;
  }

  /**
   * Master Canvas Dispatcher:
   * - 'base-rate' -> Dedicated Base Rate composition containing ONLY Company Name, Effective Date, MEDIUM BASE RATE, SL BASE RATE
   * - 'all-product' -> Dedicated All Product composition with First Row (MEDIUM BASE RATE | SL BASE RATE) & Table (S.No | Product | Size | Gauge Difference | Final Rate)
   * - 'festival-price-update' -> Dedicated Recognizable Festival Storytelling + Verified ERP Rates
   */
  public static async renderVerifiedPostToCanvas(params: {
    canvas: HTMLCanvasElement;
    postType: NanoBananaPostType;
    postTypeLabel: string;
    items: NanoBananaVerifiedItem[];
    company: CompanySettings;
    mediumBasicRate: number;
    slBasicRate: number;
    lightBasicRate: number;
    effectiveDate: string;
    variation: NanoBananaVisualVariation;
    conceptIndex?: number;
    seed: number;
    rawAiImageDataUrl?: string;
    festivalName?: string;
    festivalLogoUrl?: string;
    customHeadline?: string;
    customNote?: string;
    dynamicTagline?: string;
    dynamicBadge?: string;
  }): Promise<void> {
    if (params.postType === 'base-rate') {
      await this.renderBaseRateOnlyCanvas(params);
      return;
    }

    if (params.postType === 'festival-price-update') {
      await this.renderFestivalPriceUpdateCanvas(params);
      return;
    }

    await this.renderAllProductRateListCanvas(params);
  }

  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  }

  /**
   * Helper: Draws user-uploaded festival logo on canvas with exact aspect ratio & zero distortion
   */
  public static async drawUploadedFestivalLogoBadge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    maxW: number,
    maxH: number,
    festivalLogoUrl: string
  ): Promise<void> {
    if (!festivalLogoUrl) return;
    try {
      const img = await this.loadImage(festivalLogoUrl);
      if (!img) return;

      const imgRatio = img.width / img.height;
      let drawW = maxW;
      let drawH = drawW / imgRatio;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * imgRatio;
      }

      const drawX = x + (maxW - drawW) / 2;
      const drawY = y + (maxH - drawH) / 2;

      ctx.save();
      // Glassmorphic white badge container with rounded corners and golden border
      this.roundRect(ctx, x - 10, y - 10, maxW + 20, maxH + 20, 18);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();

      // Draw exact uploaded festival logo image
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch (err) {
      console.warn('Could not draw festival logo on canvas:', err);
    }
  }

  /**
   * ============================================================================
   * 1. BASE RATE CANVAS RENDERER
   * Contains ONLY:
   * - NAV DURGA ISPAT PRIVATE LIMITED
   * - Effective Date
   * - MEDIUM BASE RATE (₹XX,XXX / MT)
   * - SL BASE RATE (₹XX,XXX / MT)
   * Never shows individual product list. Substantially varies scene & layout every click.
   * ============================================================================
   */
  /**
   * ============================================================================
   * 1. BASE RATE CANVAS RENDERER (NAV DURGA MASTER POSTER TEMPLATE)
   * Converts the uploaded Nav Durga Master Poster image into a fixed, high-res
   * HTML/Canvas composition with live ERP rates, date/time, payment terms, notice,
   * right steel graphic, and dynamic daily/festival greeting banner.
   * ============================================================================
   */
  private static async renderBaseRateOnlyCanvas(params: {
    canvas: HTMLCanvasElement;
    mediumBasicRate: number;
    slBasicRate: number;
    effectiveDate: string;
    company?: CompanySettings;
    variation?: NanoBananaVisualVariation;
    conceptIndex?: number;
    seed?: number;
    rawAiImageDataUrl?: string;
    festivalName?: string;
    festivalLogoUrl?: string;
  }): Promise<void> {
    const {
      canvas,
      mediumBasicRate,
      slBasicRate,
      effectiveDate,
      company,
      festivalName,
    } = params;

    const W = 1200;
    const H = 1250;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const festCat = festivalName && festivalName.trim() ? this.detectFestivalCategory(festivalName) : null;

    // 1. Clean Master Poster Background with Dynamic Themed Frame
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Frame Border Colors based on active festival theme
    let frameOuterStroke = '#0f172a';
    let frameInnerStroke = '#e2e8f0';

    if (festCat === 'holi') {
      frameOuterStroke = '#ec4899';
      frameInnerStroke = '#38bdf8';
    } else if (festCat === 'diwali') {
      frameOuterStroke = '#f59e0b';
      frameInnerStroke = '#fde047';
    } else if (festCat === 'engineers') {
      frameOuterStroke = '#06b6d4';
      frameInnerStroke = '#38bdf8';
    } else if (festCat === 'national') {
      frameOuterStroke = '#f97316';
      frameInnerStroke = '#16a34a';
    } else if (festCat === 'dussehra' || festCat === 'navratri') {
      frameOuterStroke = '#dc2626';
      frameInnerStroke = '#fde047';
    } else if (festCat === 'ganesh') {
      frameOuterStroke = '#ea580c';
      frameInnerStroke = '#fef08a';
    } else if (festCat === 'teachers') {
      frameOuterStroke = '#1d4ed8';
      frameInnerStroke = '#fde047';
    } else if (festCat) {
      frameOuterStroke = '#f59e0b';
      frameInnerStroke = '#fde047';
    }

    // Outer Poster Border Frame
    ctx.strokeStyle = frameOuterStroke;
    ctx.lineWidth = 6;
    this.roundRect(ctx, 24, 24, W - 48, H - 48, 20);
    ctx.stroke();

    // Inner Accent Frame
    ctx.strokeStyle = frameInnerStroke;
    ctx.lineWidth = 2;
    this.roundRect(ctx, 32, 32, W - 64, H - 64, 16);
    ctx.stroke();

    // Corner / Background Themed Visual Accents
    if (festCat === 'holi') {
      const splashes = [
        { x: 50, y: 50, r: 60, col: 'rgba(236, 72, 153, 0.18)' },
        { x: W - 50, y: 50, r: 70, col: 'rgba(6, 182, 212, 0.18)' },
        { x: 50, y: H - 50, r: 65, col: 'rgba(234, 179, 8, 0.18)' },
        { x: W - 50, y: H - 50, r: 75, col: 'rgba(34, 197, 94, 0.18)' },
      ];
      splashes.forEach((s) => {
        ctx.fillStyle = s.col;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (festCat === 'diwali') {
      const glows = [
        { x: 80, y: 80, r: 90 },
        { x: W - 80, y: 80, r: 90 },
      ];
      glows.forEach((g) => {
        const radGrad = ctx.createRadialGradient(g.x, g.y, 10, g.x, g.y, g.r);
        radGrad.addColorStop(0, 'rgba(253, 224, 71, 0.25)');
        radGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
      });
    } else if (festCat === 'engineers') {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < W; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 40); ctx.lineTo(gx, H - 40); ctx.stroke();
      }
      for (let gy = 40; gy < H; gy += 40) {
        ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 40, gy); ctx.stroke();
      }
    }
    ctx.restore();

    // 2. HEADER SECTION
    const headerX = 48;
    const headerY = 42;
    const headerW = 1104;
    const headerH = 168;

    const festTitle = festivalName || '';

    if (festCat === 'holi') {
      await this.drawHoliFestivalHeader(ctx, headerX, headerY, headerW, headerH, festTitle);
    } else if (festCat === 'diwali' || festCat === 'navratri') {
      await this.drawDiwaliNavDurgaFestivalHeader(ctx, headerX, headerY, headerW, headerH);
    } else if (festCat === 'engineers') {
      await this.drawEngineersDayFestivalHeader(ctx, headerX, headerY, headerW, headerH, festTitle);
    } else if (festCat === 'dussehra') {
      await this.drawDussehraFestivalHeader(ctx, headerX, headerY, headerW, headerH, festTitle);
    } else if (festCat === 'ganesh') {
      await this.drawGaneshFestivalHeader(ctx, headerX, headerY, headerW, headerH, festTitle);
    } else if (festCat === 'teachers') {
      await this.drawTeachersDayFestivalHeader(ctx, headerX, headerY, headerW, headerH, festTitle);
    } else if (festCat === 'national') {
      await this.drawTricolourNationalFestivalHeader(ctx, headerX, headerY, headerW, headerH, festTitle);
    } else if (festCat) {
      await this.drawGenericFestivalHeader(ctx, headerX, headerY, headerW, headerH, festTitle, festCat);
    } else {
      // Normal Day Header
      ctx.save();
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, headerX, headerY, headerW, headerH, 16);
      ctx.fill();

      // Nav Durga Logo on Left
      await this.drawMasterLogo(ctx, headerX + 16, headerY + 16, 120, 136);

      // Main Heading: NAVDURGA GROUP
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('NAVDURGA GROUP', headerX + 150, headerY + 64);

      // Company Name Subheading
      ctx.fillStyle = '#b91c1c';
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', headerX + 150, headerY + 98);

      // Mill Info
      ctx.fillStyle = '#475569';
      ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Ex-Works Re-Rolling Mill • Phase-II, Urla Industrial Area, Raipur (C.G.)', headerX + 150, headerY + 128);

      // Indian Flag / Tiranga Emblem in Top Right
      const flagX = headerX + headerW - 140;
      const flagY = headerY + 28;
      const flagW = 120;
      const flagH = 36;
      ctx.fillStyle = '#f97316'; ctx.fillRect(flagX, flagY, flagW, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(flagX, flagY + 12, flagW, 12);
      ctx.fillStyle = '#16a34a'; ctx.fillRect(flagX, flagY + 24, flagW, 12);
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.strokeRect(flagX, flagY, flagW, flagH);
      ctx.fillStyle = '#1e3a8a'; ctx.font = '900 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('PROUDLY INDIAN', flagX + flagW / 2, flagY + 21);
      ctx.textAlign = 'left';
      ctx.restore();
    }

    // 3. DATE AND TIME BAR
    const dateBarY = 224;
    const dateBarH = 52;
    const now = new Date();
    const dateObj = effectiveDate ? new Date(effectiveDate) : now;
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const formattedDateStr = `${dd}-${mm}-${yyyy}`;

    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const weekdayStr = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dateTimeText = `DATE: ${formattedDateStr}   |   TIME: ${timeStr}   |   DAY: ${weekdayStr}`;

    ctx.save();
    this.roundRect(ctx, headerX, dateBarY, headerW, dateBarH, 8);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#eab308';
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '800 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(dateTimeText, headerX + headerW / 2, dateBarY + 34);
    ctx.textAlign = 'left';
    ctx.restore();

    // 4. MARKET OPENINGS BANNER
    const marketBarY = 286;
    const marketBarH = 68;
    ctx.save();
    this.roundRect(ctx, headerX, marketBarY, headerW, marketBarH, 8);
    const redGrad = ctx.createLinearGradient(headerX, marketBarY, headerX + headerW, marketBarY + marketBarH);
    redGrad.addColorStop(0, '#dc2626');
    redGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = redGrad;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MARKET OPENINGS', headerX + headerW / 2, marketBarY + 46);
    ctx.textAlign = 'left';
    ctx.restore();

    // 5. BASIC RATES (EX-WORKS) BANNER
    const basicBarY = 366;
    const basicBarH = 60;
    ctx.save();
    this.roundRect(ctx, headerX, basicBarY, headerW, basicBarH, 8);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BASIC RATES (EX-WORKS)', headerX + headerW / 2, basicBarY + 41);
    ctx.textAlign = 'left';
    ctx.restore();

    // 6. RATE REVISED SECTION & RIGHT PANEL GRID
    const contentY = 438;
    const leftW = 710;
    const rightX = headerX + leftW + 24;
    const rightW = headerW - leftW - 24;

    // --- LEFT COLUMN: RATE REVISED & BASE RATES ---
    ctx.save();
    this.roundRect(ctx, headerX, contentY, leftW, 48, 8);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    ctx.fillStyle = '#991b1b';
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🔴 RATE REVISED — TODAY EX-WORKS RATES', headerX + 18, contentY + 32);

    // Medium Section Box
    const medY = contentY + 60;
    const medH = 168;
    this.roundRect(ctx, headerX, medY, leftW, medH, 16);
    const medGrad = ctx.createLinearGradient(headerX, medY, headerX + leftW, medY + medH);
    medGrad.addColorStop(0, '#eff6ff');
    medGrad.addColorStop(1, '#dbeafe');
    ctx.fillStyle = medGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1d4ed8';
    ctx.stroke();

    ctx.fillStyle = '#1e40af';
    ctx.font = '800 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MEDIUM SECTION BASE RATE', headerX + 24, medY + 38);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = '900 56px "JetBrains Mono", monospace';
    ctx.fillText(`₹${mediumBasicRate.toLocaleString('en-IN')} / MT`, headerX + 24, medY + 106);

    ctx.fillStyle = '#475569';
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Includes IS:2062 Structural Medium Channels, Angles & Beams', headerX + 24, medY + 144);

    // SL Section Box
    const slY = medY + medH + 16;
    const slH = 168;
    this.roundRect(ctx, headerX, slY, leftW, slH, 16);
    const slGrad = ctx.createLinearGradient(headerX, slY, headerX + leftW, slY + slH);
    slGrad.addColorStop(0, '#fffbeb');
    slGrad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = slGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    ctx.fillStyle = '#92400e';
    ctx.font = '800 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SL / LIGHT SECTION BASE RATE', headerX + 24, slY + 38);

    ctx.fillStyle = '#b45309';
    ctx.font = '900 56px "JetBrains Mono", monospace';
    ctx.fillText(`₹${slBasicRate.toLocaleString('en-IN')} / MT`, headerX + 24, slY + 106);

    ctx.fillStyle = '#78350f';
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Includes Super Light Section Channels, 5KG & 8KG Special Sections', headerX + 24, slY + 144);
    ctx.restore();

    // --- RIGHT COLUMN: STEEL IMAGE & PAYMENT TERMS ---
    ctx.save();
    this.roundRect(ctx, rightX, contentY, rightW, 228, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    try {
      const steelImg = await this.loadImage(steelChannelsTopUrl);
      ctx.save();
      this.roundRect(ctx, rightX + 6, contentY + 6, rightW - 12, 216, 8);
      ctx.clip();
      ctx.drawImage(steelImg, rightX + 6, contentY + 6, rightW - 12, 216);
      ctx.restore();
    } catch {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rightX + 12, contentY + 12, rightW - 24, 204);
      ctx.fillStyle = '#fde047';
      ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NAVDURGA STEEL SECTIONS', rightX + rightW / 2, contentY + 115);
      ctx.textAlign = 'left';
    }

    // Payment Terms Box
    const payY = contentY + 240;
    const payH = 168;
    this.roundRect(ctx, rightX, payY, rightW, payH, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('💳 PAYMENT TERMS', rightX + 16, payY + 34);

    ctx.fillStyle = '#334155';
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('• 100% Advance Payment / Immediate RTGS', rightX + 16, payY + 66);
    ctx.fillText('  prior to trailer dispatch from mill gate.', rightX + 16, payY + 90);
    ctx.fillText('• Valid for same-day delivery bookings.', rightX + 16, payY + 114);
    ctx.fillText('• Subject to bank confirmation.', rightX + 16, payY + 138);
    ctx.restore();

    // 7. IMPORTANT NOTICE BOX
    const noticeY = contentY + 420;
    const noticeH = 98;
    ctx.save();
    this.roundRect(ctx, headerX, noticeY, headerW, noticeH, 12);
    ctx.fillStyle = '#fefce8';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#eab308';
    ctx.stroke();

    ctx.fillStyle = '#854d0e';
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('⚠️ IMPORTANT NOTICE', headerX + 24, noticeY + 30);

    ctx.fillStyle = '#713f12';
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('• All prices are Ex-Works Raipur Mill Gate.   • Loading charges & GST applicable extra as per government norms.', headerX + 24, noticeY + 58);
    ctx.fillText('• Rates subject to revision without prior notice based on raw material market conditions.', headerX + 24, noticeY + 80);
    ctx.restore();

    // 8. FESTIVAL / DAILY MESSAGE BANNER (BOTTOM THEMED BANNER)
    const festivalBannerY = noticeY + 110;
    const festivalBannerH = 118;

    let greetingMessage = 'Wishing you a very happy and productive day.';
    let subtitleMsg = 'NAV DURGA GROUP • BUILDING STRONGER NATIONS WITH TRUST, INTEGRITY & UNCOMPROMISED QUALITY';

    if (festivalName && festivalName.trim()) {
      const festClean = festivalName.trim();
      if (festClean.toLowerCase().startsWith('happy') || festClean.toLowerCase().startsWith('shubh')) {
        greetingMessage = festClean;
      } else {
        greetingMessage = `Wishing you a very Happy ${festClean}!`;
      }

      if (festCat === 'engineers') {
        subtitleMsg = 'NAV DURGA GROUP • SALUTING THE ARCHITECTS & ENGINEERS BUILDING INDIA\'S FUTURE';
      } else if (festCat === 'teachers') {
        subtitleMsg = 'NAV DURGA GROUP • HONOURING THE MENTORS SHAPING NATION BUILDERS';
      } else if (festCat === 'national') {
        subtitleMsg = 'NAV DURGA GROUP • PROUDLY BUILDING INDIA WITH UNMATCHED STEEL STRENGTH';
      }
    }

    ctx.save();
    this.roundRect(ctx, headerX, festivalBannerY, headerW, festivalBannerH, 14);
    const festGrad = ctx.createLinearGradient(headerX, festivalBannerY, headerX + headerW, festivalBannerY + festivalBannerH);

    let bannerStroke = '#eab308';
    let bannerTextColor = '#fde047';

    if (festCat === 'holi') {
      festGrad.addColorStop(0, '#4c1d95');
      festGrad.addColorStop(0.5, '#831843');
      festGrad.addColorStop(1, '#1e3a8a');
      bannerStroke = '#f43f5e';
      bannerTextColor = '#fde047';
    } else if (festCat === 'diwali' || festCat === 'navratri') {
      festGrad.addColorStop(0, '#451a03');
      festGrad.addColorStop(0.5, '#78350f');
      festGrad.addColorStop(1, '#422006');
      bannerStroke = '#fde047';
      bannerTextColor = '#fde047';
    } else if (festCat === 'engineers') {
      festGrad.addColorStop(0, '#0f172a');
      festGrad.addColorStop(0.5, '#1e3a8a');
      festGrad.addColorStop(1, '#0284c7');
      bannerStroke = '#38bdf8';
      bannerTextColor = '#38bdf8';
    } else if (festCat === 'national') {
      festGrad.addColorStop(0, '#7c2d12');
      festGrad.addColorStop(0.5, '#1e3a8a');
      festGrad.addColorStop(1, '#064e3b');
      bannerStroke = '#f97316';
      bannerTextColor = '#ffffff';
    } else if (festCat) {
      festGrad.addColorStop(0, '#451a03');
      festGrad.addColorStop(1, '#1e1b4b');
      bannerStroke = '#f59e0b';
      bannerTextColor = '#fde047';
    } else {
      festGrad.addColorStop(0, '#0f172a');
      festGrad.addColorStop(1, '#1e1b4b');
    }

    ctx.fillStyle = festGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = bannerStroke;
    ctx.stroke();

    ctx.fillStyle = bannerTextColor;
    ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(greetingMessage, headerX + headerW / 2, festivalBannerY + 52);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitleMsg, headerX + headerW / 2, festivalBannerY + 88);
    ctx.textAlign = 'left';
    ctx.restore();

    // 9. FOOTER SECTION
    const footerY = festivalBannerY + 130;
    const footerH = 118;

    const companyPhone1 = company?.phone || '+91 98930 12345';
    const companyPhone2 = '+91 771 4001122';

    ctx.save();
    this.roundRect(ctx, headerX, footerY, headerW, footerH, 12);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('📞 CONTACT FOR ORDERS & ENQUIRIES', headerX + 24, footerY + 36);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = '800 22px "JetBrains Mono", monospace';
    ctx.fillText(`Sales Hotline: ${companyPhone1}   |   Office: ${companyPhone2}`, headerX + 24, footerY + 74);

    ctx.fillStyle = '#64748b';
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED • RAIPUR (C.G.)', headerX + headerW - 24, footerY + 102);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  /**
   * ============================================================================
   * 2. ALL PRODUCT CANVAS RENDERER
   * Exact Data Hierarchy:
   * - First row: MEDIUM BASE RATE | SL BASE RATE
   * - Below that: Complete applicable product rate list in clear columns:
   *   S.No | Product | Size | Gauge Difference | Final Rate
   * ============================================================================
   */
  private static async renderAllProductRateListCanvas(params: {
    canvas: HTMLCanvasElement;
    postType: NanoBananaPostType;
    postTypeLabel: string;
    items: NanoBananaVerifiedItem[];
    company: CompanySettings;
    mediumBasicRate: number;
    slBasicRate: number;
    lightBasicRate: number;
    effectiveDate: string;
    variation: NanoBananaVisualVariation;
    conceptIndex?: number;
    seed: number;
    rawAiImageDataUrl?: string;
    customNote?: string;
    festivalLogoUrl?: string;
  }): Promise<void> {
    const {
      canvas,
      items,
      mediumBasicRate,
      slBasicRate,
      effectiveDate,
      variation,
      conceptIndex = 0,
      seed,
      rawAiImageDataUrl,
      customNote,
    } = params;

    const W = 1200;
    const H = items.length > 14 ? 1620 : 1400;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Creative Industrial Scene Background (Varied every click)
    await this.drawCreativeIndustrialScene(ctx, W, H, variation, seed, rawAiImageDataUrl);

    // Outer Frame
    ctx.save();
    ctx.strokeStyle = variation.cardBorder;
    ctx.lineWidth = 4;
    this.roundRect(ctx, 24, 24, W - 48, H - 48, 24);
    ctx.stroke();
    ctx.restore();

    const formattedDate = this.formatDisplayDate(effectiveDate);

    // 2. Top Brand & Effective Date Header
    const headerY = 44;
    const headerH = 148;
    ctx.save();
    this.roundRect(ctx, 44, headerY, W - 88, headerH, 20);
    const hdrGrad = ctx.createLinearGradient(44, headerY, W - 44, headerY + headerH);
    hdrGrad.addColorStop(0, variation.headerBg);
    hdrGrad.addColorStop(1, '#091122');
    ctx.fillStyle = hdrGrad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = variation.accentPrimary;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', 70, headerY + 66);

    ctx.fillStyle = '#fde047';
    ctx.font = '800 18px "JetBrains Mono", monospace';
    ctx.fillText(`EFFECTIVE DATE: ${formattedDate}`, 70, headerY + 104);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('URLA INDUSTRIAL AREA, RAIPUR (C.G.)  •  IS:2062 CERTIFIED STRUCTURAL STEEL', 70, headerY + 130);

    // Right side of header: Varied steel photo vignette
    const photoKeys = [
      'steelChannelsTop',
      'steelChannelsGreen',
      'steelUChannels',
      'steelBuilding',
      'steelPipes',
      'steelTmt',
    ];
    const hdrPhoto = imageCache[photoKeys[(seed + conceptIndex) % photoKeys.length]];
    if (hdrPhoto) {
      ctx.save();
      this.roundRect(ctx, W - 270, headerY + 18, 206, headerH - 36, 14);
      ctx.clip();
      ctx.drawImage(hdrPhoto, W - 270, headerY + 18, 206, headerH - 36);
      ctx.restore();

      ctx.save();
      this.roundRect(ctx, W - 270, headerY + 18, 206, headerH - 36, 14);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();
      ctx.restore();
    }

    if (params.festivalLogoUrl) {
      await this.drawUploadedFestivalLogoBadge(
        ctx,
        W - 270,
        headerY + 18,
        180,
        headerH - 36,
        params.festivalLogoUrl
      );
    }
    ctx.restore();

    // 3. FIRST ROW DATA HIERARCHY: MEDIUM BASE RATE | SL BASE RATE
    const firstRowY = headerY + headerH + 20;
    const firstRowH = 122;
    this.drawFirstRowBaseRateSplit(
      ctx,
      44,
      firstRowY,
      W - 88,
      firstRowH,
      mediumBasicRate,
      slBasicRate,
      variation
    );

    // 4. BELOW THAT: Complete Applicable Product Rate List
    // Columns: S.No | Product | Size | Gauge Difference | Final Rate
    const tableY = firstRowY + firstRowH + 20;
    const footerH = 88;
    const tableH = H - tableY - footerH - 44;

    this.drawFiveColumnProductRateTable(
      ctx,
      44,
      tableY,
      W - 88,
      tableH,
      items,
      variation,
      customNote
    );

    // 5. Clean Bottom Contact Bar
    const footerY = H - footerH - 28;
    ctx.save();
    this.roundRect(ctx, 44, footerY, W - 88, footerH, 16);
    ctx.fillStyle = '#091122';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = variation.accentPrimary;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'PAYMENT TERMS: Advance Payment Basis  •  GST 18% Extra  •  Ex-Works Raipur',
      68,
      footerY + 34
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      '📞 ORDERS & DISPATCH:   9009544333   |   7000923464   |   9713144333',
      68,
      footerY + 66
    );
    ctx.restore();
  }

  /**
   * ============================================================================
   * 3. FESTIVAL + PRICE UPDATE CANVAS RENDERER
   * Renders a genuinely recognizable festival scene (Diwali, Ganesh Chaturthi,
   * Vishwakarma Puja, Navratri, Dussehra, Makar Sankranti, New Financial Year)
   * integrated with industrial steel branding and verified ERP pricing.
   * ============================================================================
   */
  private static async renderFestivalPriceUpdateCanvas(params: {
    canvas: HTMLCanvasElement;
    items: NanoBananaVerifiedItem[];
    mediumBasicRate: number;
    slBasicRate: number;
    effectiveDate: string;
    variation: NanoBananaVisualVariation;
    conceptIndex?: number;
    seed: number;
    rawAiImageDataUrl?: string;
    festivalName?: string;
    festivalLogoUrl?: string;
  }): Promise<void> {
    const {
      canvas,
      items,
      mediumBasicRate,
      slBasicRate,
      effectiveDate,
      variation,
      conceptIndex = 0,
      seed,
      rawAiImageDataUrl,
      festivalName = 'Shubh Navratri & Jai Mata Di',
    } = params;

    const festCategory = this.detectFestivalCategory(festivalName);
    const W = 1200;
    const H = items.length > 14 ? 1680 : 1460;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Festival + Industrial Background & Top Toran / Mandala Scene
    await this.drawCreativeIndustrialScene(ctx, W, H, variation, seed, rawAiImageDataUrl, festCategory);

    // Ornate Double Festive + Industrial Frame
    ctx.save();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4;
    this.roundRect(ctx, 22, 22, W - 44, H - 44, 26);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, 30, 30, W - 60, H - 60, 22);
    ctx.stroke();
    ctx.restore();

    // Draw Hanging Marigold & Ashoka Leaf Toran Across Top
    this.drawFestiveMarigoldToran(ctx, 30, 26, W - 60, seed);

    // 2. Festival Hero Storytelling Banner (Recognizable Festival Artwork + Greeting + Brand)
    const heroY = 66;
    const heroH = 248;
    this.drawFestivalStorytellingHero(
      ctx,
      44,
      heroY,
      W - 88,
      heroH,
      festivalName,
      festCategory,
      effectiveDate,
      variation,
      conceptIndex,
      seed
    );

    if (params.festivalLogoUrl) {
      await this.drawUploadedFestivalLogoBadge(
        ctx,
        W - 270,
        heroY + 24,
        180,
        120,
        params.festivalLogoUrl
      );
    }

    // 3. First Row: MEDIUM BASE RATE | SL BASE RATE
    const firstRowY = heroY + heroH + 18;
    const firstRowH = 118;
    this.drawFirstRowBaseRateSplit(
      ctx,
      44,
      firstRowY,
      W - 88,
      firstRowH,
      mediumBasicRate,
      slBasicRate,
      variation
    );

    // 4. Below That: Verified ERP Product Table (S.No | Product | Size | Gauge Difference | Final Rate)
    const tableY = firstRowY + firstRowH + 18;
    const footerH = 86;
    const tableH = H - tableY - footerH - 42;

    this.drawFiveColumnProductRateTable(
      ctx,
      44,
      tableY,
      W - 88,
      tableH,
      items,
      variation
    );

    // 5. Footer
    const footerY = H - footerH - 26;
    ctx.save();
    this.roundRect(ctx, 44, footerY, W - 88, footerH, 16);
    ctx.fillStyle = '#091122';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `✨ ${festivalName.toUpperCase()}  •  NAV DURGA ISPAT PRIVATE LIMITED (RAIPUR, C.G.)`,
      68,
      footerY + 33
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      '📞 ORDERS & DISPATCH:   9009544333   |   7000923464   |   9713144333',
      68,
      footerY + 64
    );
    ctx.restore();
  }

  /**
   * Renders the First Row required hierarchy:
   * MEDIUM BASE RATE | SL BASE RATE
   */
  private static drawFirstRowBaseRateSplit(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    mediumBasicRate: number,
    slBasicRate: number,
    variation: NanoBananaVisualVariation
  ): void {
    const gap = 20;
    const boxW = Math.floor((w - gap) / 2);

    // Left Box: MEDIUM BASE RATE
    ctx.save();
    this.roundRect(ctx, x, y, boxW, h, 18);
    const leftGrad = ctx.createLinearGradient(x, y, x + boxW, y + h);
    leftGrad.addColorStop(0, '#0f172a');
    leftGrad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = leftGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MEDIUM BASE RATE', x + 28, y + 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "JetBrains Mono", monospace';
    ctx.fillText(`₹${mediumBasicRate.toLocaleString('en-IN')} / MT`, x + 28, y + 94);
    ctx.restore();

    // Right Box: SL BASE RATE
    const rightX = x + boxW + gap;
    ctx.save();
    this.roundRect(ctx, rightX, y, boxW, h, 18);
    const rightGrad = ctx.createLinearGradient(rightX, y, rightX + boxW, y + h);
    rightGrad.addColorStop(0, '#0f172a');
    rightGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = rightGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = variation.accentPrimary;
    ctx.stroke();

    ctx.fillStyle = '#fed7aa';
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SL BASE RATE', rightX + 28, y + 40);

    ctx.fillStyle = '#fde047';
    ctx.font = '900 42px "JetBrains Mono", monospace';
    ctx.fillText(`₹${slBasicRate.toLocaleString('en-IN')} / MT`, rightX + 28, y + 94);
    ctx.restore();
  }

  /**
   * Renders the exact 5-column product rate table required:
   * S.No | Product | Size | Gauge Difference | Final Rate
   */
  private static drawFiveColumnProductRateTable(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    items: NanoBananaVerifiedItem[],
    variation: NanoBananaVisualVariation,
    customNote?: string
  ): void {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 18);
    ctx.fillStyle = variation.cardBg;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = variation.cardBorder;
    ctx.stroke();

    // Table Header Row
    const thH = 52;
    ctx.save();
    this.roundRectTop(ctx, x, y, w, thH, 18);
    ctx.fillStyle = variation.tableHeaderBg;
    ctx.fill();

    ctx.fillStyle = variation.tableHeaderText;
    ctx.font = '900 17px "Plus Jakarta Sans", sans-serif';

    const colX = {
      sno: x + 28,
      product: x + 115,
      size: x + 430,
      gaugeDiff: x + 685,
      finalRate: x + 915,
    };

    ctx.fillText('S.No', colX.sno, y + 33);
    ctx.fillText('Product', colX.product, y + 33);
    ctx.fillText('Size', colX.size, y + 33);
    ctx.fillText('Gauge Difference', colX.gaugeDiff, y + 33);
    ctx.fillText('Final Rate', colX.finalRate, y + 33);
    ctx.restore();

    const maxRows = Math.min(items.length, 22);
    const noteSpace = customNote ? 40 : 0;
    const bodyH = h - thH - noteSpace - 10;
    const rowH = Math.min(54, Math.floor(bodyH / Math.max(maxRows, 1)));
    const fontSize = maxRows > 16 ? 16 : maxRows > 10 ? 18 : 20;

    for (let i = 0; i < maxRows; i++) {
      const it = items[i];
      const ry = y + thH + i * rowH;

      ctx.fillStyle = i % 2 === 0 ? variation.rowEvenBg : variation.rowOddBg;
      ctx.fillRect(x + 4, ry, w - 8, rowH);

      // Subtle Row Divider
      ctx.strokeStyle = variation.isLightMode
        ? 'rgba(15, 23, 42, 0.08)'
        : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 14, ry + rowH);
      ctx.lineTo(x + w - 14, ry + rowH);
      ctx.stroke();

      const textY = ry + Math.floor(rowH * 0.67);

      // 1. S.No
      ctx.fillStyle = variation.textMuted;
      ctx.font = `800 ${fontSize}px "JetBrains Mono", monospace`;
      ctx.fillText(String(i + 1).padStart(2, '0'), colX.sno, textY);

      // 2. Product (includes grade tag so Medium vs SL variants are clear)
      ctx.fillStyle = variation.textPrimary;
      ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      const prodDisplay =
        it.grade && !it.productName.toLowerCase().includes(it.grade.toLowerCase())
          ? `${it.productName} (${it.grade})`
          : it.productName;
      ctx.fillText(prodDisplay, colX.product, textY);

      // 3. Size
      ctx.fillStyle = variation.isLightMode ? '#1e3a8a' : '#e2e8f0';
      ctx.font = `800 ${fontSize}px "JetBrains Mono", monospace`;
      ctx.fillText(it.size, colX.size, textY);

      // 4. Gauge Difference
      ctx.fillStyle = variation.accentSecondary;
      ctx.font = `800 ${fontSize}px "JetBrains Mono", monospace`;
      const sign = it.gaugeDifference >= 0 ? '+' : '-';
      ctx.fillText(
        `${sign}₹${Math.abs(it.gaugeDifference).toLocaleString('en-IN')}`,
        colX.gaugeDiff,
        textY
      );

      // 5. Final Rate
      ctx.fillStyle = variation.priceHighlight;
      ctx.font = `900 ${fontSize + 1}px "JetBrains Mono", monospace`;
      ctx.fillText(`₹${it.finalRate.toLocaleString('en-IN')} / ${it.unit}`, colX.finalRate, textY);
    }

    if (customNote) {
      ctx.fillStyle = variation.accentPrimary;
      ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`📌 ${customNote}`, x + 24, y + h - 14);
    }

    ctx.restore();
  }

  /**
   * Draws genuinely varied industrial & architectural scene compositions on the canvas backdrop
   */
  private static async drawCreativeIndustrialScene(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    variation: NanoBananaVisualVariation,
    seed: number,
    rawAiImageDataUrl?: string,
    festCategory?: FestivalThemeCategory
  ): Promise<void> {
    // Base Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W * 0.45, H);
    bgGrad.addColorStop(0, variation.bgTop);
    bgGrad.addColorStop(0.52, variation.bgMid);
    bgGrad.addColorStop(1, variation.bgBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Blend live Nano Banana AI visual if available
    if (rawAiImageDataUrl) {
      try {
        const aiImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = rawAiImageDataUrl;
        });
        ctx.save();
        ctx.globalAlpha = variation.isLightMode ? 0.18 : 0.32;
        ctx.drawImage(aiImg, 0, 0, W, H);
        ctx.restore();
      } catch {
        // Ignore load failure
      }
    }

    // Scene-specific architectural & industrial background storytelling
    ctx.save();
    if (variation.sceneType === 'gantry_crane_blueprint') {
      // Isometric CAD Steel Truss & Gantry Crane Rig
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 120, 220);
        ctx.lineTo(x + 240, 0);
        ctx.stroke();
      }
      // Blueprint coordinate circles
      ctx.beginPath();
      ctx.arc(W - 180, 260, 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W - 180, 260, 95, 0, Math.PI * 2);
      ctx.stroke();
    } else if (variation.sceneType === 'diagonal_forge_cascade') {
      // Dynamic Diagonal Structural Steel Slashes & Molten Sparks
      ctx.fillStyle = 'rgba(249, 115, 22, 0.08)';
      for (let i = -2; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 260, 0);
        ctx.lineTo(i * 260 + 110, 0);
        ctx.lineTo(i * 260 - 220, H);
        ctx.lineTo(i * 260 - 330, H);
        ctx.closePath();
        ctx.fill();
      }
      // Glowing forge embers
      for (let s = 0; s < 28; s++) {
        const sx = ((seed * (s + 3) * 37) % (W - 80)) + 40;
        const sy = ((seed * (s + 7) * 53) % (H - 80)) + 40;
        const r = 2 + (s % 4);
        ctx.fillStyle = s % 2 === 0 ? 'rgba(253, 224, 71, 0.35)' : 'rgba(249, 115, 22, 0.35)';
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (variation.sceneType === 'royal_arch_stockyard' || festCategory) {
      // Ornate Radial Mandala / Royal Sunburst Arch
      const cx = W / 2;
      const cy = 240;
      const radGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 520);
      radGrad.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
      radGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(253, 224, 71, 0.12)';
      ctx.lineWidth = 1.5;
      for (let a = 0; a < 24; a++) {
        const angle = (a * Math.PI) / 12;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 600, cy + Math.sin(angle) * 600);
        ctx.stroke();
      }
    } else {
      // Structural I-Beam Grid & Rolling Mill Geometry
      ctx.strokeStyle = variation.isLightMode
        ? 'rgba(15, 23, 42, 0.05)'
        : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1.5;
      const step = 75;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Draws a varied Industrial Hero Strip for the Base Rate poster so every click has a distinct subject arrangement
   */
  private static drawVariedIndustrialHeroStrip(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    variation: NanoBananaVisualVariation,
    seed: number,
    layoutMode: number
  ): void {
    const photoKeys = [
      'steelChannelsTop',
      'steelChannelsGreen',
      'steelUChannels',
      'steelBuilding',
      'steelPipes',
      'steelTmt',
    ];
    const p1 = imageCache[photoKeys[seed % photoKeys.length]];
    const p2 = imageCache[photoKeys[(seed + 2) % photoKeys.length]];
    const p3 = imageCache[photoKeys[(seed + 4) % photoKeys.length]];

    ctx.save();
    if (layoutMode === 0) {
      // 3-panel panoramic steel mill showcase with structural steel cross-section icons
      const pw = Math.floor((w - 32) / 3);
      [p1, p2, p3].forEach((img, idx) => {
        const px = x + idx * (pw + 16);
        ctx.save();
        this.roundRect(ctx, px, y, pw, h, 20);
        ctx.clip();
        if (img) ctx.drawImage(img, px, y, pw, h);
        ctx.restore();

        ctx.save();
        this.roundRect(ctx, px, y, pw, h, 20);
        ctx.lineWidth = 3;
        ctx.strokeStyle = idx === 1 ? '#fde047' : variation.accentPrimary;
        ctx.stroke();
        ctx.restore();
      });
    } else if (layoutMode === 1) {
      // Asymmetric wide cinema frame + structural I-beam vector diagram
      const leftW = Math.floor(w * 0.64);
      ctx.save();
      this.roundRect(ctx, x, y, leftW, h, 20);
      ctx.clip();
      if (p1) ctx.drawImage(p1, x, y, leftW, h);
      ctx.restore();
      ctx.lineWidth = 3;
      ctx.strokeStyle = variation.accentPrimary;
      this.roundRect(ctx, x, y, leftW, h, 20);
      ctx.stroke();

      // Right engineering I-Beam schematic card
      const rx = x + leftW + 20;
      const rw = w - leftW - 20;
      this.roundRect(ctx, rx, y, rw, h, 20);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();
      this.drawStructuralIBeamVector(ctx, rx + rw / 2, y + h / 2, 110, '#38bdf8', '#fde047');
    } else {
      // Split twin showcase with central Maa Durga / Mill crest medallion
      const halfW = Math.floor((w - 24) / 2);
      [p2, p3].forEach((img, idx) => {
        const px = x + idx * (halfW + 24);
        ctx.save();
        this.roundRect(ctx, px, y, halfW, h, 22);
        ctx.clip();
        if (img) ctx.drawImage(img, px, y, halfW, h);
        ctx.restore();
        this.roundRect(ctx, px, y, halfW, h, 22);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fde047';
        ctx.stroke();
      });

      // Central circular medallion
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 68, 0, Math.PI * 2);
      ctx.fillStyle = '#091122';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();
      this.drawStructuralIBeamVector(ctx, cx, cy, 74, '#fde047', '#f97316');
    }
    ctx.restore();
  }

  /**
   * Draws a vector structural I-Beam & Channel cross-section emblem
   */
  private static drawStructuralIBeamVector(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    primaryColor: string,
    accentColor: string
  ): void {
    ctx.save();
    ctx.translate(cx, cy);
    const half = size / 2;
    const flangeH = size * 0.2;
    const webW = size * 0.24;

    ctx.fillStyle = primaryColor;
    // Top flange
    this.roundRect(ctx, -half, -half, size, flangeH, 4);
    ctx.fill();
    // Bottom flange
    this.roundRect(ctx, -half, half - flangeH, size, flangeH, 4);
    ctx.fill();
    // Web
    ctx.fillStyle = accentColor;
    ctx.fillRect(-webW / 2, -half + flangeH, webW, size - flangeH * 2);
    ctx.restore();
  }

  /**
   * Base Rate Card Style 1: Monumental Horizontal Slab
   */
  private static drawMonumentalBaseRateSlab(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string,
    variation: NanoBananaVisualVariation,
    highlightColor: string,
    index: number
  ): void {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 26);
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, index === 0 ? '#0f172a' : '#1e1b4b');
    grad.addColorStop(1, index === 0 ? '#1e3a8a' : '#31102f');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = highlightColor;
    ctx.stroke();

    // Left accent bar
    this.roundRect(ctx, x + 24, y + 28, 14, h - 56, 7);
    ctx.fillStyle = highlightColor;
    ctx.fill();

    // Label: MEDIUM BASE RATE or SL BASE RATE
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(label, x + 64, y + Math.floor(h * 0.36));

    // Exact ERP Rate Value: ₹XX,XXX / MT
    ctx.fillStyle = highlightColor;
    ctx.font = '900 76px "JetBrains Mono", monospace';
    ctx.fillText(value, x + 64, y + Math.floor(h * 0.78));

    // Right decorative structural steel icon
    this.drawStructuralIBeamVector(
      ctx,
      x + w - 110,
      y + h / 2,
      96,
      'rgba(255,255,255,0.16)',
      highlightColor
    );
    ctx.restore();
  }

  /**
   * Base Rate Card Style 2: Side-by-Side Twin Pillars
   */
  private static drawPillarBaseRateCard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string,
    variation: NanoBananaVisualVariation,
    highlightColor: string
  ): void {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 28);
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = highlightColor;
    ctx.stroke();

    // Top structural emblem inside pillar
    this.drawStructuralIBeamVector(ctx, x + w / 2, y + 115, 92, highlightColor, '#ffffff');

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + Math.floor(h * 0.52));

    // Divider
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 60, y + Math.floor(h * 0.58));
    ctx.lineTo(x + w - 60, y + Math.floor(h * 0.58));
    ctx.stroke();

    // Rate Value
    ctx.fillStyle = highlightColor;
    ctx.font = '900 56px "JetBrains Mono", monospace';
    ctx.fillText(value, x + w / 2, y + Math.floor(h * 0.76));
    ctx.textAlign = 'left';
    ctx.restore();
  }

  /**
   * Base Rate Card Style 3: Staggered Vault Card
   */
  private static drawVaultBaseRateCard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string,
    variation: NanoBananaVisualVariation,
    highlightColor: string
  ): void {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 24);
    ctx.fillStyle = '#091122';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = highlightColor;
    ctx.stroke();

    // Top-left label ribbon
    this.roundRect(ctx, x + 32, y + 28, 380, 54, 14);
    ctx.fillStyle = highlightColor;
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(label, x + 54, y + 64);

    // Rate Value
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 74px "JetBrains Mono", monospace';
    ctx.fillText(value, x + 36, y + h - 48);
    ctx.restore();
  }

  /**
   * Draws Hanging Marigold & Ashoka Leaf Toran Garland across top of Festival posters
   */
  private static drawFestiveMarigoldToran(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    seed: number
  ): void {
    ctx.save();
    const scallops = 7;
    const sw = w / scallops;

    for (let i = 0; i < scallops; i++) {
      const sx = x + i * sw;
      // Scallop garland loop
      for (let t = 0; t <= 10; t++) {
        const ratio = t / 10;
        const bx = sx + ratio * sw;
        const by = y + Math.sin(ratio * Math.PI) * 28;
        ctx.beginPath();
        ctx.arc(bx, by, 9, 0, Math.PI * 2);
        ctx.fillStyle = (t + i + seed) % 2 === 0 ? '#f59e0b' : '#dc2626';
        ctx.fill();
      }
      // Hanging tassel / temple bell at scallop joint
      const tx = sx + sw / 2;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, y + 28);
      ctx.lineTo(tx, y + 50);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tx, y + 54, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Draws the Recognizable Festival Hero Section with bespoke festival illustrations:
   * - Diwali: Ornate Glowing Diyas, Hanging Kandil Lanterns & Golden Fireworks
   * - Ganesh Chaturthi: Lord Ganesha Emblem (Crown, Trunk, Tilak, Modak, Lotus)
   * - Vishwakarma Puja: Precision Engineering Gear Chakra, Anvil, Hammer & Sacred Kalash
   * - Navratri: Maa Durga Portrait, Sacred Trishul & Nine Garba Lamps
   * - Dussehra: Golden Victory Bow & Arrow (Dhanush-Baan) & Sona Leaves
   * - Makar Sankranti: Radiant Surya & Colorful Kites
   * - New Financial Year: Auspicious Swastika, Kalash & Bahi-Khata
   */
  private static drawFestivalStorytellingHero(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    festivalName: string,
    festCategory: FestivalThemeCategory,
    effectiveDate: string,
    variation: NanoBananaVisualVariation,
    conceptIndex: number,
    seed: number
  ): void {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 24);
    const hdrGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    if (festCategory === 'diwali') {
      hdrGrad.addColorStop(0, '#3b0764');
      hdrGrad.addColorStop(0.5, '#7c2d12');
      hdrGrad.addColorStop(1, '#451a03');
    } else if (festCategory === 'ganesh') {
      hdrGrad.addColorStop(0, '#7f1d1d');
      hdrGrad.addColorStop(0.5, '#9a3412');
      hdrGrad.addColorStop(1, '#451a03');
    } else if (festCategory === 'vishwakarma') {
      hdrGrad.addColorStop(0, '#0f172a');
      hdrGrad.addColorStop(0.5, '#1e3a8a');
      hdrGrad.addColorStop(1, '#78350f');
    } else {
      hdrGrad.addColorStop(0, variation.headerBg);
      hdrGrad.addColorStop(1, '#1f0409');
    }
    ctx.fillStyle = hdrGrad;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    // Alternate left/right placement of the Festival Visual Centerpiece on each click
    const emblemOnRight = conceptIndex % 2 === 0;
    const emblemCenterX = emblemOnRight ? x + w - 155 : x + 155;
    const emblemCenterY = y + h / 2;
    const textStartX = emblemOnRight ? x + 64 : x + 305;

    // Company Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', textStartX, y + 62);

    // Recognizable Festival Title Banner
    ctx.fillStyle = '#fde047';
    ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`✨ ${festivalName.toUpperCase()}`, textStartX, y + 116);

    // Festival + Industrial Subtitle
    const festSubtitles: Record<FestivalThemeCategory, string> = {
      diwali: 'May the festival of lights illuminate your projects with strength & prosperity!',
      holi: 'Celebrating the vibrant colours of joy, progress, and unbreakable steel!',
      ganesh: 'Vakratunda Mahakaya • Auspicious beginnings with IS:2062 structural steel strength!',
      navratri: 'May Maa Durga bless your business with unstoppable strength & growth!',
      national: 'Saluting national pride, industrial progress, and structural steel excellence!',
      vishwakarma: 'Saluting the Divine Architect of the Universe & precision steel engineering!',
      dussehra: 'Celebrating the victory of excellence, quality, and enduring steel!',
      sankranti: 'Soaring to new heights of industrial progress this Uttarayan!',
      new_year: 'Shubh-Labh & prosperous new financial year opening rates!',
      akshaya_tritiya: 'Eternal prosperity, enduring wealth, and unbreakable steel foundation!',
      ram_navami: 'Shree Ram Navami greetings • Blessed with divine virtue and strength!',
      mahashivratri: 'Har Har Mahadev • Unshakable strength & divine prosperity for your business!',
      engineers: 'Saluting the Architects & Engineers building India\'s industrial future!',
      teachers: 'Honouring the mentors and visionaries shaping nation builders!',
      rakhi: 'Celebrating unbreakable bonds of trust, protection, and structural strength!',
      generic_festival: 'Warm festive greetings & verified ex-mill steel rate update!',
    };
    ctx.fillStyle = '#fed7aa';
    ctx.font = 'italic 700 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(festSubtitles[festCategory], textStartX, y + 152);

    // Effective Date Pill
    const formattedDate = this.formatDisplayDate(effectiveDate);
    this.roundRect(ctx, textStartX, y + 174, 430, 46, 12);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 18px "JetBrains Mono", monospace';
    ctx.fillText(`EFFECTIVE DATE: ${formattedDate}`, textStartX + 20, y + 204);

    // Draw the Festival-Specific Recognizable Artwork Emblem
    this.drawFestivalArtworkCenterpiece(
      ctx,
      emblemCenterX,
      emblemCenterY,
      festCategory,
      seed
    );

    ctx.restore();
  }

  /**
   * Renders unmistakable, recognizable festival artwork for Diwali, Ganesh Chaturthi,
   * Vishwakarma Puja, Navratri, Dussehra, Sankranti, etc.
   */
  private static drawFestivalArtworkCenterpiece(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    festCategory: FestivalThemeCategory,
    seed: number
  ): void {
    ctx.save();

    // Glowing Golden Mandala Aura behind centerpiece
    const auraGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 108);
    auraGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
    auraGrad.addColorStop(0.65, 'rgba(249, 115, 22, 0.2)');
    auraGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 108, 0, Math.PI * 2);
    ctx.fill();

    // Outer Sacred Medallion Ring
    ctx.beginPath();
    ctx.arc(cx, cy, 90, 0, Math.PI * 2);
    ctx.fillStyle = '#290f02';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    if (festCategory === 'diwali') {
      // DIWALI: Ornate Royal Terracotta & Gold Diya with Triple Flame + Firework Rays + Hanging Kandil
      // Firework bursts in background of medallion
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      for (let i = 0; i < 16; i++) {
        const ang = (i * Math.PI) / 8 + (seed % 5) * 0.1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * 42, cy - 18 + Math.sin(ang) * 42);
        ctx.lineTo(cx + Math.cos(ang) * 74, cy - 18 + Math.sin(ang) * 74);
        ctx.stroke();
      }

      // Diya Bowl
      ctx.beginPath();
      ctx.moveTo(cx - 58, cy + 16);
      ctx.quadraticCurveTo(cx, cy + 72, cx + 58, cy + 16);
      ctx.quadraticCurveTo(cx, cy + 28, cx - 58, cy + 16);
      ctx.closePath();
      ctx.fillStyle = '#d97706';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();

      // Radiant Diya Flame (Outer orange + Inner yellow-white)
      ctx.beginPath();
      ctx.moveTo(cx, cy - 64);
      ctx.quadraticCurveTo(cx + 30, cy - 16, cx, cy + 16);
      ctx.quadraticCurveTo(cx - 30, cy - 16, cx, cy - 64);
      ctx.closePath();
      ctx.fillStyle = '#f97316';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 48);
      ctx.quadraticCurveTo(cx + 16, cy - 14, cx, cy + 12);
      ctx.quadraticCurveTo(cx - 16, cy - 14, cx, cy - 48);
      ctx.closePath();
      ctx.fillStyle = '#fef08a';
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHUBH DEEPAWALI', cx, cy + 74);
    } else if (festCategory === 'ganesh') {
      // GANESH CHATURTHI: Recognizable Artistic Lord Ganesha Silhouette (Mukut Crown, Ears, Trunk, Tilak & Modak)
      // Crown (Mukut)
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(cx - 28, cy - 28);
      ctx.lineTo(cx, cy - 72);
      ctx.lineTo(cx + 28, cy - 28);
      ctx.closePath();
      ctx.fill();

      // Sacred Ears
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.ellipse(cx - 42, cy - 4, 20, 28, -0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + 42, cy - 4, 20, 28, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Head & Curved Trunk (Shunda)
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 28, 0, Math.PI * 2);
      ctx.fill();

      // Curved Trunk holding Modak
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 4);
      ctx.quadraticCurveTo(cx - 4, cy + 44, cx + 24, cy + 38);
      ctx.stroke();

      // Golden Modak on Trunk tip
      ctx.beginPath();
      ctx.arc(cx + 28, cy + 32, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();

      // Sacred Tilak on Forehead
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 16);
      ctx.lineTo(cx + 10, cy - 16);
      ctx.moveTo(cx - 8, cy - 10);
      ctx.lineTo(cx + 8, cy - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GANPATI BAPPA MORYA', cx, cy + 72);
    } else if (festCategory === 'vishwakarma') {
      // VISHWAKARMA PUJA: Golden Mechanical Engineering Gear Chakra + Sacred Kalash + Anvil/Beam
      // Outer Gear Teeth
      ctx.fillStyle = '#fde047';
      for (let g = 0; g < 12; g++) {
        const ang = (g * Math.PI) / 6;
        ctx.save();
        ctx.translate(cx + Math.cos(ang) * 56, cy - 6 + Math.sin(ang) * 56);
        ctx.rotate(ang);
        ctx.fillRect(-7, -7, 14, 14);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 48, 0, Math.PI * 2);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Inner Structural I-Beam & Sacred Kalash
      this.drawStructuralIBeamVector(ctx, cx, cy - 6, 52, '#38bdf8', '#f97316');

      ctx.fillStyle = '#fde047';
      ctx.font = '900 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JAI BABA VISHWAKARMA', cx, cy + 72);
    } else if (festCategory === 'navratri' && imageCache.maaDurga) {
      // NAVRATRI: Maa Durga & Lion Portrait + Golden Trishul
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 84, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(imageCache.maaDurga, cx - 84, cy - 84, 168, 168);
      ctx.restore();
    } else if (festCategory === 'dussehra') {
      // DUSSEHRA: Golden Bow & Arrow (Dhanush-Baan)
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx - 10, cy, 52, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
      // Bowstring
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 10 + Math.cos(-Math.PI * 0.42) * 52, cy + Math.sin(-Math.PI * 0.42) * 52);
      ctx.lineTo(cx - 10 + Math.cos(Math.PI * 0.42) * 52, cy + Math.sin(Math.PI * 0.42) * 52);
      ctx.stroke();
      // Arrow
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy);
      ctx.lineTo(cx + 55, cy);
      ctx.lineTo(cx + 40, cy - 10);
      ctx.moveTo(cx + 55, cy);
      ctx.lineTo(cx + 40, cy + 10);
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HAPPY VIJAYADASHAMI', cx, cy + 72);
    } else if (festCategory === 'sankranti') {
      // MAKAR SANKRANTI: Radiant Sun & Diamond Kite
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(cx - 18, cy - 18, 26, 0, Math.PI * 2);
      ctx.fill();

      // Diamond Kite
      ctx.save();
      ctx.translate(cx + 14, cy + 4);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-26, -26, 52, 52);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.strokeRect(-26, -26, 52, 52);
      ctx.restore();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHUBH SANKRANTI', cx, cy + 72);
    } else {
      // NEW FINANCIAL YEAR / GENERIC FESTIVAL: Auspicious Swastika & Kalash
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      const s = 32;
      ctx.beginPath();
      ctx.moveTo(cx - s, cy);
      ctx.lineTo(cx + s, cy);
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx, cy + s);
      // Arms
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s, cy - s);
      ctx.moveTo(cx + s, cy);
      ctx.lineTo(cx + s, cy + s);
      ctx.moveTo(cx, cy + s);
      ctx.lineTo(cx - s, cy + s);
      ctx.moveTo(cx - s, cy);
      ctx.lineTo(cx - s, cy - s);
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHUBH • LABH', cx, cy + 68);
    }

    ctx.textAlign = 'left';
    ctx.restore();
  }

  private static async drawHoliFestivalHeader(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    festivalName: string
  ): Promise<void> {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 16);
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#fff5f5');
    grad.addColorStop(0.5, '#fefce8');
    grad.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ec4899';
    ctx.stroke();

    const colors = ['#ec4899', '#06b6d4', '#eab308', '#22c55e', '#a855f7'];
    for (let i = 0; i < 18; i++) {
      const px = x + 300 + ((i * 57) % 720);
      const py = y + 12 + ((i * 33) % 140);
      const pr = 8 + (i % 6) * 5;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.28;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    await this.drawMasterLogo(ctx, x + 16, y + 16, 120, 136);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAVDURGA GROUP', x + 152, y + 58);

    ctx.fillStyle = '#b91c1c';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', x + 152, y + 88);

    const badgeX = x + 152;
    const badgeY = y + 104;
    this.roundRect(ctx, badgeX, badgeY, 360, 48, 12);
    const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + 360, badgeY + 48);
    badgeGrad.addColorStop(0, '#db2777');
    badgeGrad.addColorStop(0.5, '#9333ea');
    badgeGrad.addColorStop(1, '#2563eb');
    ctx.fillStyle = badgeGrad;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`🎨 ${festivalName.toUpperCase()}`, badgeX + 16, badgeY + 33);

    const rightX = x + w - 160;
    ctx.fillStyle = '#eab308';
    ctx.font = '900 36px sans-serif';
    ctx.fillText('🌈✨', rightX, y + 95);

    ctx.restore();
  }

  private static async drawEngineersDayFestivalHeader(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    festivalName: string
  ): Promise<void> {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 16);
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.6, '#1e3a8a');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    for (let gx = x + 20; gx < x + w; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();
    }
    for (let gy = y + 15; gy < y + h; gy += 30) {
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
    }

    await this.drawMasterLogo(ctx, x + 16, y + 16, 120, 136);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAVDURGA GROUP', x + 152, y + 58);

    ctx.fillStyle = '#fde047';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', x + 152, y + 88);

    const badgeX = x + 152;
    const badgeY = y + 104;
    this.roundRect(ctx, badgeX, badgeY, 380, 48, 12);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`⚙️ ${festivalName.toUpperCase()}`, badgeX + 16, badgeY + 33);

    this.drawStructuralIBeamVector(ctx, x + w - 90, y + h / 2, 84, '#38bdf8', '#fde047');

    ctx.restore();
  }

  private static async drawDussehraFestivalHeader(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    festivalName: string
  ): Promise<void> {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 16);
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#7f1d1d');
    grad.addColorStop(0.5, '#b91c1c');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    await this.drawMasterLogo(ctx, x + 16, y + 16, 120, 136);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAVDURGA GROUP', x + 152, y + 58);

    ctx.fillStyle = '#fde047';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', x + 152, y + 88);

    const badgeX = x + 152;
    const badgeY = y + 104;
    this.roundRect(ctx, badgeX, badgeY, 360, 48, 12);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`🏹 ${festivalName.toUpperCase()}`, badgeX + 16, badgeY + 33);

    const cx = x + w - 90;
    const cy = y + h / 2;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx - 10, cy, 40, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy);
    ctx.lineTo(cx + 35, cy);
    ctx.lineTo(cx + 25, cy - 8);
    ctx.moveTo(cx + 35, cy);
    ctx.lineTo(cx + 25, cy + 8);
    ctx.stroke();

    ctx.restore();
  }

  private static async drawGaneshFestivalHeader(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    festivalName: string
  ): Promise<void> {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 16);
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#9a3412');
    grad.addColorStop(0.5, '#ea580c');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    await this.drawMasterLogo(ctx, x + 16, y + 16, 120, 136);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAVDURGA GROUP', x + 152, y + 58);

    ctx.fillStyle = '#fef08a';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', x + 152, y + 88);

    const badgeX = x + 152;
    const badgeY = y + 104;
    this.roundRect(ctx, badgeX, badgeY, 380, 48, 12);
    ctx.fillStyle = '#fde047';
    ctx.fill();

    ctx.fillStyle = '#7c2d12';
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`🌺 ${festivalName.toUpperCase()}`, badgeX + 16, badgeY + 33);

    const cx = x + w - 90;
    const cy = y + h / 2 - 10;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);
    ctx.lineTo(cx, cy - 36);
    ctx.lineTo(cx + 20, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(cx, cy + 12, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private static async drawTeachersDayFestivalHeader(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    festivalName: string
  ): Promise<void> {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 16);
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#1e3a8a');
    grad.addColorStop(1, '#312e81');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    await this.drawMasterLogo(ctx, x + 16, y + 16, 120, 136);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAVDURGA GROUP', x + 152, y + 58);

    ctx.fillStyle = '#fde047';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', x + 152, y + 88);

    const badgeX = x + 152;
    const badgeY = y + 104;
    this.roundRect(ctx, badgeX, badgeY, 360, 48, 12);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`📚 ${festivalName.toUpperCase()}`, badgeX + 16, badgeY + 33);

    const cx = x + w - 90;
    const cy = y + h / 2;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private static async drawTricolourNationalFestivalHeader(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    festivalName: string
  ): Promise<void> {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 16);
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#fff7ed');
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(1, '#f0fdf4');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f97316';
    ctx.stroke();

    ctx.fillStyle = '#f97316'; ctx.fillRect(x + 150, y + 8, w - 165, 8);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 150, y + 16, w - 165, 8);
    ctx.fillStyle = '#16a34a'; ctx.fillRect(x + 150, y + 24, w - 165, 8);

    await this.drawMasterLogo(ctx, x + 16, y + 16, 120, 136);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAVDURGA GROUP', x + 152, y + 72);

    ctx.fillStyle = '#b91c1c';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', x + 152, y + 102);

    const badgeX = x + 152;
    const badgeY = y + 114;
    this.roundRect(ctx, badgeX, badgeY, 380, 42, 10);
    const bGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + 380, badgeY);
    bGrad.addColorStop(0, '#ea580c');
    bGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = bGrad;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`🇮🇳 ${festivalName.toUpperCase()}`, badgeX + 16, badgeY + 28);

    const cx = x + w - 90;
    const cy = y + h / 2;
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 24; i++) {
      const ang = (i * Math.PI) / 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * 32, cy + Math.sin(ang) * 32);
      ctx.stroke();
    }

    ctx.restore();
  }

  private static async drawGenericFestivalHeader(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    festivalName: string,
    festCat: FestivalThemeCategory
  ): Promise<void> {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 16);
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#451a03');
    grad.addColorStop(0.5, '#78350f');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    this.drawFestiveMarigoldToran(ctx, x + 150, y, w - 160, 101);

    await this.drawMasterLogo(ctx, x + 16, y + 16, 120, 136);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAVDURGA GROUP', x + 152, y + 68);

    ctx.fillStyle = '#fde047';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV DURGA ISPAT PRIVATE LIMITED', x + 152, y + 98);

    const badgeX = x + 152;
    const badgeY = y + 112;
    this.roundRect(ctx, badgeX, badgeY, 380, 42, 10);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`✨ ${festivalName.toUpperCase()}`, badgeX + 16, badgeY + 28);

    ctx.restore();
  }

  private static drawNavDurgaEmblem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w = 110,
    h = 96
  ): void {
    ctx.save();
    // High-contrast clean white backing card ensuring the logo is crisp, sharp, unoccluded
    this.roundRect(ctx, x, y, w, h, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    const logoImg = imageCache.masterOfficialLogo;
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      // Draw official master logo image preserving exact 500:360 aspect ratio
      const padding = 6;
      const drawW = w - padding * 2;
      const drawH = h - padding * 2;
      ctx.drawImage(logoImg, x + padding, y + padding, drawW, drawH);
    } else {
      // Pre-cache if not yet loaded
      if (typeof window !== 'undefined' && !logoImg) {
        const fallback = new Image();
        fallback.crossOrigin = 'anonymous';
        fallback.src = '/assets/nav_durga_logo.png';
        fallback.onload = () => {
          imageCache.masterOfficialLogo = fallback;
        };
      }

      // Exact vector drawing matching official logo colors & proportions:
      // Top Orange chevron (#f97316)
      // Lower Black diamond (#0f172a) with inner white cutout & black core dot
      const cx = x + w / 2;
      const cy = y + h * 0.32;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 18);
      ctx.lineTo(cx + 20, cy);
      ctx.lineTo(cx + 12, cy + 8);
      ctx.lineTo(cx, cy - 3);
      ctx.lineTo(cx - 12, cy + 8);
      ctx.lineTo(cx - 20, cy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 2);
      ctx.lineTo(cx + 18, cy + 20);
      ctx.lineTo(cx, cy + 38);
      ctx.lineTo(cx - 18, cy + 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx + 10, cy + 20);
      ctx.lineTo(cx, cy + 30);
      ctx.lineTo(cx - 10, cy + 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 15);
      ctx.lineTo(cx + 5, cy + 20);
      ctx.lineTo(cx, cy + 25);
      ctx.lineTo(cx - 5, cy + 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NAV', cx, y + h * 0.65);

      ctx.fillStyle = '#15803d';
      ctx.font = '900 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('DURGA', cx, y + h * 0.82);
    }
    ctx.restore();
  }

  private static async drawDiwaliNavDurgaFestivalHeader(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): Promise<void> {
    ctx.save();

    // 1. Header Container Card
    this.roundRect(ctx, x, y, w, h, 18);
    const bgGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.6, '#fffdf5');
    bgGrad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = bgGrad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.save();
    this.roundRect(ctx, x, y, w, h, 18);
    ctx.clip();

    // 2. Top-Left Tiranga Arc Ribbon
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 80);
    ctx.quadraticCurveTo(x + 40, y + 50, x + 160, y - 20);
    ctx.lineTo(x - 20, y - 20);
    ctx.closePath();
    ctx.fillStyle = '#f97316'; // Saffron
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 20, y + 90);
    ctx.quadraticCurveTo(x + 50, y + 60, x + 175, y - 20);
    ctx.lineTo(x + 160, y - 20);
    ctx.quadraticCurveTo(x + 40, y + 50, x - 20, y + 80);
    ctx.closePath();
    ctx.fillStyle = '#ffffff'; // White
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 20, y + 100);
    ctx.quadraticCurveTo(x + 60, y + 70, x + 190, y - 20);
    ctx.lineTo(x + 175, y - 20);
    ctx.quadraticCurveTo(x + 50, y + 60, x - 20, y + 90);
    ctx.closePath();
    ctx.fillStyle = '#16a34a'; // Emerald Green
    ctx.fill();

    // 3. LEFT BRANDING AREA
    const logoX = x + 35;
    const logoY = y + 18;
    await this.drawMasterLogo(ctx, logoX, logoY, 84, 90);

    // NAV DURGA GROUP Heading
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NAV', logoX + 96, logoY + 32);

    ctx.fillStyle = '#15803d';
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DURGA', logoX + 152, logoY + 32);

    ctx.fillStyle = '#1e293b';
    ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('— GROUP —', logoX + 102, logoY + 54);

    // Bottom Indian Flag + "We build the nation" Tag
    const tagY = y + 124;
    // Left mini flag
    ctx.fillStyle = '#f97316'; ctx.fillRect(x + 25, tagY, 24, 4);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 25, tagY + 4, 24, 4);
    ctx.fillStyle = '#16a34a'; ctx.fillRect(x + 25, tagY + 8, 24, 4);

    ctx.fillStyle = '#b91c1c'; // Red text
    ctx.font = '900 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('We build the nation', x + 56, tagY + 11);

    // Right mini flag
    ctx.fillStyle = '#f97316'; ctx.fillRect(x + 204, tagY, 24, 4);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 204, tagY + 4, 24, 4);
    ctx.fillStyle = '#16a34a'; ctx.fillRect(x + 204, tagY + 8, 24, 4);

    // 4. CENTER FESTIVAL GREETING AREA
    const cx = x + 490;

    // Golden Trishul Symbol
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.fillRect(cx - 3, y + 12, 6, 22);
    ctx.beginPath();
    ctx.moveTo(cx, y + 8);
    ctx.lineTo(cx + 6, y + 20);
    ctx.lineTo(cx - 6, y + 20);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx - 10, y + 18, 8, Math.PI * 0.2, Math.PI * 1.2);
    ctx.arc(cx + 10, y + 18, 8, -Math.PI * 0.2, Math.PI * 0.8);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // Shubh Sub-Header with Decorative Arrows
    ctx.fillStyle = '#991b1b';
    ctx.font = 'italic 700 20px "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.fillText('— Shubh —', cx, y + 50);

    // Large Header: NAV DURGA
    ctx.fillStyle = '#800000'; // Deep Maroon
    ctx.font = '900 46px "Times New Roman", Georgia, serif';
    ctx.fillText('NAV DURGA', cx, y + 96);

    // Blessing Subtitle
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('May Maa Durga bless you with', cx, y + 122);
    ctx.fillText('prosperity, success and new beginnings.', cx, y + 140);

    // Bottom Mandala Flourish
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(cx, y + 152, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. RIGHT FESTIVAL ARTWORK & JAI MATA DI STAMP
    const rightX = x + 710;
    const rightW = w - 710;

    // Golden Radial Glow
    ctx.save();
    const goldGlow = ctx.createRadialGradient(
      rightX + rightW * 0.5,
      y + h * 0.5,
      10,
      rightX + rightW * 0.5,
      y + h * 0.5,
      180
    );
    goldGlow.addColorStop(0, '#fef08a');
    goldGlow.addColorStop(0.5, '#fde047');
    goldGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = goldGlow;
    ctx.fillRect(rightX, y, rightW, h);

    // Draw Maa Durga & Lion Portrait Image
    try {
      const durgaImg = await this.loadImage(maaDurgaPortraitUrl);
      ctx.save();
      this.roundRect(ctx, rightX + 10, y + 6, 230, h - 12, 14);
      ctx.clip();
      ctx.drawImage(durgaImg, rightX + 10, y + 6, 230, h - 12);
      ctx.restore();
    } catch {
      // Fallback
    }

    // Red Brush Stamp Badge: "जय माता दी"
    const stampX = rightX + rightW - 135;
    const stampY = y + 18;
    const stampW = 120;
    const stampH = 110;

    ctx.save();
    ctx.translate(stampX + stampW / 2, stampY + stampH / 2);
    ctx.rotate(-0.08); // Subtle energetic angle

    const stampGrad = ctx.createLinearGradient(-stampW / 2, -stampH / 2, stampW / 2, stampH / 2);
    stampGrad.addColorStop(0, '#dc2626');
    stampGrad.addColorStop(1, '#b91c1c');
    ctx.fillStyle = stampGrad;

    this.roundRect(ctx, -stampW / 2, -stampH / 2, stampW, stampH, 16);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('जय', 0, -18);
    ctx.fillText('माता', 0, 10);
    ctx.fillText('दी', 0, 38);
    ctx.restore();

    // Bottom-Right Blue Wave Accent
    ctx.beginPath();
    ctx.moveTo(x + w - 180, y + h);
    ctx.quadraticCurveTo(x + w - 80, y + h - 25, x + w, y + h - 10);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fillStyle = '#0284c7';
    ctx.fill();

    ctx.restore();
  }

  private static async drawMasterLogo(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): Promise<void> {
    ctx.save();
    // Rounded white card backdrop
    this.roundRect(ctx, x, y, w, h, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    const cx = x + w / 2;
    const cy = y + h / 2 - 8;

    // Outer Navy Flame/Diamond
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 36);
    ctx.lineTo(cx + 32, cy);
    ctx.lineTo(cx + 20, cy + 12);
    ctx.lineTo(cx, cy - 4);
    ctx.lineTo(cx - 20, cy + 12);
    ctx.lineTo(cx - 32, cy);
    ctx.closePath();
    ctx.fill();

    // Inner Green Accent
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 28, cy + 28);
    ctx.lineTo(cx, cy + 56);
    ctx.lineTo(cx - 28, cy + 28);
    ctx.closePath();
    ctx.fill();

    // White Core Shield
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 12);
    ctx.lineTo(cx + 16, cy + 28);
    ctx.lineTo(cx, cy + 44);
    ctx.lineTo(cx - 16, cy + 28);
    ctx.closePath();
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.restore();
  }

  private static formatDisplayDate(dateStr: string): string {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return dateStr;
      const dt = new Date(y, m - 1, d);
      return dt
        .toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .toUpperCase();
    } catch {
      return dateStr;
    }
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private static roundRectTop(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * History Storage Helpers
   */
  public static getGeneratedPostsHistory(): NanoBananaGeneratedPost[] {
    try {
      const raw = localStorage.getItem(NANO_BANANA_HISTORY_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as NanoBananaGeneratedPost[];
    } catch {
      return [];
    }
  }

  public static savePostToHistory(post: NanoBananaGeneratedPost): void {
    try {
      const existing = this.getGeneratedPostsHistory().filter((p) => p.id !== post.id);
      const updated = [post, ...existing].slice(0, 12);
      localStorage.setItem(NANO_BANANA_HISTORY_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('navdurga_nano_banana_post_generated', { detail: post })
      );
    } catch (err) {
      console.warn('Could not save Nano Banana post to history:', err);
    }
  }
}
