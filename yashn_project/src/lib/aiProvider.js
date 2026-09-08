const REQUEST_TIMEOUT_MS = 20_000;

async function fetchWithTimeout(resource, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(resource, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function cleanResponse(text) {
  return String(text || '').replace(/<think>[\s\S]*?<\/think>\s*/gi, '').trim().slice(0, 12_000);
}

export async function sendMessage(conversationHistory) {
  const messages = conversationHistory
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map(({ role, content }) => ({ role, content: String(content).trim().slice(0, 4_000) }))
    .filter(({ content }) => content)
    .slice(-20);
  if (!messages.length || messages[messages.length - 1].role !== 'user') throw new Error('A user message is required.');

  const response = await fetchWithTimeout('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ messages }),
  });
  let data;
  try { data = await response.json(); } catch { throw new Error('The server returned an invalid response.'); }
  if (!response.ok) throw new Error(data?.error || 'The conversation could not be completed.');
  const content = cleanResponse(data?.message);
  if (!content) throw new Error('The conversation returned an empty response.');
  return content;
}
