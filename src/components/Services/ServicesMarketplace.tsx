import React, { useState } from 'react';
import { 
  FUTURE_SERVICE_CATEGORIES, 
  SAMPLE_SERVICE_PROVIDERS 
} from '../../data/mockData';
import { ServiceCategory, ServiceProvider, Currency, Language } from '../../types';
import { formatMoney } from '../../services/currency';
import { t } from '../../services/i18n';
import { 
  Truck, 
  Hammer, 
  Wrench, 
  Zap, 
  Scale, 
  Calculator, 
  Stethoscope, 
  HardHat, 
  Compass, 
  Palette, 
  Scissors, 
  Pickaxe,
  Search,
  Star,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';

interface ServicesMarketplaceProps {
  currency: Currency;
  language?: Language;
  onSelectHaulageCore: () => void;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Truck,
  Hammer,
  Wrench,
  Zap,
  Scale,
  Calculator,
  Stethoscope,
  HardHat,
  Compass,
  Palette,
  Scissors,
  Pickaxe,
};

export const ServicesMarketplace: React.FC<ServicesMarketplaceProps> = ({
  currency,
  language = 'en',
  onSelectHaulageCore,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteDescription, setQuoteDescription] = useState('');

  const filteredProviders = SAMPLE_SERVICE_PROVIDERS.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.profession.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSent(true);
    setTimeout(() => {
      setQuoteSent(false);
      setSelectedProvider(null);
      setQuoteDescription('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Explainer for Expandable Marketplace Architecture */}
      <div className="bg-[#1a2a3f] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur text-slate-200">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-white border border-white/10">
              Future Services Architecture
            </span>
            <span className="text-xs text-white/60">Phase 2 Expansion Ready</span>
          </div>
          <h1 className="text-[18px] sm:text-2xl font-bold text-white tracking-tight">
            MAXIMUS Professional Service Marketplace
          </h1>
          <p className="text-[14px] text-white/70 leading-6">
            Built with an extensible service schema. Beyond freight haulage, clients can connect with verified Carpenters, Electricians, Lawyers, Accountants, Doctors, Builders, Architects, and Heavy Equipment operators across East Africa under the same escrow trust model.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider">Browse Verified Service Sectors:</span>
          <span className="text-white/60">{FUTURE_SERVICE_CATEGORIES.length} Configured Industries</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          
          {/* "All" button */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-black font-bold border-orange-400 shadow-md'
                : 'bg-[#1a2a3f] border-white/10 text-white/80 hover:bg-slate-700'
            }`}
          >
            <div className="text-xs font-bold">All Sectors</div>
            <div className={`text-[10px] ${selectedCategory === 'all' ? 'text-black/80 font-medium' : 'text-white/50'}`}>
              Full Directory
            </div>
          </button>

          {FUTURE_SERVICE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.iconName] || Truck;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.isHaulageCore) {
                    onSelectHaulageCore();
                  } else {
                    setSelectedCategory(cat.id);
                  }
                }}
                className={`p-4 rounded-xl border text-left transition-all relative group ${
                  isSelected
                    ? 'bg-orange-500 text-black font-bold border-orange-400 shadow-md'
                    : 'bg-[#1a2a3f] border-white/10 text-white/80 hover:bg-slate-700'
                }`}
              >
                {cat.isHaulageCore && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Core Active Transport Engine" />
                )}
                <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-black' : 'text-white/80'}`} />
                <div className="text-xs font-bold line-clamp-1">{cat.name}</div>
                <div className={`text-[10px] ${isSelected ? 'text-black/80 font-medium' : 'text-white/50'}`}>
                  {cat.providerCount} Verified
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Providers List */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-bold text-white">Vetted Specialists &amp; Contractors</h3>
            <p className="text-[14px] text-white/60 leading-6">Book corporate services protected by Maximus Escrow arbitration</p>
          </div>

          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specialists (e.g. Solar, Attorney)..."
              className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-[#1a2a3f] border border-white/10 hover:border-white/20 rounded-2xl p-5 shadow-xl backdrop-blur transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={provider.avatarUrl}
                    alt={provider.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[14px] font-bold text-white">{provider.name}</h4>
                      {provider.verified && (
                        <span title="Maximus Vetted & Verified">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/80 font-medium">{provider.profession}</div>
                    <div className="text-[10px] text-white/50">{provider.location}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[16px] font-bold text-white font-mono">
                    {formatMoney(provider.hourlyRateUGX, currency)}
                  </div>
                  <div className="text-[11px] text-white/50">per consult / hr</div>
                </div>
              </div>

              <p className="text-[14px] text-white/70 leading-6 line-clamp-2">{provider.bio}</p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5">
                {provider.specialties.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-700 text-white border border-white/10 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-1 text-orange-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                  <span>{provider.rating}</span>
                  <span className="text-white/50 font-normal">({provider.reviewCount} client reviews)</span>
                </div>

                <button
                  onClick={() => setSelectedProvider(provider)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Request Quote</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Quote Request Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1a2a3f] border border-white/10 rounded-2xl p-5 max-w-md w-full space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-[18px] font-bold text-white">Direct Service Inquiry</h3>
                <p className="text-[14px] text-white/60 leading-6">To: {selectedProvider.name} ({selectedProvider.profession})</p>
              </div>
              <button onClick={() => setSelectedProvider(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSent ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Quote Request Transmitted!</h4>
                <p className="text-xs text-slate-400">
                  {selectedProvider.name} has been notified via SMS and Maximus app. You will receive an offer in your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendQuote} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold">Scope of Work / Project Description:</label>
                  <textarea
                    required
                    rows={3}
                    value={quoteDescription}
                    onChange={(e) => setQuoteDescription(e.target.value)}
                    placeholder="Describe your site requirements, timeline, and location..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Base Hourly Consultation:</span>
                    <span className="font-bold text-white">{formatMoney(selectedProvider.hourlyRateUGX, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximus TrustVault Protection:</span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition-colors"
                >
                  Send Inquiry with Escrow Guarantee
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
