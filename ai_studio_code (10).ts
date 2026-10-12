import React from 'react';
import { 
  Sparkles, ArrowRight
} from 'lucide-react';

interface UserGuideProps {
  onBackToInbox: () => void;
  tab: 'guide' | 'faq';
}

export const UserGuide: React.FC<UserGuideProps> = ({ onBackToInbox, tab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">
              {tab === 'guide' ? 'How MOSTAKIM BHAI HOT MAIL Works' : 'Help & Frequently Asked Questions'}
            </h1>
            <p className="text-xs text-slate-400">
              {tab === 'guide'
                ? 'Three simple steps to keep your personal mailbox 100% free of spam.'
                : 'Everything you need to know about disposable email, OTP codes, and buttons.'}
            </p>
          </div>
        </div>
      </div>

      {tab === 'guide' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <span className="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-sm text-slate-100">1. Generate & Copy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click <b>⚡ Generate Mail</b> or <b>✉️ New Email</b> to receive a new address. Tap <b>📋 Copy Address</b> to put it on your clipboard.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <span className="w-7 h-7 rounded-lg bg-blue-500 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-slate-100">2. Register Anywhere</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste the temporary address into registration forms, verification pages, or downloads without exposing your personal email.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <span className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-sm text-slate-100">3. Receive OTP Codes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Incoming messages arrive automatically. Tap <b>🔄 Check Inbox</b> to refresh anytime and copy detected 4-8 digit OTP codes with 1 tap!
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100">Button Guide</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <b className="text-cyan-300">✉️ New Email / ⚡ Generate Mail</b>
                <p className="text-slate-400 text-[11px]">Creates a new random temporary address and saves your previous one in history.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <b className="text-cyan-300">📋 Copy Address</b>
                <p className="text-slate-400 text-[11px]">Copies your active address to your device clipboard with instant visual feedback.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <b className="text-cyan-300">🔄 Check Inbox</b>
                <p className="text-slate-400 text-[11px]">Contacts Mail.tm servers to fetch newly arrived verification messages.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <b className="text-cyan-300">📥 Email History</b>
                <p className="text-slate-400 text-[11px]">Opens previously generated addresses so you can easily switch back to an older inbox.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <b className="text-cyan-300">⚙️ Custom Name</b>
                <p className="text-slate-400 text-[11px]">Allows choosing your own custom email username prefix (e.g. <code>myname@...</code>).</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <b className="text-cyan-300">💬 Support</b>
                <p className="text-slate-400 text-[11px]">Direct Telegram link to contact Mostakim Bhai: <b>@Accs_Broker_VN</b>.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={onBackToInbox}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Live Inbox</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="border-b border-slate-800 pb-3 space-y-1">
              <h4 className="font-bold text-slate-100">How long does my temporary email address last?</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Your disposable address remains active in your browser session. If you generate a new address, your old one is saved in <b>📥 Email History</b> so you can switch back whenever needed.
              </p>
            </div>

            <div className="border-b border-slate-800 pb-3 space-y-1">
              <h4 className="font-bold text-slate-100">Can I receive verification OTP codes?</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Yes! MOSTAKIM BHAI HOT MAIL is connected to real Mail.tm mailservers. It receives emails with activation links and automatically extracts 4–8 digit verification codes.
              </p>
            </div>

            <div className="border-b border-slate-800 pb-3 space-y-1">
              <h4 className="font-bold text-slate-100">What if a website rejects the domain?</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Some strict websites block public disposable domains. Use the <b>⚙️ Custom Name</b> button to test alternate active domains or generate a new address.
              </p>
            </div>

            <div className="border-b border-slate-800 pb-3 space-y-1">
              <h4 className="font-bold text-slate-100">Can I use this on Android or iPhone?</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Yes! The website is mobile-responsive and works in any Android or iOS web browser (Chrome, Safari, Firefox). You can also scan the QR code to open the address on mobile.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-100">How do I contact support?</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Message Mostakim Bhai directly on Telegram: <a href="https://t.me/Accs_Broker_VN" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-semibold">@Accs_Broker_VN</a>.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={onBackToInbox}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Back to Live Inbox</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};