import React, { useState } from 'react';
import { 
  Shield,
  Warehouse,
  Satellite,
  Truck, 
  AlertTriangle,
  Bell, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  ChevronDown, 
  Coins, 
  Globe, 
  UserCircle2,
  CheckCircle2,
  FileText,
  Check,
  Package
} from 'lucide-react';
import { UserRole, Currency, Language } from '../types';
import { formatMoney } from '../services/currency';
import { t, SUPPORTED_LANGUAGES } from '../services/i18n';
import { Logo } from './Logo';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  language: Language;
  onLanguageChange: (l: Language) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenLegal: () => void;
  onOpenPostJob: () => void;
  notifications: Array<{ id: string; title: string; desc: string; time: string; read: boolean }>;
  onMarkNotificationsRead: () => void;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currency,
  onCurrencyChange,
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  isOffline,
  onToggleOffline,
  onOpenLegal,
  onOpenPostJob,
  notifications,
  onMarkNotificationsRead,
  userEmail = 'marksentongo07@gmail.com',
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isAnyMenuOpen = showCurrencyMenu || showLangMenu || showNotifDrawer || showRoleMenu;
  const closeAllMenus = () => {
    setShowCurrencyMenu(false);
    setShowLangMenu(false);
    setShowNotifDrawer(false);
    setShowRoleMenu(false);
  };

  const roleLabels: Record<UserRole, { title: string; subtitle: string }> = {
    client: { title: t('clientAccount', language), subtitle: t('cargoShipper', language) },
    transporter: { title: t('transporterPortal', language), subtitle: t('fleetOwnerDriver', language) },
    admin: { title: t('superAdminOwner', language), subtitle: t('fullManagementEscrow', language) },
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-[100] relative isolate bg-gradient-to-r from-[#0f1c2e] to-[#1a2a3f] text-white border-b border-white/10 shadow-xl">
      {/* Backdrop for closing dropdowns on click outside */}
      {isAnyMenuOpen && (
        <div 
          className="fixed inset-0 z-[150]" 
          onClick={closeAllMenus}
          aria-hidden="true"
        />
      )}

      {/* Header Container: increased padding py-4 px-6 */}
      <div className="flex justify-between items-center flex-wrap gap-4 px-4 sm:px-6 py-4 max-w-[100vw] min-h-16 mx-auto max-w-7xl relative">
        
        {/* Zone 1: Brand Mark with subtle gradient backdrop */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onTabChange('dashboard')} 
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <Logo size={40} className="w-10 h-10 shadow-lg shadow-black/40 rounded-xl" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[18px] font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  MAXIMUS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]"></span>
              </div>
              <p className="text-[10px] tracking-[0.08em] text-slate-400 uppercase font-semibold">
                GLOBAL TRANSPORT LINK
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Tabs - Strictly filtered per user role */}
        <nav className="relative z-10 hidden lg:flex items-center gap-[8px] text-[14px]">
          {currentRole === 'client' ? (
            /* CLIENT SEES ONLY: GPS Radar (his truck only) | My Jobs | Post Cargo | Disputes */
            <>
              <button 
                onClick={() => onTabChange('gps_radar')}
                className={`transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'gps_radar' || activeTab === 'map'
                    ? 'bg-[#C9A86A] text-[#0A1931] rounded-full px-5 py-2 font-bold shadow-md' 
                    : 'text-white/70 hover:text-white rounded-full px-4 py-2 font-medium'
                }`}
              >
                <Satellite className="w-4 h-4 shrink-0 text-amber-400" />
                <span>GPS Radar (My Truck Only)</span>
              </button>

              <button 
                onClick={() => onTabChange('dashboard')}
                className={`transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'dashboard' || activeTab === 'my_jobs'
                    ? 'bg-[#C9A86A] text-[#0A1931] rounded-full px-5 py-2 font-bold shadow-md' 
                    : 'text-white/70 hover:text-white rounded-full px-4 py-2 font-medium'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>My Jobs</span>
              </button>

              <button 
                onClick={onOpenPostJob}
                className="transition-all whitespace-nowrap flex items-center gap-2 bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] rounded-full px-5 py-2 font-extrabold shadow-md shadow-[#C9A86A]/20"
              >
                <Package className="w-4 h-4 shrink-0" />
                <span>Post Cargo</span>
              </button>

              <button 
                onClick={() => onTabChange('disputes')}
                className={`transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'disputes' 
                    ? 'bg-[#C9A86A] text-[#0A1931] rounded-full px-5 py-2 font-bold shadow-md' 
                    : 'text-white/70 hover:text-white rounded-full px-4 py-2 font-medium'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Disputes</span>
              </button>
            </>
          ) : (
            /* TRANSPORTER SEES ONLY: Available Loads | My Bids | GPS Tracking | Disputes */
            <>
              <button 
                onClick={() => onTabChange('dashboard')}
                className={`transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'dashboard' || activeTab === 'available_loads'
                    ? 'bg-[#C9A86A] text-[#0A1931] rounded-full px-5 py-2 font-bold shadow-md' 
                    : 'text-white/70 hover:text-white rounded-full px-4 py-2 font-medium'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Available Loads</span>
              </button>

              <button 
                onClick={() => onTabChange('my_bids')}
                className={`transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_bids' 
                    ? 'bg-[#C9A86A] text-[#0A1931] rounded-full px-5 py-2 font-bold shadow-md' 
                    : 'text-white/70 hover:text-white rounded-full px-4 py-2 font-medium'
                }`}
              >
                <Coins className="w-4 h-4 shrink-0 text-amber-400" />
                <span>My Bids</span>
              </button>

              <button 
                onClick={() => onTabChange('gps_tracking')}
                className={`transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'gps_tracking' || activeTab === 'map'
                    ? 'bg-[#C9A86A] text-[#0A1931] rounded-full px-5 py-2 font-bold shadow-md' 
                    : 'text-white/70 hover:text-white rounded-full px-4 py-2 font-medium'
                }`}
              >
                <Satellite className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="flex items-center gap-1.5">
                  <span>GPS Tracking</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </span>
              </button>

              <button 
                onClick={() => onTabChange('disputes')}
                className={`transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'disputes' 
                    ? 'bg-[#C9A86A] text-[#0A1931] rounded-full px-5 py-2 font-bold shadow-md' 
                    : 'text-white/70 hover:text-white rounded-full px-4 py-2 font-medium'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Disputes</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Controls - reduced orange, slate-700 bg with white text */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          
          {/* Offline Mode Switcher */}
          <button
            onClick={onToggleOffline}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-white/10 ${
              isOffline 
                ? 'bg-orange-500 text-black font-bold' 
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            title={isOffline ? t('offline', language) : t('online', language)}
          >
            {isOffline ? <WifiOff className="w-4 h-4 text-black" /> : <Wifi className="w-4 h-4 text-white" />}
            <span className="hidden xl:inline text-[11px] font-medium">
              {isOffline ? t('offline', language) : t('online', language)}
            </span>
          </button>

          {/* Currency Dropdown: slate-700 background with white text */}
          <div className={`relative ${showCurrencyMenu ? 'z-[200]' : ''}`}>
            <button
              onClick={() => {
                const next = !showCurrencyMenu;
                closeAllMenus();
                setShowCurrencyMenu(next);
              }}
              className="px-3 py-2 rounded-xl bg-slate-700 text-white border border-white/10 text-xs font-semibold hover:bg-slate-600 flex items-center gap-1.5 transition-colors"
            >
              <Coins className="w-3.5 h-3.5 text-white/80" />
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>
            {showCurrencyMenu && (
              <div className="absolute right-0 top-full mt-2 z-[200] w-40 bg-[#1a2a3f] border border-white/10 rounded-2xl shadow-xl backdrop-blur p-2 text-white">
                {(['UGX', 'USD', 'EUR', 'KES', 'TZS'] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => { onCurrencyChange(c); setShowCurrencyMenu(false); }}
                    className={`w-full px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition-colors ${
                      currency === c ? 'bg-orange-500 text-black font-bold' : 'hover:bg-slate-700 text-white/80'
                    }`}
                  >
                    <span>{c}</span>
                    {c === 'UGX' && <span className="text-[10px] text-white/60 font-normal">Uganda</span>}
                    {c === 'KES' && <span className="text-[10px] text-white/60 font-normal">Kenya</span>}
                    {c === 'USD' && <span className="text-[10px] text-white/60 font-normal">Global</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Selector Dropdown: slate-700 background with white text */}
          <div className={`relative ${showLangMenu ? 'z-[200]' : ''}`}>
            <button
              onClick={() => {
                const next = !showLangMenu;
                closeAllMenus();
                setShowLangMenu(next);
              }}
              className="px-3 py-2 rounded-xl bg-slate-700 text-white border border-white/10 text-xs font-semibold hover:bg-slate-600 flex items-center gap-1.5 transition-colors"
              title="Change Language / Kyusa Olulimi / Badilisha Lugha"
            >
              <Globe className="w-3.5 h-3.5 text-white/80" />
              <span className="font-bold text-[11px] uppercase tracking-wider">{language}</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 z-[200] w-52 bg-[#1a2a3f] border border-white/10 rounded-2xl shadow-xl backdrop-blur p-2 text-white">
                <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                  Select Language / Lugha
                </div>
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => { 
                      onLanguageChange(item.code); 
                      setShowLangMenu(false); 
                    }}
                    className={`w-full px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition-colors mt-1 ${
                      language === item.code ? 'bg-orange-500 text-black font-bold' : 'hover:bg-slate-700 text-white/80'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-[10px] ${language === item.code ? 'text-black/70' : 'text-white/50'}`}>
                        {item.localName} · {item.region}
                      </div>
                    </div>
                    {language === item.code && (
                      <Check className="w-4 h-4 text-black" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell: slate-700 background with white text */}
          <div className={`relative ${showNotifDrawer ? 'z-[200]' : ''}`}>
            <button
              onClick={() => {
                const next = !showNotifDrawer;
                closeAllMenus();
                setShowNotifDrawer(next);
                if (next) onMarkNotificationsRead();
              }}
              className="relative p-2 rounded-xl bg-slate-700 text-white border border-white/10 hover:bg-slate-600 transition-colors"
              title={t('liveAlertsUpdates', language)}
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Panel: bg-[#1a2a3f] border border-white/10 rounded-2xl */}
            {showNotifDrawer && (
              <div className="absolute right-0 top-full mt-2 z-[200] w-80 bg-[#1a2a3f] border border-white/10 rounded-2xl shadow-xl backdrop-blur p-2 text-white">
                <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-[14px] font-bold text-white tracking-wide">{t('liveAlertsUpdates', language)}</span>
                  <span className="text-[11px] text-white/60">{notifications.length} {t('events', language)}</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-3 text-xs hover:bg-slate-700/60 rounded-xl transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{notif.title}</span>
                        <span className="text-[10px] text-white/40">{notif.time}</span>
                      </div>
                      <p className="text-[12px] text-white/70 leading-snug">{notif.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher: slate-700 background with white text */}
          <div className={`relative ${showRoleMenu ? 'z-[200]' : ''}`}>
            <button
              onClick={() => {
                const next = !showRoleMenu;
                closeAllMenus();
                setShowRoleMenu(next);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-700 text-white border border-white/10 hover:bg-slate-600 transition-colors"
            >
              <UserCircle2 className="w-4 h-4 text-white" />
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                  <span>{currentRole === 'client' ? t('clientAccount', language).split(' ')[0] : t('transporterPortal', language).split(' ')[0]}</span>
                </div>
                <div className="text-[9px] text-white/60 leading-none">
                  {t('switchRole', language)}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-2 z-[200] w-72 bg-[#1a2a3f] border border-white/10 rounded-2xl shadow-xl backdrop-blur p-2 text-white">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 px-3 py-1">
                  {t('activeRole', language)}
                </div>
                {(['client', 'transporter'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => { onRoleChange(r); setShowRoleMenu(false); }}
                    className={`w-full p-2.5 rounded-xl text-left transition-colors flex items-start gap-2.5 mt-1 ${
                      currentRole === r ? 'bg-[#C9A86A] text-[#0A1931] font-bold shadow-md' : 'hover:bg-slate-700 text-white/80'
                    }`}
                  >
                    <div className="mt-0.5">
                      {currentRole === r ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0A1931]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/30" />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold flex items-center gap-1.5 ${currentRole === r ? 'text-[#0A1931]' : 'text-white'}`}>
                        <span>{roleLabels[r].title}</span>
                      </div>
                      <div className={`text-[11px] ${currentRole === r ? 'text-[#0A1931]/80' : 'text-white/60'}`}>{roleLabels[r].subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action Button: only active element orange */}
          {currentRole === 'client' && (
            <button
              onClick={onOpenPostJob}
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] font-extrabold text-xs shadow-md shadow-[#C9A86A]/20 transition-all whitespace-nowrap"
            >
              <Package className="w-4 h-4" />
              <span>{t('postCargo', language)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Tab Strip - Strictly Role Based */}
      <div className="relative z-10 lg:hidden flex items-center gap-[8px] border-t border-white/10 bg-[#0f1c2e]/95 px-4 py-2.5 text-xs overflow-x-auto scrollbar-none">
        {currentRole === 'client' ? (
          <>
            <button 
              onClick={() => onTabChange('gps_radar')} 
              className={`flex items-center gap-1.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'gps_radar' || activeTab === 'map'
                  ? 'bg-[#C9A86A] text-[#0A1931] px-4 py-1.5 font-bold shadow-sm' 
                  : 'text-white/70 hover:text-white px-3 py-1.5'
              }`}
            >
              <Satellite className="w-3.5 h-3.5 text-amber-400" />
              <span>GPS Radar</span>
            </button>

            <button 
              onClick={() => onTabChange('dashboard')} 
              className={`flex items-center gap-1.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'dashboard' || activeTab === 'my_jobs'
                  ? 'bg-[#C9A86A] text-[#0A1931] px-4 py-1.5 font-bold shadow-sm' 
                  : 'text-white/70 hover:text-white px-3 py-1.5'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>My Jobs</span>
            </button>

            <button 
              onClick={onOpenPostJob}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#C9A86A] to-[#a88748] text-[#0A1931] font-bold whitespace-nowrap shrink-0 shadow-sm"
            >
              Post Cargo
            </button>

            <button 
              onClick={() => onTabChange('disputes')} 
              className={`flex items-center gap-1.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'disputes' 
                  ? 'bg-[#C9A86A] text-[#0A1931] px-4 py-1.5 font-bold shadow-sm' 
                  : 'text-white/70 hover:text-white px-3 py-1.5'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Disputes</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => onTabChange('dashboard')} 
              className={`flex items-center gap-1.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'dashboard' || activeTab === 'available_loads'
                  ? 'bg-[#C9A86A] text-[#0A1931] px-4 py-1.5 font-bold shadow-sm' 
                  : 'text-white/70 hover:text-white px-3 py-1.5'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Available Loads</span>
            </button>

            <button 
              onClick={() => onTabChange('my_bids')} 
              className={`flex items-center gap-1.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'my_bids' 
                  ? 'bg-[#C9A86A] text-[#0A1931] px-4 py-1.5 font-bold shadow-sm' 
                  : 'text-white/70 hover:text-white px-3 py-1.5'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>My Bids</span>
            </button>

            <button 
              onClick={() => onTabChange('gps_tracking')} 
              className={`flex items-center gap-1.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'gps_tracking' || activeTab === 'map'
                  ? 'bg-[#C9A86A] text-[#0A1931] px-4 py-1.5 font-bold shadow-sm' 
                  : 'text-white/70 hover:text-white px-3 py-1.5'
              }`}
            >
              <Satellite className="w-3.5 h-3.5 text-amber-400" />
              <span>GPS Tracking</span>
            </button>

            <button 
              onClick={() => onTabChange('disputes')} 
              className={`flex items-center gap-1.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'disputes' 
                  ? 'bg-[#C9A86A] text-[#0A1931] px-4 py-1.5 font-bold shadow-sm' 
                  : 'text-white/70 hover:text-white px-3 py-1.5'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Disputes</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

