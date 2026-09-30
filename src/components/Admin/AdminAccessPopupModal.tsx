import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  X, 
  RefreshCw, 
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminAccessPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAccessPopupModal: React.FC<AdminAccessPopupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('mark@maximus.ug');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Access Denied: Invalid super admin credentials.');
        return;
      }

      onSuccess();
    } catch (err: any) {
      setErrorMessage('Network error during authentication. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0A1931] border border-[#C9A86A]/40 rounded-3xl shadow-2xl p-6 sm:p-7 text-white overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A86A]/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#C9A86A]/20 border border-[#C9A86A]/40 text-[#C9A86A]">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">Admin Access</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#C9A86A] text-[#0A1931]">
                  Owner Vault
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authorized entry to Super Admin Accounts &amp; Live Bids
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mark@maximus.ug"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#070F1A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C9A86A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#070F1A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C9A86A] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] font-black rounded-xl text-sm shadow-lg shadow-[#C9A86A]/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0A1931]" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Enter Super Admin Mode</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-2 text-center border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                onClose();
                window.location.pathname = '/maximus-admin-2026-secure';
              }}
              className="text-[11px] text-[#C9A86A] hover:underline"
            >
              Open /maximus-admin-2026-secure hardware OTP gateway →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
