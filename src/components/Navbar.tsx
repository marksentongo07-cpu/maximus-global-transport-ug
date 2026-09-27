import React, { useState } from 'react';
import { 
  Truck, 
  Bell, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  ChevronDown, 
  Coins, 
  Globe, 
  UserCircle2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Check
} from 'lucide-react';
import { UserRole, Currency, Language } from '../types';
import { formatMoney } from '../services/currency';
import { t, SUPPORTED_LANGUAGES } from '../services/i18n';

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

  const roleLabels: Record<UserRole, { title: string; subtitle: string }> = {
    client: { title: t('clientAccount', language), subtitle: t('cargoShipper', language) },
    transporter: { title: t('transporterPortal', language), subtitle: t('fleetOwnerDriver', language) },
    admin: { title: t('superAdminOwner', language), subtitle: t('fullManagementEscrow', language) },
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        
        {/* Zone 1: Brand Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onTabChange('dashboard')} 
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-md shadow-amber-950/40 text-slate-950">
              <span className="font-extrabold text-xl tracking-tighter flex items-center">
                M
                <Truck className="w-4 h-4 -ml-0.5 text-slate-950 stroke-[2.5]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  MAXIMUS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              </div>
              <p className="text-[10px] tracking-wide text-slate-400 uppercase font-medium">
                {t('tagline', language)}
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Text Links with subtle hover) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button 
            onClick={() => onTabChange('dashboard')}
            className={`transition-colors hover:text-white ${activeTab === 'dashboard' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'}`}
          >
            {currentRole === 'client' 
              ? t('shipmentsAndLoads', language) 
              : currentRole === 'transporter' 
              ? t('driverConsole', language) 
              : t('managementOverview', language)}
          </button>

          <button 
            onClick={() => onTabChange('icds')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 ${activeTab === 'icds' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'}`}
          >
            <span>ICDs &amp; Warehouses</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              6 Hubs
            </span>
          </button>

          <button 
            onClick={() => onTabChange('map')}
            className={`transition-colors hover:text-white ${activeTab === 'map' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'}`}
          >
            {t('liveGpsRadar', language)}
          </button>

          <button 
            onClick={() => onTabChange('services')}
            className={`transition-colors hover:text-white ${activeTab === 'services' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'}`}
          >
            {t('serviceMarketplace', language)}
          </button>

          <button 
            onClick={() => onTabChange('disputes')}
            className={`transition-colors hover:text-white ${activeTab === 'disputes' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'}`}
          >
            {t('disputeCenter', language)}
          </button>

          <button 
            onClick={onOpenLegal}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
            title={t('limitationLiability', language)}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            {t('legalTerms', language)}
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Offline Mode Switcher */}
          <button
            onClick={onToggleOffline}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              isOffline 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isOffline ? t('offline', language) : t('online', language)}
          >
            {isOffline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4" />}
            <span className="hidden xl:inline text-[11px] font-medium">
              {isOffline ? t('offline', language) : t('online', language)}
            </span>
          </button>

          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowCurrencyMenu(!showCurrencyMenu); setShowRoleMenu(false); setShowLangMenu(false); }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-semibold text-amber-400 hover:border-amber-400/50 flex items-center gap-1.5 transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showCurrencyMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                {(['UGX', 'USD', 'EUR', 'KES', 'TZS'] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => { onCurrencyChange(c); setShowCurrencyMenu(false); }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currency === c ? 'text-amber-400 font-bold bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <span>{c}</span>
                    {c === 'UGX' && <span className="text-[10px] text-slate-400 font-normal">Uganda</span>}
                    {c === 'KES' && <span className="text-[10px] text-slate-400 font-normal">Kenya</span>}
                    {c === 'USD' && <span className="text-[10px] text-slate-400 font-normal">Global</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Selector Dropdown (English, Luganda, Swahili) */}
          <div className="relative">
            <button
              onClick={() => { setShowLangMenu(!showLangMenu); setShowCurrencyMenu(false); setShowRoleMenu(false); }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 hover:border-amber-400/50 flex items-center gap-1.5 transition-colors"
              title="Change Language / Kyusa Olulimi / Badilisha Lugha"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-[11px] uppercase tracking-wider">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-slate-200">
                <div className="px-3 py-1 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Language / Lugha
                </div>
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => { 
                      onLanguageChange(item.code); 
                      setShowLangMenu(false); 
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      language === item.code ? 'text-amber-400 font-bold bg-slate-800/70' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.localName} · {item.region}</div>
                    </div>
                    {language === item.code && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDrawer(!showNotifDrawer);
                if (!showNotifDrawer) onMarkNotificationsRead();
              }}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={t('liveAlertsUpdates', language)}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-wide">{t('liveAlertsUpdates', language)}</span>
                  <span className="text-[10px] text-slate-400">{notifications.length} {t('events', language)}</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-3 text-xs hover:bg-slate-800/70 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">{notif.title}</span>
                        <span className="text-[10px] text-slate-500">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{notif.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => { setShowRoleMenu(!showRoleMenu); setShowCurrencyMenu(false); setShowLangMenu(false); }}
              className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <UserCircle2 className="w-4 h-4 text-amber-400" />
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                  <span>{currentRole === 'admin' ? t('superAdminOwner', language).split(' ')[0] : currentRole === 'client' ? t('clientAccount', language).split(' ')[0] : t('transporterPortal', language).split(' ')[0]}</span>
                  {userEmail === 'marksentongo07@gmail.com' && currentRole === 'admin' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Auto Root Super Admin"></span>
                  )}
                </div>
                <div className="text-[9px] text-amber-300/80 leading-none">
                  {userEmail === 'marksentongo07@gmail.com' && currentRole === 'admin' ? 'Root Super Admin' : t('switchRole', language)}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-amber-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                {userEmail === 'marksentongo07@gmail.com' && (
                  <div className="mb-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400 block tracking-wider">
                      Auto Root Super Admin
                    </span>
                    <span className="text-[11px] text-white font-mono break-all font-semibold">
                      {userEmail}
                    </span>
                  </div>
                )}
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  {t('activeRole', language)}
                </div>
                {(['client', 'transporter', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => { onRoleChange(r); setShowRoleMenu(false); }}
                    className={`w-full p-2.5 rounded-lg text-left transition-colors flex items-start gap-2.5 ${
                      currentRole === r ? 'bg-amber-500/20 border border-amber-500/40 text-white' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {currentRole === r ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <span>{roleLabels[r].title}</span>
                        {r === 'admin' && userEmail === 'marksentongo07@gmail.com' && (
                          <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-mono">
                            Auto
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{roleLabels[r].subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          {currentRole === 'client' && (
            <button
              onClick={onOpenPostJob}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors whitespace-nowrap"
            >
              <span>{t('postCargo', language)}</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile Secondary Tab Strip */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/70 px-2 py-2 text-xs overflow-x-auto">
        <button 
          onClick={() => onTabChange('dashboard')} 
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'dashboard' ? 'text-amber-400 bg-slate-800 font-bold' : 'text-slate-400'}`}
        >
          {currentRole === 'client' ? t('allLoads', language) : currentRole === 'transporter' ? t('driverConsole', language).split(' ')[0] : 'Admin'}
        </button>
        <button 
          onClick={() => onTabChange('icds')} 
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'icds' ? 'text-amber-400 bg-slate-800 font-bold' : 'text-slate-400'}`}
        >
          ICDs
        </button>
        <button 
          onClick={() => onTabChange('map')} 
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'map' ? 'text-amber-400 bg-slate-800 font-bold' : 'text-slate-400'}`}
        >
          {t('liveGpsRadar', language).split(' ')[1] || 'Radar'}
        </button>
        <button 
          onClick={() => onTabChange('services')} 
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'services' ? 'text-amber-400 bg-slate-800 font-bold' : 'text-slate-400'}`}
        >
          {t('serviceMarketplace', language).split(' ')[0]}
        </button>
        <button 
          onClick={() => onTabChange('disputes')} 
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'disputes' ? 'text-amber-400 bg-slate-800 font-bold' : 'text-slate-400'}`}
        >
          {t('disputeCenter', language).split(' ')[0]}
        </button>
        {currentRole === 'client' && (
          <button 
            onClick={onOpenPostJob}
            className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold whitespace-nowrap"
          >
            {t('postCargo', language)}
          </button>
        )}
      </div>
    </header>
  );
};

