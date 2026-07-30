import type { AlbumArt, SearchResult, SearchParams } from "../types";
import { BaseProvider } from "./baseProvider";
import { useSettingsStore } from "../store/useSettingsStore";

interface DiscogsSearchResult {
  id: number;
  title: string;
  cover_image: string;
}

interface DiscogsSearchResponse {
  pagination: {
    items: number;
  };
  results: DiscogsSearchResult[];
}

export class DiscogsProvider extends BaseProvider {
  name = "discogs" as const;
  rateLimit = { limit: 1, interval: 1000 };
  protected baseUrl = "https://api.discogs.com/database/search";

  async search(params: SearchParams, page = 1): Promise<SearchResult> {
    const token =
      useSettingsStore.getState().apiKeys.discogs ||
      import.meta.env.VITE_DISCOGS_TOKEN;
    if (!token) return { albums: [], totalResults: 0, page };

    const queryParams = new URLSearchParams({
      type: "release",
      page: page.toString(),
      per_page: "30",
      token: token,
    });

    if (params.artist) queryParams.append("artist", params.artist);
    if (params.album) queryParams.append("release_title", params.album);
    if (!params.artist && !params.album) queryParams.append("q", params.query);

    const data = await this.fetchJson<DiscogsSearchResponse>(
      `${this.baseUrl}?${queryParams.toString()}`,
    );

    const albums = data.results.map((result): AlbumArt => {
      const parts = result.title.split(" - ");
      const artist = parts.length > 1 ? parts[0].trim() : "Unknown Artist";
      const album =
        (parts.length > 1 ? parts.slice(1).join(" - ") : result.title).trim() ||
        "Unknown Album";
      return {
        id: `${this.name}-${result.id}`,
        url: result.cover_image,
        artist,
        album,
        provider: this.name,
      };
    });

    return {
      albums,
      totalResults: data.pagination.items,
      page,
    };
  }
}
