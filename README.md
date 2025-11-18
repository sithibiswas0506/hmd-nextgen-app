# HMD NextGen Chat — Demo

This repository contains a minimal demo scaffold for a realtime chat application (added inside the existing workspace).

Key points:

- Technology: React + Vite + TypeScript
- Realtime & DB: Supabase (demo placeholders — configure later)
- File storage: Cloudflare R2 (placeholder helpers & comments; add later)

Files added in this scaffold (new):

- `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- `src/components/Chat.tsx` — a basic Facebook-like chat UI (message list, input)
- `src/lib/supabase.ts` — Supabase client placeholder
- `src/lib/storage.ts` — Cloudflare R2 placeholders and notes
- `.env.example` — example env vars for Supabase and R2

Quickstart (local demo):

1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

3. Open `http://localhost:5173`

Notes and next steps:

- Supabase: create a `messages` table with columns `id`, `user`, `text`, `created_at` (timestamptz default now()).
	- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to a local `.env` (see `.env.example`).
	- You can enable Realtime by subscribing to the `messages` table in `Chat.tsx` (example comments provided).

- Cloudflare R2: `src/lib/storage.ts` includes comments. For production, implement a server-side signer or Cloudflare Worker to create signed upload URLs and keep credentials secret.

- This is a demo scaffold inside the existing project. Integrate auth (Supabase Auth) and access controls before production use.

If you want, I can:
- Wire up full Supabase realtime subscription and provide SQL for the `messages` table.
- Add a serverless example (Node/Express or Cloudflare Worker) to sign R2 uploads.
- Add Supabase Auth and user avatars.

Tell me which next step you'd like me to implement.
