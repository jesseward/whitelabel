import type { AlbumArt, SearchResult, SearchParams } from '../types';
import { BaseProvider } from './baseProvider';

interface ITunesResult {
  collectionId: number;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  artworkUrl60?: string;
  collectionViewUrl: string;
}

interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesResult[];
}

export class ITunesProvider extends BaseProvider {
  name = 'itunes' as const;
  protected baseUrl = 'https://itunes.apple.com/search';

  async search(params: SearchParams, page = 1): Promise<SearchResult> {
    // iTunes API doesn't support pagination via 'page' parameter directly in the same way,
    // but uses 'limit' and 'offset'. We'll approximate.
    const limit = 30;
    const offset = (page - 1) * limit;

    const term = params.artist && params.album 
      ? `${params.artist} ${params.album}`
      : params.query;

    const queryParams = new URLSearchParams({
      term: term,
      media: 'music',
      entity: 'album',
      limit: limit.toString(),
      offset: offset.toString(),
      // 'explicit' parameter could be added if we wanted to filter explicit content
    });

    // iTunes API requires CORS proxy for client-side requests usually, 
    // but we can try direct first. If it fails due to CORS, we might need a proxy.
    // However, iTunes often allows JSONP, but fetch doesn't support JSONP.
    // Many client-side apps use a CORS proxy for iTunes.
    // For this implementation, I will attempt to fetch directly. 
    // If CORS is an issue, users might see errors, but we can't easily fix that 
    // without a backend proxy or a public CORS proxy service.
    // *Correction*: We can use the existing image proxy or just acknowledge it.
    // Actually, itunes.apple.com *does* have CORS restrictions.
    // I will use a known pattern or just standard fetch and handle errors.
    
    // Note: In a real production app, you'd route this through your own backend.
    // For this static app, we might hit CORS. 
    // Let's try to use the fetchJson from BaseProvider.
    
    const url = `${this.baseUrl}?${queryParams.toString()}`;
    
    try {
        const data = await this.fetchJson<ITunesSearchResponse>(url);
        
        const albums = data.results.map((result): AlbumArt => {
          // Get higher resolution image by modifying the URL
          // standard is 100x100 (artworkUrl100). We can try to get 600x600 or higher.
          const highResUrl = result.artworkUrl100.replace('100x100bb', '600x600bb');
          
          return {
            id: `${this.name}-${result.collectionId}`,
            url: highResUrl,
            artist: result.artistName,
            album: result.collectionName,
            provider: this.name
          };
        });

        return {
          albums,
          totalResults: data.resultCount >= limit ? (page * limit) + limit : (page * limit), // iTunes doesn't give total count easily with search
          page
        };

    } catch (error) {
        console.error("iTunes API search failed", error);
        // Fallback or empty result
        return { albums: [], totalResults: 0, page };
    }
  }
}
