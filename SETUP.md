# Setup Guide — Ashkharh / Luka

This guide walks you through getting the real backend integrations running
locally: chat with 5 different AI providers, voice input/output via
ElevenLabs, and on-demand PDF document generation.

## What this app is

Ashkharh ("Luka") is an Armenian-first voice assistant built on Next.js 14
(App Router). This guide covers connecting it to real AI providers and
voice services.

## 1. Prerequisites

- Node.js 20.x or later (Node 18.17+ minimum; check with `node -v`)
- npm (ships with Node)
- A modern browser (Chrome/Edge/Firefox/Safari) for microphone access —
  microphone recording requires either `localhost` or `https://`; plain
  HTTP on a non-localhost origin will not be allowed by the browser.

## 2. Install dependencies

From the project root:

    npm install

The following packages power the real backend integrations (already listed
in `package.json`):

- `@anthropic-ai/sdk` — Claude chat (also powers Claude's native web search
  tool for Digest mode)
- `openai` — GPT chat, and (via a custom base URL) DeepSeek + Grok chat
- `@google/generative-ai` — Gemini chat (non-search requests)
- `@google/genai` — Gemini's native Google Search grounding tool, used only
  for Digest mode on Gemini models
- `@elevenlabs/elevenlabs-js` — speech-to-text and text-to-speech
- `pdf-lib` + `@pdf-lib/fontkit` — PDF document generation with Armenian text

## 3. Configure environment variables

1. Copy the example file:

       cp .env.example .env.local

2. Open `.env.local` and fill in the keys for whichever providers you want
   to use.

| Env var              | Unlocks                                                                                         | Mandatory?                                             |
| --------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `ANTHROPIC_API_KEY`  | Claude Sonnet 5 / Claude Haiku in ModelPicker                                                    | Optional — only if you want Claude models                |
| `OPENAI_API_KEY`     | GPT-5 / GPT-5 Mini                                                                                | Optional — only if you want OpenAI models                |
| `GOOGLE_API_KEY`     | Gemini 3 Pro / Gemini 3 Flash                                                                     | Optional — only if you want Gemini models                |
| `DEEPSEEK_API_KEY`   | DeepSeek R1 / DeepSeek V3                                                                         | Optional — only if you want DeepSeek models               |
| `XAI_API_KEY`        | Grok 4 / Grok 3 Mini                                                                              | Optional — only if you want Grok models                   |
| `ELEVENLABS_API_KEY` | Microphone input (speech-to-text) AND assistant voice replies / voice preview in Settings (TTS) | Optional — typed chat still works without this            |
| `DATABASE_URL`       | Accounts, and durable conversation history for signed-in users                                  | Optional — anonymous free-tier chat works without it       |
| `NEXTAUTH_SECRET`    | Session encryption (Auth.js)                                                                     | Optional in dev (falls back to an insecure dev-only value); **required** in production |
| `NEXTAUTH_URL`       | Auth.js callback base URL                                                                        | Required only if you set `DATABASE_URL` / want sign-in     |
| `AUTH_RESEND_KEY`    | Sends magic-link sign-in emails via Resend                                                       | Required only if you want sign-in                          |
| `EMAIL_FROM`         | The verified sender address for magic-link emails                                                | Required only if you want sign-in                          |

**You need at least one chat provider key for chat to do anything at all.**
If you select a model in Settings whose key isn't set, sending a message
will show a short inline error instead of a reply — this is expected, not a
bug (the Settings model list also shows a small red `!` badge next to any
model whose key isn't configured).

**Accounts/database are entirely optional for local use.** Without
`DATABASE_URL` set, the app works exactly as before — anonymous, free-tier
chat, conversation history resets on refresh. Set `DATABASE_URL` +
`NEXTAUTH_SECRET`/`NEXTAUTH_URL`/`AUTH_RESEND_KEY`/`EMAIL_FROM` together to
enable sign-in and durable, cross-device conversation history:

1. Provision a Postgres database (Vercel Postgres, Neon, and Supabase all
   work) and put its connection string in `DATABASE_URL`.
2. Generate a session secret: `openssl rand -base64 32` → `NEXTAUTH_SECRET`.
3. Set `NEXTAUTH_URL=http://localhost:3000` for local dev.
4. Create a free Resend account, verify a sending domain/address, and put
   the API key in `AUTH_RESEND_KEY` and the verified address in
   `EMAIL_FROM`.
5. Push the schema to your database:

       npx drizzle-kit generate
       npx drizzle-kit migrate

6. Restart `npm run dev`. A "Մուտք" (Sign in) button now appears in the top
   bar; signing in via the emailed magic link persists your conversation
   history in Postgres instead of resetting on refresh.

## 4. Run the app

    npm run dev

Open http://localhost:3000 in your browser.

## 5. What's real vs. known limitations

- **Modes.** Settings has a "Ռեժիմ" (Mode) picker with 4 modes, each with
  genuinely distinct behavior (`src/lib/providers/modePrompts.ts`):
  Ուսուցիչ (Tutor, step-by-step teaching), Նորություններ (Digest,
  search-grounded news/summaries), Հարցազրույց (Interview, mock interview
  practice), Կրկնում (Retention, spaced-repetition quizzing on earlier
  Tutor/Digest topics in the same conversation).
- **Digest mode uses real web search — restricted to Claude and Gemini
  models.** The "Տեխ նորություններ"/"AI նորություններ" suggestion tiles (and
  any message sent in Digest mode) use each provider's native search tool
  (Anthropic's `web_search_20250305`, Gemini's `google_search` grounding) —
  real, current results, not the model's training data. Only models with
  `supportsSearch: true` in `modelRouter.ts` (Claude Sonnet 5, Claude
  Haiku, Gemini 3 Pro, Gemini 3 Flash) can be selected in Digest mode;
  OpenAI/DeepSeek/Grok don't have a working native search path today, so
  they're disabled in the model picker while Digest mode is active, and
  switching into Digest mode on one of them auto-switches to Gemini 3
  Flash with an inline notice. Anthropic search is capped at 3 tool calls
  per request; results for identical Digest queries are cached ~10 minutes
  to limit repeat cost. **This calls paid, metered APIs** — Anthropic
  bills per search, Gemini's grounding is a metered Google feature.
  Direct X/Twitter API integration was considered but not built (no free
  tier as of Feb 2026, pay-per-post-read) — a possible future addition if
  ever specifically wanted.
- **Voice IDs are placeholders.** `src/lib/providers/voiceMap.ts` maps the
  app's `hy-female` / `hy-male` voice picker options to ElevenLabs voice
  IDs — out of the box these are placeholder strings and will not produce
  correct audio. Replace them with real voice IDs from your ElevenLabs
  account (Voice Library, or your own custom/cloned voices) before voice
  output will sound right.
- **No persistent document storage.** Every "Download" on a document card
  regenerates the PDF on the spot from text captured earlier in the
  conversation; nothing is saved server-side.
- **Conversation history is in-memory only for anonymous users.** Without
  signing in, a page refresh always starts a new, empty conversation — this
  is unchanged and intentional for the free/anonymous path. Signing in
  (see §3) persists history to Postgres instead.
- **Document offers depend on the model following an internal formatting
  convention** (a hidden marker the model is instructed to emit when a
  document is warranted). This isn't 100% guaranteed across every
  model/provider — if a model doesn't follow it, you simply won't get a
  document card for that reply; nothing breaks.
- **Armenian PDF text depends on a bundled font.** A Noto Sans Armenian TTF
  is vendored at `src/lib/fonts/NotoSansArmenian-Regular.ttf` specifically
  for PDF generation (pdf-lib needs a raw TTF/OTF, unlike the woff2 files
  used for on-screen text). If PDF generation shows missing/garbled glyphs,
  confirm that file is present.

## 6. Troubleshooting

- **"provider not configured" error when sending a chat message** — check
  that the matching env var for your selected model is set in
  `.env.local`, then restart `npm run dev` (Next.js only reads env files at
  server startup, so changes require a restart).
- **Microphone button does nothing / permission prompt never appears** —
  confirm you're on `http://localhost:...` or `https://...`; browsers block
  microphone access entirely on plain HTTP non-localhost origins.
- **Voice preview / assistant speech is silent** — confirm
  `ELEVENLABS_API_KEY` is set and restart the dev server; also confirm the
  voice IDs in `voiceMap.ts` have been replaced with real ones (see above).
- **Document download fails** — check the server console for a
  `document_generation_failed` error; this usually means the Armenian font
  asset failed to load.
- **Sign-in email never arrives** — confirm `AUTH_RESEND_KEY` is a real
  Resend API key and `EMAIL_FROM` is a verified sender address/domain in
  your Resend account; unverified senders are silently rejected by Resend.
- **"Cannot find module" or connection errors after setting `DATABASE_URL`**
  — confirm you've run `npx drizzle-kit generate && npx drizzle-kit migrate`
  against that database before signing in (the tables must exist first),
  and restart `npm run dev` after changing `.env.local`.
