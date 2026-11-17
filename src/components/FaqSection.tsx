import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { WebsiteCmsContent } from '../types';

export interface PublicFaqItem {
  id: string;
  question: string;
  answer: string;
  actionLabel?: string;
  actionPath?: string;
}

export function buildPublicFaqs(cms: WebsiteCmsContent): PublicFaqItem[] {
  const estYear = cms.establishedYear || '1988';
  const address =
    cms.contactAddress ||
    'Plot No. 435-A, Sector-C, Urla Industrial Area, Raipur, Chhattisgarh – 493221, India';
  const phone = cms.contactPhone || '+91 771 4208900';
  const email = cms.contactEmail || 'sales@navdurgasteel.com';

  return [
    {
      id: 'what-is-nav-durga-ispat',
      question: 'What is Nav Durga Ispat Pvt. Ltd.?',
      answer: `Nav Durga Ispat Pvt. Ltd. (incorporated in ${estYear}, CIN: ${cms.cinNumber || 'U24132CT1988PTC004838'}) is a steel manufacturing company in Raipur, Chhattisgarh supplying structural steel products for industrial, construction, fabrication, and infrastructure applications.`,
      actionLabel: 'About Nav Durga Ispat',
      actionPath: '/about',
    },
    {
      id: 'where-located',
      question: 'Where is Nav Durga Ispat Pvt. Ltd. located?',
      answer: `Nav Durga Ispat Pvt. Ltd. operates from ${address} (Urla Industrial Area, Raipur, Chhattisgarh).`,
      actionLabel: 'View Contact & Location',
      actionPath: '/contact',
    },
    {
      id: 'what-steel-products',
      question: 'What steel products are available?',
      answer:
        'Our active ERP-connected product range covers Medium Section steel (supplied via Nav Durga Ispat Pvt. Ltd.) and Light Section steel (supplied via Unit-2 NS Ispat (I) Pvt. Ltd.), including MS Channels, Structural Steel Beams / Joists, and MS Equal Angles in active rolling sizes.',
      actionLabel: 'Explore Products',
      actionPath: '/products',
    },
    {
      id: 'check-current-rates',
      question: 'How can I check current steel product rates?',
      answer:
        'You can check current Medium Section and Light Section basic rates and item-wise ex-plant Urla rates anytime on our Live Product Rates portal, which synchronizes directly with Nav Durga ERP Daily Rate Management. Where a product rate is not currently published, our team provides the latest rate on request.',
      actionLabel: 'View Live Product Rates',
      actionPath: '/product-rates',
    },
    {
      id: 'request-quotation',
      question: 'How can I request a steel quotation or send an enquiry?',
      answer:
        'Select any product from our catalog or use the Quick Enquiry form below to pick your steel section, size or specification, required quantity, and contact details. Every submitted enquiry receives a unique reference number and goes straight to our commercial sales desk in Nav Durga ERP.',
      actionLabel: 'Go to Enquiry Form',
      actionPath: '#quick-enquiry-section',
    },
    {
      id: 'contact-sales',
      question: 'How can I contact the Nav Durga Ispat sales team?',
      answer: `You can reach our commercial sales desk by phone at ${phone}, by email at ${email}, via our Contact page, or directly through the WhatsApp Sales link during ${cms.dispatchHours || 'business hours'}.`,
      actionLabel: 'Contact Sales Desk',
      actionPath: '/contact',
    },
    {
      id: 'product-specifications',
      question: 'Where can I find steel product specifications?',
      answer:
        'Each active ERP product has a dedicated specification page detailing its rolling section, size, grade, unit, and availability. Printable Medium Section and Light Section specification sheets are also available in our Resources section.',
      actionLabel: 'Open Specification Sheets',
      actionPath: '/resources',
    },
  ];
}

export function buildFaqJsonLd(faqs: PublicFaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

interface FaqSectionProps {
  cms: WebsiteCmsContent;
  onNavigate: (path: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ cms, onNavigate }) => {
  const faqs = buildPublicFaqs(cms);
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const handleAction = (path?: string) => {
    if (!path) return;
    if (path.startsWith('#')) {
      const el = document.getElementById(path.slice(1));
      if (el) {
        const reduced =
          typeof window !== 'undefined' &&
          window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    onNavigate(path);
  };

  return (
    <section
      id="faq-section"
      aria-labelledby="faq-section-heading"
      className="bg-[#F7F9FB] border-b border-[#C7CED6] nd-section-py"
    >
      <div className="nd-container space-y-8 xl:space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 xl:gap-6">
          <div className="max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#105186]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Frequently Asked Questions</span>
            </span>
            <h2
              id="faq-section-heading"
              className="font-display nd-h2-section font-extrabold text-[#263442] tracking-tight"
            >
              Answers About Our Steel Products, Rates &amp; Enquiries
            </h2>
            <p className="nd-lead text-[#737D88]">
              Clear, factual information about Nav Durga Ispat Pvt. Ltd., Urla Industrial Area, Raipur, and how to access live rates and quotations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/contact')}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#EAF2F8] border border-[#C7CED6] text-[#105186] text-xs font-bold cursor-pointer shrink-0 transition-colors"
          >
            <span>Need More Details? Contact Us</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6 items-start">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-colors ${
                  isOpen ? 'border-[#105186] shadow-xs' : 'border-[#C7CED6]'
                }`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${faq.id}`}
                    onClick={() => setOpenId((prev) => (prev === faq.id ? null : faq.id))}
                    className="w-full min-h-[52px] px-5 py-4 text-left flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#105186] rounded-2xl"
                  >
                    <span className="font-display text-sm sm:text-base font-extrabold text-[#263442]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#105186] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div
                    id={`faq-panel-${faq.id}`}
                    className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#737D88] leading-relaxed border-t border-[#C7CED6]/50 space-y-2.5"
                  >
                    <p>{faq.answer}</p>
                    {faq.actionLabel && faq.actionPath && (
                      <button
                        type="button"
                        onClick={() => handleAction(faq.actionPath)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#105186] hover:text-[#0B3A60] hover:underline cursor-pointer"
                      >
                        <span>{faq.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
