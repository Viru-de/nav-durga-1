// server.ts
import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path2 from "path";
import fs2 from "fs";
import crypto2 from "crypto";
import bcrypt2 from "bcryptjs";
import { fileURLToPath } from "url";

// server/erpStore.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// src/data/productMasterData.ts
var CANONICAL_GAUGE_DIFFERENCE_RECORDS = [
  // =========================================================================
  // 1. NAVDURGA ISPAT PVT. LTD. — MEDIUM SECTION (13 Records)
  // =========================================================================
  {
    id: "prod-nd-ch-12565-med",
    code: "ND-CH-12565-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "125 \xD7 65mm",
    grade: "Medium",
    gaugeDifference: 400
  },
  {
    id: "prod-nd-ch-15075-med",
    code: "ND-CH-15075-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "150 \xD7 75mm",
    grade: "Medium",
    gaugeDifference: 400
  },
  {
    id: "prod-nd-ch-20075-med",
    code: "ND-CH-20075-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "200 \xD7 75mm",
    grade: "Medium",
    gaugeDifference: 1300
  },
  {
    id: "prod-nd-ch-25082-med",
    code: "ND-CH-25082-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "250 \xD7 82mm",
    grade: "Medium",
    gaugeDifference: 2200
  },
  {
    id: "prod-nd-ch-12565-sl",
    code: "ND-CH-12565-SL",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "125 \xD7 65mm",
    grade: "SL",
    gaugeDifference: 2100
  },
  {
    id: "prod-nd-ch-15075-sl",
    code: "ND-CH-15075-SL",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "150 \xD7 75mm",
    grade: "SL",
    gaugeDifference: 3100
  },
  {
    id: "prod-nd-ch-20075-sl",
    code: "ND-CH-20075-SL",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "200 \xD7 75mm",
    grade: "SL",
    gaugeDifference: 3100
  },
  {
    id: "prod-nd-joist-10050-med",
    code: "ND-JST-10050-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS JOIST",
    category: "MS Joist",
    size: "100 \xD7 50mm",
    grade: "Medium",
    gaugeDifference: 700
  },
  {
    id: "prod-nd-joist-12570-med",
    code: "ND-JST-12570-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS JOIST",
    category: "MS Joist",
    size: "125 \xD7 70mm",
    grade: "Medium",
    gaugeDifference: 400
  },
  {
    id: "prod-nd-joist-15075-med",
    code: "ND-JST-15075-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS JOIST",
    category: "MS Joist",
    size: "150 \xD7 75mm",
    grade: "Medium",
    gaugeDifference: 400
  },
  {
    id: "prod-nd-joist-200100-med",
    code: "ND-JST-200100-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS JOIST",
    category: "MS Joist",
    size: "200 \xD7 100mm",
    grade: "Medium",
    gaugeDifference: 700
  },
  {
    id: "prod-nd-joist-250125-med",
    code: "ND-JST-250125-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS JOIST",
    category: "MS Joist",
    size: "250 \xD7 125mm",
    grade: "Medium",
    gaugeDifference: 1500
  },
  {
    id: "prod-nd-joist-300140-med",
    code: "ND-JST-300140-MED",
    company: "NAVDURGA ISPAT PVT. LTD.",
    section: "MEDIUM SECTION",
    productName: "MS JOIST",
    category: "MS Joist",
    size: "300 \xD7 140mm",
    grade: "Medium",
    gaugeDifference: 2200
  },
  // =========================================================================
  // 2. UNIT-2 — NS ISPAT (I) PVT. LTD. — LIGHT SECTION (9 Records)
  // =========================================================================
  {
    id: "prod-ns-ch-7035-sl",
    code: "NS-CH-7035-SL",
    company: "UNIT-2 - NS ISPAT (I) PVT. LTD.",
    section: "LIGHT SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "70 \xD7 35mm",
    grade: "SL",
    gaugeDifference: 7500
  },
  {
    id: "prod-ns-ch-7540-med",
    code: "NS-CH-7540-MED",
    company: "UNIT-2 - NS ISPAT (I) PVT. LTD.",
    section: "LIGHT SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "75 \xD7 40mm",
    grade: "Medium",
    gaugeDifference: 6700
  },
  {
    id: "prod-ns-ch-7540-5kg",
    code: "NS-CH-7540-5KG",
    company: "UNIT-2 - NS ISPAT (I) PVT. LTD.",
    section: "LIGHT SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "75 \xD7 40mm",
    grade: "5 KG",
    gaugeDifference: 7500
  },
  {
    id: "prod-ns-ch-9545-sl",
    code: "NS-CH-9545-SL",
    company: "UNIT-2 - NS ISPAT (I) PVT. LTD.",
    section: "LIGHT SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "95 \xD7 45mm",
    grade: "SL",
    gaugeDifference: 7500
  },
  {
    id: "prod-ns-ch-10050-med",
    code: "NS-CH-10050-MED",
    company: "UNIT-2 - NS ISPAT (I) PVT. LTD.",
    section: "LIGHT SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "100 \xD7 50mm",
    grade: "Medium",
    gaugeDifference: 6400
  },
  {
    id: "prod-ns-ch-10050-8kg",
    code: "NS-CH-10050-8KG",
    company: "UNIT-2 - NS ISPAT (I) PVT. LTD.",
    section: "LIGHT SECTION",
    productName: "MS CHANNEL",
    category: "MS Channel",
    size: "100 \xD7 50mm",
    grade: "8 KG",
    gaugeDifference: 7500
  },
  {
    id: "prod-ns-ang-40",
    code: "NS-ANG-40-MED",
    company: "UNIT-2 - NS ISPAT (I) PVT. LTD.",
    section: "LIGHT SECTION",
    productName: "MS ANGLE",
    category: "MS Angle",
    size: "40 \xD7 5, 40 \xD7 6",
    grade: "Medium",
    gaugeDifference: 7200
  },
  {
    id: "prod-ns-ang-50-65-5",
    code: "NS-ANG-5065-5-MED",
    company: "UNIT-2 - NS ISPAT (I) PVT. LTD.",
    section: "LIGHT SECTION",
    productName: "MS ANGLE",
    category: "MS Angle",
    size: "50 \xD7 5, 65 \xD7 5",
    grade: "Medium",
    gaugeDifference: 6700
  },
  {
    id: "prod-ns-ang-50-65-6",
    code: "NS-ANG-5065-6-MED",
    company: "UNIT-2 - NS ISPAT (I) PVT. LTD.",
    section: "LIGHT SECTION",
    productName: "MS ANGLE",
    category: "MS Angle",
    size: "50 \xD7 6, 65 \xD7 6",
    grade: "Medium",
    gaugeDifference: 6400
  }
];
var MEDIUM_BASIC_RATE = 49711;
var LIGHT_BASIC_RATE = 42211;
var ACTIVE_PRODUCT_MASTER = CANONICAL_GAUGE_DIFFERENCE_RECORDS.map((c) => {
  const isMed = c.section === "MEDIUM SECTION";
  const baseRate = isMed ? MEDIUM_BASIC_RATE : LIGHT_BASIC_RATE;
  const finalRate = baseRate + c.gaugeDifference;
  return {
    id: c.id,
    name: c.productName,
    productName: c.productName,
    code: c.code,
    category: c.category,
    productCategory: c.category,
    size: c.size,
    gaugeType: c.grade,
    type: c.grade === "SL" ? "Super light" : c.grade,
    grade: c.grade,
    section: c.section,
    rateSource: c.company,
    baseRate,
    loadingCharge: 0,
    insuranceCharge: 0,
    gaugeDifference: c.gaugeDifference,
    otherCharges: 0,
    finalRate,
    currentPrice: finalRate,
    previousPrice: baseRate,
    priceChange: c.gaugeDifference,
    unit: "MT",
    minOrderQty: isMed ? 10 : 5,
    description: `${c.productName} ${c.size} ${c.grade} (${c.section}) - ${c.company}.`,
    inStock: true,
    status: "Active",
    priceHistory: [
      {
        date: "2026-09-24",
        price: finalRate,
        changeReason: `Daily rate update (Category Basic: \u20B9${baseRate.toLocaleString("en-IN")} + Gauge Diff: \u20B9${c.gaugeDifference.toLocaleString("en-IN")})`
      }
    ]
  };
});

// server/erpStore.ts
var DATA_DIR = path.resolve(process.cwd(), ".data");
var STORE_PATH = path.join(DATA_DIR, "erp-store.json");
var SESSION_SECRET = process.env.SESSION_SECRET || crypto.createHash("sha256").update(`navdurga-erp-${process.cwd()}`).digest("hex");
function getDefaultPermissionsForRole(role) {
  if (role === "SUPER_ADMIN") {
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
      viewReports: true
    };
  }
  if (role === "ADMIN") {
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
      viewReports: true
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
    viewReports: false
  };
}
function buildInitialUsers() {
  const superHash = bcrypt.hashSync("NavDurga@2026", 10);
  const adminHash = bcrypt.hashSync("Admin@2026", 10);
  const salesHash = bcrypt.hashSync("Sales@2026", 10);
  return [
    {
      id: "usr-1",
      username: "superadmin",
      name: "Virendra Patel",
      role: "Admin",
      rbacRole: "SUPER_ADMIN",
      email: "virendra@navdurgasteel.com",
      phone: "+91 98261 45890",
      status: "Active",
      passwordHash: superHash,
      permissions: getDefaultPermissionsForRole("SUPER_ADMIN")
    },
    {
      id: "usr-admin-2",
      username: "admin",
      name: "Sandeep Tiwari",
      role: "Admin",
      rbacRole: "ADMIN",
      email: "opsadmin@navdurgasteel.com",
      phone: "+91 98261 55400",
      status: "Active",
      passwordHash: adminHash,
      permissions: getDefaultPermissionsForRole("ADMIN")
    },
    {
      id: "usr-2",
      username: "rajesh.sales",
      name: "Rajesh Sharma",
      role: "Sales",
      rbacRole: "SALES",
      email: "rajesh.sales@navdurgasteel.com",
      phone: "+91 98261 11223",
      status: "Active",
      passwordHash: salesHash,
      permissions: getDefaultPermissionsForRole("SALES")
    },
    {
      id: "usr-4",
      username: "priya.sales",
      name: "Priya Verma",
      role: "Sales",
      rbacRole: "SALES",
      email: "priya.sales@navdurgasteel.com",
      phone: "+91 98261 33445",
      status: "Active",
      passwordHash: salesHash,
      permissions: getDefaultPermissionsForRole("SALES")
    },
    {
      id: "usr-5",
      username: "manish.sales",
      name: "Manish Dewangan",
      role: "Sales",
      rbacRole: "SALES",
      email: "manish.sales@navdurgasteel.com",
      phone: "+91 98261 66778",
      status: "Active",
      passwordHash: salesHash,
      permissions: getDefaultPermissionsForRole("SALES")
    },
    {
      id: "usr-3",
      username: "anil.sales",
      name: "Anil Sahu",
      role: "Sales",
      rbacRole: "SALES",
      email: "anil.sales@navdurgasteel.com",
      phone: "+91 98261 99887",
      status: "Active",
      passwordHash: salesHash,
      permissions: getDefaultPermissionsForRole("SALES")
    }
  ];
}
function buildInitialProducts() {
  const medBase = 49711;
  const lightBase = 42211;
  return CANONICAL_GAUGE_DIFFERENCE_RECORDS.map((rec) => {
    const baseRate = rec.section === "LIGHT SECTION" ? lightBase : medBase;
    const finalRate = baseRate + rec.gaugeDifference;
    return {
      id: rec.id,
      code: rec.code,
      name: rec.productName,
      category: rec.category,
      section: rec.section,
      size: rec.size,
      grade: rec.grade,
      unit: "MT",
      gaugeDifference: rec.gaugeDifference,
      baseRate,
      finalRate,
      previousPrice: finalRate,
      priceChange: 0,
      inStock: true,
      status: "Active",
      rateSource: rec.company,
      description: `${rec.productName} ${rec.size} (${rec.grade}) \u2022 ${rec.company}, Urla Industrial Area, Raipur.`
    };
  });
}
function buildInitialCms() {
  return {
    id: "main_website",
    heroBadge: "ESTABLISHED STEEL INDUSTRY | RAIPUR, CHHATTISGARH",
    heroHeadline: "Strength in Steel. Built for Tomorrow.",
    heroSubheadline: "Delivering steel products for industrial, structural and infrastructure requirements through a commitment to quality, reliability and customer relationships.",
    announcementBanner: "Nav Durga Ispat Pvt. Ltd. \u2014 Direct Commercial Enquiries & Live Structural Steel Rates (Urla Industrial Area, Raipur)",
    showAnnouncementBanner: true,
    aboutTitle: "Nav Durga Ispat Pvt. Ltd. \u2014 Structural Steel & Industrial Supply",
    aboutSummary: "Nav Durga Ispat Pvt. Ltd. is an established steel industry company based in the Urla Industrial Area, Raipur, Chhattisgarh. The company serves the steel market with a focus on structural steel products and dependable customer service.",
    visionText: "To serve industrial, structural, and infrastructure requirements with dependable steel supply, clear pricing, and lasting customer relationships.",
    missionText: "Provide structural steel products backed by responsive sales coordination, live product rate transparency, and reliable service from Urla, Raipur.",
    qualityCommitment: "We focus on consistent product specifications, careful rolling inspection, and clear commercial documentation across every order.",
    contactPhone: "+91 771 4208900",
    contactWhatsapp: "+91 97521 83053",
    contactEmail: "sales@navdurgasteel.com",
    contactAddress: "Plot No. 435-A, Sector-C, Urla Industrial Area, Raipur, Chhattisgarh \u2013 493221, India",
    unit1Name: "NAVDURGA ISPAT PVT. LTD. (Medium Section)",
    unit2Name: "UNIT-2 \u2014 NS ISPAT (I) PVT. LTD. (Light Section)",
    dispatchHours: "Mon \u2013 Sat: 09:00 AM to 07:30 PM IST",
    gstNumber: "",
    cinNumber: "U24132CT1988PTC004838",
    establishedYear: "1988",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: "Virendra Patel"
  };
}
function buildInitialState() {
  return {
    users: buildInitialUsers(),
    cms: buildInitialCms(),
    categoryBasicRates: {
      "MEDIUM SECTION": 49711,
      "LIGHT SECTION": 42211
    },
    rateStatus: "Published",
    rateLastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    rateUpdatedBy: "Virendra Patel",
    products: buildInitialProducts(),
    enquiries: [
      {
        id: "enq-web-seed-1",
        enquiryNumber: "ENQ-2026-401",
        customerId: "cust-1",
        customerName: "ABC Construction",
        product: "MS CHANNEL",
        grade: "Medium",
        quantity: 25,
        unit: "MT",
        quotedPrice: 50111,
        source: "Website",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        salesperson: "Rajesh Sharma",
        status: "New",
        notes: "Website quotation enquiry for 125 x 65mm Medium MS Channel dispatch to Naya Raipur."
      }
    ],
    activityLogs: [
      {
        id: "log-init-1",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        actorId: "usr-1",
        actorName: "Virendra Patel",
        actorRole: "SUPER_ADMIN",
        action: "SYSTEM_BOOT",
        details: "Nav Durga Ispat unified website, live rate portal, and RBAC ERP initialized."
      }
    ],
    resetTokens: {}
  };
}
var cachedStore = null;
function loadServerStore() {
  if (cachedStore) return cachedStore;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.products)) {
        const legacyDetected = parsed.cms?.contactAddress?.includes("Plot No. 42-45") || parsed.cms?.heroHeadline === "Engineering Strength. Delivering Excellence." || parsed.cms?.heroBadge?.includes("IS 2062 CERTIFIED") || !parsed.cms?.cinNumber;
        if (legacyDetected) {
          const approvedDefaults = buildInitialCms();
          parsed.cms = {
            ...approvedDefaults,
            contactPhone: parsed.cms?.contactPhone || approvedDefaults.contactPhone,
            contactWhatsapp: parsed.cms?.contactWhatsapp || approvedDefaults.contactWhatsapp,
            contactEmail: parsed.cms?.contactEmail || approvedDefaults.contactEmail,
            dispatchHours: parsed.cms?.dispatchHours || approvedDefaults.dispatchHours,
            unit1Name: parsed.cms?.unit1Name || approvedDefaults.unit1Name,
            unit2Name: parsed.cms?.unit2Name || approvedDefaults.unit2Name,
            showAnnouncementBanner: parsed.cms?.showAnnouncementBanner ?? approvedDefaults.showAnnouncementBanner,
            cinNumber: "U24132CT1988PTC004838",
            establishedYear: "1988"
          };
          parsed.products = parsed.products.map(
            (prod) => prod.description?.includes("Conforming to IS 2062 structural steel standards.") ? {
              ...prod,
              description: `${prod.name} ${prod.size} (${prod.grade}) \u2022 ${prod.rateSource}, Urla Industrial Area, Raipur.`
            } : prod
          );
          cachedStore = parsed;
          saveServerStore(cachedStore);
          return cachedStore;
        }
        cachedStore = parsed;
        return cachedStore;
      }
    }
  } catch (err) {
    console.warn("[ERP Store] Could not read persisted store, reinitializing:", err);
  }
  cachedStore = buildInitialState();
  saveServerStore(cachedStore);
  return cachedStore;
}
function saveServerStore(store) {
  cachedStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.warn("[ERP Store] Failed writing store file:", err);
  }
}
function sanitizeUser(user) {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}
function addActivityLog(store, entry) {
  store.activityLogs.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...entry
  });
  if (store.activityLogs.length > 200) {
    store.activityLogs = store.activityLogs.slice(0, 200);
  }
}
function signSessionToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}
function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  try {
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!parsed?.userId || !parsed?.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq > 0) {
      const k = part.slice(0, eq).trim();
      const v = part.slice(eq + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  }
  return out;
}
function getPublicRatesPayload(store) {
  const medBase = Number(store.categoryBasicRates["MEDIUM SECTION"]) || 0;
  const lightBase = Number(store.categoryBasicRates["LIGHT SECTION"]) || 0;
  const isPublished = store.rateStatus === "Published";
  const publicProducts = store.products.filter((p) => p.status === "Active").map((p) => {
    const isLight = p.section === "LIGHT SECTION" || p.rateSource.includes("NS ISPAT");
    const activeBase = isLight ? lightBase : medBase;
    const computedFinal = isPublished && activeBase > 0 ? activeBase + (Number(p.gaugeDifference) || 0) : 0;
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      category: p.category,
      section: isLight ? "LIGHT SECTION" : "MEDIUM SECTION",
      size: p.size,
      grade: p.grade,
      unit: p.unit || "MT",
      baseRate: isPublished ? activeBase : 0,
      gaugeDifference: Number(p.gaugeDifference) || 0,
      finalRate: computedFinal,
      priceChange: Number(p.priceChange) || 0,
      inStock: p.inStock,
      rateSource: p.rateSource,
      description: p.description,
      image: p.image
    };
  });
  return {
    mediumSectionRate: isPublished ? medBase : 0,
    slSectionRate: isPublished ? lightBase : 0,
    lightSectionRate: isPublished ? lightBase : 0,
    lastUpdated: store.rateLastUpdated,
    updatedBy: store.rateUpdatedBy,
    rateStatus: store.rateStatus,
    gstNote: "GST 18% Extra \u2022 Ex-Plant Urla, Raipur",
    unitLabel: "MT",
    products: publicProducts
  };
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var SESSION_COOKIE_NAME = "nd_erp_session";
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path2.resolve(__dirname, "public")));
function getAuthenticatedUser(req) {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization;
  const bearerToken = typeof authHeader === "string" && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : void 0;
  const token = cookies[SESSION_COOKIE_NAME] || bearerToken;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const store = loadServerStore();
  const user = store.users.find((u) => u.id === payload.userId && u.status === "Active");
  return user || null;
}
function requireAuth(req, res) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required. Please log in to Nav Durga ERP." });
    return null;
  }
  return user;
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Nav Durga Ispat Unified Platform & ERP",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    whatsappConfigured: Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  res.type("text/plain").send(
    `User-agent: *
Allow: /
Disallow: /erp
Disallow: /erp/
Disallow: /login
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`
  );
});
app.get("/sitemap.xml", (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const publicRoutes = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/product-rates", priority: "0.95", changefreq: "hourly" },
    { path: "/products", priority: "0.9", changefreq: "daily" },
    { path: "/products/medium-section", priority: "0.9", changefreq: "daily" },
    { path: "/products/light-section", priority: "0.9", changefreq: "daily" },
    { path: "/about", priority: "0.8", changefreq: "monthly" },
    { path: "/industries", priority: "0.8", changefreq: "monthly" },
    { path: "/quality", priority: "0.8", changefreq: "monthly" },
    { path: "/resources", priority: "0.7", changefreq: "weekly" },
    { path: "/contact", priority: "0.8", changefreq: "monthly" },
    { path: "/privacy", priority: "0.4", changefreq: "yearly" },
    { path: "/terms", priority: "0.4", changefreq: "yearly" }
  ];
  const urlsXml = publicRoutes.map(
    (r) => `  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  ).join("\n");
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`
  );
});
app.get("/api/public/website", (req, res) => {
  const store = loadServerStore();
  res.json({
    cms: store.cms,
    rateSummary: {
      mediumSectionRate: store.categoryBasicRates["MEDIUM SECTION"],
      lightSectionRate: store.categoryBasicRates["LIGHT SECTION"],
      lastUpdated: store.rateLastUpdated,
      rateStatus: store.rateStatus
    }
  });
});
app.get("/api/public/rates", (req, res) => {
  const store = loadServerStore();
  res.json(getPublicRatesPayload(store));
});
app.post("/api/public/enquiries", (req, res) => {
  const { name, companyName, phone, email, city, product, grade, quantity, unit, notes } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: "Contact name and phone number are required." });
  }
  const store = loadServerStore();
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const enquiryNumber = `WEB-${today.replace(/-/g, "").slice(2)}-${Math.floor(100 + Math.random() * 900)}`;
  const newEnquiry = {
    id: `enq-web-${Date.now()}`,
    enquiryNumber,
    customerId: `web-lead-${Date.now()}`,
    customerName: companyName ? `${companyName} (${name})` : String(name).trim(),
    product: product ? String(product).trim() : "Structural Steel Enquiry",
    grade: grade ? String(grade).trim() : "Medium",
    quantity: Number(quantity) || 10,
    unit: unit ? String(unit).trim() : "MT",
    source: "Website",
    date: today,
    salesperson: "Rajesh Sharma",
    status: "New",
    notes: [
      `Contact: ${String(name).trim()}`,
      `Phone: ${String(phone).trim()}`,
      email ? `Email: ${String(email).trim()}` : "",
      city ? `Location: ${String(city).trim()}` : "",
      notes ? `Requirement: ${String(notes).trim()}` : ""
    ].filter(Boolean).join(" | ")
  };
  store.enquiries.unshift(newEnquiry);
  addActivityLog(store, {
    actorId: "public-portal",
    actorName: String(name).trim(),
    actorRole: "PUBLIC_LEAD",
    action: "PUBLIC_ENQUIRY_SUBMITTED",
    target: newEnquiry.enquiryNumber,
    details: `${newEnquiry.customerName} requested ${newEnquiry.quantity} ${newEnquiry.unit} of ${newEnquiry.product}`
  });
  saveServerStore(store);
  res.status(201).json({
    success: true,
    enquiry: newEnquiry,
    message: "Your enquiry has been received by the Nav Durga Ispat commercial sales desk."
  });
});
app.post("/api/auth/login", (req, res) => {
  const { identifier, password, rememberMe } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ error: "Username/Email and password are required." });
  }
  const store = loadServerStore();
  const cleanId = String(identifier).trim().toLowerCase();
  const user = store.users.find(
    (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
  );
  if (!user || !bcrypt2.compareSync(String(password), user.passwordHash)) {
    return res.status(401).json({ error: "Invalid username/email or password." });
  }
  if (user.status !== "Active") {
    return res.status(403).json({ error: "This account has been deactivated. Contact Super Admin." });
  }
  user.lastLoginAt = (/* @__PURE__ */ new Date()).toISOString();
  const ttlMs = rememberMe ? 14 * 24 * 60 * 60 * 1e3 : 12 * 60 * 60 * 1e3;
  const token = signSessionToken({
    userId: user.id,
    role: user.rbacRole,
    exp: Date.now() + ttlMs
  });
  addActivityLog(store, {
    actorId: user.id,
    actorName: user.name,
    actorRole: user.rbacRole,
    action: "LOGIN",
    details: `Logged into Nav Durga ERP (${user.rbacRole})`
  });
  saveServerStore(store);
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ttlMs,
    path: "/"
  });
  res.json({
    success: true,
    token,
    user: sanitizeUser(user)
  });
});
app.post("/api/auth/logout", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (user) {
    const store = loadServerStore();
    addActivityLog(store, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.rbacRole,
      action: "LOGOUT",
      details: "Signed out of Nav Durga ERP"
    });
    saveServerStore(store);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.json({ success: true });
});
app.get("/api/auth/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: sanitizeUser(user) });
});
app.post("/api/auth/forgot-password", (req, res) => {
  const { identifier } = req.body || {};
  if (!identifier) {
    return res.status(400).json({ error: "Enter your registered username or email." });
  }
  const store = loadServerStore();
  const cleanId = String(identifier).trim().toLowerCase();
  const user = store.users.find(
    (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
  );
  if (!user) {
    return res.json({
      success: true,
      message: "If an active account matches that username/email, a reset code has been generated."
    });
  }
  const resetCode = String(Math.floor(1e5 + Math.random() * 9e5));
  store.resetTokens[resetCode] = {
    userId: user.id,
    expiresAt: Date.now() + 15 * 60 * 1e3
  };
  addActivityLog(store, {
    actorId: user.id,
    actorName: user.name,
    actorRole: user.rbacRole,
    action: "PASSWORD_RESET_REQUESTED",
    details: `Password reset requested for ${user.username}`
  });
  saveServerStore(store);
  res.json({
    success: true,
    message: "Reset verification code generated. Contact Super Admin or enter the verification code to set a new password.",
    verificationCodeHint: process.env.NODE_ENV === "production" ? void 0 : resetCode
  });
});
app.post("/api/auth/reset-password", (req, res) => {
  const { code, newPassword } = req.body || {};
  if (!code || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: "Valid reset code and password (min 6 characters) required." });
  }
  const store = loadServerStore();
  const entry = store.resetTokens[String(code).trim()];
  if (!entry || Date.now() > entry.expiresAt) {
    return res.status(400).json({ error: "Reset code is invalid or expired." });
  }
  const user = store.users.find((u) => u.id === entry.userId);
  if (!user) {
    return res.status(404).json({ error: "User account not found." });
  }
  user.passwordHash = bcrypt2.hashSync(String(newPassword), 10);
  delete store.resetTokens[String(code).trim()];
  addActivityLog(store, {
    actorId: user.id,
    actorName: user.name,
    actorRole: user.rbacRole,
    action: "PASSWORD_RESET_COMPLETED",
    details: `Password updated for ${user.username}`
  });
  saveServerStore(store);
  res.json({ success: true, message: "Password updated successfully. You may now sign in." });
});
app.get("/api/erp/bootstrap", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const store = loadServerStore();
  res.json({
    user: sanitizeUser(user),
    cms: store.cms,
    publicRates: getPublicRatesPayload(store),
    enquiries: store.enquiries,
    users: user.permissions.manageTeamUsers || user.rbacRole === "SUPER_ADMIN" || user.rbacRole === "ADMIN" ? store.users.map(sanitizeUser) : [sanitizeUser(user)],
    activityLogs: user.rbacRole === "SUPER_ADMIN" || user.rbacRole === "ADMIN" ? store.activityLogs.slice(0, 60) : []
  });
});
app.post("/api/erp/rates", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  if (!user.permissions.manageDailyRates && !user.permissions.publishPublicRates && user.rbacRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "You do not have permission to modify daily steel rates." });
  }
  const { categoryBasicRates, products, rateStatus, syncCatalog } = req.body || {};
  const store = loadServerStore();
  if (categoryBasicRates) {
    if (typeof categoryBasicRates["MEDIUM SECTION"] === "number") {
      store.categoryBasicRates["MEDIUM SECTION"] = categoryBasicRates["MEDIUM SECTION"];
    }
    if (typeof categoryBasicRates["LIGHT SECTION"] === "number") {
      store.categoryBasicRates["LIGHT SECTION"] = categoryBasicRates["LIGHT SECTION"];
    }
  }
  if (Array.isArray(products)) {
    const incomingIds = /* @__PURE__ */ new Set();
    for (const incoming of products) {
      if (!incoming || !incoming.id && !incoming.code) continue;
      if (incoming.id) incomingIds.add(String(incoming.id));
      const idx = store.products.findIndex((p) => p.id === incoming.id || p.code === incoming.code);
      if (idx >= 0) {
        const existing = store.products[idx];
        const nextSection = incoming.section === "LIGHT SECTION" || typeof incoming.rateSource === "string" && incoming.rateSource.includes("NS ISPAT") ? "LIGHT SECTION" : incoming.section === "MEDIUM SECTION" ? "MEDIUM SECTION" : existing.section;
        const gaugeDiff = incoming.gaugeDifference !== void 0 ? Number(incoming.gaugeDifference) : existing.gaugeDifference;
        const baseRate = nextSection === "LIGHT SECTION" ? store.categoryBasicRates["LIGHT SECTION"] : store.categoryBasicRates["MEDIUM SECTION"];
        const nextFinal = typeof incoming.finalRate === "number" && incoming.finalRate > 0 ? incoming.finalRate : baseRate > 0 ? baseRate + gaugeDiff : 0;
        store.products[idx] = {
          ...existing,
          code: incoming.code || existing.code,
          name: incoming.name || existing.name,
          category: incoming.category || existing.category,
          section: nextSection,
          size: incoming.size ?? existing.size,
          grade: incoming.grade || existing.grade,
          unit: incoming.unit || existing.unit,
          rateSource: incoming.rateSource || existing.rateSource,
          gaugeDifference: gaugeDiff,
          baseRate,
          previousPrice: existing.finalRate,
          finalRate: nextFinal,
          priceChange: nextFinal - existing.finalRate,
          inStock: incoming.inStock ?? existing.inStock,
          status: incoming.status === "Inactive" ? "Inactive" : incoming.status === "Active" ? "Active" : existing.status,
          description: incoming.description !== void 0 ? incoming.description : existing.description,
          image: incoming.image !== void 0 ? incoming.image : existing.image
        };
        incomingIds.add(store.products[idx].id);
      } else if (incoming.name) {
        const nextSection = incoming.section === "LIGHT SECTION" || typeof incoming.rateSource === "string" && incoming.rateSource.includes("NS ISPAT") ? "LIGHT SECTION" : "MEDIUM SECTION";
        const gaugeDiff = Number(incoming.gaugeDifference) || 0;
        const baseRate = nextSection === "LIGHT SECTION" ? store.categoryBasicRates["LIGHT SECTION"] : store.categoryBasicRates["MEDIUM SECTION"];
        const nextFinal = typeof incoming.finalRate === "number" && incoming.finalRate > 0 ? incoming.finalRate : baseRate > 0 ? baseRate + gaugeDiff : 0;
        const newId = String(incoming.id || `prod-${Date.now()}`);
        store.products.unshift({
          id: newId,
          code: String(incoming.code || `ND-${Math.floor(100 + Math.random() * 900)}`),
          name: String(incoming.name),
          category: String(incoming.category || "Structural Steel"),
          section: nextSection,
          size: String(incoming.size || ""),
          grade: String(incoming.grade || "Medium"),
          unit: String(incoming.unit || "MT"),
          gaugeDifference: gaugeDiff,
          baseRate,
          finalRate: nextFinal,
          previousPrice: nextFinal,
          priceChange: 0,
          inStock: incoming.inStock ?? true,
          status: incoming.status === "Inactive" ? "Inactive" : "Active",
          rateSource: String(incoming.rateSource || "NAV DURGA ISPAT PVT. LTD."),
          description: String(incoming.description || ""),
          image: typeof incoming.image === "string" ? incoming.image : void 0
        });
        incomingIds.add(newId);
      }
    }
    if (syncCatalog === true && products.length > 0) {
      store.products = store.products.filter((p) => incomingIds.has(p.id));
    }
  } else {
    store.products = store.products.map((p) => {
      const baseRate = p.section === "LIGHT SECTION" ? store.categoryBasicRates["LIGHT SECTION"] : store.categoryBasicRates["MEDIUM SECTION"];
      const nextFinal = baseRate > 0 ? baseRate + p.gaugeDifference : 0;
      return {
        ...p,
        baseRate,
        previousPrice: p.finalRate,
        finalRate: nextFinal,
        priceChange: nextFinal - p.finalRate
      };
    });
  }
  if (rateStatus === "Published" || rateStatus === "Indicative") {
    store.rateStatus = rateStatus;
  }
  store.rateLastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  store.rateUpdatedBy = user.name;
  addActivityLog(store, {
    actorId: user.id,
    actorName: user.name,
    actorRole: user.rbacRole,
    action: "DAILY_RATES_PUBLISHED",
    details: `Medium Section: \u20B9${store.categoryBasicRates["MEDIUM SECTION"].toLocaleString("en-IN")}/MT, Light Section: \u20B9${store.categoryBasicRates["LIGHT SECTION"].toLocaleString("en-IN")}/MT`
  });
  saveServerStore(store);
  res.json({ success: true, publicRates: getPublicRatesPayload(store) });
});
app.put("/api/erp/website", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  if (!user.permissions.manageWebsiteCms && user.rbacRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "You do not have permission to edit Website CMS content." });
  }
  const incoming = req.body;
  const store = loadServerStore();
  store.cms = {
    ...store.cms,
    ...incoming,
    id: "main_website",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: user.name
  };
  addActivityLog(store, {
    actorId: user.id,
    actorName: user.name,
    actorRole: user.rbacRole,
    action: "WEBSITE_CMS_UPDATED",
    details: `Updated public website content & contact settings`
  });
  saveServerStore(store);
  res.json({ success: true, cms: store.cms });
});
app.get("/api/erp/enquiries", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const store = loadServerStore();
  res.json({ enquiries: store.enquiries });
});
app.patch("/api/erp/enquiries/:id", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const store = loadServerStore();
  const idx = store.enquiries.findIndex((e) => e.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Enquiry not found" });
  store.enquiries[idx] = { ...store.enquiries[idx], ...req.body };
  saveServerStore(store);
  res.json({ success: true, enquiry: store.enquiries[idx] });
});
app.get("/api/users", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  if (!user.permissions.manageTeamUsers && user.rbacRole !== "SUPER_ADMIN" && user.rbacRole !== "ADMIN") {
    return res.status(403).json({ error: "Only Super Admin or Admin can view team directory." });
  }
  const store = loadServerStore();
  res.json({ users: store.users.map(sanitizeUser), activityLogs: store.activityLogs.slice(0, 60) });
});
app.post("/api/users", (req, res) => {
  const actor = requireAuth(req, res);
  if (!actor) return;
  if (!actor.permissions.manageTeamUsers && actor.rbacRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only authorized administrators can create team accounts." });
  }
  const { username, name, email, phone, password, rbacRole = "SALES", permissions } = req.body || {};
  if (!username || !name || !email || !password) {
    return res.status(400).json({ error: "Username, name, email, and initial password are required." });
  }
  const roleValue = rbacRole === "SUPER_ADMIN" || rbacRole === "ADMIN" || rbacRole === "SALES" ? rbacRole : "SALES";
  if (roleValue === "SUPER_ADMIN" && actor.rbacRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only Super Admin can create another Super Admin." });
  }
  const store = loadServerStore();
  const duplicate = store.users.find(
    (u) => u.username.toLowerCase() === String(username).trim().toLowerCase() || u.email.toLowerCase() === String(email).trim().toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ error: "Username or email already exists." });
  }
  const newUser = {
    id: `usr-${Date.now()}`,
    username: String(username).trim(),
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone || "+91 98261 00000").trim(),
    role: roleValue === "SALES" ? "Sales" : "Admin",
    rbacRole: roleValue,
    status: "Active",
    passwordHash: bcrypt2.hashSync(String(password), 10),
    permissions: permissions ? { ...getDefaultPermissionsForRole(roleValue), ...permissions } : getDefaultPermissionsForRole(roleValue)
  };
  store.users.push(newUser);
  addActivityLog(store, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.rbacRole,
    action: "TEAM_USER_CREATED",
    target: newUser.username,
    details: `Created ${newUser.rbacRole} account for ${newUser.name}`
  });
  saveServerStore(store);
  res.status(201).json({ success: true, user: sanitizeUser(newUser) });
});
app.patch("/api/users/:id", (req, res) => {
  const actor = requireAuth(req, res);
  if (!actor) return;
  if (!actor.permissions.manageTeamUsers && actor.rbacRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Permission denied for modifying team users." });
  }
  const store = loadServerStore();
  const idx = store.users.findIndex((u) => u.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "User not found." });
  const target = store.users[idx];
  if (target.rbacRole === "SUPER_ADMIN" && actor.rbacRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only Super Admin can modify a Super Admin account." });
  }
  const { name, email, phone, status, rbacRole, permissions } = req.body || {};
  const nextRole = rbacRole && (rbacRole === "SUPER_ADMIN" || rbacRole === "ADMIN" || rbacRole === "SALES") ? rbacRole : target.rbacRole;
  if (target.rbacRole === "SUPER_ADMIN" && (status === "Inactive" || nextRole !== "SUPER_ADMIN")) {
    const activeSuperAdmins = store.users.filter((u) => u.rbacRole === "SUPER_ADMIN" && u.status === "Active");
    if (activeSuperAdmins.length <= 1) {
      return res.status(400).json({ error: "At least one active Super Admin must remain." });
    }
  }
  store.users[idx] = {
    ...target,
    name: name !== void 0 ? String(name).trim() : target.name,
    email: email !== void 0 ? String(email).trim() : target.email,
    phone: phone !== void 0 ? String(phone).trim() : target.phone,
    status: status === "Inactive" ? "Inactive" : status === "Active" ? "Active" : target.status,
    rbacRole: nextRole,
    role: nextRole === "SALES" ? "Sales" : "Admin",
    permissions: permissions ? { ...target.permissions, ...permissions } : target.permissions
  };
  addActivityLog(store, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.rbacRole,
    action: "TEAM_USER_UPDATED",
    target: store.users[idx].username,
    details: `Updated profile/permissions for ${store.users[idx].name} (${store.users[idx].rbacRole}, ${store.users[idx].status})`
  });
  saveServerStore(store);
  res.json({ success: true, user: sanitizeUser(store.users[idx]) });
});
app.post("/api/users/:id/reset-password", (req, res) => {
  const actor = requireAuth(req, res);
  if (!actor) return;
  if (!actor.permissions.manageTeamUsers && actor.rbacRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Permission denied." });
  }
  const { newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }
  const store = loadServerStore();
  const idx = store.users.findIndex((u) => u.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "User not found." });
  store.users[idx].passwordHash = bcrypt2.hashSync(String(newPassword), 10);
  addActivityLog(store, {
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.rbacRole,
    action: "ADMIN_PASSWORD_RESET",
    target: store.users[idx].username,
    details: `Password reset by ${actor.name} for ${store.users[idx].name}`
  });
  saveServerStore(store);
  res.json({ success: true });
});
var inboundEventQueue = [];
app.get("/api/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "navdurga_webhook_secret_2026";
  if (mode === "subscribe" && token === expectedToken) {
    console.log("[Meta Webhook] Successfully verified webhook handshake with Meta Cloud API.");
    return res.status(200).send(challenge);
  }
  console.warn("[Meta Webhook] Invalid verify token or mode received:", token);
  res.sendStatus(403);
});
var processedWamids = /* @__PURE__ */ new Set();
app.post("/api/whatsapp/webhook", (req, res) => {
  try {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const signature = req.headers["x-hub-signature-256"];
    if (appSecret && typeof signature === "string") {
      const expected = "sha256=" + crypto2.createHmac("sha256", appSecret).update(JSON.stringify(req.body)).digest("hex");
      if (signature !== expected) {
        console.warn("[Meta Webhook] Invalid x-hub-signature-256 header.");
        return res.sendStatus(403);
      }
    }
    const body = req.body;
    console.log("[Meta Webhook] Received webhook payload:", JSON.stringify(body).slice(0, 300));
    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const val = change.value;
          if (val && val.messages) {
            for (const msg of val.messages) {
              const msgId = msg.id || `wamid-${Date.now()}`;
              if (processedWamids.has(msgId)) continue;
              processedWamids.add(msgId);
              if (processedWamids.size > 1e3) {
                const first = processedWamids.values().next().value;
                if (first) processedWamids.delete(first);
              }
              const text = msg.text?.body || msg.interactive?.button_reply?.title || msg.caption || "";
              const from = msg.from;
              const contact = val.contacts?.find((c) => c.wa_id === from);
              const senderName = contact?.profile?.name || "WhatsApp Customer";
              const event = {
                id: msgId,
                senderPhone: from ? `+${from}` : "+91 97521 83053",
                senderName,
                messageText: text,
                timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                rawPayload: msg
              };
              inboundEventQueue.push(event);
              if (inboundEventQueue.length > 100) inboundEventQueue.shift();
              console.log(`[Meta Webhook] Inbound message captured from ${senderName} (${from}): "${text}"`);
            }
          }
        }
      }
    }
    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("[Meta Webhook] Error processing incoming payload:", err);
    return res.status(200).json({ status: "error_caught" });
  }
});
app.get("/api/whatsapp/inbound-events", (req, res) => {
  const events = [...inboundEventQueue];
  res.json({ events });
});
app.post("/api/whatsapp/simulate-incoming-reply", (req, res) => {
  const { customerPhone, customerName, messageText } = req.body;
  if (!messageText) {
    return res.status(400).json({ error: "messageText is required" });
  }
  const event = {
    id: `sim-${Date.now()}`,
    senderPhone: customerPhone || "+91 98271 23456",
    senderName: customerName || "ABC Construction",
    messageText,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  inboundEventQueue.push(event);
  if (inboundEventQueue.length > 100) inboundEventQueue.shift();
  res.json({ success: true, event });
});
app.post("/api/whatsapp/send", async (req, res) => {
  const { to, message, customerId, conversationId, senderId, senderName, mediaUrl } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: "Recipient phone (to) and message are required" });
  }
  const cleanPhone = String(to).replace(/[^0-9]/g, "");
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (apiToken && phoneNumberId) {
    try {
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`,
        type: "text",
        text: { body: message }
      };
      const metaRes = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const metaData = await metaRes.json();
      if (metaRes.ok && metaData.messages?.[0]?.id) {
        return res.json({
          success: true,
          mode: "cloud_api",
          messageId: metaData.messages[0].id,
          status: "sent",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        return res.status(400).json({
          success: false,
          mode: "cloud_api",
          error: metaData.error?.message || "Meta Cloud API rejected dispatch",
          status: "failed"
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        mode: "cloud_api",
        error: err?.message || "Network error connecting to Meta WhatsApp Cloud API",
        status: "failed"
      });
    }
  }
  const messageId = `msg-srv-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
  return res.json({
    success: true,
    mode: "manual_intent",
    messageId,
    status: "sent",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    notes: "Message logged and ready for dispatch via WhatsApp Web Intent / Cloud API."
  });
});
app.get("/api/whatsapp/coexistence-status", (req, res) => {
  const hasToken = Boolean(process.env.WHATSAPP_API_TOKEN);
  const hasPhoneId = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const hasWabaId = Boolean(process.env.WHATSAPP_WABA_ID);
  res.json({
    coexistenceSupported: true,
    featureName: "Meta WhatsApp Business App & Cloud API Coexistence",
    description: "Allows your team to keep using the physical WhatsApp Business mobile app on Android/iOS phones while simultaneously managing customer conversations, rates, and broadcasts inside Nav Durga ERP.",
    eligibilityCheck: {
      isBusinessAppNumberCompatible: true,
      graphApiVersion: "v20.0",
      twoStepVerificationPinSupported: true,
      webhookSupported: true
    },
    credentialsConfigured: {
      apiTokenConfigured: hasToken,
      phoneNumberIdConfigured: hasPhoneId,
      wabaIdConfigured: hasWabaId,
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ? "Custom Set" : "Default (navdurga_webhook_secret_2026)"
    },
    coexistenceMode: hasToken && hasPhoneId ? "Active & Synced" : "Ready to Connect",
    recommendation: "When your Meta Cloud API token and Phone Number ID are added to the server environment, incoming mobile messages will stream into the ERP inbox automatically via webhooks without disrupting the phone app."
  });
});
var imageModelCooldownUntil = 0;
var flashModelCooldownUntil = 0;
app.post("/api/ai/generate-graphic", async (req, res) => {
  const { promptText, seed = Date.now(), aspectRatio = "1:1" } = req.body;
  if (!promptText || typeof promptText !== "string") {
    return res.status(400).json({ error: "promptText is required" });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && Date.now() > flashModelCooldownUntil) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const systemInstruction = `
You are an expert art director and advertising copywriter for "Nav Durga Ispat Pvt. Ltd." (Urla Mill, Raipur, Chhattisgarh) specializing in high-impact Indian industrial steel promotional graphics for WhatsApp broadcasts.
Analyze the admin's raw text and output a rich, randomized artistic recipe to generate an Indian steel promotional graphic.
The design must look visually similar to high-converting Indian steel industry posters: bold headlines, gold badges, large price callouts, professional steel product highlights, and official Nav Durga mill credibility.

Output JSON matching this exact schema:
{
  "headline": "Short punchy uppercase headline (max 7 words, e.g. 'FESTIVE RATE DROP ALERT' or 'SPECIAL URLA MILL OFFER')",
  "subheadline": "Compelling secondary tagline (max 12 words)",
  "badge": "Eye-catching ribbon tag (e.g. 'HOT DEAL', 'LIMITED TIME', 'DIRECT EX-PLANT', 'TODAY'S SPECIAL')",
  "price": "Extracted or formatted price string (e.g. '\u20B948,500/MT' or '\u20B9500 OFF / MT' or null if none)",
  "priceLabel": "Label above price (e.g. 'SPECIAL EX-PLANT RATE' or 'FESTIVE DISCOUNT')",
  "products": [
    { "name": "MS Channel 125x65", "tag": "In Stock" },
    { "name": "MS Angle 50x50", "tag": "Prime" }
  ],
  "features": [
    "Direct Rolling Mill Supply (Urla Mill)",
    "Immediate Trailer Loading",
    "IS 2062 Prime Tested Steel",
    "Ex-Plant Raipur Delivery"
  ],
  "cta": "BOOK ON WHATSAPP: +91 97521 83053",
  "layoutStyle": "diagonal_power | center_gold_seal | bold_split_poster | industrial_bento | dynamic_speed_angles | executive_steel_sheet | radiant_burst_deal | heavy_structural_grid",
  "colorPaletteName": "Imperial Navy & Molten Gold | Blast Furnace Molten Ember | High-Tech Industrial Cyan & Cobalt | Indian Emerald & Royal Gold | Midnight Onyx & Polished Steel | Royal Purple & Cyber Yellow",
  "backgroundDecor": "particles_molten | hex_mesh_steel | radial_sunburst | diagonal_slashes | blueprint_cad | layered_slabs | sparks_and_flares",
  "decorations": {
    "hasGoldSeal": true,
    "hasUrlaBadge": true,
    "hasPrimeQualityShield": true,
    "hasRibbon": true,
    "hasSparks": true,
    "hasCornerTechBrackets": true
  }
}
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `Create a unique, high-converting steel promotional graphic recipe for this text:

"${promptText}"

Random seed: ${seed}` }]
          }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.85
        }
      });
      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch (err) {
      const msg = String(err?.message || err || "");
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        flashModelCooldownUntil = Date.now() + 6e4;
      }
      return res.json({
        isProceduralFallback: true
      });
    }
  }
  res.json({ isProceduralFallback: true });
});
app.post("/api/ai/nano-banana-post", async (req, res) => {
  const {
    prompt,
    postType,
    festivalName,
    language = "English",
    seed = Date.now(),
    aspectRatio = "4:5",
    includePricing = true
  } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    if (Date.now() > imageModelCooldownUntil) {
      try {
        const supportedAspect = aspectRatio === "1:1" || aspectRatio === "3:4" || aspectRatio === "4:3" || aspectRatio === "9:16" || aspectRatio === "16:9" ? aspectRatio : "3:4";
        const logoPath = path2.resolve(__dirname, "public/assets/nav_durga_logo.png");
        const contentsParts = [];
        if (fs2.existsSync(logoPath)) {
          try {
            const logoData = fs2.readFileSync(logoPath).toString("base64");
            contentsParts.push({
              inlineData: {
                mimeType: "image/png",
                data: logoData
              }
            });
          } catch (e) {
            console.warn("Could not read master logo image:", e);
          }
        }
        const fullPromptText = `You are a senior advertising art director creating a premium, original festival and corporate steel marketing campaign for "NAV DURGA ISPAT PRIVATE LIMITED" (Raipur Mill, Chhattisgarh, India).

FESTIVAL / THEME: ${festivalName || "Industrial Steel Excellence"}
LANGUAGE: ${language}
ASPECT RATIO: ${aspectRatio} (${aspectRatio === "1:1" ? "1080x1080 Square" : "1080x1350 Portrait"})
VARIATION SEED: ${seed}

BRAND INFORMATION:
- Company Name: NAV DURGA ISPAT PRIVATE LIMITED
- Logo: Place the supplied official Nav Durga Group logo clearly, sharply, and elegantly in a prominent position (top corner or top center). Do not distort, alter, recolor, or generate a fake replacement logo.

CREATIVE INSTRUCTIONS:
1. Create a completely NEW original visual creative from scratch. Do not copy, recolor, or reuse previous compositions.
2. Render an authentic, culturally rich visual atmosphere for ${festivalName || "Steel Industry"}:
   - Diwali: Elegant warm festive atmosphere, golden diyas, glowing oil lamps, soft fireworks, opulent gold accents.
   - Ganesh Chaturthi: Traditional Lord Ganesha emblem, floral garlands, modak, saffron/amber celebration.
   - Navratri: Garba/dandiya traditional motifs, Maa Durga strength, vibrant warm festive energy.
   - Holi: Sophisticated color powder bursts, vibrant energy, premium celebration.
   - Independence Day / Republic Day: Indian national tricolor (Saffron, White, Emerald Green), patriotic corporate style.
   - Makar Sankranti: Radiant sunrise, kites, soaring sky, warm Indian festival atmosphere.
   - Christmas / New Year: Festive celebration lights, stars, milestone prosperity.
   - Custom Festivals: Intelligently render authentic visual identity and cultural significance for ${festivalName || "Steel Industry"}.
3. INDUSTRIAL INTEGRATION:
   - Combine the festival theme seamlessly with Nav Durga's steel manufacturing identity.
   - Integrate subtle structural steel sections (MS Channels, Angles, Beams, or rolling mill environment) into the background or architectural framing.
   - The festival theme remains visually dominant while the steel/industrial identity is clear and authoritative.
4. TEXT & MESSAGING:
   - Keep text short, elegant, premium, and readable in ${language}.
   - Primary Headline: "HAPPY ${(festivalName || "FESTIVAL").toUpperCase()}"
   - Festive Message: "Wishing you prosperity, strength, and divine success."
   - Company Name: "NAV DURGA ISPAT PRIVATE LIMITED"
   - ${includePricing ? "Include current verified ERP pricing clearly if provided." : "Focus purely on brand & festival celebration (no pricing clutter)."}

${prompt}

CRITICAL: Create a brand new original image. Make the visual storytelling strongly match ${festivalName || "Steel Industry"}. Create a premium corporate marketing creative. Do not use a generic template.`;
        contentsParts.push({
          text: fullPromptText
        });
        const imageResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: contentsParts
          },
          config: {
            imageConfig: {
              aspectRatio: supportedAspect
            }
          }
        });
        let base64Image = null;
        let mimeType = "image/png";
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            base64Image = part.inlineData.data;
            mimeType = part.inlineData.mimeType || "image/png";
            break;
          }
        }
        if (base64Image) {
          return res.json({
            success: true,
            modelUsed: "gemini-3.1-flash-lite-image",
            aiImageDataUrl: `data:${mimeType};base64,${base64Image}`,
            seed,
            postType
          });
        }
      } catch (imgErr) {
        const errStr = String(imgErr?.message || imgErr || "");
        if (errStr.includes("limit: 0")) {
          imageModelCooldownUntil = Date.now() + 30 * 6e4;
        } else if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
          imageModelCooldownUntil = Date.now() + 6e4;
        }
      }
    }
    if (Date.now() > flashModelCooldownUntil) {
      try {
        const styleResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are the Gemini AI Visual Director for NAV DURGA ISPAT PRIVATE LIMITED (Raipur, Chhattisgarh).
Given this ERP festival post request (Festival: ${festivalName || "Industrial Steel"}, Post Type: ${postType}, Language: ${language}, Seed: ${seed}):
"${prompt}"

Generate a fresh, distinctive visual variation configuration in JSON with:
{
  "variationName": "Creative theme name (e.g. 'Molten Gold Diwali Executive', 'Royal Cobalt Ganesh Structural', 'Crimson Forge Industrial', 'Emerald Prime Patriotic')",
  "tagline": "Short authoritative steel manufacturing tagline in ${language} (max 10 words)",
  "badgeText": "Short uppercase badge (e.g. 'OFFICIAL MILL RATE', 'EX-WORKS RAIPUR', 'PRIME IS:2062 STEEL')",
  "colorScheme": "royal_navy | molten_amber | crimson_forge | emerald_industrial | titanium_slate | imperial_maroon | deep_cobalt | festive_saffron"
}`
                }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0.9
          }
        });
        const text = styleResponse.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            success: true,
            modelUsed: "gemini-3.8-flash-director",
            styleConfig: parsed,
            seed,
            postType
          });
        }
      } catch (dirErr) {
        const errStr = String(dirErr?.message || dirErr || "");
        if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
          flashModelCooldownUntil = Date.now() + 6e4;
        }
      }
    }
  }
  return res.json({
    success: true,
    modelUsed: "gemini-ai-studio-engine",
    seed,
    postType
  });
});
app.post("/api/assistant/chat", async (req, res) => {
  const { message, conversationHistory = [], context = {} } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const systemInstruction = `
You are the dedicated AI Assistant for "Nav Durga Business ERP" (Nav Durga Ispat Pvt. Ltd. & Unit-2 NS Ispat (I) Pvt. Ltd., Raipur, Chhattisgarh).
You help authorized industrial ERP users manage steel product rates, generate WhatsApp daily price cards, compare historical prices, and query ERP records.
Support both English and Hinglish (e.g., "Aaj aur kal ke rate mein kya difference hai?", "Medium section ka rate 57000 kar do").

ERP Context:
- Company 1: NAVDURGA ISPAT PVT. LTD. (Category: MEDIUM SECTION)
- Company 2: UNIT-2 - NS ISPAT (I) PVT. LTD. (Category: LIGHT SECTION)
- Key Product Categories: MS Angle, MS Channel, MS Beam / Joist, MS Flat, Round Bar
- Grades / Gauges: Medium, SL (Super Light), 5 KG, 8 KG
- Core Pricing Formula: FINAL RATE = BASIC RATE + GAUGE DIFFERENCE
- Current Category Basic Rates: ${JSON.stringify(context.categoryBasicRates || { "MEDIUM SECTION": 49711, "LIGHT SECTION": 42211 })}

Commands to detect and structure:
1. Rate Update:
   When user asks to update rates (e.g. "Update Medium all products to 56922", "Medium section ko 56922 kar do", "Update Light section to 42500"):
   Set intent: "rate_update_proposal"
   Extract:
   - "section": "MEDIUM SECTION" or "LIGHT SECTION"
   - "proposedRate": number (e.g. 56922)
   In your reply, explain the proposed change clearly, stating affected section and rate, and inform the user that an itemized confirmation card is presented below for approval before any changes are saved to the ERP.

2. Price Post Generation:
   When user asks to create or generate a price post/graphic/image (e.g. "Create a price update post for Medium", "Medium ka rate 600 rupees increase hua hai, post banao", "Create today's Medium and SL price update post", "Generate a price post using the latest updated rates", "Create a WhatsApp price update image for all products", "Create a post showing a \u20B9600/MT increase"):
   Set intent: "price_post_generator"
   Extract:
   - "section": "MEDIUM SECTION" | "SL SECTION" | "MEDIUM & SL" | "ALL" | null (if user did not specify any section)
   - "priceDelta": number (e.g. 600) or 0 if using latest existing approved rates
   - "direction": "increase" | "decrease" | "set"
   If user did NOT specify a section, politely ask which section they want (Medium, SL / Super Light, Combined, or All Products).
   In your reply, explain that the high-resolution price post graphic has been generated with approved ERP rates and 7 enterprise steel themes.

3. Rate Comparison:
   When user asks for rate differences or comparisons (e.g. "Aaj aur kal ke rate mein kya difference hai?", "Compare today's and yesterday's rates", "Compare Medium and SL prices", "Show price changes for the last 7 days"):
   Set intent: "rate_comparison"
   In your reply, summarize the key rate movements, benchmarks, and market observations.

4. WhatsApp Customer Order & Enquiry:
   When user provides or asks about an incoming customer WhatsApp message (e.g. "125x65 ka rate kya hai?", "MS Channel 125x65 Medium 20 MT chahiye", "125x65 channel 20 ton bhejna hai", "100x50 channel ka bhav kya hai?"):
   Set intent: "whatsapp_order_enquiry"
   Extract product, size (e.g. 125x65), section/grade (Medium, SL, Light, 5 KG, 8 KG), and requested quantity in MT.
   If section/grade is not specified and ambiguous (e.g. 125x65 has Medium and SL), politely request confirmation.
   Provide the exact approved rate using the formula: Final Rate = Basic Rate + Gauge Difference. Never invent a rate.

5. Query Products / Customer / General:
   Set intent: "query_products", "query_customers", or "general_chat".

Always respond in JSON format matching this schema:
{
  "reply": "string (formatted markdown explanation in polite English or Hinglish)",
  "intent": "rate_update_proposal | price_post_generator | rate_comparison | whatsapp_order_enquiry | query_products | query_customers | general_chat",
  "section": "MEDIUM SECTION | SL SECTION | MEDIUM & SL | ALL | null",
  "proposedRate": number or null,
  "priceDelta": number or null,
  "direction": "increase | decrease | set | null"
}
`;
      const contents = [
        ...conversationHistory.map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }]
        })),
        {
          role: "user",
          parts: [{ text: message }]
        }
      ];
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      const responseText = response.text;
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        } catch {
          return res.json({
            reply: responseText,
            intent: "general_chat"
          });
        }
      }
    } catch (err) {
      const msg = String(err?.message || err || "");
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        flashModelCooldownUntil = Date.now() + 6e4;
      }
      return res.json({
        reply: `Received your command: "${message}". Processing using Nav Durga ERP core engine...`,
        intent: "general_chat"
      });
    }
  }
  res.json({
    reply: `Received your command: "${message}". Processing using Nav Durga ERP core engine...`,
    intent: "general_chat"
  });
});
async function start() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path2.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path2.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nav Durga Business ERP server active on http://0.0.0.0:${PORT}`);
  });
}
start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
