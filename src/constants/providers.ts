import type { Provider } from "../types";

export interface ProviderMetadata {
  id: Provider;
  name: string;
  requiresKey: boolean;
  defaultEnabled: boolean;
}

export const PROVIDERS: Record<Provider, ProviderMetadata> = {
  lastfm: {
    id: "lastfm",
    name: "Last.fm",
    requiresKey: true,
    defaultEnabled: true,
  },
  discogs: {
    id: "discogs",
    name: "Discogs",
    requiresKey: true,
    defaultEnabled: true,
  },
  musicbrainz: {
    id: "musicbrainz",
    name: "MusicBrainz",
    requiresKey: false,
    defaultEnabled: true,
  },
  itunes: {
    id: "itunes",
    name: "Apple iTunes",
    requiresKey: false,
    defaultEnabled: true,
  },
  mock: {
    id: "mock",
    name: "Mock Data",
    requiresKey: false,
    defaultEnabled: false,
  },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);
