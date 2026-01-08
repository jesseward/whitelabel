import pThrottle from 'p-throttle';
import type { SearchProvider, AlbumArt, SearchParams } from '../types';
import { LastFmProvider } from './lastfmProvider';
import { DiscogsProvider } from './discogsProvider';
import { MusicBrainzProvider } from './musicbrainzProvider';
import { ITunesProvider } from './itunesProvider';
import { SEARCH_CONFIG } from '../constants/searchConfig';

const providerInstances = [
  new LastFmProvider(),
  new DiscogsProvider(),
  new MusicBrainzProvider(),
  new ITunesProvider()
];

const providers: { provider: SearchProvider; throttle: ReturnType<typeof pThrottle> }[] = providerInstances.map(provider => ({
  provider,
  throttle: pThrottle(provider.rateLimit)
}));

export const SearchService = {
  parseQuery(rawQuery: string): SearchParams {
    const params: SearchParams = { query: rawQuery };
    
    const artistMatch = rawQuery.match(SEARCH_CONFIG.REGEX.ARTIST);
    const albumMatch = rawQuery.match(SEARCH_CONFIG.REGEX.ALBUM);

    if (artistMatch) {
      params.artist = (artistMatch[1] || artistMatch[2] || artistMatch[3]).trim();
      params.query = params.query.replace(artistMatch[0], '').trim();
    }
    if (albumMatch) {
      params.album = (albumMatch[1] || albumMatch[2] || albumMatch[3]).trim();
      params.query = params.query.replace(albumMatch[0], '').trim();
    }

    // If we only have prefixes and no general query, 
    // we use one of the prefixes as the primary query for providers that don't support field search
    if (!params.query && (params.artist || params.album)) {
      params.query = params.artist || params.album || '';
    }

    return params;
  },

  searchAll: async (rawQuery: string, page = 1, enabledProviders?: Record<string, boolean>): Promise<AlbumArt[]> => {
    if (!rawQuery) return [];

    const searchParams = SearchService.parseQuery(rawQuery);

    const activeProviders = providers.filter(({ provider }) => 
      !enabledProviders || enabledProviders[provider.name]
    );

    const results = await Promise.allSettled(
      activeProviders.map(({ provider, throttle }) => 
        throttle(() => provider.search(searchParams, page))()
      )
    );

    const allAlbums: AlbumArt[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allAlbums.push(...result.value.albums);
      } else {
        console.error('Provider search failed:', result.reason);
      }
    });

    const filteredAlbums = allAlbums.filter(album => {
      if (!album.url) return false;
      
      const artistLower = album.artist.toLowerCase();
      const albumLower = album.album.toLowerCase();
      
      // If we have specific fields, we must match them
      if (searchParams.artist && !artistLower.includes(searchParams.artist.toLowerCase())) return false;
      if (searchParams.album && !albumLower.includes(searchParams.album.toLowerCase())) return false;
      
      // Flexible word-based matching for general queries
      if (!searchParams.artist && !searchParams.album) {
        const queryWords = searchParams.query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const combined = `${artistLower} ${albumLower}`;
        
        // Ensure every word in the query exists somewhere in the result
        const isRelevant = queryWords.every(word => combined.includes(word));
        if (!isRelevant) return false;
      }

      return !SEARCH_CONFIG.PLACEHOLDERS.some(p => album.url.toLowerCase().includes(p));
    });

    const seen = new Set<string>();
    return filteredAlbums.filter(album => {
      const key = `${album.artist.toLowerCase()}-${album.album.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
};