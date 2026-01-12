import type { AlbumArt, SearchResult, SearchParams } from "../types";

const MOCK_ALBUMS: AlbumArt[] = [
  {
    id: "1",
    url: "https://placehold.co/300x300?text=Album+1",
    artist: "Artist 1",
    album: "Album 1",
    provider: "mock",
    resolution: { width: 300, height: 300 },
  },
  {
    id: "2",
    url: "https://placehold.co/300x300?text=Album+2",
    artist: "Artist 2",
    album: "Album 2",
    provider: "mock",
    resolution: { width: 300, height: 300 },
  },
];

export const MockProviderService = {
  search: async (params: SearchParams): Promise<SearchResult> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const query = params.query.toLowerCase();
    const artistQuery = params.artist?.toLowerCase();
    const albumQuery = params.album?.toLowerCase();

    const filtered = MOCK_ALBUMS.filter((album) => {
      if (artistQuery && !album.artist.toLowerCase().includes(artistQuery))
        return false;
      if (albumQuery && !album.album.toLowerCase().includes(albumQuery))
        return false;
      if (!artistQuery && !albumQuery) {
        return (
          album.artist.toLowerCase().includes(query) ||
          album.album.toLowerCase().includes(query)
        );
      }
      return true;
    });

    return {
      albums: filtered,
      totalResults: filtered.length,
      page: 1,
    };
  },
};
