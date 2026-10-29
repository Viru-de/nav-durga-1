import { MarketOpeningRates } from '../types';
import maaDurgaPortraitUrl from '../assets/images/maa_durga_lion_portrait_1790863911321.jpg';
import steelBuildingUrl from '../assets/images/steel_building_construction_1790863925525.jpg';
import steelPipesUrl from '../assets/images/steel_square_pipes_1790863937734.jpg';
import steelTmtBarsUrl from '../assets/images/steel_tmt_bars_1790863948524.jpg';

const CUSTOM_TEMPLATE_STORAGE_KEY = 'navdurga_custom_market_opening_bg_v1';

export class MarketOpeningRenderer {
  // Exact 3:2 high-resolution dimensions matching the Nav Durga Market Openings poster
  public static readonly TEMPLATE_WIDTH = 1536;
  public static readonly TEMPLATE_HEIGHT = 1024;

  private static assets: {
    durga: HTMLImageElement | null;
    building: HTMLImageElement | null;
    pipes: HTMLImageElement | null;
    tmt: HTMLImageElement | null;
    customBg: HTMLImageElement | null;
  } = {
    durga: null,
    building: null,
    pipes: null,
    tmt: null,
    customBg: null,
  };

  private static isLoaded = false;
  private static isLoading = false;
  private static loadListeners: Array<() => void> = [];

  /**
   * Optional custom full-poster background image (if user uploads the raw PNG directly)
   */
  public static setCustomTemplateDataUrl(dataUrl: string | null, onComplete?: () => void): void {
    try {
      if (typeof localStorage !== 'undefined') {
        if (dataUrl) {
          localStorage.setItem(CUSTOM_TEMPLATE_STORAGE_KEY, dataUrl);
        } else {
          localStorage.removeItem(CUSTOM_TEMPLATE_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('Could not save custom template to localStorage:', e);
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
      return typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(CUSTOM_TEMPLATE_STORAGE_KEY));
    } catch {
      return false;
    }
  }

  /**
   * Preload all photographic & devotional graphic assets
   */
  public static preloadImage(onLoad?: () => void): void {
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
        storedCustomBg = localStorage.getItem(CUSTOM_TEMPLATE_STORAGE_KEY);
      }
    } catch {
      storedCustomBg = null;
    }

    Promise.all([
      loadSingle(maaDurgaPortraitUrl),
      loadSingle(steelBuildingUrl),
      loadSingle(steelPipesUrl),
      loadSingle(steelTmtBarsUrl),
      storedCustomBg ? loadSingle(storedCustomBg) : Promise.resolve(null),
    ]).then(([durga, building, pipes, tmt, customBg]) => {
      this.assets.durga = durga;
      this.assets.building = building;
      this.assets.pipes = pipes;
      this.assets.tmt = tmt;
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
   * Renders the Nav Durga Market Opening graphic onto an HTML5 Canvas (1536 × 1024).
   * Matches the uploaded "NAV DURGA GROUP - MARKET OPENINGS" poster design,
   * dynamically binding the Medium Section and Light Section rates inside the golden rate box.
   */
  public static renderToCanvas(
    canvas: HTMLCanvasElement,
    rates: MarketOpeningRates,
    onReady?: () => void
  ): void {
    const width = this.TEMPLATE_WIDTH;
    const height = this.TEMPLATE_HEIGHT;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw current state immediately
    this.drawFullPoster(ctx, width, height, rates);

    if (this.isLoaded) {
      onReady?.();
    } else {
      this.preloadImage(() => {
        if (canvas.isConnected) {
          const freshCtx = canvas.getContext('2d');
          if (freshCtx) {
            this.drawFullPoster(freshCtx, width, height, rates);
          }
          onReady?.();
        }
      });
    }
  }

  private static drawFullPoster(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    rates: MarketOpeningRates
  ): void {
    ctx.save();

    // If the user uploaded a custom full background image, draw it first and overlay the live rates box
    if (this.assets.customBg) {
      ctx.drawImage(this.assets.customBg, 0, 0, width, height);
      this.drawGoldenBoxedRates(ctx, rates);
      this.drawBestRatesBluePill(ctx);
      ctx.restore();
      return;
    }

    // 1. Base Pearl-Ivory & Warm Golden Aura Background
    this.drawBackground(ctx, width, height);

    // 2. Top-Right: Maa Durga & Lion Artwork + "जय माता दी" Red Brush Badge
    this.drawMaaDurgaSection(ctx, width);

    // 3. Top-Left: Indian Tricolor Corner Wave & NAV DURGA GROUP Logo
    this.drawTopLeftBranding(ctx);

    // 4. Top-Center: Trishul, "Shubh NAV DURGA", Blessings & Floral Divider
    this.drawTopCenterBlessings(ctx);

    // 5. Right Column: Slanted Steel Building Photo, Pipes & TMT Photos, Payment Terms, Extra Charge & Notice
    this.drawRightColumnContent(ctx);

    // 6. Center-Left: Golden-Bordered Boxed Rates Area (DYNAMICALLY BOUND TO `rates`)
    this.drawGoldenBoxedRates(ctx, rates);

    // 7. Center-Left Header: 3D Red "MARKET OPENINGS" Banner, Megaphone & "BEST RATES (EX-WORKS)" Blue Pill
    this.drawMarketOpeningsBanner(ctx);
    this.drawBestRatesBluePill(ctx);

    // 8. Mid-Left: 4 Horizontal Trust Badges (Quality, Trusted Supply, On Time Delivery, Customer Satisfaction)
    this.drawFourTrustBadges(ctx);

    // 9. Lower-Left: City Skyline Silhouette, Indian Flag Waves & "Wishing you a very HAPPY AND PRODUCTIVE DAY!"
    this.drawSkylineAndWishBanner(ctx);

    // 10. Bottom Full-Width Dark Navy Footer with "CONTACT FOR ORDERS" & 3 WhatsApp Hotlines
    this.drawBottomFooter(ctx, width, height);

    ctx.restore();
  }

  /**
   * 1. Base Pearl-Ivory Background with Warm Golden Glow on Top-Right
   */
  private static drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    const baseGrad = ctx.createLinearGradient(0, 0, width, height);
    baseGrad.addColorStop(0, '#fffefb');
    baseGrad.addColorStop(0.55, '#fcf9f2');
    baseGrad.addColorStop(1, '#f7f2e7');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // Warm golden-saffron aura in the top-right quarter behind Maa Durga
    const auraGrad = ctx.createRadialGradient(1140, 150, 30, 1140, 150, 480);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
    auraGrad.addColorStop(0.45, 'rgba(245, 158, 11, 0.32)');
    auraGrad.addColorStop(0.75, 'rgba(253, 224, 71, 0.14)');
    auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(650, 0, width - 650, 460);

    ctx.restore();
  }

  /**
   * 2. Top-Right: Maa Durga & Lion Portrait + "जय माता दी" Brush Badge
   */
  private static drawMaaDurgaSection(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.save();

    if (this.assets.durga) {
      // Create an offscreen canvas to feather the edges of the Maa Durga & Lion portrait
      const offW = 680;
      const offH = 380;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = offW;
      offCanvas.height = offH;
      const offCtx = offCanvas.getContext('2d');

      if (offCtx) {
        offCtx.drawImage(this.assets.durga, 0, 0, offW, offH);

        // Soft radial/linear alpha mask so it blends seamlessly into the poster background
        offCtx.globalCompositeOperation = 'destination-in';
        const maskGrad = offCtx.createRadialGradient(
          offW * 0.48,
          offH * 0.44,
          offH * 0.24,
          offW * 0.48,
          offH * 0.46,
          offW * 0.52
        );
        maskGrad.addColorStop(0, 'rgba(0,0,0,1)');
        maskGrad.addColorStop(0.68, 'rgba(0,0,0,0.94)');
        maskGrad.addColorStop(0.88, 'rgba(0,0,0,0.45)');
        maskGrad.addColorStop(1, 'rgba(0,0,0,0)');
        offCtx.fillStyle = maskGrad;
        offCtx.fillRect(0, 0, offW, offH);

        ctx.drawImage(offCanvas, 790, -8, offW, offH);
      }
    } else {
      // Vector devotional fallback while image asset loads
      const durgaX = 1080;
      const durgaY = 145;
      const halo = ctx.createRadialGradient(durgaX, durgaY, 20, durgaX, durgaY, 210);
      halo.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
      halo.addColorStop(0.6, 'rgba(245, 158, 11, 0.4)');
      halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(durgaX, durgaY, 210, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top-Right Red Brush-Stroke Splash Badge: "जय माता दी"
    ctx.save();
    ctx.translate(width - 112, 136);
    ctx.rotate(-0.22);

    // Brush-stroke jagged artistic polygon
    const brushGrad = ctx.createLinearGradient(-95, -75, 95, 75);
    brushGrad.addColorStop(0, '#ef4444');
    brushGrad.addColorStop(0.5, '#dc2626');
    brushGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = brushGrad;

    ctx.shadowColor = 'rgba(127, 29, 29, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    const pts = [
      [-78, -42], [-52, -58], [-15, -66], [35, -68], [82, -58],
      [96, -36], [84, -14], [94, 8], [78, 32], [88, 52],
      [54, 68], [10, 74], [-38, 70], [-74, 56], [-88, 32],
      [-76, 8], [-90, -16],
    ];
    pts.forEach(([px, py], idx) => {
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 34px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
    ctx.fillText('जय', 0, -34);
    ctx.fillText('माता', 0, 4);
    ctx.fillText('दी', 2, 42);
    ctx.restore();

    ctx.restore();
  }

  /**
   * 3. Top-Left: Indian Tricolor Wave & NAV DURGA GROUP Logo
   */
  private static drawTopLeftBranding(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Top-left corner Indian Flag Tricolor Ribbon Sweep
    ctx.save();
    // Green outer corner wedge
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(145, 0);
    ctx.quadraticCurveTo(60, 48, 0, 125);
    ctx.closePath();
    ctx.fill();

    // White middle ribbon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(145, 0);
    ctx.lineTo(185, 0);
    ctx.quadraticCurveTo(82, 66, 0, 155);
    ctx.lineTo(0, 125);
    ctx.quadraticCurveTo(60, 48, 145, 0);
    ctx.closePath();
    ctx.fill();

    // Saffron inner ribbon
    const safGrad = ctx.createLinearGradient(0, 160, 210, 0);
    safGrad.addColorStop(0, '#ea580c');
    safGrad.addColorStop(0.5, '#f97316');
    safGrad.addColorStop(1, '#fb923c');
    ctx.fillStyle = safGrad;
    ctx.beginPath();
    ctx.moveTo(185, 0);
    ctx.lineTo(228, 0);
    ctx.quadraticCurveTo(105, 80, 0, 188);
    ctx.lineTo(0, 155);
    ctx.quadraticCurveTo(82, 66, 185, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Double Diamond Peak Icon above "V" of NAV (x ≈ 262, y ≈ 18..115)
    ctx.save();
    const peakX = 264;
    const peakY = 50;

    // Top Orange Chevron/Diamond
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY - 34);
    ctx.lineTo(peakX + 34, peakY);
    ctx.lineTo(peakX + 20, peakY + 14);
    ctx.lineTo(peakX, peakY - 6);
    ctx.lineTo(peakX - 20, peakY + 14);
    ctx.lineTo(peakX - 34, peakY);
    ctx.closePath();
    ctx.fill();

    // Lower Black Diamond with Cutout
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY + 6);
    ctx.lineTo(peakX + 30, peakY + 36);
    ctx.lineTo(peakX, peakY + 66);
    ctx.lineTo(peakX - 30, peakY + 36);
    ctx.closePath();
    ctx.fill();

    // Inner white diamond + black core dot
    ctx.fillStyle = '#fdfbf7';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY + 21);
    ctx.lineTo(peakX + 15, peakY + 36);
    ctx.lineTo(peakX, peakY + 51);
    ctx.lineTo(peakX - 15, peakY + 36);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY + 28);
    ctx.lineTo(peakX + 8, peakY + 36);
    ctx.lineTo(peakX, peakY + 44);
    ctx.lineTo(peakX - 8, peakY + 36);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // "NAV" in wide geometric black lettering
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 58px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('N A V', 72, 118);

    // "DURGA" in wide blocky industrial green font
    ctx.save();
    ctx.fillStyle = '#15803d';
    ctx.font = '900 62px "Plus Jakarta Sans", sans-serif';
    ctx.scale(1.12, 0.92);
    ctx.fillText('DURGA', 64, 190);
    ctx.restore();

    // "— GROUP —"
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('G R O U P', 218, 214);

    // Horizontal lines flanking GROUP
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(68, 202);
    ctx.lineTo(114, 202);
    ctx.moveTo(322, 202);
    ctx.lineTo(368, 202);
    ctx.stroke();

    // "🇮🇳 We build the nation 🇮🇳"
    this.drawWavingMiniFlag(ctx, 54, 232, 48, 30);
    ctx.fillStyle = '#dc2626';
    ctx.font = '800 23px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('We build the nation', 218, 255);
    this.drawWavingMiniFlag(ctx, 334, 232, 48, 30);

    ctx.restore();
  }

  private static drawWavingMiniFlag(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    ctx.save();
    const stripeH = h / 3;

    const drawBand = (by: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, by);
      ctx.bezierCurveTo(x + w * 0.33, by - 3, x + w * 0.66, by + 3, x + w, by);
      ctx.lineTo(x + w, by + stripeH);
      ctx.bezierCurveTo(
        x + w * 0.66,
        by + stripeH + 3,
        x + w * 0.33,
        by + stripeH - 3,
        x,
        by + stripeH
      );
      ctx.closePath();
      ctx.fill();
    };

    drawBand(y, '#f97316');
    drawBand(y + stripeH, '#ffffff');
    drawBand(y + stripeH * 2, '#15803d');

    // Ashoka Chakra
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, stripeH * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 4. Top-Center: Ornate Trishul, "Shubh NAV DURGA" & Blessings
   */
  private static drawTopCenterBlessings(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const centerX = 654;

    // Ornate Crimson/Copper Trishul Icon at top center (y: 12..68)
    ctx.save();
    ctx.translate(centerX, 42);
    ctx.strokeStyle = '#b45309';
    ctx.fillStyle = '#b45309';
    ctx.lineWidth = 3.5;

    // Center spear
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(-5, -14);
    ctx.lineTo(0, -18);
    ctx.lineTo(5, -14);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 26);
    ctx.stroke();

    // Left & Right prongs
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-22, 4, -22, -16, -12, -24);
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(22, 4, 22, -16, 12, -24);
    ctx.stroke();

    // Damaru / Horizontal crossbars
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.lineTo(10, 12);
    ctx.moveTo(-7, 17);
    ctx.lineTo(7, 17);
    ctx.stroke();
    ctx.restore();

    // "—> Shubh <—"
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'italic 700 36px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Shubh', centerX, 92);

    // Ornate inward arrows flanking "Shubh"
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Left arrow
    ctx.moveTo(centerX - 135, 92);
    ctx.lineTo(centerX - 66, 92);
    ctx.moveTo(centerX - 76, 86);
    ctx.lineTo(centerX - 64, 92);
    ctx.lineTo(centerX - 76, 98);
    // Right arrow
    ctx.moveTo(centerX + 135, 92);
    ctx.lineTo(centerX + 66, 92);
    ctx.moveTo(centerX + 76, 86);
    ctx.lineTo(centerX + 64, 92);
    ctx.lineTo(centerX + 76, 98);
    ctx.stroke();

    // "NAV DURGA" in large crimson-maroon serif
    ctx.save();
    ctx.font = '900 72px Georgia, "Times New Roman", serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillText('NAV DURGA', centerX + 2, 158);

    const navGrad = ctx.createLinearGradient(centerX, 110, centerX, 180);
    navGrad.addColorStop(0, '#991b1b');
    navGrad.addColorStop(0.5, '#7f1d1d');
    navGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = navGrad;
    ctx.fillText('NAV DURGA', centerX, 156);
    ctx.restore();

    // Blessings two-line subtitle
    ctx.fillStyle = '#0f172a';
    ctx.font = '500 23px Georgia, "Times New Roman", serif';
    ctx.fillText('May Maa Durga bless you with', centerX, 203);
    ctx.fillText('prosperity, success and new beginnings.', centerX, 233);

    // Decorative crimson-gold floral divider at y = 264
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 160, 263);
    ctx.lineTo(centerX - 28, 263);
    ctx.moveTo(centerX + 28, 263);
    ctx.lineTo(centerX + 160, 263);
    ctx.stroke();

    ctx.fillStyle = '#b91c1c';
    ctx.font = '24px serif';
    ctx.fillText('❈', centerX, 264);

    ctx.restore();
  }

  /**
   * 6. Center-Left: The Golden-Bordered Boxed Rates Area (ONLY EDITABLE DATA REGION)
   * Coordinates match the uploaded image: x=38, y=454, w=1034, h=244
   */
  private static drawGoldenBoxedRates(
    ctx: CanvasRenderingContext2D,
    rates: MarketOpeningRates
  ): void {
    ctx.save();

    const boxX = 38;
    const boxY = 454;
    const boxW = 1034;
    const boxH = 244;
    const radius = 24;

    // Soft warm drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(180, 83, 9, 0.18)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;

    const boxGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
    boxGrad.addColorStop(0, '#fffefb');
    boxGrad.addColorStop(0.5, '#ffffff');
    boxGrad.addColorStop(1, '#fdfaf3');
    ctx.fillStyle = boxGrad;
    this.roundRect(ctx, boxX, boxY, boxW, boxH, radius);
    ctx.fill();
    ctx.restore();

    // Metallic Gold Border (3.5px)
    const goldBorder = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
    goldBorder.addColorStop(0, '#ca8a04');
    goldBorder.addColorStop(0.35, '#eab308');
    goldBorder.addColorStop(0.7, '#ca8a04');
    goldBorder.addColorStop(1, '#a16207');
    ctx.strokeStyle = goldBorder;
    ctx.lineWidth = 3.5;
    this.roundRect(ctx, boxX, boxY, boxW, boxH, radius);
    ctx.stroke();

    // =========================================================================
    // ROW 1: MEDIUM SECTION (y = 526)
    // =========================================================================
    const row1Y = 526;
    this.draw3DSteelRoundIcon(ctx, 122, row1Y, 48);

    const mediumName = (rates.mediumSectionName || 'MEDIUM SECTION').toUpperCase();
    ctx.fillStyle = '#0c2340';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let font1 = 46;
    ctx.font = `900 ${font1}px "Plus Jakarta Sans", sans-serif`;
    while (ctx.measureText(mediumName).width > 435 && font1 > 28) {
      font1 -= 2;
      ctx.font = `900 ${font1}px "Plus Jakarta Sans", sans-serif`;
    }
    ctx.fillText(mediumName, 214, row1Y + 2);

    // Vertical separator bar "|" at x = 677
    ctx.strokeStyle = '#0c2340';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(677, row1Y - 32);
    ctx.lineTo(677, row1Y + 32);
    ctx.stroke();

    // Dynamic Medium Section Rate: ₹49711/MT
    this.drawSectionPriceValue(ctx, rates.mediumSectionRate, 704, row1Y, 1052);

    // =========================================================================
    // HORIZONTAL GOLD DIVIDER LINE (y = 583)
    // =========================================================================
    ctx.strokeStyle = 'rgba(217, 167, 42, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(184, 583);
    ctx.lineTo(1042, 583);
    ctx.stroke();

    // =========================================================================
    // ROW 2: LIGHT SECTION (y = 640)
    // =========================================================================
    const row2Y = 640;
    this.draw3DSteelFlatIcon(ctx, 122, row2Y, 48);

    const lightName = (rates.lightSectionName || 'LIGHT SECTION').toUpperCase();
    ctx.fillStyle = '#0c2340';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let font2 = 46;
    ctx.font = `900 ${font2}px "Plus Jakarta Sans", sans-serif`;
    while (ctx.measureText(lightName).width > 435 && font2 > 28) {
      font2 -= 2;
      ctx.font = `900 ${font2}px "Plus Jakarta Sans", sans-serif`;
    }
    ctx.fillText(lightName, 214, row2Y + 2);

    // Vertical separator bar "|" at x = 677
    ctx.strokeStyle = '#0c2340';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(677, row2Y - 32);
    ctx.lineTo(677, row2Y + 32);
    ctx.stroke();

    // Dynamic Light Section Rate: ₹42211/MT
    this.drawSectionPriceValue(ctx, rates.lightSectionRate, 704, row2Y, 1052);

    ctx.restore();
  }

  /**
   * Renders "₹49711/MT" in bold emerald-forest green matching the uploaded poster
   */
  private static drawSectionPriceValue(
    ctx: CanvasRenderingContext2D,
    rateValue: number,
    startX: number,
    centerY: number,
    maxRightX: number
  ): void {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    const rawNum = String(Math.round(Number(rateValue) || 0));
    const priceText = `₹${rawNum}`;
    const unitText = '/MT';

    let mainFontSize = 72;
    let unitFontSize = 40;

    const measureTotal = (mSize: number, uSize: number) => {
      ctx.font = `900 ${mSize}px "Plus Jakarta Sans", sans-serif`;
      const pw = ctx.measureText(priceText).width;
      ctx.font = `900 ${uSize}px "Plus Jakarta Sans", sans-serif`;
      const uw = ctx.measureText(unitText).width;
      return { pw, uw, total: pw + 4 + uw };
    };

    let dims = measureTotal(mainFontSize, unitFontSize);
    const maxAllowedWidth = maxRightX - startX;

    while (dims.total > maxAllowedWidth && mainFontSize > 44) {
      mainFontSize -= 2;
      unitFontSize = Math.round(mainFontSize * 0.55);
      dims = measureTotal(mainFontSize, unitFontSize);
    }

    const baselineY = centerY + mainFontSize * 0.36;

    // Draw ₹49711
    ctx.fillStyle = '#0f7a28';
    ctx.font = `900 ${mainFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(priceText, startX, baselineY);

    // Draw /MT right next to it
    ctx.font = `900 ${unitFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(unitText, startX + dims.pw + 4, baselineY);

    ctx.restore();
  }

  /**
   * 3D Blue Circular Badge with Isometric Bundle of Shiny Steel Round Bars
   */
  private static draw3DSteelRoundIcon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number
  ): void {
    ctx.save();

    // Deep Navy-Blue Metallic Circle
    const circleGrad = ctx.createRadialGradient(cx - 12, cy - 14, 6, cx, cy, r);
    circleGrad.addColorStop(0, '#1e40af');
    circleGrad.addColorStop(0.65, '#0f294e');
    circleGrad.addColorStop(1, '#091931');
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw isometric 3D steel cylinders (pyramid stack of 10 round bars)
    const drawCylinder = (x: number, y: number, cr: number) => {
      const dx = 22;
      const dy = -13;

      // Cylinder body
      const bodyGrad = ctx.createLinearGradient(x, y - cr, x, y + cr);
      bodyGrad.addColorStop(0, '#f8fafc');
      bodyGrad.addColorStop(0.45, '#94a3b8');
      bodyGrad.addColorStop(0.8, '#475569');
      bodyGrad.addColorStop(1, '#cbd5e1');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(x - cr * 0.5, y - cr * 0.86);
      ctx.lineTo(x + dx - cr * 0.5, y + dy - cr * 0.86);
      ctx.lineTo(x + dx + cr * 0.5, y + dy + cr * 0.86);
      ctx.lineTo(x + cr * 0.5, y + cr * 0.86);
      ctx.closePath();
      ctx.fill();

      // Front circular face
      const faceGrad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, cr);
      faceGrad.addColorStop(0, '#ffffff');
      faceGrad.addColorStop(0.6, '#cbd5e1');
      faceGrad.addColorStop(1, '#475569');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.arc(x, y, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };

    const cr = 6.8;
    const baseX = cx - 22;
    const baseY = cy + 16;
    // Row of 4 at bottom
    for (let i = 0; i < 4; i++) drawCylinder(baseX + i * 11, baseY + i * 2, cr);
    // Row of 3
    for (let i = 0; i < 3; i++) drawCylinder(baseX + 5 + i * 11, baseY - 10 + i * 2, cr);
    // Row of 2
    for (let i = 0; i < 2; i++) drawCylinder(baseX + 10 + i * 11, baseY - 20 + i * 2, cr);
    // Top 1
    drawCylinder(baseX + 15, baseY - 30, cr);

    ctx.restore();
  }

  /**
   * 3D Blue Circular Badge with Isometric Stack of Flat Steel Plates/Sheets
   */
  private static draw3DSteelFlatIcon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number
  ): void {
    ctx.save();

    const circleGrad = ctx.createRadialGradient(cx - 12, cy - 14, 6, cx, cy, r);
    circleGrad.addColorStop(0, '#1e40af');
    circleGrad.addColorStop(0.65, '#0f294e');
    circleGrad.addColorStop(1, '#091931');
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw 3 stacked isometric metallic flat steel sheets
    const layers = [cy + 14, cy + 4, cy - 6];
    layers.forEach((ly) => {
      // Top surface
      const plateGrad = ctx.createLinearGradient(cx - 32, ly - 14, cx + 32, ly + 14);
      plateGrad.addColorStop(0, '#f8fafc');
      plateGrad.addColorStop(0.5, '#cbd5e1');
      plateGrad.addColorStop(1, '#94a3b8');

      ctx.fillStyle = plateGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 32, ly);
      ctx.lineTo(cx - 4, ly - 15);
      ctx.lineTo(cx + 32, ly - 2);
      ctx.lineTo(cx + 4, ly + 14);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Thickness edge
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(cx - 32, ly);
      ctx.lineTo(cx + 4, ly + 14);
      ctx.lineTo(cx + 32, ly - 2);
      ctx.lineTo(cx + 32, ly + 3);
      ctx.lineTo(cx + 4, ly + 19);
      ctx.lineTo(cx - 32, ly + 5);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * 7A. Center-Left Header: 3D Red "MARKET OPENINGS" Ribbon & Megaphone
   */
  private static drawMarketOpeningsBanner(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Slanted Glossy Red 3D Banner (x: 150..1072, y: 294..414)
    ctx.save();
    ctx.shadowColor = 'rgba(127, 29, 29, 0.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    const ribGrad = ctx.createLinearGradient(150, 294, 1072, 414);
    ribGrad.addColorStop(0, '#991b1b');
    ribGrad.addColorStop(0.25, '#dc2626');
    ribGrad.addColorStop(0.6, '#b91c1c');
    ribGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = ribGrad;

    ctx.beginPath();
    ctx.moveTo(160, 304);
    ctx.lineTo(1072, 294);
    ctx.lineTo(1054, 410);
    ctx.lineTo(150, 414);
    ctx.closePath();
    ctx.fill();

    // Subtle golden top/bottom sheen on banner
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Bold 3D Extruded Text: "MARKET" (White) + "OPENINGS" (Yellow-Gold)
    ctx.save();
    const textY = 362;
    ctx.font = '900 72px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // 3D Extrusion Layers for "MARKET"
    for (let d = 7; d >= 1; d--) {
      ctx.fillStyle = '#450a0a';
      ctx.fillText('MARKET', 244 + d * 0.7, textY + d);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MARKET', 244, textY);

    // 3D Extrusion Layers for "OPENINGS"
    const openingsX = 622;
    for (let d = 7; d >= 1; d--) {
      ctx.fillStyle = '#450a0a';
      ctx.fillText('OPENINGS', openingsX + d * 0.7, textY + d);
    }
    const openGrad = ctx.createLinearGradient(openingsX, textY - 35, openingsX, textY + 35);
    openGrad.addColorStop(0, '#fef08a');
    openGrad.addColorStop(0.5, '#facc15');
    openGrad.addColorStop(1, '#eab308');
    ctx.fillStyle = openGrad;
    ctx.fillText('OPENINGS', openingsX, textY);
    ctx.restore();

    // 3D Red & White Megaphone on Left (cx ≈ 118, cy ≈ 364)
    ctx.save();
    ctx.translate(118, 364);
    ctx.rotate(-0.24);

    // Handle
    ctx.fillStyle = '#b91c1c';
    this.roundRect(ctx, -46, 18, 22, 46, 6);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rear cap
    ctx.fillStyle = '#991b1b';
    this.roundRect(ctx, -64, -16, 22, 32, 8);
    ctx.fill();

    // Cone Body (White back + Red front)
    const coneGrad = ctx.createLinearGradient(-46, -45, 42, 45);
    coneGrad.addColorStop(0, '#ffffff');
    coneGrad.addColorStop(0.45, '#f1f5f9');
    coneGrad.addColorStop(0.46, '#ef4444');
    coneGrad.addColorStop(1, '#b91c1c');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(-46, -15);
    ctx.lineTo(44, -54);
    ctx.lineTo(44, 54);
    ctx.lineTo(-46, 15);
    ctx.closePath();
    ctx.fill();

    // Front White/Red Oval Mouth
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(44, 0, 18, 54, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Inner Cone Shadow
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(40, 0, 9, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sound Wave Rays
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    [[-26, -38], [0, 0], [26, 38]].forEach(([sy, ey]) => {
      ctx.beginPath();
      ctx.moveTo(70, sy);
      ctx.lineTo(96, ey);
      ctx.stroke();
    });
    ctx.restore();

    ctx.restore();
  }

  /**
   * 7B. Deep Royal Blue Pill: "✳ BEST RATES (EX-WORKS) ✳"
   * Overlaps the top border of the golden rate box just like the reference image
   */
  private static drawBestRatesBluePill(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const pillX = 270;
    const pillY = 402;
    const pillW = 688;
    const pillH = 68;

    ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
    pillGrad.addColorStop(0, '#1e40af');
    pillGrad.addColorStop(0.5, '#0f2952');
    pillGrad.addColorStop(1, '#091936');
    ctx.fillStyle = pillGrad;
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 34);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    this.roundRect(ctx, pillX, pillY, pillW, pillH, 34);
    ctx.stroke();

    // Left & Right 8-Pointed Gold Stars
    this.drawEightPointStar(ctx, pillX + 44, pillY + pillH / 2, 18, '#facc15');
    this.drawEightPointStar(ctx, pillX + pillW - 44, pillY + pillH / 2, 18, '#facc15');

    // Bold White Text: "BEST RATES (EX-WORKS)"
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 39px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BEST RATES (EX-WORKS)', pillX + pillW / 2, pillY + pillH / 2 + 2);

    ctx.restore();
  }

  private static drawEightPointStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    color: string
  ): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
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
   * 8. Mid-Left: 4 Horizontal Trust Badges with Dividers
   */
  private static drawFourTrustBadges(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const centerY = 750;
    const badges = [
      {
        x: 68,
        pillW: 216,
        circleColor: '#15803d',
        title1: 'QUALITY',
        title2: 'MATERIAL',
        type: 'shield' as const,
      },
      {
        x: 325,
        pillW: 208,
        circleColor: '#0284c7',
        title1: 'TRUSTED',
        title2: 'SUPPLY',
        type: 'handshake' as const,
      },
      {
        x: 575,
        pillW: 212,
        circleColor: '#15803d',
        title1: 'ON TIME',
        title2: 'DELIVERY',
        type: 'truck' as const,
      },
      {
        x: 828,
        pillW: 228,
        circleColor: '#581c87',
        title1: 'CUSTOMER',
        title2: 'SATISFACTION',
        type: 'customer' as const,
      },
    ];

    badges.forEach((b, idx) => {
      // Dark Navy Rounded Pill on Right
      const pillX = b.x + 36;
      const pillY = centerY - 32;
      const pillH = 64;
      const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
      pillGrad.addColorStop(0, '#1e3a8a');
      pillGrad.addColorStop(1, '#0c2340');
      ctx.fillStyle = pillGrad;
      this.roundRect(ctx, pillX, pillY, b.pillW - 36, pillH, 24);
      ctx.fill();

      // Left Colored Circle Icon
      const cx = b.x + 40;
      ctx.fillStyle = b.circleColor;
      ctx.beginPath();
      ctx.arc(cx, centerY, 39, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Vector Icon Inside Circle
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2.8;
      if (b.type === 'shield') {
        ctx.beginPath();
        ctx.moveTo(cx, centerY - 20);
        ctx.lineTo(cx + 16, centerY - 13);
        ctx.lineTo(cx + 16, centerY + 2);
        ctx.quadraticCurveTo(cx + 16, centerY + 16, cx, centerY + 22);
        ctx.quadraticCurveTo(cx - 16, centerY + 16, cx - 16, centerY + 2);
        ctx.lineTo(cx - 16, centerY - 13);
        ctx.closePath();
        ctx.stroke();
        // Checkmark
        ctx.beginPath();
        ctx.moveTo(cx - 7, centerY + 1);
        ctx.lineTo(cx - 2, centerY + 7);
        ctx.lineTo(cx + 8, centerY - 5);
        ctx.stroke();
      } else if (b.type === 'handshake') {
        ctx.beginPath();
        ctx.roundRect(cx - 16, centerY - 8, 32, 16, 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 6, centerY);
        ctx.lineTo(cx + 6, centerY);
        ctx.stroke();
      } else if (b.type === 'truck') {
        ctx.strokeRect(cx - 18, centerY - 12, 22, 16);
        ctx.strokeRect(cx + 4, centerY - 5, 12, 9);
        ctx.beginPath();
        ctx.arc(cx - 10, centerY + 9, 4, 0, Math.PI * 2);
        ctx.arc(cx + 10, centerY + 9, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'customer') {
        ctx.beginPath();
        ctx.arc(cx, centerY - 6, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, centerY + 18, 14, Math.PI, 0);
        ctx.fill();
      }
      ctx.restore();

      // Pill Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 19px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.title1, b.x + 90, centerY - 11);
      ctx.fillText(b.title2, b.x + 90, centerY + 12);

      // Divider "|" between badges
      if (idx < badges.length - 1) {
        const divX = b.x + b.pillW + 20;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(divX, centerY - 26);
        ctx.lineTo(divX, centerY + 26);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  /**
   * 9. Lower-Left: City Skyline Silhouette, Indian Tricolor Waves & Wish Banner
   */
  private static drawSkylineAndWishBanner(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // City Skyline & Cranes Silhouette (x: 130..940, base y = 855)
    ctx.fillStyle = '#1e3a8a';
    const baseSkyY = 852;
    const buildings = [
      [140, 22, 48], [168, 18, 32], [192, 26, 56], [224, 20, 36],
      [252, 28, 42], [290, 24, 30], [325, 20, 46], [360, 28, 38],
      [710, 26, 40], [744, 22, 54], [774, 30, 35], [812, 24, 62],
      [845, 22, 38], [875, 28, 48],
    ];
    buildings.forEach(([bx, bw, bh]) => {
      ctx.fillRect(bx, baseSkyY - bh, bw, bh);
    });

    // Construction Cranes
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.5;
    [130, 275, 760, 895].forEach((craneX) => {
      ctx.beginPath();
      ctx.moveTo(craneX, baseSkyY);
      ctx.lineTo(craneX, baseSkyY - 58);
      ctx.moveTo(craneX - 24, baseSkyY - 52);
      ctx.lineTo(craneX + 36, baseSkyY - 52);
      ctx.stroke();
    });

    // Curved Dark Blue Hill / Wave Banner (x: 0..1080, y: 792..904)
    const hillGrad = ctx.createLinearGradient(0, 792, 0, 904);
    hillGrad.addColorStop(0, '#0284c7');
    hillGrad.addColorStop(0.35, '#0f2952');
    hillGrad.addColorStop(1, '#06152d');
    ctx.fillStyle = hillGrad;

    ctx.beginPath();
    ctx.moveTo(0, 904);
    ctx.lineTo(0, 845);
    ctx.quadraticCurveTo(540, 770, 1080, 845);
    ctx.lineTo(1080, 904);
    ctx.closePath();
    ctx.fill();

    // Left Indian Flag Tricolor Wave Sweep (x: 0..255, y: 715..904)
    ctx.save();
    // Saffron wave
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(0, 710);
    ctx.quadraticCurveTo(75, 815, 230, 882);
    ctx.lineTo(0, 904);
    ctx.closePath();
    ctx.fill();

    // White wave
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, 755);
    ctx.quadraticCurveTo(75, 838, 240, 892);
    ctx.lineTo(0, 904);
    ctx.closePath();
    ctx.fill();

    // Green wave
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(0, 795);
    ctx.quadraticCurveTo(80, 860, 250, 904);
    ctx.lineTo(0, 904);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Right Indian Flag Tricolor Wave Sweep (x: 840..1080, y: 790..904)
    ctx.save();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(1080, 785);
    ctx.quadraticCurveTo(990, 855, 855, 904);
    ctx.lineTo(1080, 904);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(1080, 815);
    ctx.quadraticCurveTo(1000, 868, 885, 904);
    ctx.lineTo(1080, 904);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(1080, 842);
    ctx.quadraticCurveTo(1010, 880, 915, 904);
    ctx.lineTo(1080, 904);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // "Wishing you a very" in white script
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 700 35px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Wishing you a very', 565, 818);

    // "= HAPPY AND PRODUCTIVE DAY! =" in bold yellow
    ctx.fillStyle = '#facc15';
    ctx.font = '900 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('HAPPY AND PRODUCTIVE DAY!', 565, 868);

    // Double gold bars on left & right of HAPPY AND PRODUCTIVE DAY!
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(242, 863);
    ctx.lineTo(278, 863);
    ctx.moveTo(234, 871);
    ctx.lineTo(278, 871);

    ctx.moveTo(852, 863);
    ctx.lineTo(888, 863);
    ctx.moveTo(852, 871);
    ctx.lineTo(896, 871);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 5. Right Column: Slanted Building Photo, Pipes & TMT Photos, Payment Terms, Extra Charge & Notice
   */
  private static drawRightColumnContent(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // -------------------------------------------------------------------------
    // A. Top Slanted Photo Card: Steel Building Construction (x: 1105..1536, y: 272..514)
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(1135, 345);
    ctx.lineTo(1312, 272);
    ctx.lineTo(1536, 362);
    ctx.lineTo(1536, 514);
    ctx.lineTo(1108, 514);
    ctx.closePath();
    ctx.clip();

    if (this.assets.building) {
      ctx.drawImage(this.assets.building, 1105, 270, 435, 246);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1105, 270, 435, 246);
    }
    ctx.restore();

    // White/Blue Angled Frame Lines on Building Photo
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1108, 514);
    ctx.lineTo(1135, 345);
    ctx.lineTo(1312, 272);
    ctx.lineTo(1536, 362);
    ctx.stroke();

    // Dark Blue Trapezoidal Banner at Bottom of Building: "STRONGER STEEL / FOR A BRIGHTER TOMORROW"
    ctx.save();
    const trapGrad = ctx.createLinearGradient(1108, 452, 1490, 514);
    trapGrad.addColorStop(0, '#0c2340');
    trapGrad.addColorStop(0.5, '#1e3a8a');
    trapGrad.addColorStop(1, '#0c2340');
    ctx.fillStyle = trapGrad;
    ctx.beginPath();
    ctx.moveTo(1118, 452);
    ctx.lineTo(1474, 452);
    ctx.lineTo(1492, 514);
    ctx.lineTo(1104, 514);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STRONGER STEEL', 1300, 471);

    ctx.fillStyle = '#facc15';
    ctx.font = '900 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('FOR A BRIGHTER TOMORROW', 1300, 496);
    ctx.restore();

    // -------------------------------------------------------------------------
    // B. Middle Two Product Photos: Square Steel Pipes & TMT Bars (y: 522..634)
    // -------------------------------------------------------------------------
    // Left Photo: Square Steel Pipes (x: 1084..1294, y: 522..634)
    ctx.save();
    this.roundRect(ctx, 1084, 522, 210, 112, 12);
    ctx.clip();
    if (this.assets.pipes) {
      ctx.drawImage(this.assets.pipes, 1084, 522, 210, 112);
    } else {
      ctx.fillStyle = '#334155';
      ctx.fillRect(1084, 522, 210, 112);
    }
    ctx.restore();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, 1084, 522, 210, 112, 12);
    ctx.stroke();

    // Right Photo: TMT Steel Bars (x: 1302..1516, y: 522..634)
    ctx.save();
    this.roundRect(ctx, 1302, 522, 214, 112, 12);
    ctx.clip();
    if (this.assets.tmt) {
      ctx.drawImage(this.assets.tmt, 1302, 522, 214, 112);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1302, 522, 214, 112);
    }
    ctx.restore();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, 1302, 522, 214, 112, 12);
    ctx.stroke();

    // -------------------------------------------------------------------------
    // C. PAYMENT TERMS Card (x: 1098..1504, y: 646..706)
    // -------------------------------------------------------------------------
    const cardX = 1098;
    const cardW = 406;
    const payY = 646;
    const payH = 60;

    // White rounded base
    ctx.fillStyle = '#f8fafc';
    this.roundRect(ctx, cardX, payY, cardW, payH, 14);
    ctx.fill();

    // Dark blue top header band + left icon block
    ctx.fillStyle = '#0f3b6e';
    this.roundRect(ctx, cardX, payY, cardW, 28, 12);
    ctx.fill();
    this.roundRect(ctx, cardX, payY, 68, payH, 14);
    ctx.fill();

    ctx.strokeStyle = '#0f3b6e';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, cardX, payY, cardW, payH, 14);
    ctx.stroke();

    // Invoice/Checklist Icon on Left
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cardX + 20, payY + 14, 24, 32);
    ctx.beginPath();
    ctx.moveTo(cardX + 25, payY + 22);
    ctx.lineTo(cardX + 39, payY + 22);
    ctx.moveTo(cardX + 25, payY + 30);
    ctx.lineTo(cardX + 39, payY + 30);
    ctx.moveTo(cardX + 25, payY + 38);
    ctx.lineTo(cardX + 33, payY + 38);
    ctx.stroke();

    // Header & Body Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 19px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAYMENT TERMS', cardX + 82, payY + 15);

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Advance Payment Basis', cardX + 88, payY + 44);

    // -------------------------------------------------------------------------
    // D. Red Pill Box: "₹ 300/MT extra — for next - day payment" (y: 714..776)
    // -------------------------------------------------------------------------
    const redY = 714;
    const redH = 62;
    const redGrad = ctx.createLinearGradient(cardX, redY, cardX + cardW, redY);
    redGrad.addColorStop(0, '#dc2626');
    redGrad.addColorStop(1, '#b91c1c');
    ctx.fillStyle = redGrad;
    this.roundRect(ctx, cardX, redY, cardW, redH, 14);
    ctx.fill();

    // Left White Circle with ₹ symbol
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cardX + 36, redY + redH / 2, 21, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₹', cardX + 36, redY + redH / 2 + 1);

    // Right Two-Line Text
    ctx.textAlign = 'left';
    ctx.font = '900 25px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('₹  300/MT extra', cardX + 78, redY + 21);

    ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('— for next - day payment', cardX + 78, redY + 46);

    // -------------------------------------------------------------------------
    // E. Yellow Caution Box: "IMPORTANT NOTICE" (y: 784..890)
    // -------------------------------------------------------------------------
    const notY = 784;
    const notH = 106;

    // Cream Body
    ctx.fillStyle = '#fef9c3';
    this.roundRect(ctx, cardX, notY, cardW, notH, 14);
    ctx.fill();

    // Yellow Header Bar
    ctx.fillStyle = '#eab308';
    this.roundRect(ctx, cardX, notY, cardW, 34, 12);
    ctx.fill();

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    this.roundRect(ctx, cardX, notY, cardW, notH, 14);
    ctx.stroke();

    // Warning Triangle Icon on Left
    ctx.save();
    const triX = cardX + 34;
    const triY = notY + 24;
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(triX, triY - 20);
    ctx.lineTo(triX + 22, triY + 16);
    ctx.lineTo(triX - 22, triY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', triX, triY + 3);
    ctx.restore();

    // Header Title: "IMPORTANT NOTICE"
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 21px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('IMPORTANT NOTICE', cardX + 82, notY + 18);

    // Notice Bullets
    ctx.fillStyle = '#0f172a';
    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('•  Rates are indicative & subject to', cardX + 84, notY + 50);
    ctx.fillText('    market fluctuations.', cardX + 84, notY + 70);
    ctx.fillText('•  Please reconfirm before booking.', cardX + 84, notY + 92);

    ctx.restore();
  }

  /**
   * 10. Bottom Full-Width Dark Navy Footer Bar (y: 904..1024)
   */
  private static drawBottomFooter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.save();

    const footerY = 904;
    const footerH = height - footerY;

    // Deep Navy Footer Background
    const footGrad = ctx.createLinearGradient(0, footerY, 0, height);
    footGrad.addColorStop(0, '#071936');
    footGrad.addColorStop(1, '#040d1f');
    ctx.fillStyle = footGrad;
    ctx.fillRect(0, footerY, width, footerH);

    // Top subtle blue separator line
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, footerY);
    ctx.lineTo(width, footerY);
    ctx.stroke();

    const midY = footerY + footerH / 2;

    // Left Yellow Circle Phone Icon
    const phoneCx = 80;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(phoneCx, midY, 34, 0, Math.PI * 2);
    ctx.fill();

    // Handset vector inside yellow circle
    ctx.fillStyle = '#0f172a';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📞', phoneCx, midY + 1);

    // "CONTACT FOR" (white) / "ORDERS" (yellow)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CONTACT FOR', 128, midY - 16);

    ctx.fillStyle = '#facc15';
    ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ORDERS', 128, midY + 20);

    // Divider 1
    this.drawFooterDivider(ctx, 350, midY);

    // 3 WhatsApp Hotlines
    const hotlines = [
      { iconX: 448, textX: 494, number: '9009544333', divX: 786 },
      { iconX: 860, textX: 906, number: '7000923464', divX: 1172 },
      { iconX: 1236, textX: 1282, number: '9713144333', divX: null },
    ];

    hotlines.forEach((h) => {
      this.drawWhatsAppBadgeIcon(ctx, h.iconX, midY, 28);

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 46px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.scale(0.88, 1);
      ctx.fillText(h.number, h.textX / 0.88, midY + 2);
      ctx.restore();

      if (h.divX) {
        this.drawFooterDivider(ctx, h.divX, midY);
      }
    });

    ctx.restore();
  }

  private static drawFooterDivider(ctx: CanvasRenderingContext2D, x: number, midY: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, midY - 26);
    ctx.lineTo(x, midY + 26);
    ctx.stroke();
    ctx.restore();
  }

  private static drawWhatsAppBadgeIcon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number
  ): void {
    ctx.save();
    // Green circle with crisp white border
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Speech bubble tail
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.65, cy + r * 0.45);
    ctx.lineTo(cx - r * 0.95, cy + r * 0.95);
    ctx.lineTo(cx - r * 0.25, cy + r * 0.75);
    ctx.closePath();
    ctx.fill();

    // Handset icon inside
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✆', cx, cy + 1);
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
