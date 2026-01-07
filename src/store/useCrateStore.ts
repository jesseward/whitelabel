import { create } from 'zustand';
import { get, set as idbSet } from 'idb-keyval';
import type { AlbumArt } from '../types';
import { getProxiedUrl } from '../utils/imageProxy';

interface CrateState {
  selectedAlbums: AlbumArt[];
  isHydrated: boolean;
  addAlbum: (album: AlbumArt) => Promise<void>;
  removeAlbum: (albumId: string) => void;
  reorderAlbums: (startIndex: number, endIndex: number) => void;
  shuffleAlbums: () => void;
  clearCrate: () => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEY = 'whitelabel-crate-v1';

export const useCrateStore = create<CrateState>((set, getStore) => ({
  selectedAlbums: [],
  isHydrated: false,

  shuffleAlbums: async () => {
    const { selectedAlbums } = getStore();
    const shuffled = [...selectedAlbums].sort(() => Math.random() - 0.5);
    set({ selectedAlbums: shuffled });
    await idbSet(STORAGE_KEY, shuffled.map(({ localUrl: _localUrl, ...rest }) => { void _localUrl; return rest; }));
  },

  hydrate: async () => {
    try {
      const saved = await get<AlbumArt[]>(STORAGE_KEY);
      if (saved) {
        const albumsWithNewUrls = await Promise.all(
          saved.map(async (album) => {
            try {
              const res = await fetch(getProxiedUrl(album.url, 'medium'));
              const blob = await res.blob();
              return { ...album, localUrl: URL.createObjectURL(blob) };
            } catch (error) {
              console.warn(`Failed to re-hydrate image for ${album.album}:`, error);
              return album;
            }
          })
        );
        set({ selectedAlbums: albumsWithNewUrls, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.error('Hydration failed:', error);
      set({ isHydrated: true });
    }
  },

  addAlbum: async (album) => {
    const { selectedAlbums } = getStore();
    if (selectedAlbums.find((a) => a.id === album.id)) return;

    try {
      const response = await fetch(getProxiedUrl(album.url, 'medium'));
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);

      const albumWithLocalUrl = { ...album, localUrl };
      const newAlbums = [...selectedAlbums, albumWithLocalUrl];
      set({ selectedAlbums: newAlbums });
      
      await idbSet(STORAGE_KEY, newAlbums.map(({ localUrl: _localUrl, ...rest }) => { void _localUrl; return rest; }));
    } catch (error) {
      console.error('Failed to process album image through proxy:', error);
      const newAlbums = [...selectedAlbums, album];
      set({ selectedAlbums: newAlbums });
      await idbSet(STORAGE_KEY, newAlbums.map(({ localUrl: _localUrl, ...rest }) => { void _localUrl; return rest; }));
    }
  },

  removeAlbum: async (albumId) => {
    const { selectedAlbums } = getStore();
    const albumToRemove = selectedAlbums.find((a) => a.id === albumId);
    
    if (albumToRemove?.localUrl) {
      URL.revokeObjectURL(albumToRemove.localUrl);
    }

    const newAlbums = selectedAlbums.filter((a) => a.id !== albumId);
    set({ selectedAlbums: newAlbums });
    await idbSet(STORAGE_KEY, newAlbums.map(({ localUrl: _localUrl, ...rest }) => { void _localUrl; return rest; }));
  },

  reorderAlbums: async (startIndex, endIndex) => {
    const { selectedAlbums } = getStore();
    const result = Array.from(selectedAlbums);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    set({ selectedAlbums: result });
    await idbSet(STORAGE_KEY, result.map(({ localUrl: _localUrl, ...rest }) => { void _localUrl; return rest; }));
  },

  clearCrate: async () => {
    const { selectedAlbums } = getStore();
    selectedAlbums.forEach((a) => {
      if (a.localUrl) URL.revokeObjectURL(a.localUrl);
    });
    set({ selectedAlbums: [] });
    await idbSet(STORAGE_KEY, []);
  },
}));