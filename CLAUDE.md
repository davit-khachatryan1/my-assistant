# CLAUDE.md

## Project

Ashkharh ("Luka") — an Armenian-first voice assistant built on Next.js 14
(App Router). Armenian (hy) is the primary UI/copy language; English (en)
and Russian (ru) are secondary, user-selectable input/response languages.

There is no database, no test suite, and no CI. Conversation state lives in
`AppStateContext.tsx` and is in-memory only — it resets on page refresh.
This is a deliberate design decision, not a gap to fix.

For install steps, environment variables, and how to run the app, see
`SETUP.md` — don't duplicate that content here.

**`README.md` is currently stale.** It's leftover generic Vite+React
template text and does not describe this project (it mentions Vite/Oxlint;
this project is actually Next.js/ESLint). Don't treat it as a source of
truth or copy from it until it's rewritten.

## Architecture map

```
src/app/api/
  chat/route.ts              streaming chat, routes across 5 providers
  generate-document/route.ts pdf-lib PDF generation
  models/status/route.ts     which provider env vars are configured
  speech-to-text/route.ts    ElevenLabs Scribe transcription
  text-to-speech/route.ts    ElevenLabs TTS
src/components/
  Chat/, DevPanel/, EmptyState/, InputBar/, Orb/, Settings/, TopBar/
src/hooks/
  useRealMicrophone, usePrefersReducedMotion, useLongPress, useResponsiveOrbSize
src/lib/
  audio/playAudioResponse.ts   abortable playback (AbortController/signal)
  fonts/NotoSansArmenian-Regular.ttf   vendored TTF, PDF generation only
  providers/modelRouter.ts     single source of truth for chat model routing
  providers/streamChat.ts      per-provider-family streaming generators
  providers/voiceMap.ts        dynamic ElevenLabs voice resolution
  providers/systemPrompt.ts    system prompt + document marker convention
src/state/
  AppStateContext.tsx   central state — chat, orb state, settings, speech
  appState.types.ts
  MotionPreferenceContext.tsx
```

## Chat routing: 5 providers, one source of truth

- `src/lib/providers/modelRouter.ts`'s `MODEL_CONFIGS` array is the **only**
  place that maps a UI-facing model id (as shown in `ModelPicker`) to
  `{ provider, apiModel, envVar, baseURL?, deepseekThinking? }`. Never
  hardcode a model string anywhere else.
- `src/lib/providers/streamChat.ts` has 3 provider-family generator
  functions — `streamAnthropic`, `streamOpenAICompatible` (reused for
  OpenAI, DeepSeek, and xAI via different `baseURL`s), `streamGemini` — all
  normalizing to `{ type: 'token' | 'done' | 'error' }`.
- `src/app/api/chat/route.ts` resolves the model via `resolveModel()`,
  checks the env var, then dispatches to the right stream function based on
  `resolved.provider`.
- **`apiModel` strings drift and deprecate.** This has already caused real
  bugs — wrong/deprecating ids for Gemini, xAI, and DeepSeek were only
  caught by checking live vendor docs, not by inspection. The
  `model-id-audit` skill exists specifically to re-verify these
  periodically; use it rather than trusting the strings are still current.
- **Adding a 6th provider**: one new `MODEL_CONFIGS` entry, plus one new
  `streamX` generator in `streamChat.ts` only if it isn't OpenAI-compatible,
  plus one branch in the chat route's provider dispatch. Nothing else
  should need to change.

## Graceful-degradation contract

Every route that depends on an external API key must return, **before any
streaming or work starts**:

```
503 { error: 'provider_not_configured', envVar: '<ENV_VAR_NAME>' }
```

(the chat route also includes `provider`). Client-side, `sendUserMessage()`
in `AppStateContext.tsx` catches this and appends a clear inline Armenian
assistant message, then resets `orbState` to `idle` — never a silent
failure or a stuck loading/thinking state. Reference implementations:
`speech-to-text/route.ts` and `text-to-speech/route.ts` (simple early
return), `chat/route.ts` (same check before opening the stream). Any new
route or client call must follow this exact shape.

## Document generation gotchas

- `generate-document/route.ts` uses `pdf-lib` + `@pdf-lib/fontkit` with the
  vendored Armenian TTF at `src/lib/fonts/NotoSansArmenian-Regular.ttf` —
  this must stay a raw TTF/OTF file. The woff2 fonts used for on-screen text
  (`@fontsource/noto-sans-armenian`) do **not** work with `pdf-lib`.
- `Content-Disposition` header values must be Latin-1/ByteString — Armenian
  text cannot go directly in the plain `filename=` param. The route sends
  **both** an ASCII-sanitized `filename=` fallback and the RFC 5987
  `filename*=UTF-8''...` percent-encoded extended param. Preserve this
  dual-param pattern in any future change to this header (a real 500 crash
  happened here before this fix).
- Document creation is gated by **two things that must stay in sync**:
  `explicitlyRequestedDocument()`'s regex in `chat/route.ts` (hy/en/ru
  keywords: pdf/doc/file/export/download and their Armenian/Russian
  equivalents), and the `<<<DOCUMENT:...>>>` marker convention instructed in
  `systemPrompt.ts`. This exists specifically to stop the model from
  generating unwanted PDFs on ordinary replies — don't loosen one side
  without considering the other.

## Voice pipeline

- **STT**: `/api/speech-to-text` → ElevenLabs Scribe. Recording is real
  `MediaRecorder` capture in `src/hooks/useRealMicrophone.ts` — no mocked
  audio.
- **TTS**: `/api/text-to-speech` → ElevenLabs `eleven_v3`, called via
  `speakReply()` in `AppStateContext.tsx`, played via `playAudioStream()` in
  `src/lib/audio/playAudioResponse.ts` using an `AbortController`/
  `AbortSignal` chain so speech is interruptible (stop button wired to
  `stopAssistantSpeech()`).
- **Voice IDs are resolved dynamically — never hardcoded.**
  `src/lib/providers/voiceMap.ts` calls the real ElevenLabs
  `client.voices.getAll()` endpoint (cached 5 min) and gender-matches the
  app's internal id (`hy-female`/`hy-male`) against the caller's own account
  voices, falling back to the first available voice. There is no universal
  "stock" ElevenLabs voice id across accounts. This replaced a prior
  hardcoded-placeholder-ID bug where TTS silently failed on every request.

## Do NOT reintroduce

- Mock/seed conversation data — `AppStateContext.tsx` starts `messages` as
  `[]`. A prior seed-conversation approach was deliberately removed.
- Hardcoded ElevenLabs voice IDs — always go through `resolveVoiceId()` in
  `voiceMap.ts`.
- Silent-failure or stuck-loading states on missing provider config —
  always follow the 503 `provider_not_configured` contract above.

## Running / verifying

See `SETUP.md` for install, env vars (`.env.example`), and run
instructions. `npm run dev` on port 3000 (also configured in
`.claude/launch.json`). No test suite exists (no `npm test`); `npm run
lint` runs `next lint`.

Use the `verify-luka-flows` skill (or delegate to the `luka-flow-verifier`
subagent for an isolated-context pass) to exercise chat, voice, and
document flows in the real running app — don't assume correctness from a
diff alone.
