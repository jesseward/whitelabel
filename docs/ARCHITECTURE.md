# WhiteLabel Technical Architecture

This document describes the technical architecture and data flow of the WhiteLabel application.

## Tech Stack

- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Canvas Rendering**: React-Konva (wrapper for Konva.js)
- **State Management**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)

## Core Architecture & Directory Structure

```
src/
├── components/     # UI Components (React)
│   └── MixtapePreview.tsx # Mixtape preview and export
├── services/       # External API integrations (Providers)
├── store/          # Zustand state stores
├── hooks/          # Custom React hooks (e.g., export logic)
├── utils/          # Shared utilities (e.g., image proxy)
├── types/          # TypeScript definitions
└── constants/      # Shared constants & configurations
```

### 1. State Management (Zustand)

State is managed globally using Zustand stores located in `src/store/`:

- `useCrateStore.ts`: Manages the selected albums ("The Crate"), handles adding/removing/reordering, and manages IndexedDB persistence via `CrateStorageService`.
- `useTracklistStore.ts`: Manages the imported raw tracklist (lines of text).
- `useSettingsStore.ts`: Manages user settings, active API keys, and enabled providers. Persisted in localStorage.
- `useThemeStore.ts`: Manages Light/Dark mode.

### 2. Search & Data Providers (Services)

The search functionality is designed as a multi-provider system:

- `SearchService.ts`: Parses the search query (supporting fields like `artist:` and `album:`) and queries active providers.
- **Providers**: Located in `src/services/`. Every provider extends `BaseProvider` and implements the `SearchProvider` interface.
  - `LastFmProvider`: Requires API key.
  - `DiscogsProvider`: Requires API key.
  - `MusicBrainzProvider`: Keyless.
  - `ITunesProvider`: Keyless.
- **Rate Limiting**: Providers are throttled individually using `p-throttle` to comply with API usage guidelines.

### 3. Canvas & Exporting

- **Rendering**: `MosaicStage.tsx` renders the Konva Stage, Layer, and Images.
- **CORS & Image Proxying**: To prevent canvas tainting (which blocks image export), external images are proxied through a cached image service (`wsrv.nl`) via the `getProxiedUrl` utility in `src/utils/imageProxy.ts`.
- **EXIF Metadata**: When exporting as JPEG, the app injects Curated Album Metadata (Artist - Album) into the JPEG EXIF `UserComment` header using `piexifjs` in `useMosaicExport.ts`.

### 4. AI Stylist (Gemini Integration)

- `aiService.ts` integrates with Google's Generative AI SDK.
- **Requirement**: Expects a model that supports multimodal input and **image-to-image output** (returning image data in `inlineData` response). Standard text-only Gemini models will fail with this implementation.
- **Mixtape Mode**: Extends the AI stylist to generate 90s-style mixtape cassettes (Branded Maxell XLII style or Rave clear plastic style) from scratch (using a solid placeholder image as input). Supports optional title, artist/DJ, and extra info fields with strict text preservation rules.
