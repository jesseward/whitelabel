import { get, set } from 'idb-keyval';
import type { AlbumArt } from '../types';

const STORAGE_KEY = 'whitelabel-crate-v1';

export const CrateStorageService = {
  save: async (albums: AlbumArt[]) => {
    // Strip localUrl (blob URLs) before saving to IndexedDB
    // Blob URLs are session-specific and cannot be persisted
    const cleanAlbums = albums.map(({ localUrl: _localUrl, ...rest }) => { 
      void _localUrl; 
      return rest; 
    });
    await set(STORAGE_KEY, cleanAlbums);
  },

  load: async (): Promise<AlbumArt[]> => {
    return (await get<AlbumArt[]>(STORAGE_KEY)) || [];
  },
};
