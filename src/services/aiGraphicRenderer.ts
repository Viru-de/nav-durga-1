import { AIGraphicRecipe } from '../types';
import steelChannelsTopUrl from '../assets/images/steel_channels_bundle_top_1790865061499.jpg';
import steelChannelsGreenUrl from '../assets/images/steel_channels_green_ends_1790865075262.jpg';
import steelUChannelsBottomUrl from '../assets/images/steel_uchannels_closeup_1790865086930.jpg';

const CUSTOM_REVISED_BG_STORAGE_KEY = 'navdurga_custom_rate_revised_bg_v1';

export interface RateRevisedPosterData {
  mediumSectionName: string;
  mediumSectionRate: number;
  lightSectionName: string;
  lightSectionRate: number;
  timeText: string; // e.g. "01.00"
  ampmText: string; // e.g. "PM"
  dayText: string; // e.g. "TUESDAY"
  dateText: string; // e.g. "18.08.2026"
  boxHeaderTitle: string; // e.g. "RATE REVISED"
  lastUpdated?: string;
}

export const DEFAULT_RATE_REVISED_DATA: RateRevisedPosterData = {
  mediumSectionName: 'Medium Section',
  mediumSectionRate: 44411,
  lightSectionName: 'Light Section',
  lightSectionRate: 38011,
  timeText: '01.00',
  ampmText: 'PM',
  dayText: 'TUESDAY',
  dateText: '18.08.2026',
  boxHeaderTitle: 'RATE REVISED',
};

export class AIGraphicRenderer {
  public static readonly TEMPLATE_WIDTH = 1536;
  public static readonly TEMPLATE_HEIGHT = 1024;

  private static assets: {
    topChannels: HTMLImageElement | null;
    greenChannels: HTMLImageElement | null;
    bottomChannels: HTMLImageElement | null;
    customBg: HTMLImageElement | null;
  } = {
    topChannels: null,
    greenChannels: null,
    bottomChannels: null,
    customBg: null,
  };

  private static isLoaded = false;
  private static isLoading = false;
  private static loadListeners: Array<() => void> = [];

  public static setCustomTemplateDataUrl(dataUrl: string | null, onComplete?: () => void): void {
    try {
      if (typeof localStorage !== 'undefined') {
        if (dataUrl) {
          localStorage.setItem(CUSTOM_REVISED_BG_STORAGE_KEY, dataUrl);
        } else {
          localStorage.removeItem(CUSTOM_REVISED_BG_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('Could not save custom rate revised template:', e);
    }

    if (!dataUrl) {
      this.assets.customBg = null;
      onComplete?.();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.assets.customBg = img;
      onComplete?.();
    };
    img.onerror = () => {
      this.assets.customBg = null;
      onComplete?.();
    };
    img.src = dataUrl;
  }

  public static hasCustomTemplate(): boolean {
    if (this.assets.customBg) return true;
    try {
      return typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(CUSTOM_REVISED_BG_STORAGE_KEY));
    } catch {
      return false;
    }
  }

  public static preloadAssets(onLoad?: () => void): void {
    if (this.isLoaded) {
      onLoad?.();
      return;
    }

    if (onLoad) {
      this.loadListeners.push(onLoad);
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const loadSingle = (src: string): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    let storedCustomBg: string | null = null;
    try {
      if (typeof localStorage !== 'undefined') {
        storedCustomBg = localStorage.getItem(CUSTOM_REVISED_BG_STORAGE_KEY);
      }
    } catch {
      storedCustomBg = null;
    }

    Promise.all([
      loadSingle(steelChannelsTopUrl),
      loadSingle(steelChannelsGreenUrl),
      loadSingle(steelUChannelsBottomUrl),
      storedCustomBg ? loadSingle(storedCustomBg) : Promise.resolve(null),
    ]).then(([topChannels, greenChannels, bottomChannels, customBg]) => {
      this.assets.topChannels = topChannels;
      this.assets.greenChannels = greenChannels;
      this.assets.bottomChannels = bottomChannels;
      if (customBg) {
        this.assets.customBg = customBg;
      }
      this.isLoaded = true;
      this.isLoading = false;
      const listeners = [...this.loadListeners];
      this.loadListeners = [];
      listeners.forEach((fn) => fn());
    });
  }

  /**
   * Renders the Nav Durga Group "RATE REVISED" Market Openings poster (1536 × 1024)
   * matching the uploaded WhatsApp reference image.
   */
  public static renderRateRevisedPoster(
    canvas: HTMLCanvasElement,
    data: RateRevisedPosterData,
    onReady?: () => void
  ): void {
    const width = this.TEMPLATE_WIDTH;
    const height = this.TEMPLATE_HEIGHT;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.drawFullRateRevisedPoster(ctx, width, height, data);

    if (this.isLoaded) {
      onReady?.();
    } else {
      this.preloadAssets(() => {
        if (canvas.isConnected) {
          const freshCtx = canvas.getContext('2d');
          if (freshCtx) {
            this.drawFullRateRevisedPoster(freshCtx, width, height, data);
          }
          onReady?.();
        }
      });
    }
  }

  /**
   * Legacy compatibility wrapper for AIGraphicRecipe callers
   */
  public static renderToCanvas(
    canvas: HTMLCanvasElement,
    recipe: AIGraphicRecipe,
    overrideData?: RateRevisedPosterData
  ): void {
    const data: RateRevisedPosterData = overrideData || this.extractDataFromRecipe(recipe);
    this.renderRateRevisedPoster(canvas, data);
  }

  public static extractDataFromRecipe(recipe: AIGraphicRecipe): RateRevisedPosterData {
    const result = { ...DEFAULT_RATE_REVISED_DATA };
    const raw = `${recipe.headline || ''} ${recipe.subheadline || ''} ${recipe.price || ''}`;

    // Extract Medium Section rate if present in prompt
    const medMatch = raw.match(/medium(?:\s+section)?[^0-9₹]*₹?\s*([0-9]{2,3},?[0-9]{3})/i);
    if (medMatch?.[1]) {
      result.mediumSectionRate = Number(medMatch[1].replace(/,/g, '')) || result.mediumSectionRate;
    }

    // Extract Light Section rate if present in prompt
    const lightMatch = raw.match(/light(?:\s+section)?[^0-9₹]*₹?\s*([0-9]{2,3},?[0-9]{3})/i);
    if (lightMatch?.[1]) {
      result.lightSectionRate = Number(lightMatch[1].replace(/,/g, '')) || result.lightSectionRate;
    }

    return result;
  }

  private static drawFullRateRevisedPoster(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    data: RateRevisedPosterData
  ): void {
    ctx.save();

    // If user uploaded the exact custom background image, draw it and overlay only the dynamic boxes
    if (this.assets.customBg) {
      ctx.drawImage(this.assets.customBg, 0, 0, width, height);
      this.drawTimestampBlackPill(ctx, data);
      this.drawRateRevisedRedBox(ctx, data);
      ctx.restore();
      return;
    }

    // 1. Crisp White Poster Background & Outer Rounded Border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    this.roundRect(ctx, 2, 2, width - 4, height - 4, 20);
    ctx.stroke();

    // 2. Top-Left: NAV DURGA ISPAT (P) LTD. Logo + "We build the nation"
    this.drawTopLeftBranding(ctx);

    // 3. Top-Center: Waving 3D Indian Flags + "NAVDURGA GROUP"
    this.drawTopCenterHeader(ctx);

    // 4. Top-Center Black Pill: Clock Icon + "01.00 PM , TUESDAY , 18.08.2026"
    this.drawTimestampBlackPill(ctx, data);

    // 5. Center Divider Line with Black Dot
    this.drawCenterDividerLine(ctx);

    // 6. Middle-Left Banners: Dark Maroon "* MARKET OPENINGS: *" & Black "* Basic Rates (Ex-Works) *"
    this.drawMarketOpeningsBanners(ctx);

    // 7. Center-Left Red-Bordered Box: "RATE REVISED" with Medium Section & Light Section rows
    this.drawRateRevisedRedBox(ctx, data);

    // 8. Lower-Left Black Wish Banner with Swastikas: "Wishing you a very happy and productive day."
    this.drawBlackWishBanner(ctx);

    // 9. Right Column: 3-Row Steel Channels Photo Collage + Payment Terms + Important Notice
    this.drawRightColumn(ctx);

    // 10. Bottom Footer: Black/Red "CONTACT FOR ORDERS" Pill + 3 Red Phone Icons & Hotlines
    this.drawBottomFooter(ctx);

    ctx.restore();
  }

  /**
   * 2. Top-Left: NAV DURGA ISPAT (P) LTD. Logo & "We build the nation"
   */
  private static drawTopLeftBranding(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Double Diamond Chevron Peak above "V" of NAV (cx = 160, y = 14..118)
    const peakX = 160;
    const peakY = 48;

    // Top Orange Chevron
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY - 36);
    ctx.lineTo(peakX + 38, peakY + 2);
    ctx.lineTo(peakX + 22, peakY + 18);
    ctx.lineTo(peakX, peakY - 4);
    ctx.lineTo(peakX - 22, peakY + 18);
    ctx.lineTo(peakX - 38, peakY + 2);
    ctx.closePath();
    ctx.fill();

    // Lower Black Diamond with Square Cutout
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY + 8);
    ctx.lineTo(peakX + 34, peakY + 42);
    ctx.lineTo(peakX, peakY + 76);
    ctx.lineTo(peakX - 34, peakY + 42);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY + 24);
    ctx.lineTo(peakX + 17, peakY + 42);
    ctx.lineTo(peakX, peakY + 60);
    ctx.lineTo(peakX - 17, peakY + 42);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY + 33);
    ctx.lineTo(peakX + 9, peakY + 42);
    ctx.lineTo(peakX, peakY + 51);
    ctx.lineTo(peakX - 9, peakY + 42);
    ctx.closePath();
    ctx.fill();

    // "N A V" in wide geometric black lettering
    ctx.fillStyle = '#09090b';
    ctx.font = '900 52px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('N A', 18, 122);

    // "O U R G A" / "D U R G A" in wide blocky black industrial lettering
    ctx.save();
    ctx.fillStyle = '#09090b';
    ctx.font = '900 54px "Plus Jakarta Sans", sans-serif';
    ctx.scale(1.06, 0.92);
    ctx.fillText('D U R G A', 17, 192);
    ctx.restore();

    // "ISPAT (P) LTD." in bold black serif
    ctx.fillStyle = '#09090b';
    ctx.font = '800 31px Georgia, "Times New Roman", serif';
    ctx.fillText('ISPAT (P) LTD.', 18, 214);

    // "🇮🇳 We build the nation 🇮🇳"
    this.drawMiniFlag(ctx, 14, 240, 34, 28);
    ctx.save();
    ctx.fillStyle = '#dc2626';
    ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.scale(0.76, 1.05);
    ctx.fillText('We build the nation', 160 / 0.76, 260);
    ctx.restore();
    this.drawMiniFlag(ctx, 274, 240, 34, 28);

    ctx.restore();
  }

  private static drawMiniFlag(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    ctx.save();
    const sh = h / 3;
    const drawWaveBand = (by: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, by);
      ctx.quadraticCurveTo(x + w * 0.5, by - 3, x + w, by + 2);
      ctx.lineTo(x + w, by + sh + 2);
      ctx.quadraticCurveTo(x + w * 0.5, by + sh - 3, x, by + sh);
      ctx.closePath();
      ctx.fill();
    };
    drawWaveBand(y, '#ea580c');
    drawWaveBand(y + sh, '#ffffff');
    drawWaveBand(y + sh * 2, '#15803d');

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, sh * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 3. Top-Center: Waving 3D Indian Flags on Gold Flagpoles + "NAVDURGA GROUP"
   */
  private static drawTopCenterHeader(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Left 3D Waving Indian Flag on Gold Pole (x ≈ 302..444, y ≈ 14..142)
    this.draw3DWavingFlagWithPole(ctx, 304, 18, 134, 92);

    // Center "NAVDURGA GROUP" in tall condensed black font
    ctx.save();
    ctx.fillStyle = '#09090b';
    ctx.font = '900 88px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.scale(0.76, 1.05);
    ctx.fillText('NAVDURGA GROUP', 782 / 0.76, 98);
    ctx.restore();

    // Right 3D Waving Indian Flag on Gold Pole (x ≈ 1126..1268, y ≈ 14..142)
    this.draw3DWavingFlagWithPole(ctx, 1128, 18, 134, 92);

    ctx.restore();
  }

  private static draw3DWavingFlagWithPole(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    ctx.save();

    const sh = h / 3;
    const drawRibbon = (ry: number, c1: string, c2: string) => {
      const grad = ctx.createLinearGradient(x, ry, x + w, ry + sh);
      grad.addColorStop(0, c1);
      grad.addColorStop(0.5, c2);
      grad.addColorStop(1, c1);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x + 6, ry);
      ctx.bezierCurveTo(x + w * 0.35, ry - 8, x + w * 0.65, ry + 12, x + w, ry + 4);
      ctx.lineTo(x + w + 8, ry + sh + 6);
      ctx.bezierCurveTo(x + w * 0.65, ry + sh + 14, x + w * 0.35, ry + sh - 6, x + 10, ry + sh);
      ctx.closePath();
      ctx.fill();
    };

    drawRibbon(y + 8, '#ea580c', '#fb923c');
    drawRibbon(y + 8 + sh, '#e2e8f0', '#ffffff');
    drawRibbon(y + 8 + sh * 2, '#14532d', '#16a34a');

    // Outline of flag
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 8);
    ctx.bezierCurveTo(x + w * 0.35, y, x + w * 0.65, y + 20, x + w, y + 12);
    ctx.lineTo(x + w + 14, y + h + 14);
    ctx.bezierCurveTo(x + w * 0.65, y + h + 22, x + w * 0.35, y + h + 2, x + 16, y + h + 8);
    ctx.closePath();
    ctx.stroke();

    // Ashoka Chakra in center of white stripe
    const cx = x + w * 0.52;
    const cy = y + 8 + sh * 1.5 + 2;
    const cr = sh * 0.44;
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI / 6) * i;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(a) * cr, cy - Math.sin(a) * cr);
      ctx.lineTo(cx + Math.cos(a) * cr, cy + Math.sin(a) * cr);
      ctx.stroke();
    }

    // Tilted Golden Flagpole on Left Edge
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + 18, y + h + 26);
    ctx.stroke();

    // Golden Finial Ball on Top of Pole
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + 3, y + 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 4. Top-Center Black Pill: Clock Icon + "01.00 PM , TUESDAY , 18.08.2026"
   */
  private static drawTimestampBlackPill(
    ctx: CanvasRenderingContext2D,
    data: RateRevisedPosterData
  ): void {
    ctx.save();

    const pillX = 324;
    const pillY = 144;
    const pillW = 824;
    const pillH = 92;

    ctx.fillStyle = '#050505';
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 46);
    ctx.fill();

    // Left Yellow Clock Icon (cx = 370, cy = 190, r = 29)
    const clockX = 370;
    const clockY = 190;
    const clockR = 29;
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
    ctx.stroke();

    // Clock ticks & hands
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY - clockR + 4);
    ctx.lineTo(clockX, clockY - clockR + 9);
    ctx.moveTo(clockX, clockY + clockR - 4);
    ctx.lineTo(clockX, clockY + clockR - 9);
    ctx.moveTo(clockX - clockR + 4, clockY);
    ctx.lineTo(clockX - clockR + 9, clockY);
    ctx.moveTo(clockX + clockR - 4, clockY);
    ctx.lineTo(clockX + clockR - 9, clockY);
    // Minute hand (pointing up) & Hour hand (pointing ~1 o'clock)
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX, clockY - 18);
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + 11, clockY + 8);
    ctx.stroke();

    // Dynamic Time, Day & Date Text inside Black Pill
    const timeStr = (data.timeText || '01.00').trim();
    const ampmStr = (data.ampmText || 'PM').trim().toUpperCase();
    const dayStr = (data.dayText || 'TUESDAY').trim().toUpperCase();
    const dateStr = (data.dateText || '18.08.2026').trim();

    const baseY = pillY + 65;
    let curX = 418;

    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // 1. "01.00" in bold yellow condensed
    ctx.fillStyle = '#eab308';
    ctx.font = '900 58px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(timeStr, curX, baseY);
    curX += ctx.measureText(timeStr).width + 8;

    // 2. "PM" in bold white
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(ampmStr, curX, baseY - 2);
    curX += ctx.measureText(ampmStr).width + 8;

    // 3. ", TUESDAY , " in bold white condensed
    const midStr = `, ${dayStr} , `;
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 50px "Plus Jakarta Sans", sans-serif';
    ctx.save();
    ctx.scale(0.84, 1);
    ctx.fillText(midStr, curX / 0.84, baseY);
    ctx.restore();
    curX += ctx.measureText(midStr).width * 0.84;

    // 4. "18.08.2026" in bold yellow condensed
    ctx.fillStyle = '#eab308';
    ctx.font = '900 56px "Plus Jakarta Sans", sans-serif';
    ctx.save();
    ctx.scale(0.82, 1);
    ctx.fillText(dateStr, curX / 0.82, baseY);
    ctx.restore();

    ctx.restore();
    ctx.restore();
  }

  /**
   * 5. Center Horizontal Black Divider Line with Dot
   */
  private static drawCenterDividerLine(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const y = 274;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 4.5;

    ctx.beginPath();
    ctx.moveTo(378, y);
    ctx.lineTo(672, y);
    ctx.moveTo(720, y);
    ctx.lineTo(1088, y);
    ctx.stroke();

    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(696, y, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * 6. Middle-Left Banners:
   * - Dark Maroon "* MARKET OPENINGS: *"
   * - Solid Black "* Basic Rates (Ex-Works) *"
   */
  private static drawMarketOpeningsBanners(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // A. Dark Maroon Banner (x: 132..1142, y: 298..410)
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.moveTo(168, 298);
    ctx.lineTo(1110, 298);
    ctx.quadraticCurveTo(1152, 298, 1138, 345);
    ctx.lineTo(1124, 386);
    ctx.quadraticCurveTo(1116, 410, 1086, 410);
    ctx.lineTo(188, 410);
    ctx.quadraticCurveTo(156, 410, 144, 380);
    ctx.lineTo(134, 340);
    ctx.quadraticCurveTo(126, 298, 168, 298);
    ctx.closePath();
    ctx.fill();

    // Left & Right 8-pointed Yellow Stars
    this.drawEightPointAsterisk(ctx, 222, 354, 30, '#eab308');
    this.drawEightPointAsterisk(ctx, 1078, 354, 30, '#eab308');

    // Bold White Text: "MARKET OPENINGS:"
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.scale(0.92, 1);
    ctx.fillText('MARKET OPENINGS:', 655 / 0.92, 356);
    ctx.restore();

    // B. Solid Black Pill Banner: "* Basic Rates (Ex-Works) *" (x: 260..1072, y: 414..506)
    const bpX = 260;
    const bpY = 414;
    const bpW = 812;
    const bpH = 92;

    ctx.fillStyle = '#050505';
    this.roundRect(ctx, bpX, bpY, bpW, bpH, 46);
    ctx.fill();

    // Left & Right 8-pointed Electric Blue Stars
    this.drawEightPointAsterisk(ctx, 312, 460, 26, '#1d4ed8');
    this.drawEightPointAsterisk(ctx, 1020, 460, 26, '#1d4ed8');

    // Bold White Text: "Basic Rates (Ex-Works)"
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 54px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.scale(0.88, 1);
    ctx.fillText('Basic Rates (Ex-Works)', 666 / 0.88, 462);
    ctx.restore();

    ctx.restore();
  }

  private static drawEightPointAsterisk(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    color: string
  ): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.lineCap = 'butt';
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 4) * i;
      ctx.beginPath();
      ctx.moveTo(-Math.cos(a) * r, -Math.sin(a) * r);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 7. Center-Left Red-Bordered "RATE REVISED" Box (x: 52, y: 534, w: 1082, h: 260)
   * Dynamically renders Medium Section & Light Section rates in bold red-orange.
   */
  private static drawRateRevisedRedBox(
    ctx: CanvasRenderingContext2D,
    data: RateRevisedPosterData
  ): void {
    ctx.save();

    const boxX = 52;
    const boxY = 534;
    const boxW = 1082;
    const boxH = 260;
    const radius = 22;

    // Crisp White Box Fill
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, boxX, boxY, boxW, boxH, radius);
    ctx.fill();

    // Red Outer Border (2.5px)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, boxX, boxY, boxW, boxH, radius);
    ctx.stroke();

    // Top-Center White Knockout & "RATE REVISED" Title
    const headerTitle = (data.boxHeaderTitle || 'RATE REVISED').toUpperCase();
    ctx.font = '900 44px "Plus Jakarta Sans", sans-serif';
    const titleW = Math.max(ctx.measureText(headerTitle).width * 1.15 + 56, 480);
    const gapX = 608 - titleW / 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gapX, boxY - 26, titleW, 50);

    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.font = '900 43px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.scale(1.14, 1);
    ctx.fillText(headerTitle, 608 / 1.14, boxY + 2);
    ctx.restore();

    // =========================================================================
    // ROW 1: Medium Section – ₹44411/MT (y = 612)
    // =========================================================================
    const row1Y = 612;
    const redOrange = '#d9381e';

    // Red Bullet Circle
    ctx.fillStyle = redOrange;
    ctx.beginPath();
    ctx.arc(98, row1Y - 4, 15, 0, Math.PI * 2);
    ctx.fill();

    // "Medium Section" Label
    const medLabel = data.mediumSectionName || 'Medium Section';
    ctx.save();
    ctx.fillStyle = redOrange;
    ctx.font = '800 68px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.scale(0.84, 1.05);
    ctx.fillText(medLabel, 136 / 0.84, row1Y / 1.05);
    ctx.restore();

    // Dash "–"
    ctx.fillStyle = redOrange;
    ctx.fillRect(668, row1Y - 2, 48, 7);

    // Rate "₹44411/MT"
    this.drawRedOrangePrice(ctx, data.mediumSectionRate, 758, row1Y, 1116, redOrange);

    // =========================================================================
    // DASHED RED-ORANGE HORIZONTAL DIVIDER (y = 674)
    // =========================================================================
    ctx.fillStyle = redOrange;
    for (let dx = 76; dx < 1098; dx += 19) {
      ctx.fillRect(dx, 670, 14, 8);
    }

    // =========================================================================
    // ROW 2: Light Section – ₹38011/MT (y = 744)
    // =========================================================================
    const row2Y = 744;

    // Red Bullet Circle
    ctx.fillStyle = redOrange;
    ctx.beginPath();
    ctx.arc(98, row2Y - 4, 15, 0, Math.PI * 2);
    ctx.fill();

    // "Light Section" Label
    const lightLabel = data.lightSectionName || 'Light Section';
    ctx.save();
    ctx.fillStyle = redOrange;
    ctx.font = '800 68px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.scale(0.84, 1.05);
    ctx.fillText(lightLabel, 136 / 0.84, row2Y / 1.05);
    ctx.restore();

    // Dash "–"
    ctx.fillStyle = redOrange;
    ctx.fillRect(594, row2Y - 2, 48, 7);

    // Rate "₹38011/MT"
    this.drawRedOrangePrice(ctx, data.lightSectionRate, 754, row2Y, 1116, redOrange);

    ctx.restore();
  }

  private static drawRedOrangePrice(
    ctx: CanvasRenderingContext2D,
    rateValue: number,
    startX: number,
    centerY: number,
    maxRightX: number,
    color: string
  ): void {
    ctx.save();
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    const rawNum = String(Math.round(Number(rateValue) || 0));
    const priceStr = `₹${rawNum}`;
    const unitStr = '/MT';

    let mainSize = 78;
    let unitSize = 48;
    const condScale = 0.84;

    const measure = (m: number, u: number) => {
      ctx.font = `900 ${m}px "Plus Jakarta Sans", sans-serif`;
      const pw = ctx.measureText(priceStr).width * condScale;
      ctx.font = `900 ${u}px "Plus Jakarta Sans", sans-serif`;
      const uw = ctx.measureText(unitStr).width * condScale;
      return { pw, uw, total: pw + 4 + uw };
    };

    let dims = measure(mainSize, unitSize);
    while (dims.total > maxRightX - startX && mainSize > 46) {
      mainSize -= 2;
      unitSize = Math.round(mainSize * 0.62);
      dims = measure(mainSize, unitSize);
    }

    const baseY = centerY + mainSize * 0.35;

    ctx.save();
    ctx.scale(condScale, 1.04);
    ctx.font = `900 ${mainSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(priceStr, startX / condScale, baseY / 1.04);

    ctx.font = `900 ${unitSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(unitStr, (startX + dims.pw + 4) / condScale, baseY / 1.04);
    ctx.restore();

    ctx.restore();
  }

  /**
   * 8. Lower-Left Black Banner with Swastikas & Wish (x: 52, y: 804, w: 1082, h: 100)
   */
  private static drawBlackWishBanner(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const bx = 52;
    const by = 804;
    const bw = 1082;
    const bh = 100;

    ctx.fillStyle = '#050505';
    this.roundRect(ctx, bx, by, bw, bh, 24);
    ctx.fill();

    // Left & Right Traditional Orange-Gold Swastikas
    this.drawSwastikaSymbol(ctx, 124, 854, 30);
    this.drawSwastikaSymbol(ctx, 1054, 854, 30);

    // Top White Script: "Wishing you a very"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 500 37px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Wishing you a very', 598, 830);

    // Bottom Yellow Italic Bold: "happy and productive day."
    ctx.fillStyle = '#eab308';
    ctx.font = 'italic 900 46px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('happy and productive day.', 598, 878);

    ctx.restore();
  }

  private static drawSwastikaSymbol(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    s: number
  ): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = '#d97706';
    ctx.fillStyle = '#d97706';
    ctx.lineWidth = 7;
    ctx.lineCap = 'square';

    // Center cross
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(s, 0);
    ctx.moveTo(0, -s);
    ctx.lineTo(0, s);
    // 4 clockwise arms
    ctx.moveTo(0, -s);
    ctx.lineTo(s, -s);
    ctx.moveTo(s, 0);
    ctx.lineTo(s, s);
    ctx.moveTo(0, s);
    ctx.lineTo(-s, s);
    ctx.moveTo(-s, 0);
    ctx.lineTo(-s, -s);
    ctx.stroke();

    // 4 auspicious dots
    const dotR = 3.5;
    const d = s * 0.52;
    [
      [-d, -d],
      [d, -d],
      [-d, d],
      [d, d],
    ].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * 9. Right Column:
   * - Top 3-Row Steel Channels Photo Collage (x: 1160, y: 134, w: 360, h: 448)
   * - Middle Red-Bordered Card: PAYMENT TERMS (x: 1160, y: 590, w: 360, h: 162)
   * - Bottom Red-Bordered Card: IMPORTANT NOTICE (x: 1160, y: 760, w: 360, h: 144)
   */
  private static drawRightColumn(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const colX = 1160;
    const colW = 360;

    // -------------------------------------------------------------------------
    // A. Steel Channels Photo Collage Container (y: 134..582)
    // -------------------------------------------------------------------------
    const colY = 134;
    const colH = 448;

    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, colX, colY, colW, colH, 18);
    ctx.fill();

    ctx.save();
    this.roundRect(ctx, colX + 5, colY + 5, colW - 10, colH - 10, 14);
    ctx.clip();

    // Top Photo (y: 139, h: 215): Stacked Steel Channels Bundle
    if (this.assets.topChannels) {
      ctx.drawImage(this.assets.topChannels, colX + 5, 139, colW - 10, 215);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(colX + 5, 139, colW - 10, 215);
    }

    // Middle-Left Photo (y: 358, w: 150, h: 106): Green-marked Steel Channels
    if (this.assets.greenChannels) {
      ctx.drawImage(this.assets.greenChannels, colX + 5, 358, 150, 106);
      ctx.drawImage(this.assets.greenChannels, colX + 159, 358, colW - 164, 106);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(colX + 5, 358, 150, 106);
      ctx.fillRect(colX + 159, 358, colW - 164, 106);
    }

    // Bottom Photo (y: 468, h: 109): Close-up U-Channels
    if (this.assets.bottomChannels) {
      ctx.drawImage(this.assets.bottomChannels, colX + 5, 468, colW - 10, 109);
    } else {
      ctx.fillStyle = '#334155';
      ctx.fillRect(colX + 5, 468, colW - 10, 109);
    }
    ctx.restore();

    // Outer thin black outline around collage
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    this.roundRect(ctx, colX, colY, colW, colH, 18);
    ctx.stroke();

    // -------------------------------------------------------------------------
    // B. PAYMENT TERMS Red-Bordered Card (x: 1160, y: 590, w: 360, h: 162)
    // -------------------------------------------------------------------------
    const payY = 590;
    const payH = 162;

    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, colX, payY, colW, payH, 18);
    ctx.fill();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, colX, payY, colW, payH, 18);
    ctx.stroke();

    // Top Black Inverted Trapezoid Tab: "PAYMENT TERMS"
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(colX + 78, payY);
    ctx.lineTo(colX + 308, payY);
    ctx.lineTo(colX + 292, payY + 32);
    ctx.lineTo(colX + 94, payY + 32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAYMENT TERMS', colX + 193, payY + 16);

    // Row 1: Black Circle Shield Icon + "Advance Payment Basis"
    const sCx = colX + 46;
    const sCy = payY + 46;
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(sCx, sCy, 23, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sCx, sCy - 13);
    ctx.lineTo(sCx + 11, sCy - 8);
    ctx.lineTo(sCx + 11, sCy + 2);
    ctx.quadraticCurveTo(sCx + 11, sCy + 11, sCx, sCy + 15);
    ctx.quadraticCurveTo(sCx - 11, sCy + 11, sCx - 11, sCy + 2);
    ctx.lineTo(sCx - 11, sCy - 8);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(sCx - 5, sCy + 1);
    ctx.lineTo(sCx - 1, sCy + 5);
    ctx.lineTo(sCx + 6, sCy - 4);
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = '#09090b';
    ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.scale(0.85, 1);
    ctx.fillText('Advance Payment Basis', (colX + 88) / 0.85, sCy + 4);
    ctx.restore();

    // Row 2: Red Circle ₹ Icon + "₹ 300/MT extra / for next - day payment"
    const rCx = colX + 46;
    const rCy = payY + 110;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(rCx, rCy, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₹', rCx, rCy + 2);

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.scale(0.84, 1);
    ctx.fillStyle = '#dc2626';
    ctx.font = '900 31px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('₹ 300/MT', (colX + 88) / 0.84, payY + 104);

    ctx.fillStyle = '#09090b';
    ctx.font = '800 25px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('extra', (colX + 208) / 0.84, payY + 104);

    ctx.font = '800 25px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('for next - day payment', (colX + 88) / 0.84, payY + 136);
    ctx.restore();

    // -------------------------------------------------------------------------
    // C. IMPORTANT NOTICE Red-Bordered Card (x: 1160, y: 760, w: 360, h: 144)
    // -------------------------------------------------------------------------
    const notY = 760;
    const notH = 144;

    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, colX, notY, colW, notH, 18);
    ctx.fill();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, colX, notY, colW, notH, 18);
    ctx.stroke();

    // Top Red Inverted Trapezoid Tab: "IMPORTANT NOTICE"
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(colX + 62, notY);
    ctx.lineTo(colX + 320, notY);
    ctx.lineTo(colX + 304, notY + 30);
    ctx.lineTo(colX + 78, notY + 30);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('IMPORTANT NOTICE', colX + 191, notY + 15);

    // Yellow Warning Triangle on Left
    const triX = colX + 36;
    const triY = notY + 56;
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(triX, triY - 22);
    ctx.lineTo(triX + 23, triY + 18);
    ctx.lineTo(triX - 23, triY + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#09090b';
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', triX, triY + 4);

    // Black Circle Right-Arrow Icon below triangle
    const arrX = colX + 32;
    const arrY = notY + 108;
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(arrX, arrY, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(arrX - 8, arrY);
    ctx.lineTo(arrX + 8, arrY);
    ctx.moveTo(arrX + 2, arrY - 6);
    ctx.lineTo(arrX + 8, arrY);
    ctx.lineTo(arrX + 2, arrY + 6);
    ctx.stroke();

    // Notice Text Lines
    ctx.save();
    ctx.fillStyle = '#09090b';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.scale(0.82, 1);
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Rates are indicative &', (colX + 68) / 0.82, notY + 56);
    ctx.fillText('subject to market fluctuations', (colX + 68) / 0.82, notY + 86);
    ctx.font = '800 23px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Please reconfirm before booking', (colX + 66) / 0.82, notY + 128);
    ctx.restore();

    ctx.restore();
  }

  /**
   * 10. Bottom Footer Bar:
   * - Left Black Pill with Red Ribbon Sweep ("CONTACT FOR ORDERS")
   * - 3 Red Circle Phone Icons + Bold Black Hotlines ("9009544333 | 7000923464 | 9713144333")
   */
  private static drawBottomFooter(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const footY = 916;
    const footH = 82;
    const midY = footY + footH / 2;

    // Red Ribbon Tail Behind Black Pill (x: 185..400, y: 916..998)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(185, footY + footH);
    ctx.lineTo(398, footY);
    ctx.quadraticCurveTo(366, footY + 38, 355, footY + 68);
    ctx.quadraticCurveTo(346, footY + footH, 310, footY + footH);
    ctx.closePath();
    ctx.fill();

    // Black Pill ("CONTACT FOR ORDERS")
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.moveTo(58, footY);
    ctx.lineTo(364, footY);
    ctx.quadraticCurveTo(334, footY + 34, 326, footY + 62);
    ctx.quadraticCurveTo(318, footY + footH - 4, 286, footY + footH - 4);
    ctx.lineTo(58, footY + footH - 4);
    ctx.arc(58, midY - 2, footH / 2 - 2, Math.PI / 2, -Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();

    // Left White Circle with Black Phone Icon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(56, midY - 2, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#050505';
    ctx.font = '700 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✆', 56, midY - 1);

    // Yellow Text: "CONTACT FOR" / "ORDERS"
    ctx.fillStyle = '#eab308';
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CONTACT FOR', 204, midY - 17);
    ctx.fillText('ORDERS', 194, midY + 17);

    // 3 Red Phone Icons + Bold Black Numbers
    const phones = [
      { iconX: 458, textX: 508, num: '9009544333', divX: 794 },
      { iconX: 854, textX: 906, num: '7000923464', divX: 1194 },
      { iconX: 1254, textX: 1304, num: '9713144333', divX: null },
    ];

    phones.forEach((p) => {
      // Red Circle Phone Icon
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(p.iconX, midY, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✆', p.iconX, midY + 1);

      // Bold Condensed Black Phone Number
      ctx.save();
      ctx.fillStyle = '#09090b';
      ctx.font = '900 54px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.scale(0.82, 1.05);
      ctx.fillText(p.num, p.textX / 0.82, (midY + 2) / 1.05);
      ctx.restore();

      // Vertical Black Bar "|"
      if (p.divX) {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(p.divX - 3, midY - 22, 6, 44);
      }
    });

    ctx.restore();
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
}
