import { SOUL_PROMPT } from './soulPrompt';

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 15000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Some models (like Qwen) wrap responses in <think>...</think> tags — strip them
function cleanResponse(text) {
  if (!text) return text;
  return text.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();
}

async function fetchGemini(messages) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('No Gemini API key');

  // Convert generic messages array to Gemini's format
  const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
  const geminiMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

  const requestBody = {
    contents: geminiMessages,
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.9,
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      role: 'system',
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    timeout: 15000
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini HTTP error! status: ${response.status} — ${errorData}`);
  }
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function fetchGroq(messages) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('No Groq API key');

  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: messages,
      max_tokens: 512,
      temperature: 0.9,
    }),
    timeout: 12000
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Groq HTTP error! status: ${response.status} — ${errorData}`);
  }
  const data = await response.json();
  return cleanResponse(data.choices[0].message.content);
}

async function fetchOpenRouter(messages) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No OpenRouter API key');

  const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // Let OpenRouter choose an available free text model instead of pinning
      // the app to a model that may be removed or renamed.
      model: 'openrouter/free',
      messages: messages,
      max_tokens: 512,
    }),
    timeout: 15000
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter HTTP error! status: ${response.status} — ${errorData}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

export async function sendMessage(conversationHistory) {
  // Prepend SOUL_PROMPT as the system message
  // Keep only the last 20 messages for speed
  const recentHistory = conversationHistory.slice(-20);
  const messages = [
    { role: 'system', content: SOUL_PROMPT },
    ...recentHistory
  ];

  // Race: Try Gemini and Groq simultaneously, take whichever responds first
  const providers = [];

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  if (geminiKey) {
    providers.push(
      fetchGemini(messages)
        .then(r => { console.log('[AI Provider] Responded via Gemini'); return r; })
        .catch(e => { console.error('[AI Provider] Gemini failed:', e); throw e; })
    );
  }

  if (groqKey) {
    providers.push(
      fetchGroq(messages)
        .then(r => { console.log('[AI Provider] Responded via Groq'); return r; })
        .catch(e => { console.error('[AI Provider] Groq failed:', e); throw e; })
    );
  }

  // Race the available providers — fastest wins
  if (providers.length > 0) {
    try {
      const result = await Promise.any(providers);
      if (result) return result;
    } catch (e) {
      console.error('[AI Provider] All raced providers failed:', e);
    }
  }

  // Fallback to OpenRouter
  try {
    const openRouterResponse = await fetchOpenRouter(messages);
    if (openRouterResponse) {
      console.log('[AI Provider] Responded via OpenRouter');
      return openRouterResponse;
    }
  } catch (error) {
    console.error('[AI Provider] OpenRouter failed:', error);
  }

  // Fallback
  return "I'm having trouble finding the words right now — give me a moment and try again?";
}
