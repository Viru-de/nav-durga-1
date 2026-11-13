import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { CANONICAL_GAUGE_DIFFERENCE_RECORDS } from '../src/data/productMasterData';
import type {
  AppUser,
  ErpRole,
  UserPermissions,
  WebsiteCmsContent,
  PublicRateProductItem,
  PublicRatesPayload,
  SalesEnquiry,
  ActivityLogEntry,
} from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '..', '.data');
const STORE_PATH = path.join(DATA_DIR, 'erp-store.json');

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(`navdurga-erp-${process.cwd()}`).digest('hex');

export interface StoredErpUser extends AppUser {
  username: string;
  rbacRole: ErpRole;
  passwordHash: string;
  permissions: UserPermissions;
}

export interface StoredProductRate {
  id: string;
  code: string;
  name: string;
  category: string;
  section: 'MEDIUM SECTION' | 'LIGHT SECTION';
  size: string;
  grade: string;
  unit: string;
  gaugeDifference: number;
  baseRate: number;
  finalRate: number;
  previousPrice: number;
  priceChange: number;
  inStock: boolean;
  status: 'Active' | 'Inactive';
  rateSource: string;
  description: string;
}

export interface ServerStoreState {
  users: StoredErpUser[];
  cms: WebsiteCmsContent;
  categoryBasicRates: {
    'MEDIUM SECTION': number;
    'LIGHT SECTION': number;
  };
  rateStatus: 'Published' | 'Indicative';
  rateLastUpdated: string;
  rateUpdatedBy: string;
  products: StoredProductRate[];
  enquiries: SalesEnquiry[];
  activityLogs: ActivityLogEntry[];
  resetTokens: Record<string, { userId: string; expiresAt: number }>;
}

export function getDefaultPermissionsForRole(role: ErpRole): UserPermissions {
  if (role === 'SUPER_ADMIN') {
    return {
      manageDailyRates: true,
      manageProducts: true,
      manageWebsiteCms: true,
      manageEnquiries: true,
      manageQuotationsOrders: true,
      manageWhatsApp: true,
      viewAllWhatsAppChats: true,
      manageTeamUsers: true,
      publishPublicRates: true,
      viewReports: true,
    };
  }
  if (role === 'ADMIN') {
    return {
      manageDailyRates: true,
      manageProducts: true,
      manageWebsiteCms: true,
      manageEnquiries: true,
      manageQuotationsOrders: true,
      manageWhatsApp: true,
      viewAllWhatsAppChats: true,
      manageTeamUsers: false,
      publishPublicRates: true,
      viewReports: true,
    };
  }
  return {
    manageDailyRates: false,
    manageProducts: false,
    manageWebsiteCms: false,
    manageEnquiries: true,
    manageQuotationsOrders: true,
    manageWhatsApp: true,
    viewAllWhatsAppChats: false,
    manageTeamUsers: false,
    publishPublicRates: false,
    viewReports: false,
  };
}

function buildInitialUsers(): StoredErpUser[] {
  const superHash = bcrypt.hashSync('NavDurga@2026', 10);
  const adminHash = bcrypt.hashSync('Admin@2026', 10);
  const salesHash = bcrypt.hashSync('Sales@2026', 10);

  return [
    {
      id: 'usr-1',
      username: 'superadmin',
      name: 'Virendra Patel',
      role: 'Admin',
      rbacRole: 'SUPER_ADMIN',
      email: 'virendra@navdurgasteel.com',
      phone: '+91 98261 45890',
      status: 'Active',
      passwordHash: superHash,
      permissions: getDefaultPermissionsForRole('SUPER_ADMIN'),
    },
    {
      id: 'usr-admin-2',
      username: 'admin',
      name: 'Sandeep Tiwari',
      role: 'Admin',
      rbacRole: 'ADMIN',
      email: 'opsadmin@navdurgasteel.com',
      phone: '+91 98261 55400',
      status: 'Active',
      passwordHash: adminHash,
      permissions: getDefaultPermissionsForRole('ADMIN'),
    },
    {
      id: 'usr-2',
      username: 'rajesh.sales',
      name: 'Rajesh Sharma',
      role: 'Sales',
      rbacRole: 'SALES',
      email: 'rajesh.sales@navdurgasteel.com',
      phone: '+91 98261 11223',
      status: 'Active',
      passwordHash: salesHash,
      permissions: getDefaultPermissionsForRole('SALES'),
    },
    {
      id: 'usr-4',
      username: 'priya.sales',
      name: 'Priya Verma',
      role: 'Sales',
      rbacRole: 'SALES',
      email: 'priya.sales@navdurgasteel.com',
      phone: '+91 98261 33445',
      status: 'Active',
      passwordHash: salesHash,
      permissions: getDefaultPermissionsForRole('SALES'),
    },
    {
      id: 'usr-5',
      username: 'manish.sales',
      name: 'Manish Dewangan',
      role: 'Sales',
      rbacRole: 'SALES',
      email: 'manish.sales@navdurgasteel.com',
      phone: '+91 98261 66778',
      status: 'Active',
      passwordHash: salesHash,
      permissions: getDefaultPermissionsForRole('SALES'),
    },
    {
      id: 'usr-3',
      username: 'anil.sales',
      name: 'Anil Sahu',
      role: 'Sales',
      rbacRole: 'SALES',
      email: 'anil.sales@navdurgasteel.com',
      phone: '+91 98261 99887',
      status: 'Active',
      passwordHash: salesHash,
      permissions: getDefaultPermissionsForRole('SALES'),
    },
  ];
}

function buildInitialProducts(): StoredProductRate[] {
  const medBase = 49711;
  const lightBase = 42211;
  return CANONICAL_GAUGE_DIFFERENCE_RECORDS.map((rec) => {
    const baseRate = rec.section === 'LIGHT SECTION' ? lightBase : medBase;
    const finalRate = baseRate + rec.gaugeDifference;
    return {
      id: rec.id,
      code: rec.code,
      name: rec.productName,
      category: rec.category,
      section: rec.section,
      size: rec.size,
      grade: rec.grade,
      unit: 'MT',
      gaugeDifference: rec.gaugeDifference,
      baseRate,
      finalRate,
      previousPrice: finalRate,
      priceChange: 0,
      inStock: true,
      status: 'Active',
      rateSource: rec.company,
      description: `${rec.productName} ${rec.size} (${rec.grade}) rolled at ${rec.company}, Urla Industrial Complex, Raipur. Conforming to IS 2062 structural steel standards.`,
    };
  });
}

function buildInitialCms(): WebsiteCmsContent {
  return {
    id: 'main_website',
    heroBadge: 'IS 2062 CERTIFIED STRUCTURAL STEEL • URLA INDUSTRIAL AREA, RAIPUR',
    heroHeadline: 'Engineering Strength. Delivering Excellence.',
    heroSubheadline:
      'Your Trusted Partner for Quality Steel Products and Industrial Solutions. Direct mill manufacturing of Medium & Light Section MS Channels, Joists, and Angles.',
    announcementBanner:
      'Live Mill Dispatch Open — Direct Ex-Plant Loading from Urla Rolling Mill & Unit-2 NS Ispat (Raipur).',
    showAnnouncementBanner: true,
    aboutTitle: 'Integrated Structural Steel Rolling Excellence in Central India',
    aboutSummary:
      'Nav Durga Ispat Pvt. Ltd. and Unit-2 NS Ispat (I) Pvt. Ltd. operate precision hot-rolling mills in Urla Industrial Complex, Raipur (Chhattisgarh). We serve infrastructure developers, PEB fabricators, power transmission contractors, and industrial OEMs with consistent dimensional accuracy, certified metallurgical strength, and transparent daily mill rates.',
    visionText:
      'To be Central India’s most reliable structural steel manufacturing partner through engineering consistency, transparent pricing, and zero-compromise dispatch velocity.',
    missionText:
      'Deliver BIS-compliant Medium & Light Section structural steel with real-time digital rate visibility, precision rolling tolerances, and dedicated human technical sales support.',
    qualityCommitment:
      'Every rolled heat undergoes chemical spectroscopy, tensile elongation verification, bend testing, and dimensional gauge audits before mill dispatch.',
    contactPhone: '+91 771 4208900',
    contactWhatsapp: '+91 97521 83053',
    contactEmail: 'sales@navdurgasteel.com',
    contactAddress: 'Plot No. 42-45, Phase II, Urla Industrial Complex, Raipur, Chhattisgarh 493221',
    unit1Name: 'NAVDURGA ISPAT PVT. LTD. (Medium Section)',
    unit2Name: 'UNIT-2 — NS ISPAT (I) PVT. LTD. (Light Section)',
    dispatchHours: 'Mon – Sat: 09:00 AM to 07:30 PM IST',
    gstNumber: '22AABCN1234F1Z8',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Virendra Patel',
  };
}

function buildInitialState(): ServerStoreState {
  return {
    users: buildInitialUsers(),
    cms: buildInitialCms(),
    categoryBasicRates: {
      'MEDIUM SECTION': 49711,
      'LIGHT SECTION': 42211,
    },
    rateStatus: 'Published',
    rateLastUpdated: new Date().toISOString(),
    rateUpdatedBy: 'Virendra Patel',
    products: buildInitialProducts(),
    enquiries: [
      {
        id: 'enq-web-seed-1',
        enquiryNumber: 'ENQ-2026-401',
        customerId: 'cust-1',
        customerName: 'ABC Construction',
        product: 'MS CHANNEL',
        grade: 'Medium',
        quantity: 25,
        unit: 'MT',
        quotedPrice: 50111,
        source: 'Website',
        date: new Date().toISOString().split('T')[0],
        salesperson: 'Rajesh Sharma',
        status: 'New',
        notes: 'Website quotation enquiry for 125 x 65mm Medium MS Channel dispatch to Naya Raipur.',
      },
    ],
    activityLogs: [
      {
        id: 'log-init-1',
        timestamp: new Date().toISOString(),
        actorId: 'usr-1',
        actorName: 'Virendra Patel',
        actorRole: 'SUPER_ADMIN',
        action: 'SYSTEM_BOOT',
        details: 'Nav Durga Ispat unified website, live rate portal, and RBAC ERP initialized.',
      },
    ],
    resetTokens: {},
  };
}

let cachedStore: ServerStoreState | null = null;

export function loadServerStore(): ServerStoreState {
  if (cachedStore) return cachedStore;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as ServerStoreState;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.products)) {
        cachedStore = parsed;
        return cachedStore;
      }
    }
  } catch (err) {
    console.warn('[ERP Store] Could not read persisted store, reinitializing:', err);
  }
  cachedStore = buildInitialState();
  saveServerStore(cachedStore);
  return cachedStore;
}

export function saveServerStore(store: ServerStoreState): void {
  cachedStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.warn('[ERP Store] Failed writing store file:', err);
  }
}

export function sanitizeUser(user: StoredErpUser): AppUser {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

export function addActivityLog(
  store: ServerStoreState,
  entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>
): void {
  store.activityLogs.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });
  if (store.activityLogs.length > 200) {
    store.activityLogs = store.activityLogs.slice(0, 200);
  }
}

export function signSessionToken(payload: { userId: string; role: ErpRole; exp: number }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken(
  token: string | undefined | null
): { userId: string; role: ErpRole; exp: number } | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  try {
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!parsed?.userId || !parsed?.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq > 0) {
      const k = part.slice(0, eq).trim();
      const v = part.slice(eq + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  }
  return out;
}

export function getPublicRatesPayload(store: ServerStoreState): PublicRatesPayload {
  const medBase = Number(store.categoryBasicRates['MEDIUM SECTION']) || 0;
  const lightBase = Number(store.categoryBasicRates['LIGHT SECTION']) || 0;

  const publicProducts: PublicRateProductItem[] = store.products
    .filter((p) => p.status === 'Active')
    .map((p) => {
      const isLight = p.section === 'LIGHT SECTION' || p.rateSource.includes('NS ISPAT');
      const activeBase = isLight ? lightBase : medBase;
      const computedFinal = activeBase > 0 ? activeBase + (Number(p.gaugeDifference) || 0) : 0;
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category,
        section: isLight ? 'LIGHT SECTION' : 'MEDIUM SECTION',
        size: p.size,
        grade: p.grade,
        unit: p.unit || 'MT',
        baseRate: activeBase,
        gaugeDifference: Number(p.gaugeDifference) || 0,
        finalRate: computedFinal,
        priceChange: Number(p.priceChange) || 0,
        inStock: p.inStock,
        rateSource: p.rateSource,
        description: p.description,
      };
    });

  return {
    mediumSectionRate: medBase,
    slSectionRate: lightBase,
    lightSectionRate: lightBase,
    lastUpdated: store.rateLastUpdated,
    updatedBy: store.rateUpdatedBy,
    rateStatus: store.rateStatus,
    gstNote: 'GST 18% Extra • Ex-Plant Urla, Raipur',
    unitLabel: 'MT',
    products: publicProducts,
  };
}
