import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, MessageSquare, Building2, Package } from 'lucide-react';
import { PlatformApi } from '../services/platformApi';
import { SalesEnquiry } from '../types';

interface QuotationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetProduct?: string;
  presetGrade?: string;
  contactWhatsapp?: string;
  onEnquirySubmitted?: (enquiry: SalesEnquiry) => void;
}

export const QuotationRequestModal: React.FC<QuotationRequestModalProps> = ({
  isOpen,
  onClose,
  presetProduct = '',
  presetGrade = '',
  contactWhatsapp = '919752183053',
  onEnquirySubmitted,
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [product, setProduct] = useState(presetProduct || 'MS Channel');
  const [grade, setGrade] = useState(presetGrade || 'Standard');
  const [quantity, setQuantity] = useState('25');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<SalesEnquiry | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (presetProduct) setProduct(presetProduct);
      if (presetGrade) setGrade(presetGrade);
      setError(null);
      setSubmittedEnquiry(null);
    }
  }, [isOpen, presetProduct, presetGrade]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and mobile/WhatsApp number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await PlatformApi.submitPublicEnquiry({
        name: name.trim(),
        companyName: companyName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        product: product.trim(),
        grade: grade.trim(),
        quantity: Number(quantity) || 10,
        unit: 'MT',
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
    `Hello Nav Durga Ispat, I submitted Quotation Request${submittedEnquiry ? ` (${submittedEnquiry.enquiryNumber})` : ''} for ${product} (${grade}), Qty: ${quantity} MT. Name: ${name || 'Buyer'}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#F7F9FB] border-b border-[#C7CED6] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#105186]">
              Nav Durga Ispat Sales Desk
            </span>
            <h3 className="font-display text-lg font-extrabold text-[#263442]">
              Request Industrial Quotation
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200/70 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedEnquiry ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Quotation Request Logged ({submittedEnquiry.enquiryNumber})
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Your requirement has been forwarded directly to Nav Durga Ispat&apos;s Urla dispatch &amp; sales team. Our sales officer will share confirmed ex-plant pricing shortly.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Product:</span>
                <span className="font-bold text-slate-900">{submittedEnquiry.product}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Specification / Grade:</span>
                <span className="font-semibold text-slate-900">{submittedEnquiry.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Quantity:</span>
                <span className="font-bold text-slate-900">{submittedEnquiry.quantity} MT</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Fast-Track on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-semibold text-amber-900">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Agrawal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Firm Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Mahavir Infra Pvt. Ltd."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / Delivery Location
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Raipur / Bilaspur / Nagpur"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product / Profile
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Section / Grade
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qty (MT)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email (Optional) &amp; Length / Delivery Notes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="buyer@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Standard 6m/12m length or custom spec"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Ex-Plant Urla, Raipur • Direct Mill Dispatch
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] disabled:opacity-60 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
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
