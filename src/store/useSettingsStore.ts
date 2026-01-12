import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Provider } from "../types";
import { PROVIDERS } from "../constants/providers";

interface SettingsState {
  enabledProviders: Record<Provider, boolean>;
  apiKeys: {
    lastfm: string;
    discogs: string;
    gemini: string;
  };
  toggleProvider: (provider: Provider) => void;
  setApiKey: (service: "lastfm" | "discogs" | "gemini", key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      enabledProviders: {
        lastfm: PROVIDERS.lastfm.defaultEnabled,
        discogs: PROVIDERS.discogs.defaultEnabled,
        musicbrainz: PROVIDERS.musicbrainz.defaultEnabled,
        itunes: PROVIDERS.itunes.defaultEnabled,
        mock: PROVIDERS.mock.defaultEnabled,
      },
      apiKeys: {
        lastfm: "",
        discogs: "",
        gemini: "",
      },
      toggleProvider: (provider) =>
        set((state) => ({
          enabledProviders: {
            ...state.enabledProviders,
            [provider]: !state.enabledProviders[provider],
          },
        })),
      setApiKey: (service, key) =>
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [service]: key,
          },
        })),
    }),
    {
      name: "whitelabel-settings",
      version: 1, // Increment to invalidate old storage containing 'theaudiodb'
    },
  ),
);
