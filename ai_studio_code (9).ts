import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Unlock, RefreshCw, Key, Globe, LogOut 
} from 'lucide-react';
import { MailTmService, MailDomain } from '../services/mailtm';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
}) => {
  const [passphrase, setPassphrase] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  const [serverStats, setServerStats] = useState<any>(null);
  const [mailTmLatency, setMailTmLatency] = useState<number | null>(null);
  const [domains, setDomains] = useState<MailDomain[]>([]);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>(() => {
    return localStorage.getItem('mbhm_admin_token') || '';
  });

  const testHealthAndDomains = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const data = await MailTmService.getDomains();
      const end = performance.now();
      setMailTmLatency(Math.round(end - start));
      setDomains(data);
    } catch {
      setMailTmLatency(-1);
    } finally {
      setIsPinging(false);
    }
  };

  const fetchServerStats = async (token: string) => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-token': token },
      });
      if (res.ok) {
        const data = await res.json();
        setServerStats(data);
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
        localStorage.removeItem('mbhm_admin_token');
      }
    } catch {
      setIsAdminLoggedIn(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchServerStats(adminToken);
    }
    testHealthAndDomains();
  }, [adminToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!passphrase.trim()) {
      setLoginError('Please enter your administrator passphrase.');
      return;
    }

    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase: passphrase.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid administrator credentials');
      }

      setAdminToken(data.token);
      localStorage.setItem('mbhm_admin_token', data.token);
      setIsAdminLoggedIn(true);
      setPassphrase('');
      fetchServerStats(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Check server logs.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
      });
    } catch {}
    setAdminToken('');
    localStorage.removeItem('mbhm_admin_token');
    setIsAdminLoggedIn(false);
    setServerStats(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                MOSTAKIM BHAI HOT MAIL 📬 — Admin Panel
              </h2>
              <p className="text-xs text-slate-400">
                Protected system diagnostics & service controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isAdminLoggedIn ? (
            <div className="max-w-md mx-auto my-8 bg-slate-950 border border-slate-800/80 rounded-2xl p-6 sm:p-8 text-center space-y-5">
              <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-100 text-base">Administrator Login</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your admin secret passphrase to access server metrics and domain controls.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter admin secret passphrase..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-center text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {loginError && (
                  <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2.5 rounded-lg">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{loggingIn ? 'Authenticating...' : 'Unlock Admin Panel'}</span>
                </button>
              </form>

              <div className="text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-left">
                💡 <b>Default Key:</b> Set in your <code className="text-cyan-300 font-mono">.env</code> as <code className="text-cyan-300 font-mono">ADMIN_SECRET</code>. The default passphrase is <code className="text-cyan-300 font-mono">mostakim_admin_2026</code>.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-slate-200">Admin Session Authorized</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={testHealthAndDomains}
                    disabled={isPinging}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Ping API</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 text-xs font-medium rounded-lg border border-red-800/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <div className="text-xs text-slate-400">Mail.tm Gateway</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-2">
                    <span>ONLINE</span>
                    {mailTmLatency !== null && mailTmLatency > 0 && (
                      <span className="text-xs text-slate-400">({mailTmLatency}ms)</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">Direct proxy verified</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <div className="text-xs text-slate-400">Active Domains</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {domains.length} <span className="text-xs font-normal text-slate-400">available</span>
                  </div>
                  <div className="text-[11px] text-cyan-400 truncate">
                    {domains[0] ? `@${domains[0].domain}` : 'Scanning...'}
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <div className="text-xs text-slate-400">Server Status</div>
                  <div className="text-lg font-bold font-mono text-cyan-300">
                    OPERATIONAL
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Accounts served: {serverStats?.totalAccountsCreated || 0}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-xs text-slate-200">Mail.tm Disposable Domains</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{domains.length} Active</span>
                </div>

                <div className="space-y-2">
                  {domains.map((d) => (
                    <div
                      key={d.id}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-cyan-300 font-semibold">@{d.domain}</span>
                      <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                        Active & Healthy
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-slate-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>How to Change Your Admin Password</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  In your Render dashboard environment variables, set:
                </p>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-cyan-300 select-all">
                  ADMIN_SECRET="your_private_password_here"
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};