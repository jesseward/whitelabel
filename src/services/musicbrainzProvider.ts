import type { AlbumArt, SearchResult, SearchParams } from '../types';
import { BaseProvider } from './baseProvider';

const CAA_URL = 'https://coverartarchive.org/release/';
const SCORE_THRESHOLD = 60;

interface MusicBrainzArtistCredit {
  name: string;
}

interface MusicBrainzRelease {
  id: string;
  title: string;
  score: string;
  'artist-credit'?: MusicBrainzArtistCredit[];
}

interface MusicBrainzSearchResponse {
  count: number;
  releases: MusicBrainzRelease[];
}

export class MusicBrainzProvider extends BaseProvider {
  name = 'musicbrainz' as const;
  rateLimit = { limit: 1, interval: 1000 };
  protected baseUrl = 'https://musicbrainz.org/ws/2/release/';

  async search(params: SearchParams, page = 1): Promise<SearchResult> {
    const offset = (page - 1) * 30;
    
    let luceneQuery = '';
    if (params.artist && params.album) {
      luceneQuery = `artistname:"${params.artist}" AND release:"${params.album}"`;
    } else if (params.artist) {
      luceneQuery = `artistname:"${params.artist}"`;
    } else if (params.album) {
      luceneQuery = `release:"${params.album}"`;
    } else {
      luceneQuery = `artistname:"${params.query}" OR release:"${params.query}"`;
    }
    
    const queryParams = new URLSearchParams({
      query: luceneQuery,
      fmt: 'json',
      limit: '30',
      offset: offset.toString()
    });

    const data = await this.fetchJson<MusicBrainzSearchResponse>(`${this.baseUrl}?${queryParams.toString()}`);
    
    const filteredReleases = data.releases.filter((r) => parseInt(r.score, 10) > SCORE_THRESHOLD);

    const albums = filteredReleases.map((release): AlbumArt => ({
      id: `${this.name}-${release.id}`,
      url: `${CAA_URL}${release.id}/front-500`,
      artist: release['artist-credit']?.[0]?.name || 'Unknown Artist',
      album: release.title,
      provider: this.name
    }));

    return {
      albums,
      totalResults: data.count,
      page
    };
  }
}