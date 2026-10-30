# WhiteLabel – Review Findings & Improvement Plan

Reviewed: services, stores, hooks, `App.tsx`, `MosaicStage`, `MixtapePreview`, `AIPanel` (first 120 lines), `SearchBar` (first 70 lines), CI/deploy workflows, `vite.config.ts`.
Not read in full: `Header`, `SettingsDialog`, `AlbumGrid`, `Crate`, `MosaicControls`, `HelpView`, tests. Findings below come from reading the code; none were reproduced by running the app (`node_modules` was not installed).

Priority: **P1** = real bug / user-visible, **P2** = robustness / correctness risk, **P3** = cleanup / maintainability.

---

## P1 – Bugs

1. **Gemini response parsing takes `parts[0]` only** (`aiService.ts`, `enhanceMosaic`).
   Image models often return a text part before the `inlineData` part. This throws "No image data found" even when an image is present.
   _Fix:_ `parts.find(p => p.inlineData)`; also handle `promptFeedback` / `finishReason` blocks with a clear message.

2. **`fetchImageBlob` never checks `res.ok`** (`useCrateStore.ts`).
   A 404/5xx from wsrv.nl (common for Cover Art Archive misses) is turned into a blob URL and stored as `localUrl`. `MosaicStage` prefers `localUrl`, so the tile renders blank instead of falling back to the remote URL.
   _Fix:_ throw/return `null` on `!res.ok` or non-`image/*` content type.

3. **Last.fm error responses crash the provider** (`lastfmProvider.ts`).
   Last.fm returns HTTP 200 with `{error, message}` for bad keys or rate limits. `data.results["opensearch:totalResults"]` then throws a `TypeError` with a misleading message.
   _Fix:_ check `data.error` and throw a descriptive error; guard `data.results`.

4. **MusicBrainz Lucene query is not escaped** (`musicbrainzProvider.ts`).
   User input containing `"`, `\`, `:` or similar breaks the query or returns a 400. Example: `album:"foo"bar`.
   _Fix:_ escape Lucene special characters in `artist`, `album` and `query`.

5. **README claims keys are "stored in your browser session only"**, but `useSettingsStore` uses `persist` (localStorage), so keys persist indefinitely.
   _Fix:_ either correct the docs, or add a "remember keys" toggle that uses `sessionStorage` by default (`partialize` plus a custom `storage`).

---

## P2 – Robustness / correctness

6. **Pagination is dead code.** `page` and `totalResults` flow through every provider, but `App` always requests page 1 and ignores `totalResults`. Either add "load more" with `useInfiniteQuery`, or drop the plumbing. (Recommend implementing it; the data is already there.)

7. **Whitespace-only search** passes `enabled: searchQuery.length > 0`, and then every result passes the word filter. _Fix:_ trim in `onSearch` and in `searchAll`.

8. **Unbounded blob-fetch concurrency on hydrate/`addAlbums`.** A crate with 100 albums fires 100 simultaneous requests at wsrv.nl. _Fix:_ run them through a small `p-limit`/`pThrottle` pool (the dependency is already used).

9. **Blob URL leaks under StrictMode / double hydrate.** `hydrate()` runs twice in dev. The second run overwrites `localUrl`s created by the first without revoking them. Also, the hydrate merge step never revokes blobs for albums removed during hydration. _Fix:_ make `hydrate` idempotent (guard with an in-flight promise) and revoke on discard.

10. **Mixtape generation fires on every mount, including StrictMode double-invoke, with no abort.** `MixtapePreview`'s `useEffect` guards only the state update. In dev this issues two paid Gemini calls. It also re-runs if any prop identity changes. _Fix:_ generate on explicit user action or key the request on a stable value; add `AbortController` (the SDK accepts `signal` in request options) or a request-id guard; use React Query's `useMutation`.

11. **Silent mock mode in production.** With no Gemini key, `enhanceMosaic` returns a canvas-drawn fake cassette after a 2s delay (mixtape flow only; `AIPanel` blocks without a key). Users may think the AI worked. _Fix:_ gate mock mode on `import.meta.env.DEV` or an explicit flag, and show a "Preview (no API key)" banner. Alternatively require a key in `MixtapeForm` like `AIPanel` does.

12. **iTunes provider swallows all errors** and returns an empty result, unlike the other providers. Failures then look like "no results", and `searchAll`'s `allSettled` error logging never fires. _Fix:_ let it throw. Surface per-provider errors in the UI (for example a "2 of 4 providers failed" notice).

13. **MusicBrainz / Cover Art Archive results often have no art.** The URL `…/front-500` is built blindly, so many results are broken images. Options: filter with a HEAD/`image` preload, use the `cover-art-archive.front` flag from the search response when present, or lazily drop tiles on `onError`.

14. **EXIF injection with non-ASCII text.** Artist and album names with non-Latin characters in an `"ASCII\0\0\0"` `UserComment` can make `piexif.dump` throw or produce garbage. The `try/catch` swallows it, so metadata is silently omitted. _Fix:_ use the `UNICODE\0` prefix with UTF-16 encoding or sanitize, and tell the user when metadata could not be written. Also cap the length: a 100-album crate yields a huge string.

15. **`getProxiedUrl` crop vs export resolution.** Blobs are fetched at `medium` (600×600), but export uses `pixelRatio: 3` on an up-to-800px stage. Cells larger than 200px at 3× are upscaled from a 600px source for 2–3 column layouts, so exports are soft. _Fix:_ fetch `large` for export, or re-render with originals at export time.

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

| Phase                          | Items                | Notes                                                     |
| ------------------------------ | -------------------- | --------------------------------------------------------- |
| 1. Quick correctness wins      | 1, 2, 3, 4, 7, 12    | Small, isolated, each testable (add tests per item 26)    |
| 2. Honest behaviour            | 5, 11, 22, 23, 28    | Mostly doc/gating changes                                 |
| 3. Store/network hardening     | 8, 9, 10, 13, 15, 16 | Touches `useCrateStore`, `MixtapePreview`, image pipeline |
| 4. Features already half-built | 6, 14                | Pagination UI; EXIF encoding                              |
| 5. Refactor                    | 17–21, 25            | Do after phases 1–3 so the new tests protect the refactor |
| 6. Polish                      | 24, 26, 27           | A11y, extra tests, CI                                     |

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

**Phase 1 – correctness (COMPLETED, owner browser-verified 2026-10-30):**

- [x] 1 Gemini image part lookup – 55935f3
- [x] 2 failed image fetch no longer cached – 7afe5de
- [x] 3 Last.fm error bodies – 0de0e95 (shared commit with 4)
- [x] 4 MusicBrainz phrase escaping – 0de0e95
- [x] 7 blank/whitespace search – e4dfbfd
- [x] 12 iTunes errors propagate – e8afa12
- [x] 29 (found in owner testing) relevance filter dropped results for queries containing quotes/punctuation – see commit below
      **Phase 2 – honest behaviour (COMPLETED, owner-verified 2026-10-30):**
- [x] 5 key-storage docs corrected (README, HOWTO, Settings dialog) – 0499d2c (chose docs fix, not session-only toggle)
- [x] 11 mock mode kept, "preview" banner in MixtapePreview – 01e6ca7
- [x] 22 error text uses MODEL_NAME – 01e6ca7; default model id `gemini-3.1-flash-image` confirmed valid by owner
- [x] 23 VITE\_\* warning in README – 1ea519a
- [x] 28 README typos – 1ea519a; ARCHITECTURE.md refreshed – see latest commit
- [x] `.nvmrc` (20) – 1ea519a. CI still hard-codes node 20; switching to `node-version-file` is left to item 27
      **Phase 3 – hardening:** [x] 8 throttled blob fetches (8/sec via p-throttle) – see commit [x] 9 idempotent hydrate + blob revoke on discard/replace – same commit [x] 10 abort + deferred start for mixtape generation – see commit [ ] 13 [ ] 15 [x] 16 direct fetch with proxy fallback (`fetchImageBlobData`) – see commit
      **Phase 4 – features:** [ ] 6 [ ] 14
      **Phase 5 – refactor:** [ ] 17 [ ] 18 [ ] 19 [ ] 20 [ ] 21 [ ] 25
      **Phase 6 – polish:** [ ] 24 [ ] 26 [ ] 27

Session log:

- 2026-10-30: review done, plan written, working agreements agreed. No code changed yet.
- 2026-10-30: Phase 1 implemented (5 commits on `improvements`). Node/npm are NOT installed on this machine, so nothing has been linted, type-checked or tested; owner to run `npm ci && npm run lint && npm test -- --run && npm run build`. Existing store test mocks were updated to include `ok: true`. Not yet done: Phase 2.
- 2026-10-30: Node 20.20.2 installed via nvm (`. ~/.nvm/nvm.sh` before npm in Claude's shell). Phase 1 verified: lint clean, 41/41 tests pass, `tsc -b` + build succeed. Browser click-check still owner's. Next: Phase 2.
- 2026-10-30: Owner click-test of `Say "Hi"` returned nothing. Root cause: general-query word filter in `searchAll` matched punctuation literally (pre-existing bug, not a Phase 1 regression). Fixed with `matchesAllWords`. iTunes 429 seen locally is plain rate limiting; isolated by `allSettled`. Also added `make run`.
- 2026-10-30: Phase 1 marked COMPLETED after owner browser check (`Say "Hi"` search works). Next: Phase 2 (items 5, 11, 22, 23, 28); open decision on item 5 (docs fix vs session-only keys toggle) and `.nvmrc`.
- 2026-10-30: Phase 2 implemented. lint, tsc -b and 49 tests pass. Owner browser checks: Settings > API Keys text, Mixtape Generator with no Gemini key shows the amber preview banner.
- 2026-10-30: Phase 2 COMPLETED and owner-verified. Next: Phase 3 (items 8, 9, 10, 13, 15, 16). Plan: start with a short design proposal for 13/15/16 (image pipeline) before coding; do 8+9 together, then 10. Shell note: run `. ~/.nvm/nvm.sh` before npm.
- 2026-10-30: Phase 3 started. Items 8+9 done in `useCrateStore` (shared `cacheAlbumBlobs`, `addAlbum` now delegates to `addAlbums`, so part of item 19 is also done). lint, tsc, 52 tests pass. Next: item 10 (`MixtapePreview` abort/guard), then design proposal for 13/15/16.
- 2026-10-30: Item 10 done. `enhanceMosaic` takes an optional `AbortSignal` (passed to Gemini and the mock delay); `MixtapePreview` defers the request one tick so StrictMode's throwaway mount never calls the API, and aborts on cleanup. 53 tests pass. Owner check: in dev, Network tab shows one Gemini request per generate click; clicking Back mid-generation cancels it. Remaining in Phase 3: design proposal for 13/15/16 (image pipeline) before coding.
