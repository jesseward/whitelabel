export type View = 'search' | 'generate';

export type Provider = 'lastfm' | 'discogs' | 'musicbrainz' | 'itunes' | 'mock';

export interface AlbumArt {
  id: string;
  url: string;
  localUrl?: string;
  artist: string;
  album: string;
  provider: Provider;
  resolution?: {
    width: number;
    height: number;
  };
}

export interface SearchResult {
  albums: AlbumArt[];
  totalResults: number;
  page: number;
}

export interface SearchParams {
  query: string;
  artist?: string;
  album?: string;
}

export interface SearchProvider {
  name: Provider;
  search(params: SearchParams, page?: number): Promise<SearchResult>;
  rateLimit: {
    limit: number;
    interval: number;
  };
}
