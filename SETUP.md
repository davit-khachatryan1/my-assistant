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

- `@anthropic-ai/sdk` — Claude chat
- `openai` — GPT chat, and (via a custom base URL) DeepSeek + Grok chat
- `@google/generative-ai` — Gemini chat
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

**You need at least one chat provider key for chat to do anything at all.**
If you select a model in Settings whose key isn't set, sending a message
will show a short inline error instead of a reply — this is expected, not a
bug (the Settings model list also shows a small red `!` badge next to any
model whose key isn't configured).

## 4. Run the app

    npm run dev

Open http://localhost:3000 in your browser.

## 5. What's real vs. known limitations

- **Web search is intentionally not implemented.** The "Փնտրիր
  նորություններ Հայաստանից" suggestion tile sends a normal chat message —
  the model will respond that it cannot browse the web live. This is a
  deliberate scope decision, not a bug.
- **Voice IDs are placeholders.** `src/lib/providers/voiceMap.ts` maps the
  app's `hy-female` / `hy-male` voice picker options to ElevenLabs voice
  IDs — out of the box these are placeholder strings and will not produce
  correct audio. Replace them with real voice IDs from your ElevenLabs
  account (Voice Library, or your own custom/cloned voices) before voice
  output will sound right.
- **No persistent document storage.** Every "Download" on a document card
  regenerates the PDF on the spot from text captured earlier in the
  conversation; nothing is saved server-side.
- **Conversation history is in-memory only.** There is no database. A page
  refresh always returns to the built-in seed conversation.
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
