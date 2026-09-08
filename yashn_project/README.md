# Yashñ

Yashñ is a cinematic AI companion built with React, Vite, Framer Motion, and a Vercel serverless API.

## Run locally

~~~bash
npm install
cp .env.example .env
npm run dev
~~~

Set at least one server-only provider key in `.env`. Do not use `VITE_` for AI keys: Vite bundles `VITE_*` variables into the browser.

## Production

Deploy the project root to Vercel and configure the same environment variables in the Vercel dashboard. The `/api/chat` function validates message shape and size, rejects unexpected origins, applies a lightweight per-IP limit, and keeps provider credentials on the server.

The client keeps a bounded conversation history in local storage so a refresh does not erase the current conversation. That data is local to the device; add authenticated, encrypted server persistence before using this for multi-device or regulated data.

## Checks

~~~bash
npm run build
npm run lint
~~~
