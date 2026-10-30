import type { AlbumArt, SearchResult, SearchParams } from "../types";
import { BaseProvider } from "./baseProvider";

interface ITunesResult {
  collectionId: number;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
}

interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesResult[];
}

export class ITunesProvider extends BaseProvider {
  name = "itunes" as const;
  rateLimit = { limit: 5, interval: 1000 };
  protected baseUrl = "https://itunes.apple.com/search";

  async search(params: SearchParams, page = 1): Promise<SearchResult> {
    // iTunes API doesn't support pagination via 'page' parameter directly in the same way,
    // but uses 'limit' and 'offset'. We'll approximate.
    const limit = 30;
    const offset = (page - 1) * limit;

    const term =
      params.artist && params.album
        ? `${params.artist} ${params.album}`
        : params.query;

    const queryParams = new URLSearchParams({
      term: term,
      media: "music",
      entity: "album",
      limit: limit.toString(),
      offset: offset.toString(),
      // 'explicit' parameter could be added if we wanted to filter explicit content
    });

    const url = `${this.baseUrl}?${queryParams.toString()}`;

    const data = await this.fetchJson<ITunesSearchResponse>(url);

    const albums = data.results.map((result): AlbumArt => {
      // Get higher resolution image by modifying the URL
      // standard is 100x100 (artworkUrl100). We can try to get 600x600 or higher.
      const highResUrl = result.artworkUrl100.replace("100x100bb", "600x600bb");

      return {
        id: `${this.name}-${result.collectionId}`,
        url: highResUrl,
        artist: result.artistName,
        album: result.collectionName,
        provider: this.name,
      };
    });

    return {
      albums,
      totalResults:
        data.resultCount >= limit
          ? (page + 1) * limit
          : (page - 1) * limit + data.resultCount,
      page,
    };
  }
}
