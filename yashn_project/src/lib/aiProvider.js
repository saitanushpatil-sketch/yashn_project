import { SOUL_PROMPT } from './soulPrompt';

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 30000 } = options;
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
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      role: 'system',
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    timeout: 30000
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
      messages: messages
    }),
    timeout: 30000
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
      model: 'google/gemma-4-31b-it:free',
      messages: messages
    }),
    timeout: 30000
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
  const messages = [
    { role: 'system', content: SOUL_PROMPT },
    ...conversationHistory
  ];

  // Try Gemini first (most reliable, direct Google API)
  try {
    const geminiResponse = await fetchGemini(messages);
    if (geminiResponse) {
      console.log('[AI Provider] Responded via Gemini');
      return geminiResponse;
    }
  } catch (error) {
    console.error('[AI Provider] Gemini failed:', error);
  }

  // Try Groq second
  try {
    const groqResponse = await fetchGroq(messages);
    if (groqResponse) {
      console.log('[AI Provider] Responded via Groq');
      return groqResponse;
    }
  } catch (error) {
    console.error('[AI Provider] Groq failed:', error);
  }

  // Try OpenRouter last
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
