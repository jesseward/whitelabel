import type { Provider } from "../types";

export const ProviderIcon = ({ provider }: { provider: Provider }) => {
  switch (provider) {
    case "lastfm":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.4 17.2s-1.8 1-3.4 1c-2.4 0-3.6-1.4-3.6-3.8v-5.6h2.2v5.4c0 1.2.4 1.8 1.4 1.8 1 0 1.8-.4 1.8-.4l1.6 1.6zM7.4 8.6h2.2v8.4H7.4V8.6z" />
        </svg>
      );
    case "discogs":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zm0-10c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4z" />
        </svg>
      );
    case "musicbrainz":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5 16h-2v-6h-2v6H9v-6H7v6H5V8h2v1h2V8h2v1h2V8h2v8z" />
        </svg>
      );
    case "itunes":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" />
          <path
            d="M10.854 8.675c.29-.408.875-.68 1.637-.68 1.488 0 2.213 1.137 2.213 2.658v3.167a3.076 3.076 0 0 0-2.42-1.166c-1.895 0-3.238 1.446-3.238 3.329 0 1.775 1.258 3.12 3.1 3.12 1.93.001 3.163-1.42 3.163-3.645V10.27c0-1.725-.97-3.412-3.12-3.412-1.284 0-2.125.6-2.125.6l.79 1.217z"
            fill="#fff"
          />
        </svg>
      );
    default:
      return null;
  }
};
