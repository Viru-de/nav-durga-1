import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  FileText,
  ShoppingCart,
  Clock,
  Plus,
  Edit2,
  CalendarCheck,
  CheckCircle2,
  Tag,
  ExternalLink,
  Send,
  AlertCircle,
} from 'lucide-react';
import {
  Customer,
  SalesEnquiry,
  SalesOrder,
  Quotation,
  FollowUp,
  WhatsAppMessageRecord,
  WhatsAppConversation,
  WhatsAppChatMessage,
  WhatsAppChatStatus,
} from '../types';
import { WhatsAppService } from '../services/whatsappService';

interface CustomerDetailViewProps {
  customer: Customer;
  enquiries: SalesEnquiry[];
  orders: SalesOrder[];
  quotations: Quotation[];
  followUps: FollowUp[];
  whatsAppMessages: WhatsAppMessageRecord[];
  conversations?: WhatsAppConversation[];
  chatMessages?: WhatsAppChatMessage[];
  onBack: () => void;
  onEditCustomer: (customer: Customer) => void;
  onCreateEnquiryForCustomer: (customer: Customer) => void;
  onCreateQuotationForCustomer: (customer: Customer) => void;
  onCreateOrderForCustomer: (customer: Customer) => void;
  onScheduleFollowUp: (customer: Customer) => void;
  onSendCustomWhatsApp: (customer: Customer, message: string) => void;
  onUpdateConversationStatus?: (convId: string, status: WhatsAppChatStatus) => void;
  onToggleBroadcastOptIn?: (customerId: string, optedIn: boolean) => void;
}

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customer,
  enquiries,
  orders,
  quotations,
  followUps,
  whatsAppMessages,
  conversations = [],
  chatMessages = [],
  onBack,
  onEditCustomer,
  onCreateEnquiryForCustomer,
  onCreateQuotationForCustomer,
  onCreateOrderForCustomer,
  onScheduleFollowUp,
  onSendCustomWhatsApp,
  onUpdateConversationStatus,
  onToggleBroadcastOptIn,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'orders' | 'whatsapp' | 'followups'>('overview');
  const [quickMsg, setQuickMsg] = useState('');

  // Filter linked data for this specific customer
  const customerEnquiries = enquiries.filter(
    (e) => e.customerId === customer.id || e.customerName.toLowerCase() === customer.companyName.toLowerCase()
  );
  const customerOrders = orders.filter(
    (o) => o.customerId === customer.id || o.customerName.toLowerCase() === customer.companyName.toLowerCase()
  );
  const customerFollowUps = followUps.filter(
    (f) => f.customerId === customer.id || f.customerName.toLowerCase() === customer.companyName.toLowerCase()
  );
  const customerMessages = whatsAppMessages.filter(
    (m) => m.customerId === customer.id || m.customerName.toLowerCase() === customer.companyName.toLowerCase()
  );

  const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);

  const handleSendQuickMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMsg.trim()) return;
    onSendCustomWhatsApp(customer, quickMsg);
    // Also trigger web intent
    const url = WhatsAppService.buildWhatsAppWebUrl(customer.whatsapp || customer.mobile, quickMsg);
    window.open(url, '_blank');
    setQuickMsg('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Button & Top Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers Directory</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onEditCustomer(customer)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => onScheduleFollowUp(customer)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Schedule Follow-up</span>
          </button>

          <button
            type="button"
            onClick={() => onCreateEnquiryForCustomer(customer)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Enquiry</span>
          </button>

          <button
            type="button"
            onClick={() => onCreateOrderForCustomer(customer)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-sm">
              {customer.companyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {customer.companyName}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {customer.customerType}
                </span>
                {customer.tag && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    🏷️ {customer.tag}
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    customer.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {customer.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                <span>Contact Person: <strong className="text-slate-800">{customer.name}</strong></span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span>GSTIN: <strong className="font-mono text-slate-800">{customer.gstin}</strong></span>
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {customer.city}, {customer.state}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Customer since {customer.createdDate}
                </span>
              </div>
            </div>
          </div>

          {/* Key Lifetime Stats */}
          <div className="grid grid-cols-3 gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-6 pt-4 sm:pt-0">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Orders</div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                {customerOrders.length}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Business</div>
              <div className="text-lg sm:text-xl font-extrabold text-blue-900 font-mono mt-0.5">
                ₹{(totalSpent / 100000).toFixed(2)}L
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Credit Terms</div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-800 mt-0.5">
                {customer.creditDays ? `${customer.creditDays} Days` : 'Advance'}
              </div>
            </div>
          </div>
        </div>

        {/* Interested Products Tag Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            Interested In:
          </span>
          {customer.interestedProducts && customer.interestedProducts.length > 0 ? (
            customer.interestedProducts.map((prod, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
              >
                {prod}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No specific products tagged.</span>
          )}
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Overview & Contact
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'enquiries'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Enquiries</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-xs">
            {customerEnquiries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Sales Orders</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-xs">
            {customerOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'whatsapp'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>WhatsApp History</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-xs">
            {customerMessages.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('followups')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'followups'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Follow-ups</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-xs">
            {customerFollowUps.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              Direct Contact Information
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-bold text-slate-800 font-mono">{customer.mobile}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Number:
                </span>
                <a
                  href={WhatsAppService.buildWhatsAppWebUrl(customer.whatsapp, '')}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1 font-mono"
                >
                  {customer.whatsapp}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address:
                </span>
                <span className="font-semibold text-slate-800">{customer.email || 'N/A'}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Site / Billing Address:
                </span>
                <span className="font-medium text-slate-800 text-right max-w-[240px]">
                  {customer.address}, {customer.city}, {customer.state}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={WhatsAppService.buildWhatsAppWebUrl(
                  customer.whatsapp,
                  `Hello ${customer.name}, greeting from Nav Durga Ispat.`
                )}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Direct WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Operational Notes & Commercial Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Commercial Profile & Internal Notes
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer Category:</span>
                <span className="font-bold text-slate-800">{customer.customerType}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">GST Registration:</span>
                <span className="font-mono font-bold text-blue-900">{customer.gstin}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Credit Limit:</span>
                <span className="font-bold text-slate-800">
                  {customer.creditDays ? `${customer.creditDays} Days Rolling Credit` : 'Advance Payment'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Commercial Notes:</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {customer.notes || 'No specific commercial notes recorded.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enquiries Tab */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Customer Enquiries ({customerEnquiries.length})
            </h3>
            <button
              type="button"
              onClick={() => onCreateEnquiryForCustomer(customer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log New Enquiry</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {customerEnquiries.length > 0 ? (
              customerEnquiries.map((enq) => (
                <div key={enq.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {enq.enquiryNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {enq.source}
                      </span>
                      <span className="text-xs text-slate-400">{enq.date}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-800 mt-1">
                      {enq.product} ({enq.grade}) • {enq.quantity} {enq.unit}
                    </div>
                    {enq.whatsappMessage && (
                      <p className="text-xs text-emerald-800 bg-emerald-50 p-1.5 rounded mt-1">
                        &ldquo;{enq.whatsappMessage}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5">{enq.notes}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      enq.status === 'New'
                        ? 'bg-blue-100 text-blue-800'
                        : enq.status === 'Won'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No inquiries logged for this customer yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Sales Orders History ({customerOrders.length})
            </h3>
            <button
              type="button"
              onClick={() => onCreateOrderForCustomer(customer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Order</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {customerOrders.length > 0 ? (
              customerOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400">{ord.orderDate}</span>
                      {ord.vehicleNumber && (
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">
                          🚚 {ord.vehicleNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-blue-900 mt-1">
                      Total: ₹{ord.total.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Site: {ord.deliveryLocation}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">Payment: {ord.paymentStatus}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No orders recorded for this customer yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp History Tab */}
      {activeTab === 'whatsapp' && (() => {
        const phoneDigits = (customer.whatsapp || customer.mobile || '').replace(/\D/g, '');
        const matchedConv = conversations.find(
          (c) => c.customerId === customer.id || (c.phoneNumber && c.phoneNumber.replace(/\D/g, '').endsWith(phoneDigits.slice(-10)))
        );
        const threadMessages = matchedConv
          ? chatMessages.filter((m) => m.conversationId === matchedConv.id)
          : [];

        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    WhatsApp Chat & Rates ({threadMessages.length || customerMessages.length} messages)
                  </h3>
                  {matchedConv && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        matchedConv.status === 'New'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : matchedConv.status === 'Open'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : matchedConv.status === 'Snoozed'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Status: {matchedConv.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct human chat history, rate broadcasts, and customer replies.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Rate Broadcast Opt-in / Opt-out toggle */}
                {onToggleBroadcastOptIn && (
                  <button
                    type="button"
                    onClick={() => onToggleBroadcastOptIn(customer.id, customer.optedInForBroadcast === false)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      customer.optedInForBroadcast !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Click to toggle inclusion in WhatsApp Daily Rate Broadcasts"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${customer.optedInForBroadcast !== false ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{customer.optedInForBroadcast !== false ? 'Rate Broadcast: Opted-In' : 'Rate Broadcast: Opted-Out'}</span>
                  </button>
                )}

                <a
                  href={WhatsAppService.buildWhatsAppWebUrl(customer.whatsapp || customer.mobile, '')}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Conversation meta banner if available */}
            {matchedConv && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Assigned Staff</span>
                    <span className="font-semibold text-slate-700">{matchedConv.assignedToName || 'Unassigned'}</span>
                  </div>
                  {matchedConv.followUpDate && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Follow-up Reminder</span>
                      <span className="font-semibold text-amber-700">📅 {matchedConv.followUpDate}</span>
                    </div>
                  )}
                  {matchedConv.internalNotes && (
                    <div className="max-w-xs">
                      <span className="text-slate-400 text-[11px] block">Internal Notes</span>
                      <span className="text-slate-600 truncate block">{matchedConv.internalNotes}</span>
                    </div>
                  )}
                </div>

                {onUpdateConversationStatus && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">Change Status:</span>
                    {(['New', 'Open', 'Snoozed', 'Closed'] as WhatsAppChatStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onUpdateConversationStatus(matchedConv.id, st)}
                        className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                          matchedConv.status === st
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Timeline of messages */}
            <div className="space-y-3 max-h-96 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
              {threadMessages.length > 0 ? (
                threadMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.senderType === 'team' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs whitespace-pre-wrap leading-relaxed shadow-2xs ${
                        msg.senderType === 'team'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-75 mb-1 flex items-center justify-between gap-3">
                        <span>{msg.senderType === 'team' ? (msg.senderName || 'Nav Durga Staff') : customer.companyName}</span>
                        {msg.status && (
                          <span className="text-[9px] uppercase tracking-wider opacity-80">
                            ✓ {msg.status}
                          </span>
                        )}
                      </div>
                      {msg.text}
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          msg.senderType === 'team' ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : customerMessages.length > 0 ? (
                customerMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.type === 'sent' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs whitespace-pre-wrap leading-relaxed shadow-2xs ${
                        msg.type === 'sent'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-75 mb-1">
                        {msg.type === 'sent' ? 'Nav Durga Broadcast / Staff' : customer.companyName}
                      </div>
                      {msg.message}
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          msg.type === 'sent' ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No WhatsApp conversations logged yet. Type a message below to start chatting directly.
                </div>
              )}
            </div>

            {/* Quick Message Input */}
            <form onSubmit={handleSendQuickMessage} className="flex gap-2 pt-2">
              <input
                type="text"
                value={quickMsg}
                onChange={(e) => setQuickMsg(e.target.value)}
                placeholder={`Type direct message to ${customer.name || customer.companyName}...`}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reply</span>
              </button>
            </form>
          </div>
        );
      })()}

      {/* Follow-ups Tab */}
      {activeTab === 'followups' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Customer Follow-ups ({customerFollowUps.length})
            </h3>
            <button
              type="button"
              onClick={() => onScheduleFollowUp(customer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Follow-up</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {customerFollowUps.length > 0 ? (
              customerFollowUps.map((flw) => (
                <div key={flw.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        📅 {flw.followUpDate} at {flw.followUpTime}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Rep: {flw.salesperson}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{flw.notes}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      flw.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {flw.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No follow-ups pending for this customer.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
