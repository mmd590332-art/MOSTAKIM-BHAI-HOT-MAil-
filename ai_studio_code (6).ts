import React, { useState } from 'react';
import { 
  Mail, Shield, ArrowRight, Zap, Sparkles, 
  Send, ExternalLink, Flame 
} from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnterClick = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 350);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-y-auto overflow-x-hidden p-4 sm:p-6 transition-all duration-500 ${
        isEntering ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#030712]"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-transparent rounded-full blur-[90px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-purple-600/15 rounded-full blur-[100px]"></div>
        <div className="absolute top-10 left-10 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-emerald-500/15 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-10 left-1/3 w-[180px] sm:w-[280px] h-[180px] sm:h-[280px] bg-rose-500/10 rounded-full blur-[90px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8 my-auto">
        <div className="relative group animate-float-gentle">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse-glow"></div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-400/40 flex items-center justify-center shadow-2xl">
            <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white text-[10px] font-black shadow-md">
              ⚡
            </div>
          </div>
        </div>

        <div className="space-y-3 w-full px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Premium Disposable Email Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-blue-400 drop-shadow-[0_0_35px_rgba(34,211,238,0.5)]">
              MOSTAKIM BHAI
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-cyan-300 drop-shadow-[0_0_25px_rgba(216,180,254,0.4)]">
              HOT MAIL
            </span>{' '}
            <span className="inline-block text-2xl sm:text-4xl">📬</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
            Create high-speed disposable email addresses, bypass registration walls, and receive instant OTP verification codes with 100% privacy.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full max-w-md mx-auto text-left">
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3 shadow-md hover:border-cyan-400/50 transition-colors">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>1-Click Email</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Ready in 1 second</p>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3 shadow-md hover:border-emerald-400/50 transition-colors">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Anonymous</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">No personal data</p>
          </div>

          <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-3 shadow-md hover:border-purple-400/50 transition-colors">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Instant OTPs</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Auto-extracted codes</p>
          </div>

          <div className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-3 shadow-md hover:border-rose-400/50 transition-colors">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Zero Spam</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Auto-deletes when done</p>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto pt-2">
          <button
            onClick={handleEnterClick}
            className="w-full py-4 sm:py-4.5 px-8 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-sky-200 shadow-[0_0_35px_rgba(34,211,238,0.6)] hover:shadow-[0_0_50px_rgba(34,211,238,0.8)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3 animate-shimmer-fast"
          >
            <span>ENTER WEBSITE</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="pt-2">
          <a
            href="https://t.me/Accs_Broker_VN"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-cyan-300 transition-all shadow-md group"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Telegram Support: <b className="text-white">@Accs_Broker_VN</b></span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>
    </div>
  );
};