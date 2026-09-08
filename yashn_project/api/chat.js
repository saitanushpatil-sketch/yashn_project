import { SOUL_PROMPT } from '../src/lib/soulPrompt.js';

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_BODY_LENGTH = 100_000;
const rateBuckets = new Map();

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

function clientKey(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim().slice(0, 80);
}

function isAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers.host;
  return origin === `https://${host}` || origin === `http://${host}` || origin === process.env.APP_ORIGIN;
}

function checkRateLimit(key) {
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { started: now, count: 0 };
  if (now - bucket.started >= 60_000) { bucket.started = now; bucket.count = 0; }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (rateBuckets.size > 10_000) rateBuckets.delete(rateBuckets.keys().next().value);
  return bucket.count <= 20;
}

function validateMessages(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;
  const messages = value.map((message) => {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') return null;
    const content = message.content.trim();
    return content && content.length <= MAX_MESSAGE_LENGTH ? { role: message.role, content } : null;
  });
  return messages.every(Boolean) && messages[messages.length - 1].role === 'user' ? messages : null;
}

async function callProvider(messages) {
  const system = { role: 'system', content: SOUL_PROMPT };
  const payload = { messages: [system, ...messages], max_tokens: 512, temperature: 0.85 };
  const headers = { 'Content-Type': 'application/json' };

  if (process.env.GROQ_API_KEY) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { ...headers, Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ ...payload, model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile' }),
    });
    if (response.ok) return (await response.json()).choices?.[0]?.message?.content;
  }
  if (process.env.OPENROUTER_API_KEY) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', headers: { ...headers, Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      body: JSON.stringify({ ...payload, model: process.env.OPENROUTER_MODEL || 'openrouter/free' }),
    });
    if (response.ok) return (await response.json()).choices?.[0]?.message?.content;
  }
  if (process.env.GEMINI_API_KEY) {
    const contents = messages.map(({ role, content }) => ({ role: role === 'user' ? 'user' : 'model', parts: [{ text: content }] }));
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST', headers, body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: SOUL_PROMPT }] }, generationConfig: { maxOutputTokens: 512, temperature: 0.85 } }),
    });
    if (response.ok) return (await response.json()).candidates?.[0]?.content?.parts?.[0]?.text;
  }
  throw new Error('No AI provider is configured.');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!isAllowedOrigin(req)) return json(res, 403, { error: 'Origin not allowed.' });
  if (!checkRateLimit(clientKey(req))) return json(res, 429, { error: 'Too many messages. Please wait a moment.' });
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}; } catch { return json(res, 400, { error: 'Invalid JSON payload.' }); }
  if (JSON.stringify(body).length > MAX_BODY_LENGTH) return json(res, 413, { error: 'Message is too large.' });
  const messages = validateMessages(body.messages);
  if (!messages) return json(res, 400, { error: 'Invalid conversation payload.' });
  try {
    const message = String(await callProvider(messages) || '').replace(/<think>[\s\S]*?<\/think>\s*/gi, '').trim().slice(0, 12_000);
    if (!message) throw new Error('Empty provider response.');
    return json(res, 200, { message });
  } catch (error) {
    console.error('[chat] provider failure:', error.message);
    return json(res, 503, { error: 'Yashñ is taking a quiet moment. Please try again.' });
  }
}
