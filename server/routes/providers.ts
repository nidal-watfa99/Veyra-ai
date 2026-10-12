import { Router, type Request, type Response } from 'express';
import {
  loadStore, saveStore, newId, encryptSecret, decryptSecret, maskKey,
} from '../db/store.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { writeAudit } from '../services/audit.js';
import { logger } from '../utils/logger.js';

const router = Router();
router.use(requireAuth);

type ProviderId = 'gemini' | 'groq' | 'cerebras' | 'openrouter';

const PROVIDER_META: Record<ProviderId, { name: string; portal: string; docs: string; defaultModel: string; models: { id: string; name: string }[] }> = {
  gemini: {
    name: 'Google Gemini',
    portal: 'https://aistudio.google.com/app/apikey',
    docs: 'https://ai.google.dev/gemini-api/docs',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    ],
  },
  groq: {
    name: 'GroqCloud',
    portal: 'https://console.groq.com/keys',
    docs: 'https://console.groq.com/docs/overview',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    ],
  },
  cerebras: {
    name: 'Cerebras Inference',
    portal: 'https://inference.cerebras.ai/',
    docs: 'https://inference-docs.cerebras.ai/',
    defaultModel: 'llama3.1-70b',
    models: [
      { id: 'llama3.1-70b', name: 'Llama 3.1 70B' },
      { id: 'llama3.1-8b', name: 'Llama 3.1 8B' },
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    portal: 'https://openrouter.ai/keys',
    docs: 'https://openrouter.ai/docs',
    defaultModel: 'google/gemini-2.0-flash-exp:free',
    models: [
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (free)' },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (free)' },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (free)' },
    ],
  },
};

function isProvider(p: unknown): p is ProviderId {
  return typeof p === 'string' && p in PROVIDER_META;
}

router.get('/', (req: Request, res: Response) => {
  const store = loadStore();
  const orgKeys = store.providerKeys.filter((k) => k.organizationId === req.auth!.organizationId);
  const providers = (Object.keys(PROVIDER_META) as ProviderId[]).map((id) => {
    const meta = PROVIDER_META[id];
    const rec = orgKeys.find((k) => k.provider === id);
    return {
      id,
      name: meta.name,
      officialPortalUrl: meta.portal,
      docsUrl: meta.docs,
      models: meta.models,
      hasStoredKey: !!rec,
      maskedKey: rec ? maskKey('xxxx' + rec.encryptedKey.slice(-4)) : '',
      selectedModel: rec?.selectedModel || meta.defaultModel,
      status: rec?.status || 'unconfigured',
      lastTestedAt: rec?.lastTestedAt,
      lastLatencyMs: rec?.lastLatencyMs,
      lastError: rec?.lastError,
    };
  });
  res.json({ providers });
});

router.put('/:provider/key', requireRole('owner', 'admin'), async (req: Request, res: Response) => {
  const provider = req.params.provider;
  if (!isProvider(provider)) {
    res.status(400).json({ error: 'unknown_provider' });
    return;
  }
  const apiKey = req.body?.apiKey;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
    res.status(400).json({ error: 'invalid_key', message: 'API key required (min 10 chars)' });
    return;
  }
  const model = req.body?.model || PROVIDER_META[provider].defaultModel;
  const { encrypted, iv, authTag } = encryptSecret(apiKey.trim());
  const store = loadStore();
  const existing = store.providerKeys.find(
    (k) => k.organizationId === req.auth!.organizationId && k.provider === provider
  );
  const now = new Date().toISOString();
  if (existing) {
    existing.encryptedKey = encrypted;
    existing.iv = iv;
    existing.authTag = authTag;
    existing.selectedModel = model;
    existing.status = 'untested';
    existing.updatedAt = now;
    existing.updatedBy = req.auth!.userId;
  } else {
    store.providerKeys.push({
      id: newId('pkey'),
      organizationId: req.auth!.organizationId,
      provider,
      encryptedKey: encrypted,
      iv,
      authTag,
      selectedModel: model,
      status: 'untested',
      updatedAt: now,
      updatedBy: req.auth!.userId,
    });
  }
  await saveStore(store);
  await writeAudit({
    organizationId: req.auth!.organizationId,
    userId: req.auth!.userId,
    action: 'provider.key_save',
    resource: 'provider',
    resourceId: provider,
    result: 'success',
    ip: req.ip,
  });
  res.json({ success: true, status: 'untested', maskedKey: maskKey(apiKey) });
});

router.post('/:provider/test', requireRole('owner', 'admin', 'member'), async (req: Request, res: Response) => {
  const provider = req.params.provider;
  if (!isProvider(provider)) {
    res.status(400).json({ error: 'unknown_provider' });
    return;
  }
  const store = loadStore();
  const rec = store.providerKeys.find(
    (k) => k.organizationId === req.auth!.organizationId && k.provider === provider
  );
  if (!rec) {
    res.status(400).json({ error: 'no_key', message: 'No API key configured for this provider', status: 'unconfigured' });
    return;
  }

  let apiKey: string;
  try {
    apiKey = decryptSecret(rec.encryptedKey, rec.iv, rec.authTag);
  } catch {
    res.status(500).json({ error: 'decrypt_failed', status: 'error' });
    return;
  }

  const model = rec.selectedModel;
  const testPrompt = 'Reply with exactly: VEYRA_OK';
  const started = Date.now();
  let status = 'connected';
  let errorMsg = '';
  let latency = 0;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let responseText = '';
    if (provider === 'gemini') {
      // Official: use x-goog-api-key header, not query string
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: testPrompt }] }],
          generationConfig: { maxOutputTokens: 20, temperature: 0 },
        }),
        signal: controller.signal,
      });
      const data = (await apiRes.json()) as any;
      clearTimeout(timeout);
      if (!apiRes.ok) {
        status = apiRes.status === 429 ? 'quota_exceeded' : apiRes.status === 401 || apiRes.status === 403 ? 'auth_failed' : 'service_error';
        errorMsg = data?.error?.message || `HTTP ${apiRes.status}`;
      } else {
        responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } else {
      const endpoints: Record<string, string> = {
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        cerebras: 'https://api.cerebras.ai/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
      };
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = process.env.APP_PUBLIC_URL || 'https://veyra.ai';
        headers['X-Title'] = 'Veyra AI';
      }
      const apiRes = await fetch(endpoints[provider], {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20,
          temperature: 0,
        }),
        signal: controller.signal,
      });
      const data = (await apiRes.json()) as any;
      clearTimeout(timeout);
      if (!apiRes.ok) {
        status = apiRes.status === 429 ? 'quota_exceeded' : apiRes.status === 401 || apiRes.status === 403 ? 'auth_failed' : 'service_error';
        errorMsg = data?.error?.message || `HTTP ${apiRes.status}`;
      } else {
        responseText = data?.choices?.[0]?.message?.content || '';
      }
    }
    latency = Date.now() - started;
    if (status === 'connected' && !responseText) {
      status = 'service_error';
      errorMsg = 'Empty response from provider';
    }
  } catch (e: any) {
    latency = Date.now() - started;
    if (e?.name === 'AbortError') {
      status = 'timeout';
      errorMsg = 'Request timed out (20s)';
    } else {
      status = 'service_error';
      errorMsg = e?.message || 'Network error';
    }
  }

  rec.status = status;
  rec.lastTestedAt = new Date().toISOString();
  rec.lastLatencyMs = latency;
  rec.lastError = errorMsg || undefined;
  await saveStore(store);

  await writeAudit({
    organizationId: req.auth!.organizationId,
    userId: req.auth!.userId,
    action: 'provider.test',
    resource: 'provider',
    resourceId: provider,
    result: status === 'connected' ? 'success' : 'failure',
    details: status === 'connected' ? `latency=${latency}ms` : errorMsg,
    ip: req.ip,
  });

  if (status !== 'connected') {
    res.status(status === 'auth_failed' ? 401 : 502).json({
      success: false,
      status,
      error: errorMsg,
      latencyMs: latency,
      testedAt: rec.lastTestedAt,
    });
    return;
  }

  res.json({
    success: true,
    status: 'connected',
    latencyMs: latency,
    testedAt: rec.lastTestedAt,
  });
});

export default router;
