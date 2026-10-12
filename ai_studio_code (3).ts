export interface MailDomain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
}

export interface MailAccount {
  id: string;
  address: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  password?: string;
  token?: string;
}

export interface MailMessageSummary {
  id: string;
  accountId: string;
  msgid: string;
  from: {
    address: string;
    name: string;
  };
  to: Array<{
    address: string;
    name: string;
  }>;
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MailMessageDetail extends MailMessageSummary {
  text?: string;
  html?: string[];
  attachments?: Array<{
    id: string;
    filename: string;
    contentType: string;
    disposition: string;
    transferEncoding: string;
    related: boolean;
    size: number;
    downloadUrl: string;
  }>;
}

export interface HistoryAccountEntry {
  account: MailAccount;
  createdAt: number;
  messageCount: number;
}

const STORAGE_KEY_CURRENT = 'mbhm_current_account';
const STORAGE_KEY_HISTORY = 'mbhm_account_history';
const STORAGE_KEY_CACHED_DOMAINS = 'mbhm_cached_domains';

let cachedDomains: MailDomain[] = [];
let domainsCacheTimestamp = 0;
const DOMAINS_CACHE_TTL = 3 * 60 * 1000;

export class MailTmService {
  private static async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const isBrowser = typeof window !== 'undefined';
    const proxyUrl = `/api/mailtm${endpoint}`;
    const directUrl = `https://api.mail.tm${endpoint}`;

    if (isBrowser) {
      try {
        const res = await fetch(proxyUrl, options);
        if (res.status !== 502 && res.status !== 504) {
          return res;
        }
      } catch (proxyErr) {
        console.warn('Proxy fetch failed, trying direct:', proxyErr);
      }
    }

    return await fetch(directUrl, options);
  }

  static async getDomains(forceRefresh = false): Promise<MailDomain[]> {
    const now = Date.now();

    if (!forceRefresh && cachedDomains.length > 0 && now - domainsCacheTimestamp < DOMAINS_CACHE_TTL) {
      return cachedDomains;
    }

    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_CACHED_DOMAINS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.domains) && parsed.domains.length > 0 && now - parsed.timestamp < DOMAINS_CACHE_TTL) {
            cachedDomains = parsed.domains;
            domainsCacheTimestamp = parsed.timestamp;
            return cachedDomains;
          }
        }
      } catch {}
    }

    try {
      const response = await this.request('/domains?page=1', {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to load domains: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      let list: MailDomain[] = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.['hydra:member'])) {
        list = data['hydra:member'];
      } else if (Array.isArray(data?.member)) {
        list = data.member;
      }

      const active = list.filter((d) => d && (d.isActive === undefined || d.isActive === true));

      if (active.length > 0) {
        cachedDomains = active;
        domainsCacheTimestamp = now;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY_CACHED_DOMAINS, JSON.stringify({ domains: active, timestamp: now }));
          } catch {}
        }
        return active;
      }

      if (cachedDomains.length > 0) {
        return cachedDomains;
      }

      return [{ id: 'fallback-1', domain: 'maxxspace.com', isActive: true, isPrivate: false, createdAt: new Date().toISOString() }];
    } catch (err: any) {
      if (cachedDomains.length > 0) return cachedDomains;
      return [{ id: 'fallback-1', domain: 'maxxspace.com', isActive: true, isPrivate: false, createdAt: new Date().toISOString() }];
    }
  }

  static generateRandomUsername(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateSecurePassword(length = 14): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async createAccount(customUsername?: string, chosenDomain?: string): Promise<{ account: MailAccount; token: string }> {
    const domains = await this.getDomains();
    if (!domains || domains.length === 0) {
      throw new Error('No active disposable domains available currently.');
    }

    const domain = chosenDomain && domains.some(d => d.domain === chosenDomain)
      ? chosenDomain
      : domains[0].domain;

    const username = (customUsername && customUsername.trim().length >= 3)
      ? customUsername.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
      : this.generateRandomUsername(8);

    const address = `${username}@${domain}`;
    const password = this.generateSecurePassword(16);

    const createRes = await this.request('/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ address, password }),
    });

    if (!createRes.ok) {
      const errorData = await createRes.json().catch(() => ({}));
      const msg = errorData['hydra:description'] || errorData.message || createRes.statusText;
      throw new Error(`Could not create address (${createRes.status}): ${msg}`);
    }

    const accountData: MailAccount = await createRes.json();

    const tokenRes = await this.request('/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ address, password }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Account created, but token authentication failed (${tokenRes.status})`);
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    const fullAccount: MailAccount = {
      ...accountData,
      address,
      password,
      token,
    };

    this.saveAccountToStorage(fullAccount);
    this.saveToHistory(fullAccount);

    return { account: fullAccount, token };
  }

  static async getMessages(token: string, page = 1): Promise<MailMessageSummary[]> {
    const response = await this.request(`/messages?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Session expired. Please generate a new temporary address.');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    const data = await response.json();
    let list: MailMessageSummary[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (Array.isArray(data?.['hydra:member'])) {
      list = data['hydra:member'];
    } else if (Array.isArray(data?.member)) {
      list = data.member;
    }
    return list;
  }

  static async getMessageDetail(token: string, messageId: string): Promise<MailMessageDetail> {
    const response = await this.request(`/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load email details: ${response.statusText}`);
    }

    return await response.json();
  }

  static async deleteMessage(token: string, messageId: string): Promise<boolean> {
    const response = await this.request(`/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  }

  static extractVerificationCode(textOrIntro = '', subject = ''): string | null {
    const combined = `${subject} ${textOrIntro}`;
    const otpKeywordsMatch = combined.match(/(?:code|otp|pin|verification|código|passcode)[\s:]*([0-9]{4,8})/i);
    if (otpKeywordsMatch && otpKeywordsMatch[1]) {
      return otpKeywordsMatch[1];
    }
    const standaloneCode = combined.match(/\b([0-9]{5,7})\b/);
    if (standaloneCode && standaloneCode[1]) {
      return standaloneCode[1];
    }
    const subjectCode = subject.match(/\b([0-9]{4,8})\b/);
    if (subjectCode && subjectCode[1]) {
      return subjectCode[1];
    }
    return null;
  }

  static saveAccountToStorage(account: MailAccount | null) {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      if (!account) {
        localStorage.removeItem(STORAGE_KEY_CURRENT);
      } else {
        localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(account));
      }
    } catch {}
  }

  static getAccountFromStorage(): MailAccount | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveToHistory(account: MailAccount) {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const history = this.getHistory();
      const filtered = history.filter((h) => h.account.address !== account.address);
      const updated: HistoryAccountEntry[] = [
        { account, createdAt: Date.now(), messageCount: 0 },
        ...filtered,
      ].slice(0, 15);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch {}
  }

  static updateHistoryMessageCount(address: string, count: number) {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const history = this.getHistory();
      const updated = history.map((h) => {
        if (h.account.address === address) {
          return { ...h, messageCount: count };
        }
        return h;
      });
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch {}
  }

  static getHistory(): HistoryAccountEntry[] {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static clearHistory() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {}
  }

  static clearStorage() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    } catch {}
  }
}