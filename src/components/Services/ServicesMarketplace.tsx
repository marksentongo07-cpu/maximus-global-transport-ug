import React, { useState } from 'react';
import { 
  REAL_SERVICE_PROVIDERS, 
  ServiceProviderItem 
} from '../../data/serviceProvidersData';
import { Currency, Language, Job, Transporter } from '../../types';
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
  ArrowRight,
  PlusCircle,
  Link as LinkIcon,
  X,
  Lock,
  ChevronRight,
  Boxes,
  Briefcase
} from 'lucide-react';

interface ServicesMarketplaceProps {
  currency: Currency;
  language?: Language;
  onSelectHaulageCore?: () => void;
  jobs?: Job[];
  transporters?: Transporter[];
  onOpenNegotiation?: (job: Job) => void;
  onAddJob?: (job: Job) => void;
  onAddTransporter?: (transporter: Transporter) => void;
  isAdmin?: boolean;
}

type ExtendedFilter = 
  | 'all' 
  | 'seeking_trucks'
  | 'seeking_clients'
  | 'clearing_agents'
  | 'shipping_lines' 
  | 'airlines_cargo' 
  | 'transporters' 
  | 'banks' 
  | 'professionals';

export const ServicesMarketplace: React.FC<ServicesMarketplaceProps> = ({
  currency,
  language = 'en',
  onSelectHaulageCore,
  jobs = [],
  transporters = [],
  onOpenNegotiation,
  onAddJob,
  onAddTransporter,
  isAdmin = false,
}) => {
  // Provider list in state (includes preloaded + newly registered worldwide providers)
  const [providers, setProviders] = useState<ServiceProviderItem[]>(() => {
    try {
      const stored = localStorage.getItem('maximus_global_service_providers');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...REAL_SERVICE_PROVIDERS.filter(p => !parsed.some((x: any) => x.id === p.id))];
        }
      }
    } catch (e) {
      // fallback
    }
    return REAL_SERVICE_PROVIDERS;
  });

  const [selectedFilter, setSelectedFilter] = useState<ExtendedFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Linkage Modal States
  const [linkTrucksForProvider, setLinkTrucksForProvider] = useState<ServiceProviderItem | null>(null);
  const [linkClientsForProvider, setLinkClientsForProvider] = useState<ServiceProviderItem | null>(null);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCategory, setNewCategory] = useState<'clearing_agents' | 'shipping_lines' | 'airlines_cargo' | 'transporters' | 'banks' | 'professionals'>('clearing_agents');
  const [newProfession, setNewProfession] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [seekingClients, setSeekingClients] = useState(true);
  const [seekingTrucks, setSeekingTrucks] = useState(true);
  const [seekingCustoms, setSeekingCustoms] = useState(true);
  const [truckTypesNeeded, setTruckTypesNeeded] = useState('Semi-Trailer 20ft/40ft, Fuso 7T, Lowbed');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Handle Provider Registration
  const handleRegisterCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newLocation.trim() || !newPhone.trim()) {
      showToast('⚠️ Please enter company name, location, and phone number.');
      return;
    }

    const initials = newCompanyName
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 3)
      .toUpperCase() || 'SVC';

    const categoryLabels: Record<string, string> = {
      clearing_agents: 'Customs Clearing & Freight Forwarders',
      shipping_lines: 'Shipping Lines',
      airlines_cargo: 'Airlines Cargo',
      transporters: 'Fleet Transporter',
      banks: 'Banking & Escrow Vault',
      professionals: 'Allied Logistics Professional',
    };

    const newProvider: ServiceProviderItem = {
      id: 'sp-world-' + Date.now(),
      name: newCompanyName.trim(),
      category: newCategory,
      categoryLabel: categoryLabels[newCategory] || 'Logistics Service',
      profession: newProfession.trim() || categoryLabels[newCategory],
      location: newLocation.trim(),
      phone: newPhone.trim(),
      phoneRaw: newPhone.replace(/[^0-9+]/g, ''),
      email: newEmail.trim() || undefined,
      website: newWebsite.trim() || undefined,
      verified: true,
      notes: newNotes.trim() || 'Worldwide verified logistics and freight forwarding partner.',
      logoInitial: initials,
      colorScheme: 'from-amber-600 via-amber-700 to-slate-900',
      linkedNeeds: {
        seekingClients,
        seekingTrucks,
        seekingCustomsClearance: seekingCustoms,
        description: `Actively seeking ${seekingClients ? 'clients with cargo' : ''} ${seekingTrucks ? 'and carrier trucks' : ''} on the Maximus global network.`,
      },
      matchedTruckTypes: truckTypesNeeded.split(',').map(s => s.trim()),
      matchedCorridors: ['Mombasa ➔ Kampala', 'Dar es Salaam ➔ Kampala', 'Entebbe Cargo Hub', 'Regional Corridors'],
    };

    const updated = [newProvider, ...providers];
    setProviders(updated);
    try {
      localStorage.setItem('maximus_global_service_providers', JSON.stringify(updated.slice(0, 50)));
    } catch (e) {
      // ignore
    }

    setShowRegisterModal(false);
    setNewCompanyName('');
    setNewProfession('');
    setNewLocation('');
    setNewPhone('');
    setNewEmail('');
    setNewWebsite('');
    setNewNotes('');

    showToast(`🎉 ${newProvider.name} registered and linked to MAXIMUS global ecosystem!`);
  };

  // Filter providers
  const filteredProviders = providers.filter((provider) => {
    if (selectedFilter === 'seeking_trucks') {
      if (!provider.linkedNeeds?.seekingTrucks) return false;
    } else if (selectedFilter === 'seeking_clients') {
      if (!provider.linkedNeeds?.seekingClients) return false;
    } else if (selectedFilter !== 'all') {
      if (provider.category !== selectedFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = provider.name.toLowerCase().includes(q);
      const matchProfession = provider.profession.toLowerCase().includes(q);
      const matchLocation = provider.location.toLowerCase().includes(q);
      const matchNotes = provider.notes?.toLowerCase().includes(q);
      const matchNeeds = provider.linkedNeeds?.description?.toLowerCase().includes(q);
      if (!matchName && !matchProfession && !matchLocation && !matchNotes && !matchNeeds) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#C9A86A] text-slate-950 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 border border-white/20 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0A1931] via-[#0f2747] to-[#0A1931] border border-[#C9A86A]/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A86A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A86A]/20 text-[#e6cb96] border border-[#C9A86A]/40 text-[11px] font-bold tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A86A]" />
              Global Service Provider Linkage System
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
              Worldwide Inter-Connectivity Active
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Worldwide Logistics, Customs Clearing &amp; Service Provider Network
          </h1>
          
          <p className="text-sm text-slate-300 leading-relaxed">
            Every customs clearing agency (like <strong>Overseas Freight Forwarders Limited</strong>), freight broker, shipping line, truck fleet, and warehousing depot in the world can link directly with cargo shippers, container haulage trucks, and secret bilateral negotiation rooms within MAXIMUS.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2.5 bg-[#C9A86A] hover:bg-[#d6b77c] text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Register Your Company / Service Worldwide</span>
            </button>

            <button
              onClick={() => setSelectedFilter('seeking_trucks')}
              className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Providers Looking for Trucks</span>
            </button>

            <button
              onClick={() => setSelectedFilter('seeking_clients')}
              className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
            >
              <Boxes className="w-4 h-4 text-cyan-400" />
              <span>Providers Looking for Cargo Clients</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Spotlight: Overseas Freight Forwarders Limited */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0A1931] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-[#C9A86A] to-blue-900 text-white font-black text-lg flex items-center justify-center shadow-xl tracking-wider shrink-0 border border-amber-400/30">
              OFF
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Featured Case Study
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  URA Licensed Customs Broker
                </span>
                <span className="text-xs text-slate-400">Plot 14/18 Nakawa Industrial Area, Kampala</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Overseas Freight Forwarders Limited
              </h2>
              <p className="text-xs text-amber-200/90 leading-relaxed max-w-2xl">
                Specialized in Port of Mombasa &amp; Dar es Salaam port transit, URA Asycuda customs declarations, container clearance, and cross-border road freight. Currently looking for shippers with import/export cargo and container flatbed trucks.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-300">
                <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-emerald-400">
                  ✓ Seeking Cargo Clients
                </span>
                <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-amber-400">
                  ✓ Seeking 20ft/40ft &amp; Lowbed Trucks
                </span>
                <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-cyan-400">
                  ✓ Mombasa-Malaba-Kampala Corridor
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions for Overseas Freight Forwarders */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => {
                const off = providers.find(p => p.id === 'clr-overseas-001') || providers[0];
                setLinkTrucksForProvider(off);
              }}
              className="flex-1 lg:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Link with Available Trucks</span>
            </button>

            <button
              onClick={() => {
                const off = providers.find(p => p.id === 'clr-overseas-001') || providers[0];
                setLinkClientsForProvider(off);
              }}
              className="flex-1 lg:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Link with Cargo Clients</span>
            </button>

            <a
              href="https://wa.me/256701982345?text=Hello%20Overseas%20Freight%20Forwarders%20Limited,%20I%20am%20contacting%20you%20via%20MAXIMUS%20Global%20Transport%20Link."
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 lg:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct WhatsApp Contact</span>
            </a>
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
            placeholder="Search provider by name, city, clearing agency, cargo corridor, phone (e.g. Overseas Freight, Maersk, Nakawa, Mombasa)..."
            className="w-full pl-11 pr-4 py-3 bg-[#081220] border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#C9A86A] transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Verified (${providers.length})`, icon: Sparkles },
            { id: 'seeking_trucks', label: 'Seeking Trucks 🚛', icon: Truck },
            { id: 'seeking_clients', label: 'Seeking Clients 📦', icon: Boxes },
            { id: 'clearing_agents', label: 'Clearing & Forwarding (UCIFA)', icon: FileCheck },
            { id: 'shipping_lines', label: 'Shipping Lines', icon: Anchor },
            { id: 'airlines_cargo', label: 'Airlines Cargo', icon: Plane },
            { id: 'transporters', label: 'Fleet Transporters', icon: Truck },
            { id: 'banks', label: 'Banking & Escrow', icon: Building2 },
            { id: 'professionals', label: 'Allied Professionals', icon: Wrench },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id as ExtendedFilter)}
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

              {/* Linked Needs Badge Strip */}
              {provider.linkedNeeds && (
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-1.5 text-xs">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    <span>In-App Ecosystem Linkage:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.linkedNeeds.seekingClients && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                        Looking for Clients 📦
                      </span>
                    )}
                    {provider.linkedNeeds.seekingTrucks && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        Looking for Trucks 🚛
                      </span>
                    )}
                    {provider.linkedNeeds.seekingCustomsClearance && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Customs Clearance 📑
                      </span>
                    )}
                  </div>
                  {provider.linkedNeeds.description && (
                    <p className="text-[11px] text-slate-300 italic pt-0.5">
                      "{provider.linkedNeeds.description}"
                    </p>
                  )}
                </div>
              )}

              {/* Location */}
              <div className="text-xs text-slate-300 flex items-start gap-2 bg-[#091424] p-2.5 rounded-xl border border-white/5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{provider.location}</span>
              </div>

              {/* Real Notes / Description if present */}
              {provider.notes && !provider.linkedNeeds && (
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

            {/* Bottom Actions: Linkage Buttons + WhatsApp */}
            <div className="pt-4 mt-3 border-t border-white/10 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLinkTrucksForProvider(provider)}
                  className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  title="View matching trucks & fleets registered in Maximus"
                >
                  <Truck className="w-3 h-3 text-amber-400" />
                  <span>Link Trucks</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLinkClientsForProvider(provider)}
                  className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  title="View clients with cargo looking for clearing or freight forwarding"
                >
                  <Boxes className="w-3 h-3 text-cyan-400" />
                  <span>Link Clients</span>
                </button>
              </div>

              {/* Direct WhatsApp Channel */}
              <a
                href={`https://wa.me/${provider.phoneRaw || provider.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${provider.name}, I am contacting you via MAXIMUS Global Transport Link regarding a freight / professional service inquiry.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  showToast(`WhatsApp quote channel opened for ${provider.name}!`);
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 text-xs transition-all text-center"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>Contact via WhatsApp</span>
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
            onClick={() => { setSelectedFilter('all'); setSearchQuery(''); }}
            className="px-4 py-2 bg-[#C9A86A] text-[#0A1931] font-bold text-xs rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: LINK WITH AVAILABLE TRUCKS IN APP */}
      {/* ========================================================================= */}
      {linkTrucksForProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Global Linkage Hub: Match Carrier Trucks
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Connecting Trucks for: {linkTrucksForProvider.name}
                </h3>
                <p className="text-xs text-slate-300">
                  Matched truck types: {linkTrucksForProvider.matchedTruckTypes?.join(', ') || 'Semi-Trailers, Fusos, Heavy Flatbeds'}
                </p>
              </div>
              <button
                onClick={() => setLinkTrucksForProvider(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-950/60">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
                💡 <strong>How it works:</strong> You can assign cargo shipments directly to these verified carriers, or dispatch containers through their verified trucks.
              </div>

              {transporters.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No registered transporters found in fleet list.
                </div>
              ) : (
                transporters.map((carrier) => (
                  <div
                    key={carrier.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{carrier.name}</span>
                        <span className="text-xs text-amber-400">★ {carrier.rating}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          {carrier.status === 'active' ? 'Available' : 'On Trip'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{carrier.companyName}</span>
                        <span>·</span>
                        <span>{carrier.vehicles[0]?.name || 'Semi-Trailer 28T'}</span>
                        <span className="font-mono text-amber-300">({carrier.vehicles[0]?.plateNumber || 'UBD 441L'})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>Current Depot: {carrier.currentLocation?.address || 'Nakawa / Namanve Corridor'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`tel:${carrier.phone}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        Call Driver
                      </a>
                      <button
                        onClick={() => {
                          showToast(`🤝 Consignment dispatched from ${linkTrucksForProvider.name} to ${carrier.name}!`);
                          setLinkTrucksForProvider(null);
                        }}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow transition-all"
                      >
                        Connect Consignment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LINK WITH CARGO CLIENTS IN APP */}
      {/* ========================================================================= */}
      {linkClientsForProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Global Linkage Hub: Match Cargo Clients
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Active Cargo Clients for: {linkClientsForProvider.name}
                </h3>
                <p className="text-xs text-slate-300">
                  Active shipments needing customs clearance, freight forwarding, or transport
                </p>
              </div>
              <button
                onClick={() => setLinkClientsForProvider(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-950/60">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-200">
                🔒 <strong>Confidential Bilateral Bidding:</strong> When you submit a rate or start negotiations, it is secret to only you, this client, and Super Admin Mark Sentongo.
              </div>

              {jobs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active cargo shipments currently open.
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{job.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 font-mono">
                          #{job.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <span>Shipper: {job.clientName}</span>
                        <span>·</span>
                        <span>{job.weightTons}T {job.category}</span>
                        <span>·</span>
                        <span className="text-amber-400 font-mono font-bold">Budget: {formatMoney(job.clientBudgetUGX, currency)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>Route: {job.pickupLocation.name} ➔ {job.deliveryLocation.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setLinkClientsForProvider(null);
                          if (onOpenNegotiation) {
                            onOpenNegotiation(job);
                          } else {
                            showToast(`Confidential negotiation opened with ${job.clientName}!`);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Negotiate Bilateral</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTER WORLDWIDE SERVICE PROVIDER COMPANY */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-[#C9A86A]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#C9A86A]/20 text-[#e6cb96] border border-[#C9A86A]/30">
                  Global Registration Hub
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Register Your Company / Service Worldwide
                </h3>
                <p className="text-xs text-slate-300">
                  Join the MAXIMUS international logistics registry and connect with clients &amp; fleets
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterCompany} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Overseas Freight Forwarders Limited / Apex Maritime Services"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A86A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Service Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A86A]"
                  >
                    <option value="clearing_agents">Customs Clearing &amp; Freight Forwarding (UCIFA)</option>
                    <option value="shipping_lines">Shipping Line Carrier</option>
                    <option value="airlines_cargo">Airlines Cargo Carrier</option>
                    <option value="transporters">Fleet Truck Transporter</option>
                    <option value="banks">Banking Escrow &amp; Trade Finance</option>
                    <option value="professionals">Allied Inspection / Mechanics / Warehouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Specialization / Profession Title
                  </label>
                  <input
                    type="text"
                    value={newProfession}
                    onChange={(e) => setNewProfession(e.target.value)}
                    placeholder="e.g. Licensed Customs Clearing &amp; Port Transit"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A86A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Physical Office &amp; Country / City *
                </label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Plot 14/18 Nakawa Industrial Area, Kampala, Uganda / Mombasa Port"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A86A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+256 701 982345"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#C9A86A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="operations@company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#C9A86A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#C9A86A]"
                  />
                </div>
              </div>

              {/* What is your company looking for in MAXIMUS? */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-white/10 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">
                  What are you actively looking for in the MAXIMUS network?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seekingClients}
                      onChange={(e) => setSeekingClients(e.target.checked)}
                      className="accent-[#C9A86A] rounded"
                    />
                    <span>Seeking Cargo Clients</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seekingTrucks}
                      onChange={(e) => setSeekingTrucks(e.target.checked)}
                      className="accent-[#C9A86A] rounded"
                    />
                    <span>Seeking Trucks &amp; Fleets</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seekingCustoms}
                      onChange={(e) => setSeekingCustoms(e.target.checked)}
                      className="accent-[#C9A86A] rounded"
                    />
                    <span>Customs Clearance</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Preferred Truck Types / Fleet Needs:
                  </label>
                  <input
                    type="text"
                    value={truckTypesNeeded}
                    onChange={(e) => setTruckTypesNeeded(e.target.value)}
                    placeholder="e.g. Semi-Trailer 20ft/40ft, Fuso 7T, Lowbed Trailer"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Company Bio &amp; Service Description
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Describe your capabilities, customs clearing license, trade corridors handled, or special logistics equipment..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A86A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C9A86A] hover:bg-[#d6b77c] text-slate-950 rounded-xl text-xs font-extrabold shadow-lg transition-transform active:scale-95"
                >
                  Complete Registration &amp; Link Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
