import React, { useState } from 'react';
import { 
  REAL_SERVICE_PROVIDERS, 
  ServiceProviderItem 
} from '../../data/serviceProvidersData';
import { Currency, Language } from '../../types';
import { formatMoney } from '../../services/currency';
import { 
  Search, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  CheckCircle2, 
  MessageSquare, 
  ExternalLink,
  Filter,
  Truck,
  Plane,
  Anchor,
  FileCheck,
  Building2,
  Wrench,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ServicesMarketplaceProps {
  currency: Currency;
  language?: Language;
  onSelectHaulageCore?: () => void;
}

type CategoryFilter = 'all' | 'shipping_lines' | 'airlines_cargo' | 'transporters' | 'clearing_agents' | 'banks' | 'professionals';

export const ServicesMarketplace: React.FC<ServicesMarketplaceProps> = ({
  currency,
  language = 'en',
  onSelectHaulageCore,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);

  // Filter providers
  const filteredProviders = REAL_SERVICE_PROVIDERS.filter((provider) => {
    if (selectedCategory !== 'all' && provider.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = provider.name.toLowerCase().includes(q);
      const matchProfession = provider.profession.toLowerCase().includes(q);
      const matchLocation = provider.location.toLowerCase().includes(q);
      const matchNotes = provider.notes?.toLowerCase().includes(q);
      if (!matchName && !matchProfession && !matchLocation && !matchNotes) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {quoteSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>{quoteSuccessMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0A1931] via-[#0f2747] to-[#0A1931] border border-[#C9A86A]/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A86A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A86A]/20 text-[#e6cb96] border border-[#C9A86A]/40 text-[11px] font-bold tracking-widest uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A86A]" />
            Preloaded Official Directory · Real Verified Contacts
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            East Africa Logistics &amp; Professional Service Directory
          </h1>
          
          <p className="text-sm text-slate-300 leading-relaxed">
            Verified Shipping Lines, Air Cargo Carriers, Clearing &amp; Forwarding Agents (UCIFA/URA), Licensed Transporters, Banking Escrow Partners, and Allied Master Craftsmen across the Northern &amp; Central Corridors.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Anchor className="w-3.5 h-3.5 text-sky-400" />
              Ocean Lines: Maersk, MSC, CMA CGM, Grimaldi
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Plane className="w-3.5 h-3.5 text-amber-400" />
              Air Cargo: Ethiopian, Emirates, Qatar, Turkish, Uganda Airlines
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills & Search Controls */}
      <div className="bg-[#101F33] border border-white/10 rounded-2xl p-4 shadow-xl space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider by name, city, phone, or service (e.g. Maersk, Namanve, Clearing, Stanbic, Mechanics)..."
            className="w-full pl-11 pr-4 py-3 bg-[#081220] border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#C9A86A] transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Verified (${REAL_SERVICE_PROVIDERS.length})`, icon: Sparkles },
            { id: 'shipping_lines', label: 'Shipping Lines', icon: Anchor },
            { id: 'airlines_cargo', label: 'Airlines Cargo', icon: Plane },
            { id: 'transporters', label: 'Legit Transporters', icon: Truck },
            { id: 'clearing_agents', label: 'Clearing Agents (UCIFA)', icon: FileCheck },
            { id: 'banks', label: 'Banks (TrustVault)', icon: Building2 },
            { id: 'professionals', label: 'Other Professionals', icon: Wrench },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
                className={`transition-all whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border ${
                  isSelected
                    ? 'bg-[#C9A86A] text-[#0A1931] border-[#C9A86A] shadow-md shadow-[#C9A86A]/20 scale-[1.02]'
                    : 'bg-[#1a2d47] hover:bg-[#223959] text-slate-300 hover:text-white border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="group relative bg-[#0e1d32] border border-white/10 hover:border-[#C9A86A]/50 rounded-2xl p-5 shadow-xl backdrop-blur flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#C9A86A]/10"
          >
            <div className="space-y-3">
              {/* Header: Logo Initial + Name + Verified Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Logo Initial Badge */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${provider.colorScheme || 'from-[#C9A86A] to-amber-700'} text-white font-black text-sm flex items-center justify-center shadow-lg tracking-wider shrink-0`}>
                    {provider.logoInitial}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base leading-tight group-hover:text-[#C9A86A] transition-colors">
                      {provider.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                      {provider.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Verified Badge */}
                {provider.verified && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              {/* Profession / Role */}
              <div className="text-xs font-semibold text-[#e6cb96] leading-snug">
                {provider.profession}
              </div>

              {/* Location */}
              <div className="text-xs text-slate-300 flex items-start gap-2 bg-[#091424] p-2.5 rounded-xl border border-white/5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{provider.location}</span>
              </div>

              {/* Real Notes / Description if present */}
              {provider.notes && (
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  {provider.notes}
                </p>
              )}

              {/* Contact Information (Clickable Phone & Email) */}
              <div className="space-y-1.5 pt-1 text-xs font-mono">
                {/* Clickable Phone */}
                <a
                  href={`tel:${provider.phoneRaw || provider.phone}`}
                  className="flex items-center gap-2 text-slate-200 hover:text-[#C9A86A] transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  title="Call Phone"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{provider.phone}</span>
                </a>

                {/* Clickable Email */}
                {provider.email && (
                  <a
                    href={`mailto:${provider.email}`}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 truncate"
                    title="Send Email"
                  >
                    <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{provider.email}</span>
                  </a>
                )}

                {/* Website if available */}
                {provider.website && (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-400 hover:text-sky-300 transition-colors p-1.5 rounded-lg hover:bg-white/5 text-[11px]"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{provider.website.replace('https://', '')}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                  </a>
                )}
              </div>
            </div>

            {/* Request Quote Link -> Opens WhatsApp directly and safely */}
            <div className="pt-4 mt-3 border-t border-white/10">
              <a
                href={`https://wa.me/${provider.phoneRaw || provider.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${provider.name}, I am contacting you via MAXIMUS Global Transport Link regarding a freight / professional service inquiry.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setQuoteSuccessMsg(`WhatsApp quote channel opened for ${provider.name}!`);
                  setTimeout(() => setQuoteSuccessMsg(null), 4000);
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 text-xs transition-all text-center"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>Request Quote (WhatsApp)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="p-12 text-center bg-[#101F33] rounded-3xl border border-white/10 space-y-3">
          <Search className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No service providers match your search</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search keywords or select "All Verified".
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="px-4 py-2 bg-[#C9A86A] text-[#0A1931] font-bold text-xs rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
