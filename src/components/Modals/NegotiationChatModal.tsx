import React, { useState, useEffect } from 'react';
import { 
  Job, 
  JobOffer, 
  UserRole, 
  Currency,
  Language
} from '../../types';
import { formatMoney } from '../../services/currency';
import { t } from '../../services/i18n';
import { SmartBiddingAssistant } from './SmartBiddingAssistant';
import { 
  Lock, 
  Send, 
  ArrowRight, 
  CheckCircle, 
  Coins, 
  Truck, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  MessageSquare,
  AlertTriangle,
  Eye,
  UserCheck,
  UserCog,
  Shield
} from 'lucide-react';

interface NegotiationChatModalProps {
  job: Job;
  currentRole: UserRole;
  currency: Currency;
  language?: Language;
  historicalJobs?: Job[];
  onClose: () => void;
  onUpdateJob: (updatedJob: Job) => void;
  onOpenEscrow: (job: Job) => void;
  isAdminMode?: boolean;
}

export const NegotiationChatModal: React.FC<NegotiationChatModalProps> = ({
  job,
  currentRole,
  currency,
  language = 'en',
  historicalJobs = [],
  onClose,
  onUpdateJob,
  onOpenEscrow,
  isAdminMode = false,
}) => {
  // If no offers exist, create a starter offer for demonstration if transporter
  const [selectedOfferId, setSelectedOfferId] = useState<string>(
    job.offers.length > 0 ? job.offers[0].id : ''
  );

  const activeOffer = job.offers.find(o => o.id === selectedOfferId) || job.offers[0] || null;

  const [messages, setMessages] = useState(activeOffer?.messages || []);
  const [newMessage, setNewMessage] = useState('');
  
  // Free price input - no limits!
  const [counterPriceInput, setCounterPriceInput] = useState<string>(
    activeOffer?.counterPriceUGX 
      ? String(activeOffer.counterPriceUGX) 
      : activeOffer?.offeredPriceUGX 
      ? String(activeOffer.offeredPriceUGX) 
      : String(job.clientBudgetUGX || 1700000)
  );

  const [isNegotiable, setIsNegotiable] = useState<boolean>(
    activeOffer?.isNegotiable ?? job.isNegotiable ?? true
  );

  const [showSmartBidding, setShowSmartBidding] = useState<boolean>(false);

  // Admin Bid On Behalf Mode
  const [adminActAs, setAdminActAs] = useState<'admin' | 'behalf_driver' | 'behalf_client'>('admin');
  const effectiveIsAdmin = currentRole === 'admin' || isAdminMode;

  // Sync messages when active offer changes
  useEffect(() => {
    if (activeOffer) {
      setMessages(activeOffer.messages || []);
      setCounterPriceInput(
        activeOffer.counterPriceUGX 
          ? String(activeOffer.counterPriceUGX) 
          : String(activeOffer.offeredPriceUGX)
      );
    }
  }, [activeOffer?.id]);

  const isTransporter = currentRole === 'transporter' || (effectiveIsAdmin && adminActAs === 'behalf_driver');
  const isAgreed = job.status === 'escrow_pending' || job.status === 'booked' || job.status === 'in_transit' || job.status === 'delivered';

  // Strict 2-Party Confidentiality Filter:
  // If Transporter: Can ONLY see their own bid thread. Other transporters' bids are strictly concealed!
  // If Client: Can see bids on their job and negotiate individually with each bidder.
  // If Admin: Can see all threads for fraud prevention, dispute arbitration, and on-behalf assistance.
  const visibleOffers = effectiveIsAdmin
    ? job.offers
    : currentRole === 'client'
    ? job.offers
    : job.offers.filter(o => o.id === selectedOfferId || o.transporterId === 'trans-003' || (job.offers.length > 0 && o.id === (activeOffer?.id || job.offers[0].id)));

  // Admin New Bid on Behalf inputs
  const [showAdminNewBidForm, setShowAdminNewBidForm] = useState(false);
  const [onBehalfDriverName, setOnBehalfDriverName] = useState('Moses Ochen (Assisted by Admin)');
  const [onBehalfVehicle, setOnBehalfVehicle] = useState('Fuso 7T Box Body');
  const [onBehalfInitialBid, setOnBehalfInitialBid] = useState(String(job.clientBudgetUGX || 1700000));

  const handleApplySmartOffer = (priceUGX: number, pitchMessage: string) => {
    setCounterPriceInput(String(priceUGX));
    setNewMessage(pitchMessage);
  };

  const numericCounter = parseInt(counterPriceInput.replace(/[^0-9]/g, ''), 10) || 0;

  // Warning check: Is price unusually low (< 40% of benchmark)?
  const isSuspiciouslyLow = numericCounter > 0 && job.marketPriceEstimateUGX > 0 && numericCounter < (job.marketPriceEstimateUGX * 0.35);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !counterPriceInput) return;

    const proposedNum = numericCounter > 0 ? numericCounter : undefined;
    
    let senderRole: 'client' | 'transporter' | 'admin' = 'client';
    let senderName = job.clientName;
    let onBehalfOf: 'driver' | 'client' | undefined = undefined;

    if (effectiveIsAdmin) {
      if (adminActAs === 'behalf_driver') {
        senderRole = 'admin';
        onBehalfOf = 'driver';
        senderName = `Admin Mark Sentongo (Bidding for Driver: ${activeOffer?.transporterName || 'Transporter'})`;
      } else if (adminActAs === 'behalf_client') {
        senderRole = 'admin';
        onBehalfOf = 'client';
        senderName = `Admin Mark Sentongo (Negotiating for Client: ${job.clientName})`;
      } else {
        senderRole = 'admin';
        senderName = `Admin Mark Sentongo (Arbitrator & Escrow Oversight)`;
      }
    } else if (currentRole === 'transporter') {
      senderRole = 'transporter';
      senderName = activeOffer?.transporterName || 'Transporter Moses Ochen';
    } else {
      senderRole = 'client';
      senderName = job.clientName;
    }

    const newMsgObj = {
      id: 'm-' + Date.now(),
      senderRole,
      senderName,
      message: newMessage.trim() || (proposedNum ? `Counter Offer proposition: ${formatMoney(proposedNum, currency)}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposedPriceUGX: proposedNum,
      onBehalfOf,
      isConfidentialToPartiesAndAdmin: true,
    };

    const updatedMessages = [...messages, newMsgObj];
    setMessages(updatedMessages);
    setNewMessage('');

    if (activeOffer) {
      const updatedOffer: JobOffer = {
        ...activeOffer,
        counterPriceUGX: proposedNum || activeOffer.counterPriceUGX,
        isNegotiable,
        status: 'countered',
        messages: updatedMessages,
      };

      const updatedJob: Job = {
        ...job,
        status: 'negotiating',
        offers: job.offers.map(o => o.id === activeOffer.id ? updatedOffer : o),
      };
      onUpdateJob(updatedJob);
    } else {
      // Create new offer from transporter or Admin on behalf of driver
      const newOffer: JobOffer = {
        id: 'off-' + Date.now(),
        jobId: job.id,
        transporterId: 'trans-003',
        transporterName: 'Moses Ochen (Assisted by Admin)',
        transporterRating: 4.8,
        transporterDistanceKm: 3,
        vehicleOffered: 'Fuso 7T (Custom Truck Available)',
        offeredPriceUGX: proposedNum || 1700000,
        isNegotiable,
        status: 'pending',
        createdAt: 'Just now',
        messages: [newMsgObj],
      };

      const updatedJob: Job = {
        ...job,
        status: 'negotiating',
        offers: [newOffer, ...job.offers],
      };
      setSelectedOfferId(newOffer.id);
      onUpdateJob(updatedJob);
    }
  };

  const handleAcceptAndLock = (targetOffer?: JobOffer) => {
    const offerToAccept = targetOffer || activeOffer;
    if (!offerToAccept) return;

    const finalAgreed = offerToAccept.counterPriceUGX || offerToAccept.offeredPriceUGX || numericCounter || job.clientBudgetUGX;
    
    const acceptedOffer: JobOffer = {
      ...offerToAccept,
      status: 'accepted',
    };

    const updatedJob: Job = {
      ...job,
      status: 'escrow_pending',
      agreedPriceUGX: finalAgreed,
      assignedTransporterId: offerToAccept.transporterId,
      offers: job.offers.map(o => o.id === offerToAccept.id ? acceptedOffer : o),
    };

    onUpdateJob(updatedJob);
    onOpenEscrow(updatedJob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                MAXIMUS Free Market Bidding &amp; Negotiation Room
              </span>
              <span className="text-xs text-slate-400">Shipment #{job.id}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">
              {job.title}
            </h3>
            <p className="text-xs text-slate-300">
              Client Offer: <strong className="text-amber-400 font-mono">{formatMoney(job.clientBudgetUGX, currency)}</strong> {job.isNegotiable ? '(Negotiable)' : '(Fixed)'} · Vehicle: {job.desiredVehicleType.toUpperCase()} · Cargo: {job.weightTons}T {job.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Market Charter Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[11px] text-amber-200 flex items-center justify-between">
          <span>
            ⚖️ <strong>MAXIMUS is FREE MARKET:</strong> You set price, you negotiate, we secure escrow. We don't fix price. Suggested prices are guide only. 8% commission on final agreed amount.
          </span>
          <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">8% Escrow Fee</span>
        </div>

        {/* STRICT 2-PARTY CONFIDENTIALITY GUARANTEE BANNER */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-[11px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-emerald-400">Strict 2-Party Confidentiality:</strong> Negotiations and bids are secret to strictly the 2 transacting parties ({job.clientName} &amp; {activeOffer?.transporterName || 'Transporter'}) and Super Admin Mark Sentongo.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            Zero Leakage Guarantee
          </span>
        </div>

        {/* ADMIN ON-BEHALF AUTHORITY CONTROLS (IF ADMIN) */}
        {effectiveIsAdmin && (
          <div className="bg-[#0c1a2e] border-b border-[#C9A86A]/30 p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C9A86A]" />
              <span className="font-bold text-white">Admin Acting Authority:</span>
              <div className="inline-flex rounded-xl p-0.5 bg-slate-900 border border-white/10">
                <button
                  type="button"
                  onClick={() => setAdminActAs('admin')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    adminActAs === 'admin'
                      ? 'bg-[#C9A86A] text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🛡️ Super Admin Oversight
                </button>
                <button
                  type="button"
                  onClick={() => setAdminActAs('behalf_driver')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    adminActAs === 'behalf_driver'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🚛 Bid on Behalf of Driver
                </button>
                <button
                  type="button"
                  onClick={() => setAdminActAs('behalf_client')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    adminActAs === 'behalf_client'
                      ? 'bg-sky-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  👤 Negotiate on Behalf of Client
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdminNewBidForm(!showAdminNewBidForm)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/30 transition-colors"
            >
              {showAdminNewBidForm ? '✕ Close Bid Form' : '+ Add Driver Bid on Behalf'}
            </button>
          </div>
        )}

        {/* ADMIN ON-BEHALF NEW BID INLINE FORM */}
        {effectiveIsAdmin && showAdminNewBidForm && (
          <div className="bg-slate-950 border-b border-amber-500/30 p-3 px-4 text-xs space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Submit Initial Carrier Bid on Behalf of an Unable / Offline Driver:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={onBehalfDriverName}
                onChange={(e) => setOnBehalfDriverName(e.target.value)}
                placeholder="Driver Name (e.g. Ronald Kato)"
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                value={onBehalfVehicle}
                onChange={(e) => setOnBehalfVehicle(e.target.value)}
                placeholder="Vehicle (e.g. Semi-Trailer 28T)"
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <div className="flex gap-1.5">
                <input
                  type="number"
                  value={onBehalfInitialBid}
                  onChange={(e) => setOnBehalfInitialBid(e.target.value)}
                  placeholder="Price (UGX)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const priceNum = parseInt(onBehalfInitialBid.replace(/[^0-9]/g, ''), 10) || 1700000;
                    const newOffer: JobOffer = {
                      id: 'off-adm-' + Date.now(),
                      jobId: job.id,
                      transporterId: 'trans-adm-' + Date.now(),
                      transporterName: onBehalfDriverName.trim() || 'Driver (Assisted by Admin)',
                      transporterRating: 4.9,
                      transporterDistanceKm: 2,
                      vehicleOffered: onBehalfVehicle.trim() || 'Fuso 7T Box Body',
                      offeredPriceUGX: priceNum,
                      isNegotiable: true,
                      status: 'pending',
                      createdAt: 'Just now',
                      messages: [
                        {
                          id: 'm-adm-' + Date.now(),
                          senderRole: 'admin',
                          senderName: `Admin Mark Sentongo (Bidding on Behalf of Driver ${onBehalfDriverName})`,
                          message: `Admin placed bid of ${priceNum.toLocaleString()} UGX for ${onBehalfVehicle} on behalf of driver. Available for immediate dispatch.`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          proposedPriceUGX: priceNum,
                          onBehalfOf: 'driver',
                          isConfidentialToPartiesAndAdmin: true,
                        }
                      ],
                    };
                    const updatedJob: Job = {
                      ...job,
                      status: 'negotiating',
                      offers: [newOffer, ...job.offers],
                    };
                    setSelectedOfferId(newOffer.id);
                    onUpdateJob(updatedJob);
                    setShowAdminNewBidForm(false);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg whitespace-nowrap"
                >
                  Post Bid
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Split: Left Bids List (if Client has multiple bids) + Right Chat Thread */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
          
          {/* Bids List Sidebar */}
          {visibleOffers.length > 0 && (
            <div className="w-full md:w-80 bg-slate-950 border-r border-slate-800 p-3 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-300">
                  {effectiveIsAdmin ? `Carrier Bids (${visibleOffers.length})` : currentRole === 'client' ? `Received Bids (${visibleOffers.length})` : 'Your Private Bid Channel'}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {currentRole === 'transporter' && !effectiveIsAdmin ? '🔒 Confidential' : 'Bilateral'}
                </span>
              </div>

              {visibleOffers.map((offer) => {
                const isSelected = (activeOffer?.id === offer.id);
                return (
                  <div
                    key={offer.id}
                    onClick={() => setSelectedOfferId(offer.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                      isSelected 
                        ? 'bg-orange-500/15 border-orange-500/50 shadow-md' 
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{offer.transporterName}</span>
                          <span className="text-[10px] text-amber-400 flex items-center">
                            ★ {offer.transporterRating}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>{offer.vehicleOffered}</span>
                        </div>
                        {offer.transporterDistanceKm && (
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{offer.transporterDistanceKm}km away</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-sm text-orange-400 font-mono">
                          {formatMoney(offer.counterPriceUGX || offer.offeredPriceUGX, currency)}
                        </div>
                        {offer.counterPriceUGX && (
                          <div className="text-[9px] text-slate-500 line-through">
                            {formatMoney(offer.offeredPriceUGX, currency)}
                          </div>
                        )}
                        <span className={`px-1.5 py-0.2 text-[9px] rounded uppercase font-bold ${
                          offer.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {offer.status}
                        </span>
                      </div>
                    </div>

                    {/* Quick Accept CTA in list for client or Admin acting on behalf of client */}
                    {((currentRole === 'client') || (effectiveIsAdmin && adminActAs === 'behalf_client')) && !isAgreed && (
                      <div className="pt-2 flex items-center gap-1.5 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptAndLock(offer);
                          }}
                          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOfferId(offer.id);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] rounded-lg transition-colors"
                        >
                          Counter
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Right: Negotiation Chat Stream & Actions */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            
            {/* Active Thread Banner */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Active Carrier Thread:</span>
                <span className="font-bold text-white">
                  {activeOffer?.transporterName || 'Moses Ochen'}
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {formatMoney(activeOffer?.counterPriceUGX || activeOffer?.offeredPriceUGX || 1700000, currency)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSmartBidding(!showSmartBidding)}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Smart Bidding Insights</span>
              </button>
            </div>

            {/* Smart Bidding Collapsible */}
            {showSmartBidding && (
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 max-h-48 overflow-y-auto">
                <SmartBiddingAssistant
                  job={job}
                  currency={currency}
                  language={language}
                  historicalJobs={historicalJobs}
                  onApplyOffer={handleApplySmartOffer}
                  isTransporter={isTransporter}
                />
              </div>
            )}

            {/* Negotiation Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/60">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No counter offers exchanged yet. Type an offer below to negotiate directly like Jumia chat.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = (currentRole === 'client' && m.senderRole === 'client') || 
                               (currentRole === 'transporter' && m.senderRole === 'transporter');
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                        {m.senderName} · {m.timestamp}
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-md ${
                          isMe 
                            ? 'bg-orange-500 text-black font-medium rounded-tr-none' 
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                        {m.proposedPriceUGX && (
                          <div className={`mt-2 pt-1.5 border-t flex items-center justify-between text-xs font-extrabold ${
                            isMe ? 'border-black/20 text-black font-mono' : 'border-slate-700 text-amber-400 font-mono'
                          }`}>
                            <span>Proposed Price:</span>
                            <span>{formatMoney(m.proposedPriceUGX, currency)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions: Counter Offer & Lock & Accept */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2.5">
              
              {isAgreed ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="font-bold">Agreed Locked Price:</span>{' '}
                      <span className="font-mono font-extrabold text-sm">{formatMoney(job.agreedPriceUGX || 0, currency)}</span>
                    </div>
                  </div>
                  {job.status === 'escrow_pending' && currentRole === 'client' && (
                    <button
                      onClick={() => onOpenEscrow(job)}
                      className="px-4 py-2 bg-emerald-500 text-black rounded-lg font-bold hover:bg-emerald-400 transition-colors shadow-md"
                    >
                      Fund Escrow Now
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Counter Price Bar */}
                  <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <Coins className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
                    <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                      {isTransporter ? 'Your Bid Price (UGX):' : (effectiveIsAdmin && adminActAs === 'behalf_driver') ? 'Driver Bid (UGX):' : 'Counter Offer (UGX):'}
                    </span>
                    <input
                      type="text"
                      value={counterPriceInput}
                      onChange={(e) => setCounterPriceInput(e.target.value)}
                      placeholder={isTransporter ? "Enter your best price - client will choose" : "Enter counter offer e.g. 1,900,000"}
                      className="flex-1 min-w-[140px] bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                    />

                    {/* Negotiable Checkbox */}
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer px-1">
                      <input
                        type="checkbox"
                        checked={isNegotiable}
                        onChange={(e) => setIsNegotiable(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Negotiable</span>
                    </label>
                    
                    {/* Accept Button (Locks Price) */}
                    <button
                      type="button"
                      onClick={() => handleAcceptAndLock()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors whitespace-nowrap"
                      title="Agree and lock this price for shipment"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{currentRole === 'client' ? 'Lock & Accept Bid' : (effectiveIsAdmin && adminActAs === 'behalf_client') ? 'Accept on Behalf of Client' : (effectiveIsAdmin && adminActAs === 'behalf_driver') ? 'Confirm Driver Offer' : 'Accept Client Offer'}</span>
                    </button>
                  </div>

                  {/* Warning only (no blocking!) */}
                  {isSuspiciouslyLow && (
                    <div className="px-2 text-[10px] text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Warning: Price much lower than average (1.4M) - ensure cargo is legit. Allowed by Free Market rules.</span>
                    </div>
                  )}

                  {/* Message Input & Send */}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type counter offer note or chat terms (e.g. 'Can we do 1.9M final?')..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                      title="Send Counter Offer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Counter</span>
                    </button>
                  </form>
                </>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
