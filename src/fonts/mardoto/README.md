# Mardoto

Mardoto is a licensed Armenian-script display typeface and is not available as
an npm/Fontsource package. It is not bundled in this repo.

To enable it:

1. Obtain licensed `woff2` files (bold + medium weights).
2. Place them here as `Mardoto-Bold.woff2` and `Mardoto-Medium.woff2`.
3. Uncomment the `@font-face` block in `src/styles/typography.css`.

Until then, `--font-display` falls back to `Noto Sans Armenian` (bundled via
`@fontsource/noto-sans-armenian`), which covers the Armenian script correctly.
No other code changes are needed when the real font is added — the font-stack
fallback handles it automatically.
