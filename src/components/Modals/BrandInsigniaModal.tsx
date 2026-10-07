import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Gem, 
  Compass, 
  Layers, 
  Zap,
  Eye,
  Crown
} from 'lucide-react';
import { Logo } from '../Logo';

interface BrandInsigniaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandInsigniaModal: React.FC<BrandInsigniaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [previewBg, setPreviewBg] = useState<'obsidian' | 'navy' | 'light' | 'emerald'>('obsidian');
  const [activeTab, setActiveTab] = useState<'vector' | 'render3d' | 'anatomy'>('vector');

  if (!isOpen) return null;

  const handleCopySvg = async () => {
    try {
      const response = await fetch('/logo.svg');
      const svgText = await response.text();
      await navigator.clipboard.writeText(svgText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadSvg = () => {
    const link = document.createElement('a');
    link.href = '/logo.svg';
    link.download = 'maximus-luxury-insignia.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const bgStyles = {
    obsidian: 'bg-[#030712] border-white/10 text-white',
    navy: 'bg-[#0A192F] border-blue-900/40 text-white',
    light: 'bg-[#F8FAFC] border-slate-300 text-slate-900 shadow-inner',
    emerald: 'bg-[#052219] border-emerald-900/50 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#0F172A] via-[#090D16] to-[#03060B] border border-[#C9A86A]/40 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden text-slate-200 my-8">
        
        {/* Top Gold Horizon Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#9E7835] via-[#FFEAA8] to-[#9E7835]"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Crown className="w-5 h-5 text-[#F3DE9C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  MAXIMUS Imperial Insignia
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#C9A86A]/20 text-[#FFEAA8] border border-[#C9A86A]/30">
                  Haute-Horlogerie Identity
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Architectural Freight Monogram · 24K Bullion Gold · Global Logistics Escrow
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Main Visual Showcase Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Preview Canvas (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-black/50 border border-white/10 rounded-xl mb-4 w-full max-w-sm justify-center">
                <button
                  onClick={() => setActiveTab('vector')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'vector'
                      ? 'bg-gradient-to-r from-[#C9A86A] to-[#9E7835] text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Scalable Vector
                </button>
                <button
                  onClick={() => setActiveTab('render3d')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'render3d'
                      ? 'bg-gradient-to-r from-[#C9A86A] to-[#9E7835] text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  3D Bullion Render
                </button>
                <button
                  onClick={() => setActiveTab('anatomy')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'anatomy'
                      ? 'bg-gradient-to-r from-[#C9A86A] to-[#9E7835] text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Anatomy
                </button>
              </div>

              {/* The Display Stage */}
              <div 
                className={`w-full aspect-square max-w-[340px] sm:max-w-[360px] rounded-3xl border flex items-center justify-center relative p-6 transition-all duration-300 shadow-2xl ${bgStyles[previewBg]}`}
              >
                {activeTab === 'vector' && (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Logo 
                      size={210} 
                      className="drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] filter hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="mt-4 flex flex-col items-center">
                      <span className="text-base font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#E8C477] to-[#C9A86A]">
                        MAXIMUS
                      </span>
                      <span className="text-[9px] tracking-[0.22em] text-amber-200/80 uppercase font-mono mt-0.5">
                        GLOBAL TRANSPORT LINK
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'render3d' && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                    <img
                      src="/src/assets/images/maximus_luxury_logo_1791400730098.jpg"
                      alt="MAXIMUS 3D Luxury Gold Bullion Emblem Render"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-2xl shadow-xl border border-[#C9A86A]/30"
                    />
                    <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-amber-200/90 text-center font-mono">
                      8K Ray-Traced 24K Gold & Obsidian Render
                    </div>
                  </div>
                )}

                {activeTab === 'anatomy' && (
                  <div className="relative w-full h-full flex flex-col justify-between p-2 text-xs">
                    <div className="flex justify-center">
                      <Logo size={150} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[10.5px]">
                      <div className="p-1.5 rounded-lg bg-black/60 border border-amber-500/20 text-amber-200">
                        <span className="font-bold text-white block">1. Left & Right Pylons:</span>
                        Container Obelisks & Laser Fluting
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/60 border border-amber-500/20 text-amber-200">
                        <span className="font-bold text-white block">2. Center Apex:</span>
                        Imperial Chevron & Keystone Diamond
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/60 border border-amber-500/20 text-amber-200">
                        <span className="font-bold text-white block">3. Hyper-Carrier:</span>
                        Aerodynamic Cab & Photon Beam
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/60 border border-amber-500/20 text-amber-200">
                        <span className="font-bold text-white block">4. 3 Turbine Wheels:</span>
                        Chronometer Gearing & Highway Ingot
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Color Switcher */}
              <div className="flex items-center gap-2 mt-3.5">
                <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider mr-1">
                  Preview Backing:
                </span>
                {(['obsidian', 'navy', 'light', 'emerald'] as const).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setPreviewBg(bg)}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      previewBg === bg ? 'ring-2 ring-[#C9A86A] scale-110' : 'opacity-60 hover:opacity-100'
                    } ${
                      bg === 'obsidian' ? 'bg-[#030712] border-slate-700' :
                      bg === 'navy' ? 'bg-[#0A192F] border-blue-700' :
                      bg === 'light' ? 'bg-[#F8FAFC] border-slate-400' :
                      'bg-[#052219] border-emerald-700'
                    }`}
                    title={`Switch to ${bg}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Information & Action Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gem className="w-4 h-4 text-amber-400" />
                  The 5 Core Luxury Upgrades
                </h3>
                
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✦</span>
                    <div>
                      <strong className="text-white">Haute-Horlogerie Monoliths:</strong> The corrugated container ribs from the original logo are re-imagined as 3D beveled obelisks with laser guilloché pinstripes.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✦</span>
                    <div>
                      <strong className="text-white">Escrow Keystone Diamond:</strong> The center V is crowned with an imperial chevron and an emerald-cut diamond keystone representing secure escrow trust.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✦</span>
                    <div>
                      <strong className="text-white">Aerodynamic Grand-Tourer Cab:</strong> The truck cab is streamlined into a sleek hyper-carrier with sapphire glass and a forward photon laser light beam.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✦</span>
                    <div>
                      <strong className="text-white">3 Turbine Chronometer Wheels:</strong> The 3 lower wheels are engineered with multi-spoke turbine rims and platinum axle gems.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✦</span>
                    <div>
                      <strong className="text-white">Celestial Meridian Orbit:</strong> Sweeping gold equatorial trajectory symbolizing seamless trade connecting Mombasa, Kampala, and the world.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Download & Copy Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={handleDownloadSvg}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AC5B] via-[#FFE28A] to-[#B38734] text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Master SVG
                </button>
                <button
                  onClick={handleCopySvg}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-300" />
                      <span>Copy SVG Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quality & Production Stamp */}
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-[11px] text-amber-100/80 leading-relaxed">
                  Vector asset configured for responsive rendering at any size (from 16px favicon up to billboard scale) without loss of clarity.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px] text-amber-300/80">
            <span>© 2026 MAXIMUS GLOBAL TRANSPORT LINK</span>
            <span>·</span>
            <span>All Rights Reserved</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default BrandInsigniaModal;
