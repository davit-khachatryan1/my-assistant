---
name: verify-luka-flows
description: Launch and manually verify Ashkharh/Luka's core end-to-end flows in the running app — streaming chat replies, microphone recording plus ElevenLabs speech-to-text transcription, ElevenLabs text-to-speech playback (confirming real audio output, not just the orb animating), and PDF document generation/download with correct Armenian filename encoding. Use this when asked to verify, test, or confirm a change works in the real app for this project.
---

## Critical rules

- Verify with real evidence (network status codes, response bodies,
  screenshots, actual audio duration) — never report a flow as working
  because "it should" or because the code looks right.
- A `503 provider_not_configured` response with a clear inline Armenian
  error and the orb returning to `idle` is a **pass**, not a failure, when
  the relevant env var genuinely isn't set. Don't treat graceful
  degradation as a bug.
- Use the Preview MCP tools for all browser interaction and for starting
  the dev server — never Bash or chrome-devtools for this.

## Workflow

1. **Launch**: start the dev server via `.claude/launch.json`'s "dev"
   config through the Preview tooling. Confirm it starts cleanly with no
   missing-env crash — a crash at startup is wrong; a `503` at request time
   for an unconfigured provider is correct.
2. **Chat streaming flow**: send a text message. With a chat-provider key
   configured, confirm tokens arrive incrementally (not as one blocked
   chunk) and the orb transitions `idle` → `thinking` → `speaking`/`idle`.
   With no key configured, confirm the exact Armenian 503 message appears
   and `orbState` resets to `idle`.
3. **Voice input flow**: click the mic button, grant permission, record
   briefly, stop. Confirm a real POST to `/api/speech-to-text` fires and
   either transcribed text lands in the input (success) or the correct
   `provider_not_configured`/`stt_failed` handling occurs if
   `ELEVENLABS_API_KEY` is absent.
4. **Voice output flow**: with `settings.voiceReplies` on and
   `ELEVENLABS_API_KEY` set, confirm **actual audio plays** — check the
   network tab for a real `audio/mpeg` response from `/api/text-to-speech`
   with non-zero size, not just that the orb switched to the "speaking"
   visual state (these are decoupled failure points — the orb can animate
   while audio silently fails). Confirm the stop button aborts playback
   immediately via `AbortController`, with no trailing sound.
5. **Document generation flow**: send an explicit document request (e.g.
   contains "pdf" or Armenian "փաստաթուղթ"). Confirm a document card
   appears, download it, and verify the filename decodes correctly
   (Armenian characters render properly, not `_` fallback junk) — check the
   response headers contain both `filename=` (ASCII fallback) and
   `filename*=UTF-8''...` (RFC 5987 extended param).
6. **Negative-path check**: repeat steps 2–5 with the relevant env var
   deliberately unset, or select an unconfigured model in Settings, and
   confirm graceful `503` handling per the degradation contract in
   `CLAUDE.md` — no console errors, no stuck loading/listening/speaking
   state.
7. **Report** pass/fail per flow with what was actually observed (status
   codes, audio duration, screenshot/console evidence) — not assumptions.
