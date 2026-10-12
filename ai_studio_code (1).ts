import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MAILTM_UPSTREAM = 'https://api.mail.tm';

// Admin passphrase from environment
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'mostakim_admin_2026';

// Server-side session tokens for authorized admins
const authorizedAdminTokens = new Set<string>();

// Activity counters
let totalAccountsCreated = 0;
let totalMessagesChecked = 0;
const serverStartTime = Date.now();

app.use(express.json());

// -------------------------------------------------------------
// MAIL.TM SERVER-SIDE PROXY ROUTE
// Resolves browser CORS & network restrictions
// -------------------------------------------------------------
app.all('/api/mailtm/*', async (req, res) => {
  const subpath = req.url.replace('/api/mailtm', '');
  const targetUrl = `${MAILTM_UPSTREAM}${subpath}`;

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'] as string;
    }
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'] as string;
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    if (req.method === 'POST' && subpath.startsWith('/accounts')) {
      totalAccountsCreated++;
    } else if (req.method === 'GET' && subpath.startsWith('/messages')) {
      totalMessagesChecked++;
    }

    const upstreamRes = await fetch(targetUrl, fetchOptions);
    const contentType = upstreamRes.headers.get('content-type') || '';

    res.status(upstreamRes.status);

    if (contentType.includes('application/json') || contentType.includes('application/ld+json')) {
      const data = await upstreamRes.json();
      res.json(data);
    } else {
      const text = await upstreamRes.text();
      res.send(text);
    }
  } catch (err: any) {
    console.error(`Mail.tm proxy error [${req.method} ${targetUrl}]:`, err.message);
    res.status(502).json({
      error: 'Failed to communicate with Mail.tm upstream service',
      message: err.message,
    });
  }
});

// -------------------------------------------------------------
// SECURE ADMIN AUTHENTICATION & TELEMETRY ENDPOINTS
// -------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const { passphrase } = req.body;

  if (!passphrase || typeof passphrase !== 'string') {
    return res.status(400).json({ success: false, error: 'Passphrase is required' });
  }

  const inputBuffer = Buffer.from(passphrase);
  const secretBuffer = Buffer.from(ADMIN_SECRET);

  let isMatch = false;
  if (inputBuffer.length === secretBuffer.length) {
    isMatch = crypto.timingSafeEqual(inputBuffer, secretBuffer);
  }

  if (isMatch || passphrase === ADMIN_SECRET) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    authorizedAdminTokens.add(sessionToken);

    setTimeout(() => {
      authorizedAdminTokens.delete(sessionToken);
    }, 24 * 60 * 60 * 1000);

    return res.json({
      success: true,
      token: sessionToken,
      message: 'Admin authentication successful',
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Incorrect administrator passphrase.',
  });
});

app.get('/api/admin/stats', (req, res) => {
  const token = req.headers['x-admin-token'] as string;
  if (!token || !authorizedAdminTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);

  res.json({
    status: 'healthy',
    uptimeSeconds,
    totalAccountsCreated,
    totalMessagesChecked,
    activeSessions: authorizedAdminTokens.size,
    serverTimestamp: new Date().toISOString(),
  });
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.headers['x-admin-token'] as string;
  if (token) {
    authorizedAdminTokens.delete(token);
  }
  res.json({ success: true });
});

// General health check
app.get('/api/health', (req, res) => {
  res.json({
    service: 'MOSTAKIM BHAI HOT MAIL 📬',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION SERVING
// -------------------------------------------------------------
async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const distIndex = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndex);

  if (isProd || hasDist) {
    console.log(`[Server] Serving production static files from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    console.log('[Server] Starting Vite development middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`MOSTAKIM BHAI HOT MAIL server running at http://0.0.0.0:${PORT} (Production: ${isProd || hasDist})`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});