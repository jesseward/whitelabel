# WhiteLabel – Review Findings & Improvement Plan

Reviewed: services, stores, hooks, `App.tsx`, `MosaicStage`, `MixtapePreview`, `AIPanel` (first 120 lines), `SearchBar` (first 70 lines), CI/deploy workflows, `vite.config.ts`.
Not read in full: `Header`, `SettingsDialog`, `AlbumGrid`, `Crate`, `MosaicControls`, `HelpView`, tests. Findings below come from reading the code; none were reproduced by running the app (`node_modules` was not installed).

Priority: **P1** = real bug / user-visible, **P2** = robustness / correctness risk, **P3** = cleanup / maintainability.

---

## P1 – Bugs

1. **Gemini response parsing takes `parts[0]` only** (`aiService.ts`, `enhanceMosaic`).
   Image models often return a text part before the `inlineData` part. This throws "No image data found" even when an image is present.
   *Fix:* `parts.find(p => p.inlineData)`; also handle `promptFeedback` / `finishReason` blocks with a clear message.

2. **`fetchImageBlob` never checks `res.ok`** (`useCrateStore.ts`).
   A 404/5xx from wsrv.nl (common for Cover Art Archive misses) is turned into a blob URL and stored as `localUrl`. `MosaicStage` prefers `localUrl`, so the tile renders blank instead of falling back to the remote URL.
   *Fix:* throw/return `null` on `!res.ok` or non-`image/*` content type.

3. **Last.fm error responses crash the provider** (`lastfmProvider.ts`).
   Last.fm returns HTTP 200 with `{error, message}` for bad keys or rate limits. `data.results["opensearch:totalResults"]` then throws a `TypeError` with a misleading message.
   *Fix:* check `data.error` and throw a descriptive error; guard `data.results`.

4. **MusicBrainz Lucene query is not escaped** (`musicbrainzProvider.ts`).
   User input containing `"`, `\`, `:` or similar breaks the query or returns a 400. Example: `album:"foo"bar`.
   *Fix:* escape Lucene special characters in `artist`, `album` and `query`.

5. **README claims keys are "stored in your browser session only"**, but `useSettingsStore` uses `persist` (localStorage), so keys persist indefinitely.
   *Fix:* either correct the docs, or add a "remember keys" toggle that uses `sessionStorage` by default (`partialize` plus a custom `storage`).

---

## P2 – Robustness / correctness

6. **Pagination is dead code.** `page` and `totalResults` flow through every provider, but `App` always requests page 1 and ignores `totalResults`. Either add "load more" with `useInfiniteQuery`, or drop the plumbing. (Recommend implementing it; the data is already there.)

7. **Whitespace-only search** passes `enabled: searchQuery.length > 0`, and then every result passes the word filter. *Fix:* trim in `onSearch` and in `searchAll`.

8. **Unbounded blob-fetch concurrency on hydrate/`addAlbums`.** A crate with 100 albums fires 100 simultaneous requests at wsrv.nl. *Fix:* run them through a small `p-limit`/`pThrottle` pool (the dependency is already used).

9. **Blob URL leaks under StrictMode / double hydrate.** `hydrate()` runs twice in dev. The second run overwrites `localUrl`s created by the first without revoking them. Also, the hydrate merge step never revokes blobs for albums removed during hydration. *Fix:* make `hydrate` idempotent (guard with an in-flight promise) and revoke on discard.

10. **Mixtape generation fires on every mount, including StrictMode double-invoke, with no abort.** `MixtapePreview`'s `useEffect` guards only the state update. In dev this issues two paid Gemini calls. It also re-runs if any prop identity changes. *Fix:* generate on explicit user action or key the request on a stable value; add `AbortController` (the SDK accepts `signal` in request options) or a request-id guard; use React Query's `useMutation`.

11. **Silent mock mode in production.** With no Gemini key, `enhanceMosaic` returns a canvas-drawn fake cassette after a 2s delay (mixtape flow only; `AIPanel` blocks without a key). Users may think the AI worked. *Fix:* gate mock mode on `import.meta.env.DEV` or an explicit flag, and show a "Preview (no API key)" banner. Alternatively require a key in `MixtapeForm` like `AIPanel` does.

12. **iTunes provider swallows all errors** and returns an empty result, unlike the other providers. Failures then look like "no results", and `searchAll`'s `allSettled` error logging never fires. *Fix:* let it throw. Surface per-provider errors in the UI (for example a "2 of 4 providers failed" notice).

13. **MusicBrainz / Cover Art Archive results often have no art.** The URL `…/front-500` is built blindly, so many results are broken images. Options: filter with a HEAD/`image` preload, use the `cover-art-archive.front` flag from the search response when present, or lazily drop tiles on `onError`.

14. **EXIF injection with non-ASCII text.** Artist and album names with non-Latin characters in an `"ASCII\0\0\0"` `UserComment` can make `piexif.dump` throw or produce garbage. The `try/catch` swallows it, so metadata is silently omitted. *Fix:* use the `UNICODE\0` prefix with UTF-16 encoding or sanitize, and tell the user when metadata could not be written. Also cap the length: a 100-album crate yields a huge string.

15. **`getProxiedUrl` crop vs export resolution.** Blobs are fetched at `medium` (600×600), but export uses `pixelRatio: 3` on an up-to-800px stage. Cells larger than 200px at 3× are upscaled from a 600px source for 2–3 column layouts, so exports are soft. *Fix:* fetch `large` for export, or re-render with originals at export time.

16. **Hard dependency on wsrv.nl** (third-party, no SLA) for all images and export. Add a documented fallback, for example try the direct URL with `crossOrigin="anonymous"` first (iTunes, CAA and Last.fm usually send CORS headers) and fall back to the proxy.

---

## P3 – Cleanup / maintainability

17. **`App.tsx` is a god component** (~300 lines): search, mixtape form, tab switching and routing in one. Extract `MixtapeForm`, `MosaicTab` (search + crate) and a `TabBar`. Move mixtape form state into the form, or into a small store.

18. **Overlapping navigation state.** `view` (`search | generate | help | mixtape_preview`) and `generatorMode` (`mosaic | mixtape`) encode the same thing in two places. The tab `onClick`s contain redundant branches (`if (view === "generate" || view === "search") setView("search")`). Model it as one discriminated state, for example `{ mode, step }`.

19. **Duplicated logic:**
    - Blob fetch and set in `addAlbum` vs `addAlbums` (`addAlbum` can just call `addAlbums([album])`).
    - Download-link plus EXIF code in `useMosaicExport` and `MixtapePreview.handleExport` → `utils/download.ts` and `utils/exif.ts`.
    - API-key resolution (store → env) repeated in `lastfmProvider`, `discogsProvider`, `aiService`, `AIPanel`, `SearchBar` → one `getApiKey(service)` in `settingsStore`/`utils`.
    - Spinner markup repeated 3× in `App`.

20. **Provider boilerplate:**
    - `BaseProvider` sets a `User-Agent` header, which browsers forbid and ignore. The placeholder URL `your-repo` is also stale. Remove it (MusicBrainz identifies by `Origin`/`Referer` in the browser).
    - `iTunesProvider` carries a long stream-of-consciousness comment block; replace it with a one-line note.
    - Move per-provider response mapping into small pure functions so it can be unit tested.

21. **Dead or unused code:** `useMosaicExport`'s `quality` state has no setter (make it a constant). `SEARCH_CONFIG.BATCH_SIZE` — verify usage. `src/assets/react.svg`, `public/vite.svg` are leftover scaffolding. `useThemeStore` is read in `App`; confirm the pre-paint theme class avoids a flash.

22. **Hard-coded model name in error text** (`MixtapePreview`: "gemini-3.1-flash-image") can drift from `MODEL_NAME`/`VITE_GEMINI_MODEL`. Interpolate the constant. Also verify the default model ID is valid; a wrong default fails every request.

23. **`VITE_*` secrets are inlined into the public bundle.** `VITE_GEMINI_API_KEY`, `VITE_DISCOGS_TOKEN` and `VITE_LASTFM_API_KEY` are fine for local dev but must never be set in the Pages deploy. Document that in README/HOWTO, and consider removing the fallbacks from production builds.

24. **Accessibility:** form `<label>`s in the mixtape form and `AIPanel` lack `htmlFor`/`id`. Toggle buttons need `aria-pressed`. The tab bar needs `role="tablist"`/`aria-selected`. Spinners need `role="status"`. Check `AlbumGrid` and `Crate` drag handles for keyboard support (dnd-kit has a `KeyboardSensor`).

25. **Types:** `enabledProviders?: Record<string, boolean>` in `searchAll` should be `Record<Provider, boolean>`. `p.id in apiKeys ? apiKeys[p.id as keyof typeof apiKeys]` casts in `SearchBar` go away if provider config declares its `apiKeyField`. `(error as Error).message` in `App` → `error instanceof Error`.

26. **Tests:** existing tests cover the stores, `searchService` and `aiService`. Missing coverage:
    - provider response mapping and error paths (items 3, 12)
    - `fetchImageBlob` failure handling (item 2)
    - `parseQuery` edge cases (quotes, only-prefix queries, empty)
    - the EXIF helper
    - a smoke test for `App` view switching

27. **CI/CD:**
    - `ci.yml` runs `make` while `deploy.yml` re-implements the steps with `npm`. Use one path.
    - `peaceiris/actions-gh-pages@v3` is old; consider the official `actions/deploy-pages`, which also drops the need for `contents: write`.
    - Pin Node to a version satisfying Vite's minimum (check the Vite/rolldown engines field against `"20"`).
    - Deploy gates on lint/test, but a failed deploy has no PR check mirroring `tsc -b`.

28. **Docs:** fix README typos ("mosciacs", "alrt", "tranmission"). Update `ARCHITECTURE.md`, which lists `Tailwind` and the dir tree but omits the mixtape flow, `idb-keyval` persistence details and `use-image`.

---

## Suggested execution order

| Phase | Items | Notes |
|---|---|---|
| 1. Quick correctness wins | 1, 2, 3, 4, 7, 12 | Small, isolated, each testable (add tests per item 26) |
| 2. Honest behaviour | 5, 11, 22, 23, 28 | Mostly doc/gating changes |
| 3. Store/network hardening | 8, 9, 10, 13, 15, 16 | Touches `useCrateStore`, `MixtapePreview`, image pipeline |
| 4. Features already half-built | 6, 14 | Pagination UI; EXIF encoding |
| 5. Refactor | 17–21, 25 | Do after phases 1–3 so the new tests protect the refactor |
| 6. Polish | 24, 26, 27 | A11y, extra tests, CI |

Open question for the owner: should the mock cassette mode remain (as a demo for keyless users), or be dev-only? That decides how item 11 is fixed.

---

## Working agreements

- Single long-lived branch: `improvements`. Commits are allowed, **never push** (owner pushes).
- One commit per finding; tests added alongside the fix where easy.
- Mock cassette mode (item 11): keep it, add a visible "preview, no API key" banner.
- Item 8: reuse `p-throttle`, no new dependency.
- Owner runs tests and browser click-checks; Claude also runs lint/test/build before handoff.
- Commit messages carry no Claude attribution.

## Status tracker

Update after every commit. Format: `[ ] item – status/commit`.

**Phase 1 – correctness:** [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 7 [ ] 12
**Phase 2 – honest behaviour:** [ ] 5 [ ] 11 [ ] 22 [ ] 23 [ ] 28
**Phase 3 – hardening:** [ ] 8 [ ] 9 [ ] 10 [ ] 13 [ ] 15 [ ] 16
**Phase 4 – features:** [ ] 6 [ ] 14
**Phase 5 – refactor:** [ ] 17 [ ] 18 [ ] 19 [ ] 20 [ ] 21 [ ] 25
**Phase 6 – polish:** [ ] 24 [ ] 26 [ ] 27

Session log:
- 2026-10-30: review done, plan written, working agreements agreed. No code changed yet.
