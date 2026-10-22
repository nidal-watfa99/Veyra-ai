/**
 * Browser-side AI client.
 * Works on static hosting (GitHub Pages) with no backend: API keys live in the
 * user's own browser storage and requests go straight to each provider.
 */
import { resilientStorage } from './security';

export type ProviderId = 'gemini' | 'groq' | 'cerebras' | 'openrouter';

export interface LiveModel {
  id: string;
  name: string;
}

export class AIError extends Error {
  status: number;
  kind: 'invalid_key' | 'quota_exceeded' | 'network' | 'service' | 'empty';
  constructor(message: string, status: number, kind: AIError['kind']) {
    super(message);
    this.status = status;
    this.kind = kind;
  }
}

const KEY_PREFIX = 'veyra_key_';
const ACTIVE_KEY = 'veyra_active_provider';

export const getStoredKey = (p: string): string => resilientStorage.getItem(KEY_PREFIX + p) || '';
export const setStoredKey = (p: string, key: string): void => resilientStorage.setItem(KEY_PREFIX + p, key);
export const removeStoredKey = (p: string): void => resilientStorage.removeItem(KEY_PREFIX + p);
export const getActiveProvider = (): string => resilientStorage.getItem(ACTIVE_KEY) || 'gemini';

export const maskKey = (key: string): string =>
  key.length > 8 ? `${key.slice(0, 4)}••••${key.slice(-4)}` : '••••••••';

const OPENAI_COMPAT: Record<Exclude<ProviderId, 'gemini'>, string> = {
  groq: 'https://api.groq.com/openai/v1',
  cerebras: 'https://api.cerebras.ai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
};

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/** Ordered preferences used when the selected model is not offered by the provider. */
const PREFERRED: Record<ProviderId, RegExp[]> = {
  gemini: [/gemini-2\.5-flash$/, /gemini-2\.5-flash-lite/, /gemini-.*flash/, /gemini/],
  groq: [/llama-3\.3-70b/, /llama-3\.1-8b/, /llama/, /./],
  cerebras: [/llama-3\.3-70b/, /llama3\.1-8b/, /llama/, /./],
  openrouter: [/llama-3\.3-70b-instruct:free/, /:free$/],
};

async function request(url: string, init: RequestInit, timeoutMs = 20000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: controller.signal });
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.name === 'AbortError') throw new AIError('Request timed out', 0, 'network');
    throw new AIError(
      'Network error: the provider could not be reached (check your connection, VPN, or that the provider is available in your region)',
      0,
      'network'
    );
  }
  clearTimeout(timer);
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `HTTP ${res.status}`;
    const kind: AIError['kind'] =
      res.status === 429 ? 'quota_exceeded' : res.status === 401 || res.status === 403 || /api key/i.test(msg) ? 'invalid_key' : 'service';
    throw new AIError(msg, res.status, kind);
  }
  return data;
}

/** Lists the models that really exist for this key, so stale hard-coded IDs never break testing. */
export async function listModels(provider: ProviderId, apiKey: string): Promise<LiveModel[]> {
  if (provider === 'gemini') {
    const data = await request(`${GEMINI_BASE}/models?pageSize=100`, { headers: { 'x-goog-api-key': apiKey } });
    return (data?.models || [])
      .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m: any) => ({ id: String(m.name).replace(/^models\//, ''), name: m.displayName || m.name }))
      .filter((m: LiveModel) => /^gemini/.test(m.id) && !/embedding|tts|image|live|audio|robotics|computer-use/i.test(m.id));
  }
  const headers: Record<string, string> = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  const data = await request(`${OPENAI_COMPAT[provider]}/models`, { headers });
  let list: LiveModel[] = (data?.data || []).map((m: any) => ({ id: m.id, name: m.name || m.id }));
  if (provider === 'groq') list = list.filter((m) => !/whisper|guard|tts|playai|distil-whisper/i.test(m.id));
  if (provider === 'openrouter') list = list.filter((m) => /:free$/.test(m.id)).slice(0, 30);
  return list;
}

export function pickModel(provider: ProviderId, wanted: string, available: LiveModel[]): string {
  if (available.some((m) => m.id === wanted)) return wanted;
  for (const re of PREFERRED[provider]) {
    const hit = available.find((m) => re.test(m.id));
    if (hit) return hit.id;
  }
  return available[0]?.id || wanted;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callModel(
  provider: ProviderId,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens = 400
): Promise<string> {
  if (provider === 'gemini') {
    const system = messages.find((m) => m.role === 'system')?.content;
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const data = await request(`${GEMINI_BASE}/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents,
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
      }),
    });
    const text = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('').trim();
    if (!text) throw new AIError('Empty response from provider', 200, 'empty');
    return text;
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
  if (provider === 'openrouter') headers['X-Title'] = 'Veyra AI';
  const data = await request(`${OPENAI_COMPAT[provider]}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.4 }),
  });
  const text = String(data?.choices?.[0]?.message?.content || '').trim();
  if (!text) throw new AIError('Empty response from provider', 200, 'empty');
  return text;
}

export interface TestOutcome {
  success: boolean;
  status: 'connected' | 'invalid_key' | 'quota_exceeded' | 'timeout_error';
  latencyMs?: number;
  sampleResponse?: string;
  error?: string;
  model?: string;
  models?: LiveModel[];
}

export async function testProvider(provider: ProviderId, apiKey: string, wantedModel: string): Promise<TestOutcome> {
  const started = performance.now();
  let models: LiveModel[] = [];
  try {
    // Step 1: validates the key and discovers real model IDs.
    try {
      models = await listModels(provider, apiKey);
    } catch (e) {
      // Bad key / no network are final; anything else we can still try the chat call.
      if (e instanceof AIError && (e.kind === 'invalid_key' || e.kind === 'network')) throw e;
    }
    const model = models.length ? pickModel(provider, wantedModel, models) : wantedModel;
    // Step 2: one tiny generation to prove the key can actually generate.
    const sample = await callModel(provider, apiKey, model, [{ role: 'user', content: 'Reply with exactly: VEYRA_OK' }], 20);
    return {
      success: true,
      status: 'connected',
      latencyMs: Math.round(performance.now() - started),
      sampleResponse: sample,
      model,
      models,
    };
  } catch (e) {
    const err = e as AIError;
    const status: TestOutcome['status'] =
      err.kind === 'invalid_key' ? 'invalid_key' : err.kind === 'quota_exceeded' ? 'quota_exceeded' : 'timeout_error';
    return { success: false, status, error: err.message || 'Connection error', models };
  }
}

/** Generates an agent reply with the active provider's stored key. Returns null if nothing is configured or the call fails. */
export async function generateAgentReply(params: {
  agentName: string;
  agentRole: string;
  userMessage: string;
  context?: string;
  isArabic: boolean;
}): Promise<{ reply: string; provider: string; model: string } | null> {
  const provider = getActiveProvider() as ProviderId;
  const key = getStoredKey(provider);
  if (!key) return null;
  const model = resilientStorage.getItem('veyra_model_' + provider) || '';
  if (!model) return null;
  const system =
    `You are ${params.agentName}, ${params.agentRole}, an AI employee at an enterprise advisory firm. ` +
    `Reply to the client concisely (2-4 sentences), professionally, and in ${params.isArabic ? 'Arabic' : 'the same language as the client'}. ` +
    `Never invent fees, dates or legal commitments; if unsure, say you will confirm with the team.` +
    (params.context ? ` Client company: ${params.context}.` : '');
  try {
    const reply = await callModel(provider, key, model, [
      { role: 'system', content: system },
      { role: 'user', content: params.userMessage },
    ]);
    return { reply, provider, model };
  } catch {
    return null;
  }
}
