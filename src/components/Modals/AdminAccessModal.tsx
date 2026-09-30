import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowRight, X, Sparkles } from 'lucide-react';

interface AdminAccessModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('mark@maximus.ug');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      // Also set client-side cookie for immediate state detection
      document.cookie = 'role=super_admin; path=/; max-age=7200; SameSite=Lax';

      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while contacting admin auth service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1320] border-2 border-[#C9A86A]/50 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#C9A86A]/20 border border-[#C9A86A] flex items-center justify-center text-[#C9A86A]">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#C9A86A] bg-[#C9A86A]/10 px-2 py-0.5 rounded border border-[#C9A86A]/30">
            SUPER ADMIN ACCESS
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Owner Admin Access</h3>
        <p className="text-xs text-slate-400 mb-5">
          Enter your executive credentials to unlock Accounts, Live Bids, and Commission Control.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mark@maximus.ug"
                className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-slate-700 focus:border-[#C9A86A] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#C9A86A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-slate-700 focus:border-[#C9A86A] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#C9A86A]"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Default demo: Mark2026!MAXIMUS</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] font-bold text-xs rounded-xl shadow-lg shadow-[#C9A86A]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Unlock Super Admin Mode</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <a
            href="/maximus-admin-2026-secure"
            className="text-[11px] text-slate-400 hover:text-[#C9A86A] transition-colors underline flex items-center justify-center gap-1"
          >
            <span>Or open full OTP portal at /maximus-admin-2026-secure</span>
          </a>
        </div>
      </div>
    </div>
  );
};
