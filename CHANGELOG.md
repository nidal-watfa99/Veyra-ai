# Changelog — audit & fixes

## Static-hosting fix (GitHub Pages)

- AI keys are now saved in the user's own browser and tested/used directly against each provider; no backend needed. New file: `src/utils/aiClient.ts`.
- Key test lists the models the key can really use and auto-replaces retired model IDs (previous defaults for Cerebras, OpenRouter, Groq and Gemini had been removed by the providers).
- Live chat in the conversation inspector uses the active provider's key and falls back to the built-in sample replies only when none is configured.
- "Request storage access" no longer fails on normal pages (it only applies to embedded frames).
- The four overview metric cards now open their related sections.


## Settings / modal pages (content was clipped or unreachable)
- **Security & Storage Audit**: modal had no max height → on phones/short screens header/footer were pushed off-screen. Body now scrolls inside a viewport-sized (`dvh`) frame.
- **AI Keys & Models**: on phones only ~68px of the settings content was visible (provider list took the space). The whole body now scrolls on small screens; two-pane scrolling kept on desktop. API-key field no longer overlaps the show/hide icon; rows wrap on narrow screens.
- **Deploy Specialist**, **Knowledge Vault** dialogs, **Inspector**: same framing fix (max height + internal scroll, responsive grids).
- All dialogs now close with **Esc** and by clicking the backdrop.

## Bugs
- Avatars used raw `/src/assets/...` strings → broken in production builds / GitHub Pages. Now imported (bundled by Vite).
- `safeOpenWindow`: `noopener` in the features string made `window.open` always return `null`, so every successful open was reported as "popup blocked". Fixed (opener is nulled manually); non-http(s) schemes are refused. Popup test now also reports real failures.
- `InspectorModal`: early `return` before hooks (Rules of Hooks violation, console warning, state lost on every close). Fixed.
- AI Keys: clicking a model radio saved twice; server's real error (400/401/429) was hidden behind a misleading "static mode" message. Fixed.
- Security modal: cookie check ran on every render; storage-access was requested without a user gesture on open. Fixed.
- `server.ts`: provider names like `constructor` passed validation; non-string `apiKey` could throw. Fixed (`hasOwnProperty` + type checks).

## Layout
- Mobile drawer scrolls and has a tap-to-close backdrop; mobile header is sticky; language dropdown in the drawer opens upward.
- Top bar wraps instead of overflowing (was 316px overflow on phones); channel filters now usable on phones.
- "No results" messages for appointments, pipeline, conversations, vault.

## Translations
- Knowledge Vault ignored existing AR/FR translations. Wired them in and added 19 new keys (AR/EN/FR).

Nothing was deleted from the project.
