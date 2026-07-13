# TODO — Ashkharh / Luka

Everything on the code side is implemented, type-checked, and built. This
list is what's left for **you** to do — mostly external account/config
items I can't resolve from inside the codebase.

## Blocking — needed for full functionality

1. **ElevenLabs credits are exhausted.** Voice replies (TTS) currently
   fail with `quota_exceeded` (account was down to 2/10,000 credits during
   this session). Top up your ElevenLabs plan, or swap in a different
   `ELEVENLABS_API_KEY` in `.env.local`. Text chat works fine either way —
   this only affects spoken replies.

2. **Google Gemini quota/availability issues.** Live-testing Digest mode
   (search-grounded news) repeatedly hit `429 RESOURCE_EXHAUSTED` (quota)
   and later a `503` ("model experiencing high demand") directly from
   Google's API — not a bug in this app. If you want Digest mode to work
   reliably on Gemini, check your Google AI Studio quota/billing tier; the
   free tier's search-grounding quota appears to be very limited.

3. **`ANTHROPIC_API_KEY` is not set.** Claude is the other
   search-capable provider for Digest mode, and its native web-search
   integration has never been live-tested end-to-end because no key is
   configured. Adding one gives you a second, independent Digest-mode
   provider that doesn't share Gemini's quota problems — recommended if
   you want Digest mode to actually be usable day-to-day.

## Follow-up once the above are resolved

4. **Confirm real grounded search output.** Every live Digest-mode test
   this session was blocked by items 1–3 (quota/availability, not code).
   Once you've got a working key/quota, do one real test: ask a
   genuinely current question in Digest mode and confirm the reply cites
   real, dated information (not a generic explainer) and that a
   "searching" status briefly appears before the reply streams in.

## Optional — your call, not required

5. **Direct X/Twitter API integration** — not built. X's API has no free
   tier as of Feb 2026 (pay-per-post-read). Only worth adding if you
   specifically want live X/Twitter content beyond what Gemini/Claude's
   general web search already surfaces.

6. **OpenAI / DeepSeek / Grok don't support Digest mode.** This was an
   intentional scope decision — none of the three have a working native
   search path through this app's current setup. They're disabled in the
   model picker while Digest mode is active. Revisit only if you want
   broader provider coverage later (would need real work: migrating the
   OpenAI path to its Responses API, or adding an independent search API
   like Tavily/Serper as a shared fallback).

7. **Rename `src/state/mockPrompts.ts`.** It holds real, functional data
   (the two Digest-mode news suggestion chips) — the "mock" name is a
   leftover misnomer from early scaffolding, not actual placeholder data.
   Purely cosmetic; safe to rename to something like `promptChips.ts`
   whenever convenient.

## Reminders (already true, just don't forget)

- Real API keys go in `.env.local` only (gitignored) — never in
  `.env.example` or committed anywhere.
- Anthropic's web search tool bills **$10 per 1,000 searches** (capped at
  3 calls per request in this app) on top of normal token costs. Gemini's
  search grounding is a separately metered Google feature. Both are real,
  ongoing costs tied to how much Digest mode gets used.
