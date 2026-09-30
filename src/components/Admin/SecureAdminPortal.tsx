import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  LogOut, 
  CheckCircle2, 
  Database, 
  Coins, 
  Users, 
  FileText, 
  FileSpreadsheet, 
  Building2, 
  Clock, 
  Satellite, 
  Truck, 
  Sliders, 
  ListOrdered,
  UserCheck, 
  UserX, 
  ShieldAlert, 
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { Job, Transporter, EscrowTransaction, Dispute, Currency, Language } from '../../types';
import { formatMoney } from '../../services/currency';
import { LeafletLiveFleetMap } from '../Map/LeafletLiveFleetMap';
import { fetchPlatformSettings, savePlatformSettings, PlatformSettings } from '../../services/settingsService';

interface SecureAdminPortalProps {
  jobs: Job[];
  transporters: Transporter[];
  escrows: EscrowTransaction[];
  disputes: Dispute[];
  currency: Currency;
  language: Language;
  onCurrencyChange: (c: Currency) => void;
  onUpdateJobStatus?: (jobId: string, status: any) => void;
  onInspectTransporter?: (t: Transporter) => void;
  onExitPortal: () => void;
}

export const SecureAdminPortal: React.FC<SecureAdminPortalProps> = ({
  jobs,
  transporters,
  escrows,
  disputes,
  currency,
  language,
  onCurrencyChange,
  onUpdateJobStatus,
  onInspectTransporter,
  onExitPortal,
}) => {
  // Server-verified Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Credentials inputs
  const [email, setEmail] = useState<string>('mark@maximus.ug');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  // UI state & notices
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState<number>(300); // 5 mins

  // 2-Hour Auto-Logout countdown timer (in seconds)
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(7200);

  // Active Tab within Super Admin Suite: Primary tabs matching user specs
  const [adminTab, setAdminTab] = useState<'accounts' | 'bids' | 'kyc' | 'commission' | 'fleet' | 'escrow'>('accounts');

  // Data states from protected /api/admin/* endpoints
  const [accountData, setAccountData] = useState<any>(null);
  const [liveBids, setLiveBids] = useState<any[]>([]);
  const [fleetKycList, setFleetKycList] = useState<any[]>([]);
  const [assigningCargoId, setAssigningCargoId] = useState<string | null>(null);

  // Commission Slider settings (Domestic default 8%, International default 12%)
  const [domesticCommission, setDomesticCommission] = useState<number>(8);
  const [intlCommission, setIntlCommission] = useState<number>(12);
  const [settingsUpdatedInfo, setSettingsUpdatedInfo] = useState<string>('Defaults loaded');
  const [savingCommission, setSavingCommission] = useState<boolean>(false);

  // Verify server session via /api/auth/me
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.role === 'super_admin') {
            setIsAuthenticated(true);
            loadAllAdminData();
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    verifySession();
  }, []);

  // Fetch all admin data
  const loadAllAdminData = async () => {
    fetchProtectedAccounts();
    fetchLiveBids();
    fetchFleetKyc();
    fetchCommissionSettings();
  };

  const fetchProtectedAccounts = async () => {
    try {
      const res = await fetch('/api/admin/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccountData(data);
      }
    } catch (e) {
      console.warn('Could not fetch accounts:', e);
    }
  };

  const fetchLiveBids = async () => {
    try {
      const res = await fetch('/api/admin/bids-status');
      if (res.ok) {
        const data = await res.json();
        setLiveBids(data.bids || []);
      }
    } catch (e) {
      console.warn('Could not fetch live bids:', e);
    }
  };

  const fetchFleetKyc = async () => {
    try {
      const res = await fetch('/api/admin/fleet-kyc');
      if (res.ok) {
        const data = await res.json();
        setFleetKycList(data.records || []);
      }
    } catch (e) {
      console.warn('Could not fetch kyc records:', e);
    }
  };

  const fetchCommissionSettings = async () => {
    try {
      const settings = await fetchPlatformSettings();
      setDomesticCommission(settings.commission_percent);
      setIntlCommission(settings.international_commission);
      setSettingsUpdatedInfo(`Last updated by ${settings.updated_by} at ${new Date(settings.updated_at).toLocaleTimeString()}`);
    } catch (e) {
      console.warn('Could not fetch settings:', e);
    }
  };

  // OTP 5-minute countdown
  useEffect(() => {
    if (step !== 'otp' || otpSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setOtpSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage('OTP expired after 5 minutes. Please re-enter your credentials.');
          setStep('credentials');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, otpSecondsLeft]);

  // 2-hour Auto Logout countdown
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setInterval(() => {
      setSessionSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLockAdmin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  // Handle Step 1: Submit Credentials
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Access Denied: Invalid super admin credentials.');
        return;
      }

      setStep('otp');
      setOtpSecondsLeft(300);
      setSuccessNotice(data.message || 'OTP generated. Please check your admin email.');
      if (data.demoOtp) {
        setDemoOtpHint(data.demoOtp);
      }
    } catch (err: any) {
      setErrorMessage('Network error during authentication. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleStep2VerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid or expired OTP code.');
        return;
      }

      setIsAuthenticated(true);
      setSessionSecondsLeft(7200);
      loadAllAdminData();
    } catch (err) {
      setErrorMessage('Failed to verify OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Super Admin Lockout / Logout
  const handleLockAdmin = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
    setStep('credentials');
    setPassword('');
    setOtp('');
    setDemoOtpHint(null);
    onExitPortal();
  };

  // Handle Save Commission
  const handleSaveCommission = async () => {
    setSavingCommission(true);
    setSuccessNotice(null);
    try {
      const updated = await savePlatformSettings({
        commission_percent: domesticCommission,
        international_commission: intlCommission,
        updated_by: email,
      });
      setSuccessNotice(`Commission rates saved! Domestic: ${updated.commission_percent}%, International: ${updated.international_commission}%. New jobs and checkout will use these values.`);
      setSettingsUpdatedInfo(`Last updated by ${updated.updated_by} at ${new Date(updated.updated_at).toLocaleTimeString()}`);
      fetchProtectedAccounts();
    } catch (e) {
      setErrorMessage('Could not save commission settings.');
    } finally {
      setSavingCommission(false);
    }
  };

  // Handle Assign Carrier
  const handleAssignBid = async (cargoId: string) => {
    setAssigningCargoId(cargoId);
    try {
      const res = await fetch('/api/admin/assign-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargoId, transporterName: 'Ronald Kato (Maximus Verified)' }),
      });
      if (res.ok) {
        fetchLiveBids();
        setSuccessNotice(`Transporter assigned to ${cargoId} successfully!`);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setAssigningCargoId(null);
    }
  };

  // Handle KYC Action
  const handleKycAction = async (id: string, action: 'approve' | 'reject', target: 'nin' | 'logbook' | 'all') => {
    try {
      const res = await fetch('/api/admin/kyc-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, target }),
      });
      if (res.ok) {
        fetchFleetKyc();
        setSuccessNotice(`KYC ${action.toUpperCase()} updated for record.`);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#070e17] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span className="font-mono text-sm tracking-widest uppercase">Verifying Super Admin Authorization...</span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // SCREEN 1: DOUBLE LOCKDOWN LOGIN FORM (Email + Password + 5-min OTP)
  // ----------------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060c14] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#6A0DAD]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#C9A86A]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-[#0A1931] border border-[#C9A86A]/30 shadow-2xl shadow-[#6A0DAD]/20 mb-4">
              <ShieldAlert className="w-10 h-10 text-[#C9A86A]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6A0DAD]/20 text-[#cbb1ff] border border-[#6A0DAD]/40 text-[11px] font-bold tracking-widest uppercase mb-2">
              <Lock className="w-3 h-3 text-[#C9A86A]" />
              Super Admin Lockdown Gateway
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">MAXIMUS SECURITY VAULT</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Restricted route. Double Lock authentication: Password + OTP required.
            </p>
          </div>

          <div className="bg-[#0A1931]/95 border border-[#C9A86A]/25 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successNotice && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successNotice}</span>
              </div>
            )}

            {step === 'credentials' ? (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Super Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mark@maximus.ug"
                      className="w-full pl-10 pr-4 py-3 bg-[#0f243d] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A86A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Vault Master Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-[#0f243d] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A86A] transition-colors font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Bcrypt hash matched against <code className="text-[#C9A86A]">SUPER_ADMIN_PASSWORD_HASH</code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] shadow-lg shadow-[#C9A86A]/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0A1931]" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Step 2 (OTP)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleStep2VerifyOtp} className="space-y-4">
                <div className="text-center p-3 rounded-xl bg-slate-900/60 border border-white/10">
                  <span className="text-xs text-slate-300">
                    6-digit code dispatched to <strong className="text-[#C9A86A]">{email}</strong>
                  </span>
                  <div className="text-xs text-amber-400 font-mono mt-1">
                    Code expires in: <strong>{formatTime(otpSecondsLeft)}</strong>
                  </div>
                </div>

                {demoOtpHint && (
                  <div className="p-2.5 rounded-xl bg-[#6A0DAD]/20 border border-[#6A0DAD]/40 text-center">
                    <span className="text-[10px] uppercase font-bold text-purple-300 block">OTP Code</span>
                    <span className="text-lg font-mono font-black text-amber-300 tracking-widest">{demoOtpHint}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-center">
                    Enter 6-Digit One-Time PIN
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center text-2xl tracking-[0.4em] font-mono font-bold py-3.5 bg-[#0f243d] border border-[#C9A86A]/40 rounded-xl text-white focus:outline-none focus:border-[#C9A86A] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Validating Security Token...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authenticate Super Admin</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setErrorMessage(null); }}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Back to credentials
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={onExitPortal}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Public Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // SCREEN 2: AUTHENTICATED SUPER ADMIN SUITE
  // ----------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070e17] text-white">
      {/* Top Super Admin Lockdown Header */}
      <header className="sticky top-0 z-[110] bg-[#0A1931] border-b border-[#C9A86A]/30 px-4 sm:px-6 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          
          {/* Gold Badge & Identification */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#C9A86A] to-[#8f7139] text-[#0A1931] shadow-md font-bold">
              <ShieldCheck className="w-5 h-5 text-[#0A1931]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase bg-[#C9A86A] text-[#0A1931] shadow-md shadow-[#C9A86A]/20">
                  ★ SUPER ADMIN MODE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6A0DAD]/30 text-[#d8c2ff] border border-[#6A0DAD]/40">
                  Equity Till 031801
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">
                Authenticated: <span className="text-[#C9A86A] font-bold">{email}</span>
              </div>
            </div>
          </div>

          {/* Session Timer & Lock Admin Action */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-lock: <strong className="text-white">{formatTime(sessionSecondsLeft)}</strong></span>
            </div>

            <button
              onClick={handleLockAdmin}
              className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-600/40 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
              title="Clears httpOnly cookie and closes session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SUPER ADMIN NAVIGATION TABS (Strictly adhering to specifications) */}
        {/* ---------------------------------------------------- */}
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'accounts', label: '1. Accounts & Banking', icon: Building2 },
            { id: 'bids', label: '2. Live Bids Status', icon: ListOrdered },
            { id: 'kyc', label: '3. Fleet KYC Gate', icon: Users },
            { id: 'commission', label: '4. Commission Control', icon: Sliders },
            { id: 'fleet', label: 'Live Fleet Radar', icon: Satellite },
            { id: 'escrow', label: 'TrustVault Ledger', icon: Coins },
          ].map(tab => {
            const Icon = tab.icon;
            const active = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  active 
                    ? 'bg-[#C9A86A] text-[#0A1931] shadow-md shadow-[#C9A86A]/20 scale-[1.02]' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Alerts / Feedback */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button onClick={() => setSuccessNotice(null)} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: ACCOUNTS & BANKING (TrustVault UGX/USD total, commission today, pending payouts, EFRIS status) */}
        {/* ---------------------------------------------------- */}
        {adminTab === 'accounts' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#0A1931] border border-[#C9A86A]/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[#C9A86A]" />
                  <span>TrustVault Accounts &amp; EFRIS Fiscal Status</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Guaranteed statutory escrow backed by Equity Bank Till 031801, Stanbic FlexiPay, and URA ASYCUDA sync.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  EFRIS Online: TIN 1008492019
                </span>
                <button
                  onClick={fetchProtectedAccounts}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  title="Refresh Balance"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: TrustVault UGX & USD Total */}
              <div className="p-5 rounded-2xl bg-[#0A1931] border border-[#C9A86A]/40 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>TrustVault Total Locked</span>
                  <Coins className="w-4 h-4 text-[#C9A86A]" />
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {formatMoney(accountData?.trustVaultTotalUGX || 48500000, 'UGX')}
                </div>
                <div className="text-xs font-mono text-[#C9A86A] font-bold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>${(accountData?.trustVaultTotalUSD || 12850).toLocaleString()} USD (Cross-Border Escrow)</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  100% held in trust · Equity Merchant Till 031801
                </p>
              </div>

              {/* Card 2: Commission Earned Today */}
              <div className="p-5 rounded-2xl bg-[#0A1931] border border-emerald-500/30 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Commission Today</span>
                  <Coins className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  +{formatMoney(accountData?.commissionTodayUGX || 1840000, 'UGX')}
                </div>
                <div className="text-xs font-mono text-emerald-300 font-bold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>+${(accountData?.commissionTodayUSD || 490).toLocaleString()} USD today</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  Domestic: {domesticCommission}% · Intl: {intlCommission}%
                </p>
              </div>

              {/* Card 3: Pending Payouts */}
              <div className="p-5 rounded-2xl bg-[#0A1931] border border-amber-500/30 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Pending Driver Payouts</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {formatMoney(accountData?.pendingPayoutsUGX || 9250000, 'UGX')}
                </div>
                <div className="text-xs text-amber-200 font-semibold">
                  {accountData?.pendingPayoutsCount || 4} Drivers awaiting POD sign-off
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  Auto-disburses to MoMo / Bank upon POD approval
                </p>
              </div>

              {/* Card 4: URA EFRIS Status */}
              <div className="p-5 rounded-2xl bg-[#0A1931] border border-sky-500/30 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>URA EFRIS Compliance</span>
                  <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl font-black text-white font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>{accountData?.efrisStatus?.connection || 'ONLINE 100%'}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  {accountData?.efrisStatus?.fiscalInvoicesIssuedToday || 18} Fiscal Invoices Today
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  VAT Payable: {formatMoney(accountData?.efrisStatus?.vatPayableUGX || 331200, 'UGX')}
                </p>
              </div>
            </div>

            {/* Statutory Bank Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#0A1931] border border-white/10 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C9A86A]" />
                  <span>Primary Escrow Gateways (Direct Clearance)</span>
                </h3>
                <div className="text-xs text-slate-300 space-y-2 font-mono bg-black/30 p-3 rounded-xl">
                  <div>Bank: <strong className="text-white">Equity Bank Uganda</strong></div>
                  <div>Account Name: <strong className="text-[#C9A86A]">MAXIMUS GLOBAL TRANSPORT LINK LTD</strong></div>
                  <div>Merchant Till: <strong className="text-emerald-400 font-bold">031801</strong></div>
                  <div>MTN MoMo Escrow USSD: <strong className="text-amber-400">*165*3*031801#</strong></div>
                  <div>Airtel Money Escrow USSD: <strong className="text-red-400">*185*9*031801#</strong></div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0A1931] border border-white/10 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C9A86A]" />
                  <span>Revenue Summary &amp; EFRIS Fiscal Audit</span>
                </h3>
                <div className="text-xs text-slate-300 space-y-2 font-mono bg-black/30 p-3 rounded-xl">
                  <div>Platform TIN: <strong className="text-white">1008492019</strong></div>
                  <div>Gross Freight Transacted: <strong className="text-white">{formatMoney(accountData?.totalGrossTransactedUGX || 194500000, 'UGX')}</strong></div>
                  <div>Cumulative Net Commission: <strong className="text-emerald-400">{formatMoney(accountData?.netRevenueUGX || 16600000, 'UGX')}</strong></div>
                  <div>Total Invoices Synced to URA: <strong className="text-sky-400">{accountData?.efrisStatus?.fiscalInvoicesIssuedTotal || 860}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: LIVE BIDS STATUS (Table CargoID | Client | Pickup Country | Drop | Lowest/Highest Bid | Count | Status | Assign button) */}
        {/* ---------------------------------------------------- */}
        {adminTab === 'bids' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0A1931] border border-[#C9A86A]/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ListOrdered className="w-6 h-6 text-[#C9A86A]" />
                  <span>Live Bids Status Board</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time bidding activity across domestic Uganda routes and cross-border international corridors.
                </p>
              </div>

              <button
                onClick={fetchLiveBids}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 self-start md:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Bids</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl bg-[#0A1931] border border-white/10 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">CargoID</th>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Pickup Country</th>
                    <th className="p-3.5">Drop</th>
                    <th className="p-3.5">Lowest / Highest Bid</th>
                    <th className="p-3.5">Count</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Assign Transporter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {liveBids.map((bid) => (
                    <tr key={bid.cargoId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-[#C9A86A]">
                        {bid.cargoId}
                        {bid.isInternational && (
                          <span className="block text-[9px] text-cyan-400 uppercase tracking-wider font-sans">
                            Global Corridor
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-white font-medium">
                        {bid.client}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {bid.pickupCountry}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {bid.dropLocation}
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        <span className="text-emerald-400">{formatMoney(bid.lowestBidUGX, currency)}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-amber-400">{formatMoney(bid.highestBidUGX, currency)}</span>
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-cyan-300">
                          {bid.bidCount} bids
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          bid.status === 'ASSIGNED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : bid.status === 'READY_TO_ASSIGN'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {bid.status}
                        </span>
                        {bid.assignedTransporter && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Carrier: {bid.assignedTransporter}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {bid.status === 'ASSIGNED' ? (
                          <span className="text-emerald-400 text-[11px] font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Assigned
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAssignBid(bid.cargoId)}
                            disabled={assigningCargoId === bid.cargoId}
                            className="px-3.5 py-1.5 bg-[#C9A86A] hover:bg-[#d6b77c] text-[#0A1931] font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
                          >
                            {assigningCargoId === bid.cargoId ? 'Assigning...' : 'Assign Carrier'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: FLEET KYC (Approve/Reject NIN Logbook) */}
        {/* ---------------------------------------------------- */}
        {adminTab === 'kyc' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0A1931] border border-[#C9A86A]/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#C9A86A]" />
                  <span>Fleet Driver KYC &amp; Verification Gate</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Statutory verification of driver National Identification Numbers (NIN) and URA Vehicle Logbooks before load access.
                </p>
              </div>

              <button
                onClick={fetchFleetKyc}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 self-start md:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh KYC Records</span>
              </button>
            </div>

            {/* KYC Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {fleetKycList.map((record) => (
                <div
                  key={record.id}
                  className="bg-[#0A1931] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base text-white">{record.transporterName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        record.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : record.status === 'REJECTED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {record.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 font-mono">
                      <div>Vehicle: <strong className="text-white">{record.vehicleType}</strong> ({record.numberPlate})</div>
                      <div>Phone: <strong className="text-white">{record.phone}</strong></div>
                      <div>Uploaded: <span className="text-slate-400">{record.uploadedAt}</span></div>
                    </div>

                    {/* NIN Verification Section */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold">National ID (NIN):</span>
                        <span className={`text-[10px] font-bold uppercase ${record.ninVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {record.ninVerified ? '✓ Approved' : 'Pending'}
                        </span>
                      </div>
                      <div className="font-mono text-sm font-bold text-white tracking-wider">
                        {record.nin}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleKycAction(record.id, 'approve', 'nin')}
                          className="flex-1 py-1 px-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Approve NIN</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKycAction(record.id, 'reject', 'nin')}
                          className="flex-1 py-1 px-2.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          <span>Reject NIN</span>
                        </button>
                      </div>
                    </div>

                    {/* URA Logbook Section */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold">URA Logbook Ref:</span>
                        <span className={`text-[10px] font-bold uppercase ${record.logbookVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {record.logbookVerified ? '✓ Approved' : 'Pending'}
                        </span>
                      </div>
                      <div className="font-mono text-sm font-bold text-white tracking-wider">
                        {record.logbookNumber}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleKycAction(record.id, 'approve', 'logbook')}
                          className="flex-1 py-1 px-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Approve Logbook</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKycAction(record.id, 'reject', 'logbook')}
                          className="flex-1 py-1 px-2.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          <span>Reject Logbook</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Overall Quick Action */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleKycAction(record.id, 'approve', 'all')}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve Carrier KYC</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKycAction(record.id, 'reject', 'all')}
                      className="py-2 px-3 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-600/40 font-bold rounded-xl text-xs transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: COMMISSION CONTROL (Slider Domestic 1-20% default 8%, International 1-20% default 12%, saves to settings table, new jobs use new value) */}
        {/* ---------------------------------------------------- */}
        {adminTab === 'commission' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="p-5 rounded-2xl bg-[#0A1931] border border-[#C9A86A]/25 space-y-2">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Sliders className="w-6 h-6 text-[#C9A86A]" />
                <span>Dynamic Commission Control &amp; Platform Fee Governance</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adjust platform commission rates dynamically. Changes immediately save to the settings table, and all new shipments, client quotes, and TrustVault escrow checkouts will use these new rates.
              </p>
              <div className="text-[11px] font-mono text-[#C9A86A] pt-1">
                {settingsUpdatedInfo}
              </div>
            </div>

            {/* Slider Controls Card */}
            <div className="bg-[#0A1931] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Slider 1: Domestic Commission (1 - 20%, default 8%) */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-extrabold text-white text-sm flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span>Domestic Platform Fee (Uganda Intra-Corridor)</span>
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Applied to shipments moving within Uganda (Kampala, Gulu, Mbale, Jinja, Namanve). Default 8%.
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-lg font-mono font-black">
                    {domesticCommission}%
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={domesticCommission}
                    onChange={(e) => setDomesticCommission(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>1% (Min)</span>
                    <span className="text-emerald-400 font-bold">8% Default</span>
                    <span>20% (Max)</span>
                  </div>
                </div>

                {/* Live calculation sample */}
                <div className="text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg flex items-center justify-between">
                  <span>Sample Domestic Job (2,000,000 UGX):</span>
                  <span className="font-bold text-emerald-400">
                    Maximus Fee = {formatMoney(Math.round(2000000 * (domesticCommission / 100)), currency)}
                  </span>
                </div>
              </div>

              {/* Slider 2: International Commission (1 - 20%, default 12%) */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-extrabold text-white text-sm flex items-center gap-2">
                      <Coins className="w-4 h-4 text-cyan-400" />
                      <span>International &amp; Cross-Border Platform Fee</span>
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Applied to cross-border routes (China-Guangzhou, Dubai, Mombasa, Dar es Salaam, South Africa). Default 12%.
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-lg font-mono font-black">
                    {intlCommission}%
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={intlCommission}
                    onChange={(e) => setIntlCommission(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>1% (Min)</span>
                    <span className="text-cyan-400 font-bold">12% Default</span>
                    <span>20% (Max)</span>
                  </div>
                </div>

                {/* Live calculation sample */}
                <div className="text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg flex items-center justify-between">
                  <span>Sample Intl Job ($5,000 USD):</span>
                  <span className="font-bold text-cyan-400">
                    Maximus Fee = ${(5000 * (intlCommission / 100)).toFixed(0)} USD
                  </span>
                </div>
              </div>

              {/* Action Button: Save to Settings Table */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveCommission}
                  disabled={savingCommission}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] font-black rounded-xl text-sm shadow-lg shadow-[#C9A86A]/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  {savingCommission ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0A1931]" />
                      <span>Saving to Settings Table...</span>
                    </>
                  ) : (
                    <>
                      <Sliders className="w-4 h-4" />
                      <span>Save Commission Rates (Apply to New Jobs &amp; Checkout)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Values persist in database &amp; immediately propagate to EscrowPaymentModal &amp; ClientPostCargoModal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: LIVE FLEET RADAR */}
        {/* ---------------------------------------------------- */}
        {adminTab === 'fleet' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0A1931] border border-[#C9A86A]/20 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-[#C9A86A]" />
                  <span>Uganda &amp; Worldwide Fleet Radar</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time telemetry from all connected trucks across Uganda, Kenya, and international corridors.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  12 Active Dispatches
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  3 Standby Yards
                </span>
              </div>
            </div>
            
            <LeafletLiveFleetMap
              language={language}
              onSelectTruck={(truck) => {
                if (onInspectTransporter) {
                  const matched = transporters.find(t => t.id === truck.transporterId);
                  if (matched) onInspectTransporter(matched);
                }
              }}
            />
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: TRUSTVAULT LEDGER */}
        {/* ---------------------------------------------------- */}
        {adminTab === 'escrow' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0A1931] border border-[#C9A86A]/20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#C9A86A]" />
                <span>TrustVault Settlement Ledger</span>
              </h2>
              <p className="text-xs text-slate-400">
                100% Guaranteed payouts secured via Equity Bank Till 031801. Settled to Mobile Money &amp; Bank upon electronic Proof-of-Delivery.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-[#0A1931] border border-white/10 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Ledger ID</th>
                    <th className="p-3.5">Job ID</th>
                    <th className="p-3.5">Shipper / Client</th>
                    <th className="p-3.5">Transporter</th>
                    <th className="p-3.5">Locked Amount</th>
                    <th className="p-3.5">Maximus Fee</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {escrows.map(esc => (
                    <tr key={esc.id} className="hover:bg-slate-800/50">
                      <td className="p-3.5 text-slate-300">{esc.id}</td>
                      <td className="p-3.5 text-[#C9A86A]">{esc.jobId}</td>
                      <td className="p-3.5 text-white">{esc.clientName || 'Shipper'}</td>
                      <td className="p-3.5 text-white">{esc.transporterName || 'Transporter'}</td>
                      <td className="p-3.5 font-bold text-white">{formatMoney(esc.totalAmountUGX, currency)}</td>
                      <td className="p-3.5 text-emerald-400 font-bold">{formatMoney(Math.round(esc.totalAmountUGX * (domesticCommission / 100)), currency)}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {esc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
