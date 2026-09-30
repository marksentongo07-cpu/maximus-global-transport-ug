import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Globe, Loader2, Check } from 'lucide-react';

export interface PlaceResult {
  name: string;
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  mode?: string;
  isInternational?: boolean;
}

interface WorldwidePlaceInputProps {
  value: string;
  onChange: (value: string, place?: PlaceResult) => void;
  placeholder?: string;
  label?: string;
  onCountryChange?: (country: string, isInternational: boolean) => void;
}

export const WorldwidePlaceInput: React.FC<WorldwidePlaceInputProps> = ({
  value,
  onChange,
  placeholder = 'Pickup anywhere: e.g. Guangzhou, China or Mombasa, Kenya or Kikuubo, Kampala',
  label,
  onCountryChange,
}) => {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<PlaceResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch predictions with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setPredictions(data.predictions || []);
        }
      } catch (err) {
        console.warn('Place autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.name);
    setIsOpen(false);
    onChange(place.name, place);
    if (onCountryChange) {
      onCountryChange(place.country, !!place.isInternational);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    onChange(val);

    // Auto-detect country if common city entered
    const lower = val.toLowerCase();
    let detectedCountry = 'Uganda';
    let isIntl = false;
    if (lower.includes('china') || lower.includes('guangzhou') || lower.includes('yiwu') || lower.includes('shanghai') || lower.includes('shenzhen')) {
      detectedCountry = 'China';
      isIntl = true;
    } else if (lower.includes('kenya') || lower.includes('mombasa') || lower.includes('nairobi')) {
      detectedCountry = 'Kenya';
      isIntl = true;
    } else if (lower.includes('tanzania') || lower.includes('dar es salaam')) {
      detectedCountry = 'Tanzania';
      isIntl = true;
    } else if (lower.includes('rwanda') || lower.includes('kigali')) {
      detectedCountry = 'Rwanda';
      isIntl = true;
    } else if (lower.includes('dubai') || lower.includes('uae')) {
      detectedCountry = 'United Arab Emirates';
      isIntl = true;
    } else if (lower.includes('india') || lower.includes('mumbai')) {
      detectedCountry = 'India';
      isIntl = true;
    }

    if (onCountryChange) {
      onCountryChange(detectedCountry, isIntl);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="text-[11px] font-bold text-white/80 block mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#1a2a3f] border border-white/20 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#C9A86A] transition-colors"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#C9A86A]" />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[250] bg-[#0c1a2e] border border-[#C9A86A]/40 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 bg-[#081220] border-b border-white/10 text-[10px] font-bold text-[#C9A86A] uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            <span>Worldwide Places & Logistics Hubs</span>
          </div>
          {predictions.map((p, idx) => (
            <button
              key={`${p.name}-${idx}`}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-[#1a2a3f] text-xs text-slate-200 border-b border-white/5 last:border-b-0 flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-[#C9A86A] transition-colors">
                  {p.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {p.city ? `${p.city}, ` : ''}{p.country}
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                p.country === 'Uganda' 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : 'bg-purple-500/20 text-purple-300'
              }`}>
                {p.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
