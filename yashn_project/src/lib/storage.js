const CONVERSATION_KEY = 'yashn_conversation';
const NAME_KEY = 'yashn_username';
const MAX_MESSAGES = 100;
const MAX_CONTENT_LENGTH = 12_000;

function safeMessages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string')
    .map(({ role, content }) => ({ role, content: content.trim().slice(0, MAX_CONTENT_LENGTH) }))
    .filter(({ content }) => content)
    .slice(-MAX_MESSAGES);
}

export function saveConversation(messages) {
  try { localStorage.setItem(CONVERSATION_KEY, JSON.stringify(safeMessages(messages))); } catch { /* storage is optional */ }
}
export function loadConversation() {
  try { return safeMessages(JSON.parse(localStorage.getItem(CONVERSATION_KEY) || '[]')); } catch { return []; }
}
export function clearConversation() {
  try { localStorage.removeItem(CONVERSATION_KEY); } catch { /* storage is optional */ }
}
export function saveUserName(name) {
  const safeName = String(name || '').trim().replace(/[^\p{L}\p{N} .'-]/gu, '').slice(0, 60);
  if (!safeName) return;
  try { localStorage.setItem(NAME_KEY, safeName); } catch { /* storage is optional */ }
}
export function loadUserName() {
  try { return localStorage.getItem(NAME_KEY)?.slice(0, 60) || null; } catch { return null; }
}
export function clearUserData() {
  try { localStorage.removeItem(CONVERSATION_KEY); localStorage.removeItem(NAME_KEY); } catch { /* storage is optional */ }
}
