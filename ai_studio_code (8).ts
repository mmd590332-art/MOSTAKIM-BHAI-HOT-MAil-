import React from 'react';
import { HistoryAccountEntry, MailAccount } from '../services/mailtm';
import { X, Clock, Mail, Copy, Check, ArrowRight, Trash2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryAccountEntry[];
  currentAddress?: string;
  onSelectAccount: (account: MailAccount) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  currentAddress,
  onSelectAccount,
  onClearHistory,
}) => {
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-100">
                📥 Email Address History
              </h2>
              <p className="text-[11px] text-slate-400">
                Switch back to any previously generated disposable address
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Mail className="w-8 h-8 mx-auto text-slate-600" />
              <p>No previous email addresses found in this session.</p>
              <p className="text-[11px] text-slate-500">
                When you generate new addresses, they will be saved here so you never lose them.
              </p>
            </div>
          ) : (
            history.map((entry) => {
              const isCurrent = entry.account.address === currentAddress;

              return (
                <div
                  key={entry.account.address}
                  onClick={() => {
                    onSelectAccount(entry.account);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-xs'
                      : 'bg-slate-950/80 hover:bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                        {entry.account.address}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-medium border border-cyan-500/30">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleCopy(entry.account.address, e)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Copy address"
                    >
                      {copiedAddress === entry.account.address ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      className="px-2.5 py-1 bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                    >
                      <span>{isCurrent ? 'Viewing' : 'Switch'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-500">
          {history.length > 0 ? (
            <button
              onClick={onClearHistory}
              className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          ) : (
            <span></span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};