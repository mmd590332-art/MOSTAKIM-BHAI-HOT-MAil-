import React from 'react';
import { Sparkles, Inbox, Clock, Send, HelpCircle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'inbox' | 'guide' | 'faq';
  setActiveTab: (tab: 'inbox' | 'guide' | 'faq') => void;
  onGenerateNew: () => void;
  onOpenHistory: () => void;
  isGenerating: boolean;
  isAdminLoggedIn: boolean;
  onOpenAdmin: () => void;
  onShowWelcome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onGenerateNew,
  onOpenHistory,
  isGenerating,
  isAdminLoggedIn,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-3">
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab('inbox')}
          className="flex flex-col items-center sm:items-start text-center sm:text-left group cursor-pointer leading-tight transition-transform active:scale-98"
        >
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span className="font-black text-base sm:text-lg md:text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-shimmer-fast">
              MOSTAKIM BHAI
            </span>
            <span className="font-extrabold text-sm sm:text-base md:text-lg bg-gradient-to-r from-amber-300 via-rose-400 to-cyan-300 bg-clip-text text-transparent">
              HOT MAIL
            </span>
            <span className="text-base sm:text-lg select-none">📬</span>
          </div>

          <span className="text-[10px] text-cyan-400/90 font-bold tracking-widest uppercase mt-0.5">
            ⚡ Instant Disposable Temporary Email
          </span>
        </button>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              activeTab === 'inbox'
                ? 'text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inbox</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="px-2.5 py-1.5 text-slate-300 hover:text-purple-300 hover:bg-purple-950/30 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-transparent hover:border-purple-800/40"
            title="View previously generated addresses"
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>History</span>
          </button>

          <a
            href="https://t.me/Accs_Broker_VN"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 text-blue-300 hover:text-blue-200 hover:bg-blue-950/40 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-blue-800/30"
            title="Telegram Support: @Accs_Broker_VN"
          >
            <Send className="w-3.5 h-3.5 text-blue-400" />
            <span>Support</span>
          </a>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              activeTab === 'faq'
                ? 'text-amber-300 bg-amber-950/70 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">FAQ</span>
          </button>

          {isAdminLoggedIn && (
            <button
              onClick={onOpenAdmin}
              className="px-2 py-1 rounded-lg text-emerald-300 text-xs bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/40 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-semibold"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Admin</span>
            </button>
          )}

          <button
            onClick={onGenerateNew}
            disabled={isGenerating}
            className="px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-cyan-950/50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 active:scale-95 ml-1"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Creating...' : '⚡ Generate'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};