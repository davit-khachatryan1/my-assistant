---
name: model-id-audit
description: Audit and refresh the AI provider model ID strings in src/lib/providers/modelRouter.ts (Anthropic, OpenAI, Google Gemini, DeepSeek, xAI) against each vendor's current live API docs, since these ids drift and deprecate over time. Use when asked to check/update/verify model IDs, fix a "model not found" or deprecated-model API error, add a new model to ModelPicker, or when modelRouter.ts's "verified against live docs on <date>" comment is more than ~1-2 months old.
---

## Critical rules

- Never rely on training knowledge for current model ids — vendors ship new
  models and deprecate old ones constantly. Always check live docs via
  WebSearch/WebFetch before changing or confirming anything.
- Only edit `ModelConfig` field values (`apiModel`, and `id`/`baseURL` only
  if truly necessary) in `src/lib/providers/modelRouter.ts`. Never change
  the `ModelConfig` interface shape or touch unrelated files.
- If a vendor's docs can't be reached or a model's status is ambiguous,
  report that explicitly. Do not guess or silently leave/change a string
  based on assumption.

## Workflow

1. Read `MODEL_CONFIGS` in full from `src/lib/providers/modelRouter.ts`, and
   note the "verified against live docs on `<date>`" comment above it.
2. For each of the 5 `provider` values present (`anthropic`, `openai`,
   `google`, `deepseek`, `xai`), use WebSearch/WebFetch to check that
   vendor's current model list and any deprecation notices:
   - Anthropic — console/docs model list
   - OpenAI — platform docs model list
   - Google — Gemini API model list
   - DeepSeek — API docs model list/changelog
   - xAI — docs model list
3. Cross-check `.env.example`'s human-readable model name comments (e.g.
   "enables Grok 4 and Grok 3 Mini") against the actual `id`s in
   `MODEL_CONFIGS` for drift — these are just labels for humans, but they
   should stay roughly in sync so the setup doc doesn't confuse users.
4. Report findings as a table before making any changes:

   | id | current apiModel | status | recommended replacement |
   |---|---|---|---|

   Status is one of: current / deprecated / renamed / not found.
5. If changes are needed, edit only the affected `ModelConfig` entries in
   `modelRouter.ts`, and update the "verified against live docs on
   `<date>`" comment to today's date.
6. After changes, suggest running the `verify-luka-flows` skill (or
   delegating to the `luka-flow-verifier` subagent) to confirm chat still
   works end-to-end with the updated model — there is no automated test
   covering this.
