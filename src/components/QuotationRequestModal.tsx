import React, { useState, useEffect, useMemo } from 'react';
import { X, Send, CheckCircle2, MessageSquare, Building2, Package } from 'lucide-react';
import { PlatformApi } from '../services/platformApi';
import { PublicRateProductItem, SalesEnquiry } from '../types';

interface QuotationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetProduct?: string;
  presetGrade?: string;
  contactWhatsapp?: string;
  products?: PublicRateProductItem[];
  onEnquirySubmitted?: (enquiry: SalesEnquiry) => void;
}

export const QuotationRequestModal: React.FC<QuotationRequestModalProps> = ({
  isOpen,
  onClose,
  presetProduct = '',
  presetGrade = '',
  contactWhatsapp = '919752183053',
  products = [],
  onEnquirySubmitted,
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [product, setProduct] = useState(presetProduct || 'MS Channel');
  const [grade, setGrade] = useState(presetGrade || 'Standard');
  const [quantity, setQuantity] = useState('25');
  const [unit, setUnit] = useState<'MT' | 'Kg' | 'Piece' | 'Bundle'>('MT');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<SalesEnquiry | null>(null);

  const matchedErpProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  useEffect(() => {
    if (isOpen) {
      if (presetProduct) {
        setProduct(presetProduct);
        const found = products.find(
          (p) =>
            `${p.name} (${p.size})`.toLowerCase() === presetProduct.toLowerCase() ||
            p.name.toLowerCase() === presetProduct.toLowerCase()
        );
        setSelectedProductId(found ? found.id : '');
      } else {
        setSelectedProductId('');
      }
      if (presetGrade) setGrade(presetGrade);
      setError(null);
      setSubmittedEnquiry(null);
    }
  }, [isOpen, presetProduct, presetGrade, products]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const digits = cleanPhone.replace(/\D/g, '');
    const parsedQty = Number(quantity);

    if (cleanName.length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (digits.length < 10 || digits.length > 15) {
      setError('Please enter a valid 10-digit mobile or WhatsApp number.');
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address or leave it blank.');
      return;
    }
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await PlatformApi.submitPublicEnquiry({
        name: cleanName,
        companyName: companyName.trim(),
        phone: cleanPhone,
        email: email.trim(),
        city: city.trim(),
        productId: matchedErpProduct?.id,
        product: matchedErpProduct ? matchedErpProduct.name : product.trim(),
        size: matchedErpProduct?.size || '',
        grade: matchedErpProduct ? matchedErpProduct.grade : grade.trim(),
        quantity: parsedQty,
        unit,
        notes: notes.trim(),
      });
      setSubmittedEnquiry(res.enquiry);
      onEnquirySubmitted?.(res.enquiry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit enquiry. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const waDigits = contactWhatsapp.replace(/\D/g, '');
  const waHref = `https://wa.me/${waDigits.startsWith('91') ? waDigits : `91${waDigits}`}?text=${encodeURIComponent(
    `Hello Nav Durga Ispat, I submitted Quotation Request${submittedEnquiry ? ` (${submittedEnquiry.enquiryNumber})` : ''} for ${product} (${grade}), Qty: ${quantity} ${unit}. Name: ${name || 'Buyer'}.`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#14213D]/55 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-heading"
    >
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-2xl w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 bg-[var(--color-navy)] border-b border-[var(--color-amber)]/35 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-amber)]">
              Nav Durga Ispat Sales Desk
            </span>
            <h3 id="quote-modal-heading" className="font-display text-lg font-extrabold text-[var(--color-linen)]">
              Request Industrial Quotation
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--color-linen)]/80 hover:bg-white/10 hover:text-[var(--color-amber)] cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedEnquiry ? (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-4 rounded-xl bg-[var(--color-navy)] border border-[var(--color-amber)]/45 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[var(--color-amber)] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[var(--color-linen)] text-sm">
                  Quotation Request Logged ({submittedEnquiry.enquiryNumber})
                </h4>
                <p className="text-xs text-[var(--color-linen)]/85 mt-1">
                  Your requirement has been forwarded directly to Nav Durga Ispat&apos;s Urla dispatch &amp; sales team. Our sales officer will share confirmed ex-plant pricing shortly.
                </p>
              </div>
            </div>

            <div className="bg-[var(--color-linen)]/55 rounded-xl border border-[var(--color-border)] p-4 text-xs space-y-1.5 text-[var(--color-navy)]">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Product:</span>
                <span className="font-bold">{submittedEnquiry.product}</span>
              </div>
              {submittedEnquiry.size && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Size / Spec:</span>
                  <span className="font-semibold">{submittedEnquiry.size}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Grade:</span>
                <span className="font-semibold">{submittedEnquiry.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Estimated Quantity:</span>
                <span className="font-bold tabular-nums">
                  {submittedEnquiry.quantity} {submittedEnquiry.unit}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="nd-btn-amber inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Fast-Track on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="nd-btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-[var(--color-amber-soft)] border border-[var(--color-amber)] text-xs font-semibold text-[var(--color-navy)]">
                {error}
              </div>
            )}

            {products.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                  Quick Select Active ERP Product &amp; Size
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedProductId(id);
                    const found = products.find((p) => p.id === id);
                    if (found) {
                      setProduct(`${found.name} (${found.size})`);
                      setGrade(found.grade);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-linen)]/45 text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                >
                  <option value="">Custom / Manual Entry Below</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.size} ({p.grade}) • {p.section}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Agrawal"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                  Company / Firm Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Mahavir Infra Pvt. Ltd."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                  City / Delivery Location
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Raipur / Bilaspur / Nagpur"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                  Product / Profile
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => {
                      setSelectedProductId('');
                      setProduct(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none tabular-nums"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'MT' | 'Kg' | 'Piece' | 'Bundle')}
                    className="w-full px-2 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                  >
                    <option value="MT">MT</option>
                    <option value="Kg">Kg</option>
                    <option value="Piece">Pc</option>
                    <option value="Bundle">Bdl</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-navy)] mb-1">
                Email (Optional) &amp; Length / Delivery Notes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="buyer@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Standard 6m/12m length or custom spec"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)] outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                Ex-Plant Urla, Raipur • Direct Mill Sales
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="nd-btn-secondary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="nd-btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl disabled:opacity-60 text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Enquiry'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
