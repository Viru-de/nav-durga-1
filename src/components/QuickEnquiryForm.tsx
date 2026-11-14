import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { PublicRateProductItem, SalesEnquiry } from '../types';
import { PlatformApi } from '../services/platformApi';

interface QuickEnquiryFormProps {
  products: PublicRateProductItem[];
  contactWhatsapp?: string;
  presetProductId?: string;
  presetProductName?: string;
  compact?: boolean;
  onEnquirySubmitted?: (enquiry: SalesEnquiry) => void;
}

const CUSTOM_PRODUCT_OPTION = '__CUSTOM__';

export const QuickEnquiryForm: React.FC<QuickEnquiryFormProps> = ({
  products,
  contactWhatsapp = '919752183053',
  presetProductId,
  presetProductName,
  compact = false,
  onEnquirySubmitted,
}) => {
  const uniqueProductNames = useMemo(() => {
    const names = new Set<string>();
    products.forEach((p) => {
      if (p.name) names.add(p.name);
    });
    return Array.from(names);
  }, [products]);

  const initialProductMatch = useMemo(() => {
    if (presetProductId) {
      const byId = products.find((p) => p.id === presetProductId);
      if (byId) return byId;
    }
    if (presetProductName) {
      const byName = products.find(
        (p) => p.name.toLowerCase() === presetProductName.toLowerCase()
      );
      if (byName) return byName;
    }
    return products[0] || null;
  }, [products, presetProductId, presetProductName]);

  const [selectedProductName, setSelectedProductName] = useState<string>(
    initialProductMatch?.name || (uniqueProductNames[0] ?? CUSTOM_PRODUCT_OPTION)
  );
  const [selectedSpecId, setSelectedSpecId] = useState<string>(
    initialProductMatch?.id || ''
  );
  const [customProductText, setCustomProductText] = useState<string>('');
  const [customSizeText, setCustomSizeText] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('25');
  const [unit, setUnit] = useState<'MT' | 'Kg' | 'Piece' | 'Bundle'>('MT');
  const [name, setName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEnquiry, setSuccessEnquiry] = useState<SalesEnquiry | null>(null);

  const specsForSelectedProduct = useMemo(() => {
    if (selectedProductName === CUSTOM_PRODUCT_OPTION) return [];
    return products.filter((p) => p.name === selectedProductName);
  }, [products, selectedProductName]);

  useEffect(() => {
    if (products.length > 0 && selectedProductName === CUSTOM_PRODUCT_OPTION && !customProductText) {
      const first = initialProductMatch || products[0];
      setSelectedProductName(first.name);
      setSelectedSpecId(first.id);
    }
  }, [products, initialProductMatch, selectedProductName, customProductText]);

  useEffect(() => {
    if (selectedProductName === CUSTOM_PRODUCT_OPTION) {
      setSelectedSpecId('');
      return;
    }
    const matching = products.filter((p) => p.name === selectedProductName);
    if (matching.length > 0 && !matching.some((m) => m.id === selectedSpecId)) {
      setSelectedSpecId(matching[0].id);
    }
  }, [selectedProductName, products, selectedSpecId]);

  const activeErpSpec = useMemo(
    () => products.find((p) => p.id === selectedSpecId) || null,
    [products, selectedSpecId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const digits = cleanPhone.replace(/\D/g, '');
    const cleanEmail = email.trim();
    const parsedQty = Number(quantity);

    if (cleanName.length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (digits.length < 10 || digits.length > 15) {
      setError('Please enter a valid 10-digit mobile or WhatsApp number.');
      return;
    }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address or leave email blank.');
      return;
    }
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    const isCustom = selectedProductName === CUSTOM_PRODUCT_OPTION;
    const chosenProductName = isCustom
      ? customProductText.trim() || 'Custom Structural Steel Enquiry'
      : activeErpSpec?.name || selectedProductName;
    const chosenSize = isCustom
      ? customSizeText.trim()
      : activeErpSpec?.size || customSizeText.trim();
    const chosenGrade = isCustom
      ? 'Standard'
      : activeErpSpec?.grade || 'Medium / Standard';

    setSubmitting(true);
    try {
      const res = await PlatformApi.submitPublicEnquiry({
        name: cleanName,
        companyName: companyName.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        city: city.trim(),
        productId: isCustom ? undefined : activeErpSpec?.id,
        product: chosenProductName,
        size: chosenSize,
        grade: chosenGrade,
        quantity: parsedQty,
        unit,
        notes: notes.trim(),
      });
      setSuccessEnquiry(res.enquiry);
      onEnquirySubmitted?.(res.enquiry);
      setName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setCity('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const waDigits = contactWhatsapp.replace(/\D/g, '');
  const waHref = `https://wa.me/${waDigits.startsWith('91') ? waDigits : `91${waDigits}`}?text=${encodeURIComponent(
    successEnquiry
      ? `Hello Nav Durga Ispat Sales Team, I submitted enquiry ${successEnquiry.enquiryNumber} for ${successEnquiry.product}${successEnquiry.size ? ` (${successEnquiry.size})` : ''}, Quantity: ${successEnquiry.quantity} ${successEnquiry.unit}. Please share rate confirmation.`
      : `Hello Nav Durga Ispat Sales Team, I would like to enquire about ${activeErpSpec ? `${activeErpSpec.name} (${activeErpSpec.size})` : 'structural steel products'} (${quantity} ${unit}).`
  )}`;

  return (
    <div className="space-y-4">
      {successEnquiry && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-sm">
                Enquiry Recorded — Ref: {successEnquiry.enquiryNumber}
              </div>
              <p className="text-emerald-900 mt-0.5 leading-relaxed">
                Your requirement for{' '}
                <span className="font-bold">
                  {successEnquiry.product}
                  {successEnquiry.size ? ` (${successEnquiry.size})` : ''} — {successEnquiry.quantity}{' '}
                  {successEnquiry.unit}
                </span>{' '}
                has been saved directly in Nav Durga Ispat ERP for our commercial sales desk.
              </p>
            </div>
          </div>
          <div className="pl-7 flex flex-wrap items-center gap-2.5">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Share Ref on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-950"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Row 1: ERP Product + Size/Specification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="qe-product"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              Select Steel Product *
            </label>
            <select
              id="qe-product"
              value={selectedProductName}
              onChange={(e) => setSelectedProductName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
            >
              {uniqueProductNames.map((prodName) => (
                <option key={prodName} value={prodName}>
                  {prodName}
                </option>
              ))}
              <option value={CUSTOM_PRODUCT_OPTION}>
                Custom / Other Steel Requirement
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="qe-spec"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              Size / Specification *
            </label>
            {selectedProductName !== CUSTOM_PRODUCT_OPTION && specsForSelectedProduct.length > 0 ? (
              <select
                id="qe-spec"
                value={selectedSpecId}
                onChange={(e) => setSelectedSpecId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
              >
                {specsForSelectedProduct.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.size || 'Standard'} ({spec.grade}) — {spec.section === 'LIGHT SECTION' ? 'Light' : 'Medium'}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="qe-spec"
                type="text"
                value={customSizeText}
                onChange={(e) => setCustomSizeText(e.target.value)}
                placeholder="e.g. 100 x 50 mm / Standard Spec"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
              />
            )}
          </div>
        </div>

        {selectedProductName === CUSTOM_PRODUCT_OPTION && (
          <div>
            <label
              htmlFor="qe-custom-product"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              Specify Steel Product Name *
            </label>
            <input
              id="qe-custom-product"
              type="text"
              value={customProductText}
              onChange={(e) => setCustomProductText(e.target.value)}
              placeholder="e.g. MS Channel / Structural Beam / MS Angle"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
            />
          </div>
        )}

        {/* Row 2: Quantity + Unit + Delivery City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label
              htmlFor="qe-qty"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              Quantity *
            </label>
            <input
              id="qe-qty"
              type="number"
              min="0.1"
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186] tabular-nums"
            />
          </div>

          <div>
            <label
              htmlFor="qe-unit"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              Unit
            </label>
            <select
              id="qe-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'MT' | 'Kg' | 'Piece' | 'Bundle')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
            >
              <option value="MT">MT (Metric Ton)</option>
              <option value="Kg">Kg</option>
              <option value="Piece">Piece</option>
              <option value="Bundle">Bundle</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="qe-city"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              City / Delivery Location
            </label>
            <input
              id="qe-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Raipur / Bilaspur"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
            />
          </div>
        </div>

        {/* Row 3: Name, Mobile, Company, Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="qe-name"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              Your Full Name *
            </label>
            <input
              id="qe-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Suresh Agrawal"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
            />
          </div>

          <div>
            <label
              htmlFor="qe-phone"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              Mobile / WhatsApp Number *
            </label>
            <input
              id="qe-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98XXX XXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
            />
          </div>

          <div>
            <label
              htmlFor="qe-company"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              Company / Firm Name
            </label>
            <input
              id="qe-company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Optional business name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
            />
          </div>

          <div>
            <label
              htmlFor="qe-email"
              className="block text-xs font-bold text-[#263442] mb-1"
            >
              Email Address (Optional)
            </label>
            <input
              id="qe-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="buyer@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="qe-notes"
            className="block text-xs font-bold text-[#263442] mb-1"
          >
            Message / Length &amp; Delivery Notes
          </label>
          <textarea
            id="qe-notes"
            rows={compact ? 2 : 3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mention preferred lengths, dispatch timeline, or additional sizes..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7CED6] bg-white text-sm text-[#263442] outline-none focus:ring-2 focus:ring-[#105186]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#105186] hover:bg-[#0B3A60] disabled:opacity-60 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting Enquiry...' : 'Submit Quick Enquiry'}</span>
          </button>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enquire on WhatsApp</span>
          </a>
        </div>
      </form>
    </div>
  );
};
