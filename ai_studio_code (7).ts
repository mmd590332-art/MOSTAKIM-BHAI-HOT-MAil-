import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, RefreshCw, Mail, Sparkles, Trash2, ShieldCheck, 
  Inbox, ChevronRight, Settings, QrCode, X, Clock, Send, HelpCircle, AlertCircle, ExternalLink 
} from 'lucide-react';
import { MailTmService, MailAccount, MailMessageSummary, MailDomain } from '../services/mailtm';

interface MailboxViewProps {
  currentAccount: MailAccount | null;
  onAccountCreated: (account: MailAccount, token: string) => void;
  messages: MailMessageSummary[];
  onRefreshInbox: () => Promise<void>;
  onSelectMessage: (msg: MailMessageSummary) => void;
  onClearMailbox: () => void;
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  errorMessage: string | null;
  onOpenHistory: () => void;
  onOpenHelp: () => void;
}

export const MailboxView: React.FC<MailboxViewProps> = ({
  currentAccount,
  onAccountCreated,
  messages,
  onRefreshInbox,
  onSelectMessage,
  onClearMailbox,
  autoRefreshEnabled,
  setAutoRefreshEnabled,
  errorMessage,
  onOpenHistory,
  onOpenHelp,
}) => {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [domains, setDomains] = useState<MailDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [customUsername, setCustomUsername] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    MailTmService.getDomains()
      .then((data) => {
        setDomains(data);
        if (data.length > 0) {
          setSelectedDomain(data[0].domain);
        }
      })
      .catch((err) => {
        console.error('Failed to load domains:', err);
      });
  }, []);

  const handleCopyEmail = () => {
    if (!currentAccount) return;
    navigator.clipboard.writeText(currentAccount.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshInbox();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleGenerateRandom = async () => {
    setGenerating(true);
    try {
      const { account, token } = await MailTmService.createAccount();
      onAccountCreated(account, token);
    } catch (err: any) {
      alert(`Could not generate address: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    if (!customUsername || customUsername.length < 3) {
      setCustomError('Username must be at least 3 alphanumeric characters.');
      return;
    }
    setGenerating(true);
    try {
      const { account, token } = await MailTmService.createAccount(customUsername, selectedDomain);
      onAccountCreated(account, token);
      setShowCustomModal(false);
      setCustomUsername('');
    } catch (err: any) {
      setCustomError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 px-1 sm:px-0">
      {errorMessage && (
        <div className="w-full bg-red-950/70 border border-red-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-200 text-xs sm:text-sm shadow-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-100">Service Status Notice</div>
              <div className="text-red-300 mt-0.5">{errorMessage}</div>
            </div>
          </div>
          <button
            onClick={handleGenerateRandom}
            className="w-full sm:w-auto px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 text-center"
          >
            Retry Connection
          </button>
        </div>
      )}

      <div className="w-full bg-slate-900/95 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-black text-xs sm:text-sm tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                MOSTAKIM BHAI HOT MAIL 📬
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-emerald-400 font-semibold">Active & Listening</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            {currentAccount ? (
              <div className="w-full space-y-3">
                <div 
                  onClick={handleCopyEmail}
                  className="w-full font-mono text-base sm:text-2xl font-bold text-white bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-3.5 sm:p-4.5 transition-all cursor-pointer flex items-center justify-between gap-2 group select-all shadow-inner"
                  title="Click to copy address"
                >
                  <span className="tracking-tight truncate text-cyan-200 font-extrabold">
                    {currentAccount.address}
                  </span>
                  <div className="p-2 text-slate-400 group-hover:text-cyan-300 hover:bg-slate-800/80 rounded-xl transition-colors shrink-0">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
                  <button
                    onClick={handleCopyEmail}
                    className="sm:col-span-3 w-full py-3 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Address Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>📋 Copy Address</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    title="Scan QR Code with Phone Camera"
                  >
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <span>Scan QR</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-400 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-cyan-300 font-mono">
                    @{currentAccount.address.split('@')[1]}
                  </span>
                  <span>·</span>
                  <span className="text-emerald-400">⚡ Instant OTP Delivery</span>
                  <span>·</span>
                  <span className="text-purple-300">🔒 100% Anonymous</span>
                </div>
              </div>
            ) : (
              <div className="w-full py-6 text-center text-slate-400 text-xs sm:text-sm flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Generating your disposable mailbox with Mail.tm...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-1">
            <button
              onClick={handleGenerateRandom}
              disabled={generating}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>✉️ New Email</span>
            </button>

            <button
              onClick={handleGenerateRandom}
              disabled={generating}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl border border-slate-700 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-cyan-400 shrink-0 ${generating ? 'animate-spin' : ''}`} />
              <span>⚡ Generate Mail</span>
            </button>

            <button
              onClick={() => setShowCustomModal(true)}
              className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white font-medium text-xs rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>⚙️ Custom Name</span>
            </button>

            <button
              onClick={onOpenHistory}
              className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white font-medium text-xs rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>📥 History</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
        <button
          onClick={handleManualRefresh}
          disabled={refreshing || !currentAccount}
          className="p-3 bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold text-cyan-300 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
          <span>🔄 Check Inbox</span>
        </button>

        <button
          onClick={onOpenHistory}
          className="p-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer shadow-sm"
        >
          <Clock className="w-4 h-4 text-purple-400 shrink-0" />
          <span>📥 Saved Inboxes</span>
        </button>

        <a
          href="https://t.me/Accs_Broker_VN"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-slate-900/90 hover:bg-slate-850 border border-blue-500/30 hover:border-blue-400/60 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-semibold text-blue-300 cursor-pointer shadow-sm"
        >
          <Send className="w-4 h-4 text-blue-400 shrink-0" />
          <span>💬 Support</span>
          <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
        </a>

        <button
          onClick={onOpenHelp}
          className="p-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer shadow-sm"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>❓ Help & FAQ</span>
        </button>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 px-4 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <Inbox className="w-4.5 h-4.5 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100">Live Inbox</h2>
          </div>

          <div className="px-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono font-bold text-cyan-300">
            {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Auto-refresh (10s)</span>
          </label>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing || !currentAccount}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Checking...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-inner">
            <Inbox className="w-8 h-8" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400"></span>
          </div>

          <div className="max-w-md mx-auto space-y-1.5 px-2">
            <h3 className="text-base font-bold text-slate-100">Waiting for incoming messages</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your temporary mailbox is active. Send an email to{' '}
              <code className="text-cyan-300 font-mono font-medium">{currentAccount?.address || 'your address'}</code> or paste it on any website requiring verification.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing || !currentAccount}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Check Inbox Now</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-2.5">
          {messages.map((msg) => {
            const detectedOtp = MailTmService.extractVerificationCode(msg.intro, msg.subject);

            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group shadow-sm"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors shrink-0 mt-0.5 sm:mt-0">
                    <Mail className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-100 truncate">
                        {msg.from.name || msg.from.address}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono truncate">
                        &lt;{msg.from.address}&gt;
                      </span>
                    </div>

                    <div className="text-xs text-slate-200 font-medium truncate">
                      {msg.subject || '(No Subject)'}
                    </div>

                    <div className="text-xs text-slate-400 line-clamp-1">
                      {msg.intro || 'Click to view full message...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  {detectedOtp && (
                    <div className="bg-cyan-950/90 border border-cyan-500/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="text-xs font-mono font-bold text-cyan-200">
                        {detectedOtp}
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <button
                    type="button"
                    className="p-1.5 text-slate-400 group-hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showQrModal && currentAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Scan with Phone Camera</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl inline-block shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentAccount.address)}`}
                alt="QR Code"
                className="w-44 h-44 object-contain"
              />
            </div>

            <div className="font-mono text-xs text-cyan-300 font-semibold break-all px-2">
              {currentAccount.address}
            </div>

            <p className="text-[11px] text-slate-400">
              Point your Android or iOS camera at the code to scan your temporary address instantly.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">⚙️ Create Custom Email Address</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Desired Username Prefix
                </label>
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="e.g. mostakim, gamer99, tester"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Active Domain
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
                >
                  {domains.map((d) => (
                    <option key={d.id} value={d.domain}>
                      @{d.domain}
                    </option>
                  ))}
                </select>
              </div>

              {customError && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2.5 rounded-lg">
                  {customError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                >
                  {generating ? 'Creating...' : 'Create Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};