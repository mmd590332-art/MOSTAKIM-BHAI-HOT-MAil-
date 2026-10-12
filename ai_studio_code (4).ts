import React, { useState, useEffect, useRef } from 'react';
import { MailTmService, MailAccount, MailMessageSummary, HistoryAccountEntry } from './services/mailtm';
import { Navbar } from './components/Navbar';
import { MailboxView } from './components/MailboxView';
import { UserGuide } from './components/UserGuide';
import { AdminPanel } from './components/AdminPanel';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HistoryModal } from './components/HistoryModal';
import { EmailReaderModal } from './components/EmailReaderModal';
import { Zap, Send, Sparkles, Lock, ExternalLink } from 'lucide-react';

export default function App() {
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return sessionStorage.getItem('mbhm_has_entered') !== 'true';
  });

  const [activeTab, setActiveTab] = useState<'inbox' | 'guide' | 'faq'>('inbox');
  const [currentAccount, setCurrentAccount] = useState<MailAccount | null>(null);
  const [messages, setMessages] = useState<MailMessageSummary[]>([]);
  const [accountHistory, setAccountHistory] = useState<HistoryAccountEntry[]>([]);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<MailMessageSummary | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const prevMsgCount = useRef<number>(0);

  const showToast = (text: string) => {
    setGlobalToast(text);
    setTimeout(() => setGlobalToast(null), 3000);
  };

  useEffect(() => {
    setAccountHistory(MailTmService.getHistory());

    const saved = MailTmService.getAccountFromStorage();
    if (saved && saved.token) {
      setCurrentAccount(saved);
      MailTmService.getMessages(saved.token)
        .then((msgs) => {
          setMessages(msgs);
          prevMsgCount.current = msgs.length;
          MailTmService.updateHistoryMessageCount(saved.address, msgs.length);
        })
        .catch(() => {
          handleGenerateNew();
        });
    } else {
      handleGenerateNew();
    }
  }, []);

  useEffect(() => {
    if (!autoRefreshEnabled || !currentAccount?.token) return;

    const interval = setInterval(async () => {
      if (document.hidden) return;

      try {
        const latest = await MailTmService.getMessages(currentAccount.token!);
        if (latest.length > prevMsgCount.current && prevMsgCount.current > 0) {
          showToast(`📬 New email arrived: "${latest[0].subject || 'No Subject'}"`);
        }
        prevMsgCount.current = latest.length;
        setMessages(latest);
        MailTmService.updateHistoryMessageCount(currentAccount.address, latest.length);
        setAccountHistory(MailTmService.getHistory());
      } catch (err) {
        console.error('Auto-refresh error:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, currentAccount]);

  const handleRefreshInbox = async () => {
    if (!currentAccount?.token) return;
    try {
      const msgs = await MailTmService.getMessages(currentAccount.token);
      setMessages(msgs);
      prevMsgCount.current = msgs.length;
      MailTmService.updateHistoryMessageCount(currentAccount.address, msgs.length);
      setAccountHistory(MailTmService.getHistory());
      setErrorMessage(null);
      showToast('🔄 Inbox updated.');
    } catch (err: any) {
      showToast(`Refresh error: ${err.message}`);
    }
  };

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const { account } = await MailTmService.createAccount();
      setCurrentAccount(account);
      setMessages([]);
      prevMsgCount.current = 0;
      setAccountHistory(MailTmService.getHistory());
      showToast(`⚡ New address ready: ${account.address}`);
    } catch (err: any) {
      const msg = err.message || 'Could not connect to disposable email provider';
      setErrorMessage(msg);
      showToast(`Notice: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccountCreated = (account: MailAccount) => {
    setCurrentAccount(account);
    setMessages([]);
    prevMsgCount.current = 0;
    setAccountHistory(MailTmService.getHistory());
    setErrorMessage(null);
    showToast(`⚡ Address ready: ${account.address}`);
  };

  const handleSelectFromHistory = async (account: MailAccount) => {
    setCurrentAccount(account);
    MailTmService.saveAccountToStorage(account);
    setMessages([]);
    prevMsgCount.current = 0;
    showToast(`Switched to: ${account.address}`);

    if (account.token) {
      try {
        const msgs = await MailTmService.getMessages(account.token);
        setMessages(msgs);
        prevMsgCount.current = msgs.length;
      } catch {}
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear saved address history?')) {
      MailTmService.clearHistory();
      setAccountHistory([]);
      showToast('History cleared.');
    }
  };

  const handleClearMailbox = () => {
    if (confirm('Discard current disposable address and generate a new one?')) {
      MailTmService.clearStorage();
      handleGenerateNew();
    }
  };

  const handleSelectMessage = (msg: MailMessageSummary) => {
    setSelectedMessage(msg);
    setIsReaderOpen(true);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!currentAccount?.token) return;
    await MailTmService.deleteMessage(currentAccount.token, id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    showToast('Email deleted.');
  };

  const handleEnterWebsite = () => {
    sessionStorage.setItem('mbhm_has_entered', 'true');
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {showWelcome && <WelcomeScreen onEnter={handleEnterWebsite} />}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGenerateNew={handleGenerateNew}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isGenerating={isGenerating}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onShowWelcome={() => setShowWelcome(true)}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col items-center">
        <div className="w-full mb-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 bg-slate-900/70 border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-sm text-center sm:text-left">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-200 font-extrabold tracking-wide">MOSTAKIM BHAI HOT MAIL 📬</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Live Disposable Email Service</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('guide')}
              className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer"
            >
              How It Works →
            </button>
            <span>·</span>
            <a
              href="https://t.me/Accs_Broker_VN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-bold hover:underline flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Support (@Accs_Broker_VN)</span>
            </a>
          </div>
        </div>

        {activeTab === 'inbox' && (
          <MailboxView
            currentAccount={currentAccount}
            onAccountCreated={handleAccountCreated}
            messages={messages}
            onRefreshInbox={handleRefreshInbox}
            onSelectMessage={handleSelectMessage}
            onClearMailbox={handleClearMailbox}
            autoRefreshEnabled={autoRefreshEnabled}
            setAutoRefreshEnabled={setAutoRefreshEnabled}
            errorMessage={errorMessage}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenHelp={() => setActiveTab('faq')}
          />
        )}

        {(activeTab === 'guide' || activeTab === 'faq') && (
          <UserGuide
            tab={activeTab}
            onBackToInbox={() => setActiveTab('inbox')}
          />
        )}
      </main>

      <EmailReaderModal
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        summary={selectedMessage}
        token={currentAccount?.token || null}
        onDeleteMessage={handleDeleteMessage}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={accountHistory}
        currentAddress={currentAccount?.address}
        onSelectAccount={handleSelectFromHistory}
        onClearHistory={handleClearHistory}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        isAdminLoggedIn={isAdminLoggedIn}
        setIsAdminLoggedIn={setIsAdminLoggedIn}
      />

      {globalToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-slate-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{globalToast}</span>
        </div>
      )}

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">MOSTAKIM BHAI HOT MAIL 📬</span>
            <span>—</span>
            <span>Free Disposable Temporary Email</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <button
              onClick={() => setShowWelcome(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Intro</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('inbox')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Inbox
            </button>
            <span>·</span>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              History
            </button>
            <span>·</span>
            <a
              href="https://t.me/Accs_Broker_VN"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <span>Support</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
              title="Administrator Management"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}