import React, { useState } from 'react';
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
  Bot
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
}) => {
  const activeOffer = job.offers[0] || null;
  const [messages, setMessages] = useState(activeOffer?.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [counterPriceInput, setCounterPriceInput] = useState<string>(
    activeOffer?.counterPriceUGX ? String(activeOffer.counterPriceUGX) : String(job.marketPriceEstimateUGX)
  );
  const [showSmartBidding, setShowSmartBidding] = useState<boolean>(true);

  const isTransporter = currentRole === 'transporter';
  const isAgreed = job.status === 'escrow_pending' || job.status === 'booked' || job.status === 'in_transit' || job.status === 'delivered';

  const handleApplySmartOffer = (priceUGX: number, pitchMessage: string) => {
    setCounterPriceInput(String(priceUGX));
    setNewMessage(pitchMessage);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !counterPriceInput) return;

    const proposedNum = Number(counterPriceInput) || undefined;
    const senderName = currentRole === 'client' ? job.clientName : (activeOffer?.transporterName || 'Transporter');

    const newMsgObj = {
      id: 'm-' + Date.now(),
      senderRole: currentRole === 'client' ? ('client' as const) : ('transporter' as const),
      senderName,
      message: newMessage.trim() || (proposedNum ? `Updated price proposition to ${formatMoney(proposedNum, currency)}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposedPriceUGX: proposedNum,
    };

    const updatedMessages = [...messages, newMsgObj];
    setMessages(updatedMessages);
    setNewMessage('');

    // Update job offers
    if (activeOffer) {
      const updatedOffer: JobOffer = {
        ...activeOffer,
        counterPriceUGX: proposedNum || activeOffer.counterPriceUGX,
        status: 'countered',
        messages: updatedMessages,
      };

      const updatedJob: Job = {
        ...job,
        status: 'negotiating',
        offers: [updatedOffer],
      };
      onUpdateJob(updatedJob);
    }
  };

  const handleAcceptAndLock = () => {
    const finalAgreed = Number(counterPriceInput) || activeOffer?.counterPriceUGX || activeOffer?.offeredPriceUGX || job.marketPriceEstimateUGX;
    
    if (activeOffer) {
      const acceptedOffer: JobOffer = {
        ...activeOffer,
        status: 'accepted',
      };

      const updatedJob: Job = {
        ...job,
        status: 'escrow_pending',
        agreedPriceUGX: finalAgreed,
        assignedTransporterId: activeOffer.transporterId,
        offers: [acceptedOffer],
      };

      onUpdateJob(updatedJob);
      onOpenEscrow(updatedJob);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Price Negotiation Room
              </span>
              <span className="text-xs text-slate-400">Shipment #{job.id}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">{job.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benchmark Price Engine Anchor Bar */}
        <div className="bg-slate-950 px-4 sm:px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-400">Market Price Benchmark:</span>
              <span className="ml-1.5 font-bold text-amber-400">{formatMoney(job.marketPriceEstimateUGX, currency)}</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <div className="hidden sm:block">
              <span className="text-slate-400">Est. Distance:</span>
              <span className="ml-1.5 font-semibold text-slate-200">{job.estimatedDistanceKm} km</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSmartBidding(!showSmartBidding)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                showSmartBidding 
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
              }`}
              title="Toggle Smart Bidding AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Bidding AI</span>
              {showSmartBidding ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Smart Bidding Assistant Container */}
        {showSmartBidding && (
          <div className="px-3 sm:px-5 py-1.5 bg-slate-950/70 border-b border-slate-800 max-h-[46vh] overflow-y-auto">
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

        {/* Chat / Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-900">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No price offers exchanged yet. Type an offer below to start negotiation.
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
                  <div className="text-[10px] text-slate-400 mb-1 px-1">
                    {m.senderName} · {m.timestamp}
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs shadow-md ${
                      isMe 
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{m.message}</p>
                    {m.proposedPriceUGX && (
                      <div className={`mt-2 pt-2 border-t flex items-center justify-between text-xs font-bold ${
                        isMe ? 'border-slate-950/20 text-slate-950' : 'border-slate-700 text-amber-400'
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

        {/* Bottom Action Area: Counter Offer Input & Accept CTA */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          
          {isAgreed ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold">Price Agreed &amp; Locked:</span>{' '}
                  {formatMoney(job.agreedPriceUGX || 0, currency)}
                </div>
              </div>
              {job.status === 'escrow_pending' && currentRole === 'client' && (
                <button
                  onClick={() => onOpenEscrow(job)}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg font-bold hover:bg-emerald-400 transition-colors"
                >
                  Deposit to Escrow
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Counter Price Bar */}
              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <Coins className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
                <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">Your Offer (UGX):</span>
                <input
                  type="number"
                  value={counterPriceInput}
                  onChange={(e) => setCounterPriceInput(e.target.value)}
                  placeholder="e.g. 1200000"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                
                {/* Accept Button (Locks Price) */}
                <button
                  onClick={handleAcceptAndLock}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors whitespace-nowrap"
                  title="Agree and lock this price for shipment"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock &amp; Accept</span>
                </button>
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type negotiation counter-offer message or terms..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-colors"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
