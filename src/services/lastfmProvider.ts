import type { AlbumArt, SearchResult, SearchParams } from "../types";
import { BaseProvider } from "./baseProvider";
import { useSettingsStore } from "../store/useSettingsStore";

interface LastFmImage {
  "#text": string;
  size: string;
}

interface LastFmAlbumMatch {
  mbid: string;
  url: string;
  artist: string;
  name: string;
  image: LastFmImage[];
}

interface LastFmSearchResponse {
  results: {
    "opensearch:totalResults": string;
    albummatches: {
      album: LastFmAlbumMatch[];
    };
  };
}

export class LastFmProvider extends BaseProvider {
  name = "lastfm" as const;
  rateLimit = { limit: 5, interval: 1000 };
  protected baseUrl = "https://ws.audioscrobbler.com/2.0/";

  async search(params: SearchParams, page = 1): Promise<SearchResult> {
    const apiKey =
      useSettingsStore.getState().apiKeys.lastfm ||
      import.meta.env.VITE_LASTFM_API_KEY;
    if (!apiKey) return { albums: [], totalResults: 0, page };

    const searchTerm = params.album || params.query;
    const queryParams = new URLSearchParams({
      method: "album.search",
      album: searchTerm,
      api_key: apiKey,
      format: "json",
      page: page.toString(),
      limit: "30",
    });

    const data = await this.fetchJson<LastFmSearchResponse>(
      `${this.baseUrl}?${queryParams.toString()}`,
    );

    const albums = data.results.albummatches.album.map(
      (album): AlbumArt => ({
        id: `${this.name}-${album.mbid || album.url}`,
        url:
          album.image.find((img) => img.size === "extralarge")?.["#text"] ||
          album.image[0]?.["#text"] ||
          "",
        artist: album.artist,
        album: album.name,
        provider: this.name,
      }),
    );

    return {
      albums,
      totalResults: parseInt(data.results["opensearch:totalResults"], 10),
      page,
    };
  }
}
