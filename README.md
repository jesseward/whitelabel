# WhiteLabel

WhiteLabel is a client-side web application designed for music enthusiasts to create album art mosaics for mixtapes. It features a multi-provider search engine, a persistent workspace (The Crate), and AI-powered enhancement tools.

## Features

- **Multi-Provider Search**: Integrated with Last.fm, Discogs, MusicBrainz, and Apple iTunes.
- **Client-Side Configuration**: "Bring Your Own Key" allows users to input API keys directly in the UI, enabling purely static hosting.
- **Smart Crate**: Persistent selection management with drag-and-drop reordering.
- **Mosaic Engine**: Responsive canvas with real-time layout controls.
- **AI Lab**: Style transfers and custom typography powered by Gemini Nano Banana.
- **Advanced Export**: PNG/JPEG support with automatic EXIF metadata injection.

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   # or
   make install
   ```

2. **Configure Environment Variables (Optional)**:
   For local development, you can create a `.env` file in the root directory. Alternatively, you can input these keys via the UI Settings menu after starting the app.
   ```env
   VITE_LASTFM_API_KEY=your_lastfm_key
   VITE_DISCOGS_TOKEN=your_discogs_token
   ```

3. **Run Locally**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Production Build & Verification

We provide a `Makefile` to streamline common tasks:

```bash
# Run linting, tests, and build
make all

# Or run individual steps:
make lint
make test
make build
```

The compiled files will be located in the `dist/` directory.

## Deployment

The application is a pure static site (SPA).

### GitHub Pages (Automated)
This repository includes a GitHub Action (`.github/workflows/deploy.yml`) that automatically builds and deploys the application to GitHub Pages whenever you push to the `main` branch.

### Manual Deployment
You can deploy the contents of the `dist/` folder to any static hosting provider such as Vercel, Netlify, or AWS S3.

### Important Note on CORS
The application uses `wsrv.nl` as an image proxy to handle CORS and performance optimization for album covers. No additional server-side configuration is required.

## Documentation

For detailed information on configuration, search filters, and AI features, see the [User Guide](docs/HOWTO.md).

## Technical Stack

- **Framework**: React 19
- **Language**: TypeScript
- **State**: Zustand
- **Styling**: Tailwind CSS 4
- **Canvas**: React-Konva
- **Animations**: Framer Motion
- **Persistence**: IndexedDB (idb-keyval) & LocalStorage
- **Testing**: Vitest
