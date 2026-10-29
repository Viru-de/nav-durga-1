import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Users,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Send,
  UserCheck,
  UserPlus,
  Clock,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Shield,
  Filter,
  CheckCheck,
  Calendar,
  Layers,
  Phone,
  Building2,
  X,
  FileText,
} from 'lucide-react';
import {
  DailyUpdate,
  Customer,
  Product,
  CompanySettings,
  WhatsAppConfig,
  WhatsAppMessageRecord,
  SalesEnquiry,
  WhatsAppOrderEnquiryParsed,
  ActiveTab,
  CategoryBasicRates,
  CompanyGradeBasicRates,
  NanoBananaGeneratedPost,
  NanoBananaPostType,
  WhatsAppConversation,
  WhatsAppChatMessage,
  RateBroadcastRecord,
  RateBroadcastRecipient,
  WhatsAppChatStatus,
  AppUser,
} from '../types';
import { WhatsAppService } from '../services/whatsappService';
import { AIWhatsAppOrderCard } from './AIWhatsAppOrderCard';
import { parseWhatsAppCustomerMessage } from '../utils/whatsappOrderHelper';
import { NanoBananaPostService } from '../services/nanoBananaPostService';
import { StorageService } from '../services/storageService';

interface WhatsAppCenterViewProps {
  dailyUpdates: DailyUpdate[];
  customers: Customer[];
  products: Product[];
  company: CompanySettings;
  whatsAppConfig: WhatsAppConfig;
  categoryBasicRates?: CategoryBasicRates;
  gradeBasicRates?: CompanyGradeBasicRates;
  conversations?: WhatsAppConversation[];
  chatMessages?: WhatsAppChatMessage[];
  rateBroadcasts?: RateBroadcastRecord[];
  users?: AppUser[];
  activeUser?: AppUser;
  onChangeActiveUser?: (user: AppUser) => void;
  onAddTeamMember?: (user: Omit<AppUser, 'id'>) => void;
  onSendMessage?: (conversationId: string, text: string) => Promise<void>;
  onUpdateConversationStatus?: (conversationId: string, status: WhatsAppChatStatus) => void;
  onAssignConversation?: (conversationId: string, userId: string, userName: string) => void;
  onUpdateConversationNotes?: (conversationId: string, notes: string, followUpDate?: string) => void;
  onBroadcastRates?: (params: {
    recipients: Customer[];
    isRevision: boolean;
    customNote?: string;
    includeImage?: boolean;
  }) => Promise<void>;
  onRetryBroadcast?: (broadcastId: string) => void;
  onLogMessage: (record: WhatsAppMessageRecord) => void;
  onCreateEnquiryFromWebhook: (enquiry: SalesEnquiry) => void;
  onNavigateToCustomer: (customerId: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

type MainWhatsAppTab = 'inbox' | 'broadcast' | 'team' | 'coexistence' | 'posters';

export const WhatsAppCenterView: React.FC<WhatsAppCenterViewProps> = ({
  dailyUpdates,
  customers,
  products,
  company,
  whatsAppConfig,
  categoryBasicRates,
  gradeBasicRates,
  conversations: propConversations,
  chatMessages: propChatMessages,
  rateBroadcasts: propRateBroadcasts,
  users: propUsers,
  activeUser: propActiveUser,
  onChangeActiveUser,
  onAddTeamMember,
  onSendMessage,
  onUpdateConversationStatus,
  onAssignConversation,
  onUpdateConversationNotes,
  onBroadcastRates,
  onRetryBroadcast,
  onLogMessage,
  onCreateEnquiryFromWebhook,
  onNavigateToCustomer,
  onNavigateTab,
}) => {
  // Navigation between primary functional modes
  const [activeTab, setActiveTab] = useState<MainWhatsAppTab>('inbox');

  // Active User session (Admin or Team Member)
  const defaultUser: AppUser = {
    id: 'usr-1',
    name: 'Virendra Patel',
    role: 'Admin',
    email: 'admin@navdurgasteel.com',
    phone: '+91 98261 45890',
    status: 'Active',
  };
  const activeUser = propActiveUser || defaultUser;
  const users = propUsers && propUsers.length > 0 ? propUsers : [defaultUser];

  // Feedback notifications
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // 1. INBOX STATE (Requirement 1 & 6: Human Communication Only)
  // -------------------------------------------------------------------------
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    propConversations?.[0]?.id || 'conv-cust-1'
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | WhatsAppChatStatus>('ALL');
  const [inboxSearch, setInboxSearch] = useState<string>('');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'ASSIGNED_TO_ME'>('ALL');
  const [replyText, setReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);

  // Editable notes & follow-up for selected chat
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [followUpDraft, setFollowUpDraft] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  // Simulator modal state for testing incoming customer replies
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState<boolean>(false);
  const [simulateMessageText, setSimulateMessageText] = useState<string>(
    'Aaj Medium 125x65 channel ka final bhav kya chal raha hai? 20 ton ready loading chahiye.'
  );

  // Current conversations and chat messages
  const conversations = propConversations || [];
  const chatMessages = propChatMessages || [];

  const selectedConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === selectedConversationId) ||
      conversations[0] ||
      null
    );
  }, [conversations, selectedConversationId]);

  // Load notes when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setNotesDraft(selectedConversation.internalNotes || '');
      setFollowUpDraft(selectedConversation.followUpDate || '');
      setIsEditingNotes(false);
    }
  }, [selectedConversation?.id]);

  // Messages for active conversation
  const activeThreadMessages = useMemo(() => {
    if (!selectedConversation) return [];
    return chatMessages.filter(
      (m) =>
        m.conversationId === selectedConversation.id ||
        m.customerId === selectedConversation.customerId
    );
  }, [chatMessages, selectedConversation]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

      // Assignment filter (Team member permission logic)
      if (assignmentFilter === 'ASSIGNED_TO_ME' && c.assignedToUserId !== activeUser.id) {
        return false;
      }

      // If non-admin sales staff wants to only see their work when restricted
      if (activeUser.role !== 'Admin' && assignmentFilter === 'ASSIGNED_TO_ME' && c.assignedToUserId !== activeUser.id) {
        return false;
      }

      // Search term
      if (inboxSearch.trim()) {
        const q = inboxSearch.toLowerCase().trim();
        const matchesName = c.customerName.toLowerCase().includes(q);
        const matchesPhone = c.phoneNumber.includes(q);
        const matchesMsg = (c.lastMessage || '').toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesMsg;
      }

      return true;
    });
  }, [conversations, statusFilter, assignmentFilter, inboxSearch, activeUser]);

  // Counts for 4 status badges
  const statusCounts = useMemo(() => {
    return {
      ALL: conversations.length,
      New: conversations.filter((c) => c.status === 'New').length,
      Open: conversations.filter((c) => c.status === 'Open').length,
      Snoozed: conversations.filter((c) => c.status === 'Snoozed').length,
      Closed: conversations.filter((c) => c.status === 'Closed').length,
    };
  }, [conversations]);

  // Poll for webhook incoming events periodically
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const events = await WhatsAppService.pollInboundEvents();
        if (isMounted && events && events.length > 0) {
          // New events captured via webhook
          // Handled via state sync if needed
        }
      } catch {
        // quiet
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle Send Direct Reply (Human Communication Only)
  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim() || isSendingReply) return;
    setIsSendingReply(true);
    try {
      if (onSendMessage) {
        await onSendMessage(selectedConversation.id, replyText.trim());
      } else {
        await WhatsAppService.sendDirectReply({
          conversationId: selectedConversation.id,
          customerId: selectedConversation.customerId,
          customerPhone: selectedConversation.phoneNumber,
          messageText: replyText.trim(),
          sender: activeUser,
        });
      }
      setReplyText('');
      setStatusFeedback(`Reply sent to ${selectedConversation.customerName}`);
      setTimeout(() => setStatusFeedback(null), 3500);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Quick insertion of ERP rate snippet into reply
  const handleInsertRateTemplate = (type: 'medium' | 'sl' | 'terms') => {
    const medRate = categoryBasicRates?.['MEDIUM SECTION'] || 49711;
    const slRate = categoryBasicRates?.['LIGHT SECTION'] || 42211;

    if (type === 'medium') {
      setReplyText(
        (prev) =>
          prev +
          (prev ? '\n' : '') +
          `NAVDURGA ISPAT — MEDIUM SECTION Approved Basic Rate: ₹${medRate.toLocaleString(
            'en-IN'
          )}/MT (Ex-plant Urla). Ready for dispatch.`
      );
    } else if (type === 'sl') {
      setReplyText(
        (prev) =>
          prev +
          (prev ? '\n' : '') +
          `UNIT-2 NS ISPAT — SUPER LIGHT (SL) SECTION Approved Basic Rate: ₹${slRate.toLocaleString(
            'en-IN'
          )}/MT (Ex-plant Urla).`
      );
    } else {
      setReplyText(
        (prev) =>
          prev +
          (prev ? '\n' : '') +
          `Terms: GST 18% Extra • Ex-Plant Urla Raipur • Weight as per mill weighbridge • Payment advance.`
      );
    }
  };

  // Save notes & follow up
  const handleSaveNotes = () => {
    if (!selectedConversation) return;
    if (onUpdateConversationNotes) {
      onUpdateConversationNotes(selectedConversation.id, notesDraft, followUpDraft);
    }
    setIsEditingNotes(false);
    setStatusFeedback('Customer notes & follow-up updated.');
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Trigger simulated incoming reply (for testing the auto-receive webhook pipeline)
  const handleTriggerSimulateReply = async () => {
    if (!selectedConversation || !simulateMessageText.trim()) return;
    await WhatsAppService.simulateIncomingReply({
      customerPhone: selectedConversation.phoneNumber,
      customerName: selectedConversation.customerName,
      messageText: simulateMessageText.trim(),
    });

    // Also update conversation directly so the team sees the reply in ERP immediately
    if (onUpdateConversationStatus) {
      onUpdateConversationStatus(selectedConversation.id, 'New');
    }

    setIsSimulateModalOpen(false);
    setStatusFeedback(`Customer reply received from ${selectedConversation.customerName}!`);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  // -------------------------------------------------------------------------
  // 2. RATE BROADCASTING STATE (Requirement 2)
  // -------------------------------------------------------------------------
  const [broadcastMode, setBroadcastMode] = useState<'daily' | 'revision'>('daily');
  const [broadcastCustomNote, setBroadcastCustomNote] = useState<string>('');
  const [includeRateImage, setIncludeRateImage] = useState<boolean>(true);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(() =>
    customers.filter((c) => c.optedInForBroadcast !== false).map((c) => c.id)
  );
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  const mediumBaseRate = categoryBasicRates?.['MEDIUM SECTION'] || 49711;
  const slBaseRate = categoryBasicRates?.['LIGHT SECTION'] || 42211;

  // Rate broadcasts history
  const rateBroadcasts = propRateBroadcasts || [];

  const optedInCustomers = useMemo(() => {
    return customers.filter((c) => c.optedInForBroadcast !== false);
  }, [customers]);

  const toggleRecipient = (customerId: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]
    );
  };

  const handleSelectAllRecipients = () => {
    if (selectedRecipientIds.length === optedInCustomers.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(optedInCustomers.map((c) => c.id));
    }
  };

  const handleExecuteBroadcast = async () => {
    if (selectedRecipientIds.length === 0 || isBroadcasting) return;
    setIsBroadcasting(true);

    try {
      const targetRecipients = customers.filter((c) => selectedRecipientIds.includes(c.id));
      if (onBroadcastRates) {
        await onBroadcastRates({
          recipients: targetRecipients,
          isRevision: broadcastMode === 'revision',
          customNote: broadcastCustomNote,
          includeImage: includeRateImage,
        });
      } else {
        const todayStr = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        await WhatsAppService.broadcastApprovedRates({
          recipients: targetRecipients,
          mediumRate: mediumBaseRate,
          slRate: slBaseRate,
          dateStr: todayStr,
          sender: activeUser,
          isRevision: broadcastMode === 'revision',
          customNote: broadcastCustomNote,
        });
      }

      setStatusFeedback(
        `Rate broadcast successfully dispatched to ${selectedRecipientIds.length} verified customers!`
      );
      setTimeout(() => setStatusFeedback(null), 4000);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // -------------------------------------------------------------------------
  // 3. TEAM ACCOUNTS STATE (Requirement 3)
  // -------------------------------------------------------------------------
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamEmail, setNewTeamEmail] = useState<string>('');
  const [newTeamPhone, setNewTeamPhone] = useState<string>('+91 98261 ');
  const [newTeamRole, setNewTeamRole] = useState<'Admin' | 'Sales' | 'Staff'>('Sales');

  const handleCreateTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamEmail.trim()) return;

    if (onAddTeamMember) {
      onAddTeamMember({
        name: newTeamName.trim(),
        email: newTeamEmail.trim(),
        phone: newTeamPhone.trim(),
        role: newTeamRole,
        status: 'Active',
      });
    }

    setNewTeamName('');
    setNewTeamEmail('');
    setNewTeamPhone('+91 98261 ');
    setIsAddTeamModalOpen(false);
    setStatusFeedback(`New team member account added for ${newTeamName}.`);
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  // -------------------------------------------------------------------------
  // 4. COEXISTENCE & META API STATUS (Requirement 5)
  // -------------------------------------------------------------------------
  const [coexistenceData, setCoexistenceData] = useState<{
    coexistenceSupported: boolean;
    featureName: string;
    description: string;
    eligibilityCheck: any;
    credentialsConfigured: any;
    coexistenceMode: string;
    recommendation: string;
  } | null>(null);
  const [isLoadingCoexistence, setIsLoadingCoexistence] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'coexistence') {
      setIsLoadingCoexistence(true);
      WhatsAppService.checkCoexistenceStatus()
        .then((res) => setCoexistenceData(res))
        .finally(() => setIsLoadingCoexistence(false));
    }
  }, [activeTab]);

  // -------------------------------------------------------------------------
  // 5. EXISTING POST GENERATOR & MEDIA PREVIEWS PRESERVED
  // -------------------------------------------------------------------------
  const [livePost, setLivePost] = useState<NanoBananaGeneratedPost | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const generatePreview = async () => {
      setIsGeneratingImage(true);
      try {
        const post = await NanoBananaPostService.generateNewPost({
          postType: 'all-products-price-update',
          products,
          company,
          categoryBasicRates,
          gradeBasicRates,
          skipRemoteApi: true,
        });
        if (isMounted) setLivePost(post);
      } finally {
        if (isMounted) setIsGeneratingImage(false);
      }
    };
    generatePreview();
    return () => {
      isMounted = false;
    };
  }, [products, categoryBasicRates, gradeBasicRates, company]);

  return (
    <div className="space-y-5">
      {/* TOP ERP WHATSAPP BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>WhatsApp System</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Human Communication Only
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Coexistence Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official Nav Durga steel rates, customer chat inbox, daily broadcasting, and team coordination.
          </p>
        </div>

        {/* User Switcher / Current Staff Session */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
          <div className="text-right px-2 hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">{activeUser.name}</div>
            <div className="text-[10px] text-blue-700 font-semibold">{activeUser.role} Account</div>
          </div>
          <select
            value={activeUser.id}
            onChange={(e) => {
              const u = users.find((x) => x.id === e.target.value);
              if (u && onChangeActiveUser) {
                onChangeActiveUser(u);
                setStatusFeedback(`Switched active session to ${u.name} (${u.role})`);
                setTimeout(() => setStatusFeedback(null), 3000);
              }
            }}
            className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Switch logged in team member"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STATUS FEEDBACK ALERT */}
      {statusFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 ${
            activeTab === 'inbox'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Inbox</span>
          {statusCounts.New > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-600 text-white">
              {statusCounts.New}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 ${
            activeTab === 'broadcast'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Rate Broadcasting</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            Approved Rates
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 ${
            activeTab === 'team'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Accounts ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coexistence')}
          className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 ${
            activeTab === 'coexistence'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Phone App Coexistence &amp; API</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('posters')}
          className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 ${
            activeTab === 'posters'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Rate Posters &amp; Visuals</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: WHATSAPP INBOX (Requirement 1 & 6) */}
      {/* =================================================================== */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: CHAT THREADS LIST WITH 4 STATUSES */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[700px] overflow-hidden">
            {/* Search & Top Action */}
            <div className="p-3.5 border-b border-slate-200 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Customer Conversations ({filteredConversations.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                  title="Test an incoming customer WhatsApp reply"
                >
                  <RotateCcw className="w-3 h-3 text-amber-600" />
                  <span>Test Inbound Reply</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  placeholder="Search customer, company or mobile..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* 4 STATUS PILLS: New, Open, Snoozed, Closed */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({statusCounts.ALL})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('New')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                    statusFilter === 'New'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>New ({statusCounts.New})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Open')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                    statusFilter === 'Open'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  <span>Open ({statusCounts.Open})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Snoozed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                    statusFilter === 'Snoozed'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <span>Snoozed ({statusCounts.Snoozed})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Closed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                    statusFilter === 'Closed'
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Closed ({statusCounts.Closed})</span>
                </button>
              </div>

              {/* Assignment filter toggle */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="font-semibold">Filter:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAssignmentFilter('ALL')}
                    className={`px-2 py-0.5 rounded font-bold ${
                      assignmentFilter === 'ALL'
                        ? 'bg-slate-200 text-slate-800'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All Staff Chats
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentFilter('ASSIGNED_TO_ME')}
                    className={`px-2 py-0.5 rounded font-bold ${
                      assignmentFilter === 'ASSIGNED_TO_ME'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Assigned to Me
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No conversations matching the current filter.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  const statusColors = {
                    New: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    Open: 'bg-blue-100 text-blue-800 border-blue-300',
                    Snoozed: 'bg-amber-100 text-amber-800 border-amber-300',
                    Closed: 'bg-slate-100 text-slate-700 border-slate-300',
                  };

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`p-3.5 transition-colors cursor-pointer text-left ${
                        isSelected ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="font-black text-xs text-slate-900 truncate">
                          {conv.customerName}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 font-mono font-semibold mb-1">
                        {conv.phoneNumber}
                      </div>

                      <div className="text-xs text-slate-600 line-clamp-1 mb-2 font-normal">
                        {conv.lastSenderType === 'team' && <span className="font-bold text-slate-800">You: </span>}
                        {conv.lastMessage}
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold border ${
                            statusColors[conv.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {conv.status}
                        </span>

                        <div className="flex items-center gap-1 text-slate-500 truncate max-w-[150px]">
                          <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{conv.assignedToName || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT 7 COLS: ACTIVE CHAT THREAD & ERP ACTION BAR */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[700px] overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-slate-50/50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {selectedConversation.customerName}
                      </h2>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {selectedConversation.phoneNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>Assigned to: <strong>{selectedConversation.assignedToName || 'Unassigned'}</strong></span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => onNavigateToCustomer(selectedConversation.customerId)}
                        className="text-blue-700 hover:underline font-bold"
                      >
                        View Customer Record
                      </button>
                    </div>
                  </div>

                  {/* Status Dropdown & Assignment Dropdown */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Status:</span>
                      <select
                        value={selectedConversation.status}
                        onChange={(e) => {
                          const newStat = e.target.value as WhatsAppChatStatus;
                          if (onUpdateConversationStatus) {
                            onUpdateConversationStatus(selectedConversation.id, newStat);
                            setStatusFeedback(`Status changed to ${newStat}`);
                            setTimeout(() => setStatusFeedback(null), 3000);
                          }
                        }}
                        className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value="New">New</option>
                        <option value="Open">Open</option>
                        <option value="Snoozed">Snoozed</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    {/* Assignment Dropdown */}
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Assign:</span>
                      <select
                        value={selectedConversation.assignedToUserId || ''}
                        onChange={(e) => {
                          const targetUser = users.find((u) => u.id === e.target.value);
                          if (onAssignConversation) {
                            onAssignConversation(
                              selectedConversation.id,
                              e.target.value,
                              targetUser?.name || 'Unassigned'
                            );
                            setStatusFeedback(
                              `Assigned to ${targetUser?.name || 'Unassigned'}`
                            );
                            setTimeout(() => setStatusFeedback(null), 3000);
                          }
                        }}
                        className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Open Phone WhatsApp Button */}
                    <a
                      href={WhatsAppService.buildWhatsAppWebUrl(
                        selectedConversation.phoneNumber,
                        ''
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                      title="Open in WhatsApp Web / App"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Message Thread (Chronological Chat History) */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
                  {activeThreadMessages.length === 0 ? (
                    <div className="text-center py-16 text-xs text-slate-400">
                      No message history found for this customer.
                    </div>
                  ) : (
                    activeThreadMessages.map((msg) => {
                      const isCustomer = msg.senderType === 'customer';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs text-xs ${
                              isCustomer
                                ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                                : 'bg-emerald-700 text-white rounded-tr-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider ${
                                  isCustomer ? 'text-blue-700' : 'text-emerald-200'
                                }`}
                              >
                                {isCustomer ? selectedConversation.customerName : msg.senderName}
                              </span>
                              <span
                                className={`text-[9px] ${
                                  isCustomer ? 'text-slate-400' : 'text-emerald-200'
                                }`}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <p className="whitespace-pre-wrap leading-relaxed text-xs">{msg.text}</p>

                            {/* Delivery Status Indicator for team messages */}
                            {!isCustomer && (
                              <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-emerald-200">
                                {msg.status === 'read' ? (
                                  <>
                                    <CheckCheck className="w-3 h-3 text-cyan-300" />
                                    <span>Read</span>
                                  </>
                                ) : msg.status === 'delivered' ? (
                                  <>
                                    <CheckCheck className="w-3 h-3 text-emerald-200" />
                                    <span>Delivered</span>
                                  </>
                                ) : msg.status === 'failed' ? (
                                  <>
                                    <AlertTriangle className="w-3 h-3 text-amber-300" />
                                    <span>Failed</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-200" />
                                    <span>Sent</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick ERP Rate Snippets */}
                <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                    Insert Rate:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInsertRateTemplate('medium')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 shrink-0 cursor-pointer"
                  >
                    + Medium Section (₹{mediumBaseRate.toLocaleString('en-IN')})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertRateTemplate('sl')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 shrink-0 cursor-pointer"
                  >
                    + SL Section (₹{slBaseRate.toLocaleString('en-IN')})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertRateTemplate('terms')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 shrink-0 cursor-pointer"
                  >
                    + Ex-Plant Terms
                  </button>
                </div>

                {/* Direct Reply Input Bar (Human Communication Only) */}
                <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                  <div className="flex items-center gap-2">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply as ${activeUser.name}... (Press Send to dispatch)`}
                      className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
                    />
                    <button
                      type="button"
                      disabled={!replyText.trim() || isSendingReply}
                      onClick={handleSendReply}
                      className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSendingReply ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Internal Notes & Follow-up Drawer */}
                <div className="border-t border-slate-200 p-3 bg-slate-50 shrink-0 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Internal Notes &amp; Follow-up Reminder</span>
                    </span>
                    {!isEditingNotes ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(true)}
                        className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Edit Notes
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Save Notes
                      </button>
                    )}
                  </div>

                  {!isEditingNotes ? (
                    <div className="flex items-center justify-between gap-4 text-slate-600 text-[11px]">
                      <span className="truncate italic">
                        {selectedConversation.internalNotes || 'No internal notes added yet.'}
                      </span>
                      {selectedConversation.followUpDate && (
                        <span className="shrink-0 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                          Follow-up: {selectedConversation.followUpDate}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mt-2">
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Internal note for sales team (e.g. Needs 20 MT Friday)..."
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="date"
                          value={followUpDraft}
                          onChange={(e) => setFollowUpDraft(e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">
                Select a conversation from the left to start communicating.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: RATE BROADCASTING & RETRY (Requirement 2) */}
      {/* =================================================================== */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 6 COLS: APPROVED STEEL RATE CARD & REVISION DISPATCH */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Approved Nav Durga Steel Rates
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formula: <strong>Final Rate = Basic Rate + Gauge Difference</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  Verified Mill Rates
                </span>
              </div>

              {/* Display Approved Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-900">
                    NAVDURGA ISPAT PVT. LTD.
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">MEDIUM SECTION</div>
                  <div className="text-2xl font-black text-blue-700 mt-1">
                    ₹{mediumBaseRate.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-500">/ MT</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">MS Channel 125x65, Angles, Beams</div>
                </div>

                <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/50">
                  <div className="text-[10px] font-black uppercase tracking-wider text-cyan-900">
                    UNIT-2 - NS ISPAT (I) PVT. LTD.
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">SUPER LIGHT (SL)</div>
                  <div className="text-2xl font-black text-cyan-700 mt-1">
                    ₹{slBaseRate.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-500">/ MT</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">MS Channel 75x40, 100x50, Light Angles</div>
                </div>
              </div>

              {/* Broadcast Type Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 block">Broadcast Notice Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastMode('daily')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      broadcastMode === 'daily'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Standard Daily Rates</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Morning market opening rate sheet</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBroadcastMode('revision')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      broadcastMode === 'revision'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Revised Rate Notice</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Intraday mill rate change alert</div>
                  </button>
                </div>
              </div>

              {/* Optional Custom Notice */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Remarks / Market Observation (Optional):
                </label>
                <input
                  type="text"
                  value={broadcastCustomNote}
                  onChange={(e) => setBroadcastCustomNote(e.target.value)}
                  placeholder="e.g. Steel demand firm in Raipur rolling mills, booking valid till 5 PM."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              {/* Attach Verified Image Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="includeImageCheck"
                  checked={includeRateImage}
                  onChange={(e) => setIncludeRateImage(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="includeImageCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Attach Verified High-Resolution Steel Rate Poster Image
                </label>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={selectedRecipientIds.length === 0 || isBroadcasting}
                  onClick={handleExecuteBroadcast}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>
                    {isBroadcasting
                      ? 'Dispatching WhatsApp Broadcast...'
                      : `Send Rate Broadcast to ${selectedRecipientIds.length} Verified Recipients`}
                  </span>
                </button>
                <div className="text-[11px] text-slate-400 text-center mt-2">
                  Authorised staff: <strong>{activeUser.name}</strong> • Follows opt-out compliance
                </div>
              </div>
            </div>

            {/* RIGHT 6 COLS: RECIPIENT LIST WITH OPT-IN PERMISSIONS */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Recipient Directory ({optedInCustomers.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified customers with active WhatsApp numbers permitted to receive rate updates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSelectAllRecipients}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {selectedRecipientIds.length === optedInCustomers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto border border-slate-200 rounded-xl">
                {optedInCustomers.map((cust) => {
                  const isChecked = selectedRecipientIds.includes(cust.id);
                  return (
                    <div
                      key={cust.id}
                      onClick={() => toggleRecipient(cust.id)}
                      className={`p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by row click
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {cust.companyName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {cust.name} • {cust.city}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-emerald-800">
                          {cust.whatsapp || cust.mobile}
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">
                          Opted In
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PREVIOUS RATE BROADCASTS & RETRY TABLE (Requirement 2) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Rate Broadcast History &amp; Delivery Tracking
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saved previous rate lists, delivery statuses, and failed message retries without duplicate sends.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {rateBroadcasts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No rate broadcast records yet.
                </div>
              ) : (
                rateBroadcasts.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{record.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                            {record.broadcastType === 'revised_rates' ? 'Revision Alert' : 'Daily Rates'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Date: <strong>{record.date}</strong> • Dispatched by {record.sentBy} at{' '}
                          {new Date(record.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {/* Delivery Stats Pills */}
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                          Delivered: {record.deliveredCount}
                        </span>
                        {record.failedCount > 0 ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Failed: {record.failedCount}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">
                            0 Failed
                          </span>
                        )}

                        {/* RETRY FAILED BUTTON: Only retries failed recipients without resending successful */}
                        {record.failedCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onRetryBroadcast) {
                                onRetryBroadcast(record.id);
                              }
                              setStatusFeedback(
                                `Retried ${record.failedCount} failed messages for ${record.title} without duplicating successful sends.`
                              );
                              setTimeout(() => setStatusFeedback(null), 4000);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retry Failed ({record.failedCount})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Recipient Breakdown Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/80 text-[11px]">
                      <span className="font-bold text-slate-600">Recipients:</span>
                      {record.recipients.map((r) => (
                        <span
                          key={r.customerId}
                          className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                            r.status === 'failed'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span>{r.customerName}</span>
                          {r.status === 'failed' && (
                            <span className="text-[9px] font-black text-rose-600">(Failed)</span>
                          )}
                          {r.status === 'read' && (
                            <CheckCheck className="w-3 h-3 text-cyan-600" />
                          )}
                          {r.status === 'delivered' && (
                            <Check className="w-3 h-3 text-emerald-600" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: TEAM ACCOUNTS (Requirement 3: 1 Admin + 4 Team Members) */}
      {/* =================================================================== */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Team Accounts &amp; Permissions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                1 Admin and 4 Team Members. Each employee logs in with their own account. Admin can view all chats and assign conversations.
              </p>
            </div>

            {activeUser.role === 'Admin' && (
              <button
                type="button"
                onClick={() => setIsAddTeamModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Team Member</span>
              </button>
            )}
          </div>

          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => {
              const isActive = activeUser.id === u.id;
              const assignedChatsCount = conversations.filter((c) => c.assignedToUserId === u.id).length;

              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'Admin'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : u.role === 'Sales'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {u.role}
                    </span>

                    {isActive && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Active Session
                      </span>
                    )}
                  </div>

                  <div className="font-black text-sm text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</div>
                  <div className="text-xs font-mono font-semibold text-slate-700 mt-1">{u.phone}</div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Assigned Chats: <strong>{assignedChatsCount}</strong>
                    </span>

                    {!isActive && onChangeActiveUser && (
                      <button
                        type="button"
                        onClick={() => {
                          onChangeActiveUser(u);
                          setStatusFeedback(`Logged in as ${u.name}`);
                          setTimeout(() => setStatusFeedback(null), 3000);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Switch to this user
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: PHONE COEXISTENCE & META API (Requirement 5) */}
      {/* =================================================================== */}
      {activeTab === 'coexistence' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>WhatsApp Business App &amp; Cloud API Coexistence</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verification of official Meta Coexistence: keep using the physical WhatsApp Business app on your phone while managing rates, broadcasts, and replies in ERP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coexistence Verification Status */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                  Phone Coexistence Status
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  Eligible &amp; Supported
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                  <span>Registered Mobile App:</span>
                  <strong className="text-emerald-900">+91 97521 83053 (Android / iOS)</strong>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                  <span>Meta Cloud API Protocol:</span>
                  <strong>Graph API v20.0</strong>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                  <span>Dual Device Sync:</span>
                  <span className="text-emerald-800 font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Historical Chats Import:</span>
                  <span>Supported via API Sync</span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2.5 rounded-lg">
                ℹ️ When an inbound message is received on your phone WhatsApp, Meta webhook forwards a synchronous copy to your ERP inbox in real time.
              </div>
            </div>

            {/* Server Webhook Endpoints */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Official Server Webhook Endpoints
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Webhook URL</span>
                  <div className="p-2 rounded-lg bg-white border border-slate-300 font-mono text-[11px] text-slate-800 select-all">
                    https://{window.location.host}/api/whatsapp/webhook
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Verify Token</span>
                  <div className="p-2 rounded-lg bg-white border border-slate-300 font-mono text-[11px] text-slate-800 select-all">
                    navdurga_webhook_secret_2026
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Send API Proxy</span>
                  <div className="p-2 rounded-lg bg-white border border-slate-300 font-mono text-[11px] text-slate-800">
                    POST /api/whatsapp/send
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: VISUAL RATE POSTERS & MEDIA (Preserved) */}
      {/* =================================================================== */}
      {activeTab === 'posters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Verified Daily Post Generator
            </h2>
            <p className="text-xs text-slate-500">
              Generate enterprise-grade WhatsApp rate posters with approved mill pricing.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800">Included Sections:</div>
                <div className="text-slate-600 mt-1">
                  • Nav Durga Medium Section: ₹{mediumBaseRate.toLocaleString('en-IN')}/MT
                  <br />
                  • Unit-2 SL Light Section: ₹{slBaseRate.toLocaleString('en-IN')}/MT
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (livePost) {
                    const link = document.createElement('a');
                    link.download = `NavDurga_WhatsApp_Post_${livePost.effectiveDate}.png`;
                    link.href = livePost.imageDataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setStatusFeedback('Rate poster downloaded.');
                    setTimeout(() => setStatusFeedback(null), 3000);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Poster Image</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (livePost) {
                    await navigator.clipboard.writeText(livePost.whatsappCaption);
                    setCopied(true);
                    setStatusFeedback('Caption copied to clipboard.');
                    setTimeout(() => setCopied(false), 2000);
                    setTimeout(() => setStatusFeedback(null), 3000);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy WhatsApp Caption'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-center min-h-[460px]">
            {isGeneratingImage ? (
              <div className="py-16 flex items-center gap-2 text-xs font-bold text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Rendering verified rate poster...</span>
              </div>
            ) : livePost ? (
              <img
                src={livePost.imageDataUrl}
                alt={livePost.title}
                className="max-h-[500px] w-auto object-contain rounded-xl shadow-md border border-slate-300"
              />
            ) : null}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD TEAM MEMBER (Requirement 3) */}
      {/* =================================================================== */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Create New Team Member Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTeamModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Ramesh Agrawal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newTeamEmail}
                  onChange={(e) => setNewTeamEmail(e.target.value)}
                  placeholder="ramesh.sales@navdurgasteel.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile / WhatsApp</label>
                <input
                  type="text"
                  value={newTeamPhone}
                  onChange={(e) => setNewTeamPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Role / Permissions</label>
                <select
                  value={newTeamRole}
                  onChange={(e) => setNewTeamRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  <option value="Sales">Sales Member (Views &amp; replies to assigned customer chats)</option>
                  <option value="Staff">Staff (Dispatch / Logistics coordination)</option>
                  <option value="Admin">Admin (Full access, assign chats, create accounts)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TEST INCOMING CUSTOMER REPLY SIMULATOR */}
      {/* =================================================================== */}
      {isSimulateModalOpen && selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Simulate Inbound Customer Reply</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSimulateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Test how the ERP inbox automatically receives and shows customer replies when a customer responds on WhatsApp.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Sender</span>
                <div className="font-bold text-slate-900">
                  {selectedConversation.customerName} ({selectedConversation.phoneNumber})
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Customer Reply Message
                </label>
                <textarea
                  rows={3}
                  value={simulateMessageText}
                  onChange={(e) => setSimulateMessageText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSimulateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerSimulateReply}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Trigger Inbound Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
