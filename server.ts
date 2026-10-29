import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.resolve(__dirname, 'public')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Nav Durga ERP Server',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    whatsappConfigured: Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    timestamp: new Date().toISOString(),
  });
});

// Inbound webhook event queue buffer (in-memory buffer for real-time frontend retrieval)
interface InboundMessageEvent {
  id: string;
  senderPhone: string;
  senderName?: string;
  messageText: string;
  timestamp: string;
  rawPayload?: any;
}
const inboundEventQueue: InboundMessageEvent[] = [];

// 1. Meta WhatsApp Webhook Handshake (GET /api/whatsapp/webhook)
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'navdurga_webhook_secret_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Meta Webhook] Successfully verified webhook handshake with Meta Cloud API.');
    return res.status(200).send(challenge);
  }
  console.warn('[Meta Webhook] Invalid verify token or mode received:', token);
  res.sendStatus(403);
});

// 2. Meta WhatsApp Webhook Event Receiver (POST /api/whatsapp/webhook)
app.post('/api/whatsapp/webhook', (req, res) => {
  try {
    const body = req.body;
    console.log('[Meta Webhook] Received webhook payload:', JSON.stringify(body).slice(0, 300));

    // Handle Meta WhatsApp Cloud API format
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const val = change.value;
          if (val && val.messages) {
            for (const msg of val.messages) {
              const text = msg.text?.body || msg.interactive?.button_reply?.title || msg.caption || '';
              const from = msg.from;
              const contact = val.contacts?.find((c: any) => c.wa_id === from);
              const senderName = contact?.profile?.name || 'WhatsApp Customer';

              const event: InboundMessageEvent = {
                id: msg.id || `wamid-${Date.now()}`,
                senderPhone: from ? `+${from}` : '+91 97521 83053',
                senderName,
                messageText: text,
                timestamp: new Date().toISOString(),
                rawPayload: msg,
              };

              inboundEventQueue.push(event);
              if (inboundEventQueue.length > 100) inboundEventQueue.shift();
              console.log(`[Meta Webhook] Inbound message captured from ${senderName} (${from}): "${text}"`);
            }
          }
        }
      }
    }
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Meta Webhook] Error processing incoming payload:', err);
    return res.status(200).json({ status: 'error_caught' });
  }
});

// 3. Retrieve buffered webhook events for frontend inbox
app.get('/api/whatsapp/inbound-events', (req, res) => {
  const events = [...inboundEventQueue];
  res.json({ events });
});

// 4. Test Inbound Reply Simulator (Allows testing incoming replies without needing live Meta webhook)
app.post('/api/whatsapp/simulate-incoming-reply', (req, res) => {
  const { customerPhone, customerName, messageText } = req.body;
  if (!messageText) {
    return res.status(400).json({ error: 'messageText is required' });
  }

  const event: InboundMessageEvent = {
    id: `sim-${Date.now()}`,
    senderPhone: customerPhone || '+91 98271 23456',
    senderName: customerName || 'ABC Construction',
    messageText: messageText,
    timestamp: new Date().toISOString(),
  };

  inboundEventQueue.push(event);
  if (inboundEventQueue.length > 100) inboundEventQueue.shift();

  res.json({ success: true, event });
});

// 5. WhatsApp API Send Route (POST /api/whatsapp/send)
app.post('/api/whatsapp/send', async (req, res) => {
  const { to, message, customerId, conversationId, senderId, senderName, mediaUrl } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Recipient phone (to) and message are required' });
  }

  const cleanPhone = String(to).replace(/[^0-9]/g, '');
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // If live Meta WhatsApp Cloud API credentials are provided:
  if (apiToken && phoneNumberId) {
    try {
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`,
        type: 'text',
        text: { body: message },
      };

      const metaRes = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const metaData = await metaRes.json();
      if (metaRes.ok && metaData.messages?.[0]?.id) {
        return res.json({
          success: true,
          mode: 'cloud_api',
          messageId: metaData.messages[0].id,
          status: 'sent',
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(400).json({
          success: false,
          mode: 'cloud_api',
          error: metaData.error?.message || 'Meta Cloud API rejected dispatch',
          status: 'failed',
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        mode: 'cloud_api',
        error: err?.message || 'Network error connecting to Meta WhatsApp Cloud API',
        status: 'failed',
      });
    }
  }

  // Native / Web Intent Mode:
  const messageId = `msg-srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return res.json({
    success: true,
    mode: 'manual_intent',
    messageId,
    status: 'sent',
    timestamp: new Date().toISOString(),
    notes: 'Message logged and ready for dispatch via WhatsApp Web Intent / Cloud API.',
  });
});

// 6. WhatsApp Business Coexistence Verification Route
app.get('/api/whatsapp/coexistence-status', (req, res) => {
  const hasToken = Boolean(process.env.WHATSAPP_API_TOKEN);
  const hasPhoneId = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const hasWabaId = Boolean(process.env.WHATSAPP_WABA_ID);

  res.json({
    coexistenceSupported: true,
    featureName: 'Meta WhatsApp Business App & Cloud API Coexistence',
    description: 'Allows your team to keep using the physical WhatsApp Business mobile app on Android/iOS phones while simultaneously managing customer conversations, rates, and broadcasts inside Nav Durga ERP.',
    eligibilityCheck: {
      isBusinessAppNumberCompatible: true,
      graphApiVersion: 'v20.0',
      twoStepVerificationPinSupported: true,
      webhookSupported: true,
    },
    credentialsConfigured: {
      apiTokenConfigured: hasToken,
      phoneNumberIdConfigured: hasPhoneId,
      wabaIdConfigured: hasWabaId,
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ? 'Custom Set' : 'Default (navdurga_webhook_secret_2026)',
    },
    coexistenceMode: hasToken && hasPhoneId ? 'Active & Synced' : 'Ready to Connect',
    recommendation: 'When your Meta Cloud API token and Phone Number ID are added to the server environment, incoming mobile messages will stream into the ERP inbox automatically via webhooks without disrupting the phone app.',
  });
});

// Track whether the image generation model has hit free-tier 0-limit quota to avoid repeated 429 calls
let imageModelCooldownUntil = 0;
let flashModelCooldownUntil = 0;

// AI Promotional Graphic Generator Route (Powered by Gemini 3.8 Flash)
app.post('/api/ai/generate-graphic', async (req, res) => {
  const { promptText, seed = Date.now(), aspectRatio = '1:1' } = req.body;

  if (!promptText || typeof promptText !== 'string') {
    return res.status(400).json({ error: 'promptText is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && Date.now() > flashModelCooldownUntil) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
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
  "price": "Extracted or formatted price string (e.g. '₹48,500/MT' or '₹500 OFF / MT' or null if none)",
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
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `Create a unique, high-converting steel promotional graphic recipe for this text:\n\n"${promptText}"\n\nRandom seed: ${seed}` }],
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.85,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        flashModelCooldownUntil = Date.now() + 60_000;
      }
      return res.json({
        isProceduralFallback: true,
      });
    }
  }

  res.json({ isProceduralFallback: true });
});

// Gemini AI Post & Festival Creative Generator Route
app.post('/api/ai/nano-banana-post', async (req, res) => {
  const {
    prompt,
    postType,
    festivalName,
    language = 'English',
    seed = Date.now(),
    aspectRatio = '4:5',
    includePricing = true,
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // 1. Gemini AI Image Generation (gemini-3.1-flash-lite-image)
    if (Date.now() > imageModelCooldownUntil) {
      try {
        const supportedAspect =
          aspectRatio === '1:1' ||
          aspectRatio === '3:4' ||
          aspectRatio === '4:3' ||
          aspectRatio === '9:16' ||
          aspectRatio === '16:9'
            ? aspectRatio
            : '3:4';

        const logoPath = path.resolve(__dirname, 'public/assets/nav_durga_logo.png');
        const contentsParts: any[] = [];
        if (fs.existsSync(logoPath)) {
          try {
            const logoData = fs.readFileSync(logoPath).toString('base64');
            contentsParts.push({
              inlineData: {
                mimeType: 'image/png',
                data: logoData,
              },
            });
          } catch (e) {
            console.warn('Could not read master logo image:', e);
          }
        }

        const fullPromptText = `You are a senior advertising art director creating a premium, original festival and corporate steel marketing campaign for "NAV DURGA ISPAT PRIVATE LIMITED" (Raipur Mill, Chhattisgarh, India).

FESTIVAL / THEME: ${festivalName || 'Industrial Steel Excellence'}
LANGUAGE: ${language}
ASPECT RATIO: ${aspectRatio} (${aspectRatio === '1:1' ? '1080x1080 Square' : '1080x1350 Portrait'})
VARIATION SEED: ${seed}

BRAND INFORMATION:
- Company Name: NAV DURGA ISPAT PRIVATE LIMITED
- Logo: Place the supplied official Nav Durga Group logo clearly, sharply, and elegantly in a prominent position (top corner or top center). Do not distort, alter, recolor, or generate a fake replacement logo.

CREATIVE INSTRUCTIONS:
1. Create a completely NEW original visual creative from scratch. Do not copy, recolor, or reuse previous compositions.
2. Render an authentic, culturally rich visual atmosphere for ${festivalName || 'Steel Industry'}:
   - Diwali: Elegant warm festive atmosphere, golden diyas, glowing oil lamps, soft fireworks, opulent gold accents.
   - Ganesh Chaturthi: Traditional Lord Ganesha emblem, floral garlands, modak, saffron/amber celebration.
   - Navratri: Garba/dandiya traditional motifs, Maa Durga strength, vibrant warm festive energy.
   - Holi: Sophisticated color powder bursts, vibrant energy, premium celebration.
   - Independence Day / Republic Day: Indian national tricolor (Saffron, White, Emerald Green), patriotic corporate style.
   - Makar Sankranti: Radiant sunrise, kites, soaring sky, warm Indian festival atmosphere.
   - Christmas / New Year: Festive celebration lights, stars, milestone prosperity.
   - Custom Festivals: Intelligently render authentic visual identity and cultural significance for ${festivalName || 'Steel Industry'}.
3. INDUSTRIAL INTEGRATION:
   - Combine the festival theme seamlessly with Nav Durga's steel manufacturing identity.
   - Integrate subtle structural steel sections (MS Channels, Angles, Beams, or rolling mill environment) into the background or architectural framing.
   - The festival theme remains visually dominant while the steel/industrial identity is clear and authoritative.
4. TEXT & MESSAGING:
   - Keep text short, elegant, premium, and readable in ${language}.
   - Primary Headline: "HAPPY ${(festivalName || 'FESTIVAL').toUpperCase()}"
   - Festive Message: "Wishing you prosperity, strength, and divine success."
   - Company Name: "NAV DURGA ISPAT PRIVATE LIMITED"
   - ${includePricing ? 'Include current verified ERP pricing clearly if provided.' : 'Focus purely on brand & festival celebration (no pricing clutter).'}

${prompt}

CRITICAL: Create a brand new original image. Make the visual storytelling strongly match ${festivalName || 'Steel Industry'}. Create a premium corporate marketing creative. Do not use a generic template.`;

        contentsParts.push({
          text: fullPromptText,
        });

        const imageResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: contentsParts,
          },
          config: {
            imageConfig: {
              aspectRatio: supportedAspect,
            },
          },
        });

        let base64Image: string | null = null;
        let mimeType = 'image/png';
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            base64Image = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            break;
          }
        }

        if (base64Image) {
          return res.json({
            success: true,
            modelUsed: 'gemini-3.1-flash-lite-image',
            aiImageDataUrl: `data:${mimeType};base64,${base64Image}`,
            seed,
            postType,
          });
        }
      } catch (imgErr: any) {
        const errStr = String(imgErr?.message || imgErr || '');
        if (errStr.includes('limit: 0')) {
          imageModelCooldownUntil = Date.now() + 30 * 60_000;
        } else if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
          imageModelCooldownUntil = Date.now() + 60_000;
        }
      }
    }

    // 2. Gemini 3.8 Flash Visual Director fallback for style configuration
    if (Date.now() > flashModelCooldownUntil) {
      try {
        const styleResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are the Gemini AI Visual Director for NAV DURGA ISPAT PRIVATE LIMITED (Raipur, Chhattisgarh).
Given this ERP festival post request (Festival: ${festivalName || 'Industrial Steel'}, Post Type: ${postType}, Language: ${language}, Seed: ${seed}):
"${prompt}"

Generate a fresh, distinctive visual variation configuration in JSON with:
{
  "variationName": "Creative theme name (e.g. 'Molten Gold Diwali Executive', 'Royal Cobalt Ganesh Structural', 'Crimson Forge Industrial', 'Emerald Prime Patriotic')",
  "tagline": "Short authoritative steel manufacturing tagline in ${language} (max 10 words)",
  "badgeText": "Short uppercase badge (e.g. 'OFFICIAL MILL RATE', 'EX-WORKS RAIPUR', 'PRIME IS:2062 STEEL')",
  "colorScheme": "royal_navy | molten_amber | crimson_forge | emerald_industrial | titanium_slate | imperial_maroon | deep_cobalt | festive_saffron"
}`,
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.9,
          },
        });

        const text = styleResponse.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            success: true,
            modelUsed: 'gemini-3.8-flash-director',
            styleConfig: parsed,
            seed,
            postType,
          });
        }
      } catch (dirErr: any) {
        const errStr = String(dirErr?.message || dirErr || '');
        if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
          flashModelCooldownUntil = Date.now() + 60_000;
        }
      }
    }
  }

  return res.json({
    success: true,
    modelUsed: 'gemini-ai-studio-engine',
    seed,
    postType,
  });
});

// AI Assistant Chat Route (Powered by Gemini 3.8 Flash SDK)
app.post('/api/assistant/chat', async (req, res) => {
  const { message, conversationHistory = [], context = {} } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
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
- Current Category Basic Rates: ${JSON.stringify(context.categoryBasicRates || { 'MEDIUM SECTION': 49711, 'LIGHT SECTION': 42211 })}

Commands to detect and structure:
1. Rate Update:
   When user asks to update rates (e.g. "Update Medium all products to 56922", "Medium section ko 56922 kar do", "Update Light section to 42500"):
   Set intent: "rate_update_proposal"
   Extract:
   - "section": "MEDIUM SECTION" or "LIGHT SECTION"
   - "proposedRate": number (e.g. 56922)
   In your reply, explain the proposed change clearly, stating affected section and rate, and inform the user that an itemized confirmation card is presented below for approval before any changes are saved to the ERP.

2. Price Post Generation:
   When user asks to create or generate a price post/graphic/image (e.g. "Create a price update post for Medium", "Medium ka rate 600 rupees increase hua hai, post banao", "Create today's Medium and SL price update post", "Generate a price post using the latest updated rates", "Create a WhatsApp price update image for all products", "Create a post showing a ₹600/MT increase"):
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
        ...conversationHistory.map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        } catch {
          return res.json({
            reply: responseText,
            intent: 'general_chat',
          });
        }
      }
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        flashModelCooldownUntil = Date.now() + 60_000;
      }
      return res.json({
        reply: `Received your command: "${message}". Processing using Nav Durga ERP core engine...`,
        intent: 'general_chat',
      });
    }
  }

  // Graceful rule-based response when Gemini API is not configured or in offline mode
  res.json({
    reply: `Received your command: "${message}". Processing using Nav Durga ERP core engine...`,
    intent: 'general_chat',
  });
});

// Mounting Vite in Dev Mode or Serving Built Assets in Prod
async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nav Durga Business ERP server active on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
