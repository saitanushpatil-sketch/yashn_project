# Yashñ — Project Context

## What this is
Yashñ is an AI companion app for people who feel lonely or like "the last
option." Core principles: always free, genderless by design, feels like a
present, consistent personality rather than a generic assistant.

## Tech stack
- Vite + React (JavaScript, not TypeScript)
- No backend server — calls AI provider APIs directly from the frontend
  using API keys in .env (VITE_ prefixed, exposed client-side — acceptable
  for a hackathon demo, not for production)
- Deployed on Vercel
- Styling: plain CSS (or Tailwind if installed — check package.json)

## Architecture
- src/lib/aiProvider.js — the multi-provider fallback chain (Groq →
  OpenRouter → Gemini). ALWAYS route AI calls through this file's exported
  function, never call a provider API directly from a component.
- src/lib/soulPrompt.js — exports the system prompt that defines Yashñ's
  personality. Read this before writing any AI-related code so tone stays
  consistent.
- src/components/ — UI components
- src/App.jsx — main app shell

## Build phases (check which are done)
- [x] Phase 1: Core AI engine (fallback chain + soul prompt)
- [x] Phase 2: Chat UI
- [x] Phase 3: Cinematic opening animation
- [x] Phase 4: Conversation memory
- [x] Phase 5: PWA basics
- [ ] Phase 6: Deployed to Vercel

## Rules for any AI agent working on this repo
1. Read this file fully before making changes.
2. After finishing a phase, check its box above and update this file.
3. Don't introduce a backend/server unless explicitly asked — this stays a
   static frontend app calling AI APIs directly.
4. Keep the soul prompt's personality consistent — don't rewrite
   soulPrompt.js casually.
5. Mobile-first: this will be demoed on a phone as often as a laptop.
