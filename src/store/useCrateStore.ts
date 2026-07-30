import { create } from "zustand";
import type { AlbumArt } from "../types";
import { getProxiedUrl } from "../utils/imageProxy";
import { CrateStorageService } from "../services/crateStorageService";

interface CrateState {
  selectedAlbums: AlbumArt[];
  isHydrated: boolean;
  addAlbum: (album: AlbumArt) => Promise<void>;
  addAlbums: (albums: AlbumArt[]) => Promise<void>;
  removeAlbum: (albumId: string) => void;
  reorderAlbums: (startIndex: number, endIndex: number) => void;
  shuffleAlbums: () => void;
  clearCrate: () => void;
  hydrate: () => Promise<void>;
}

const fetchImageBlob = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(getProxiedUrl(url, "medium"));
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn(`Failed to cache image for ${url}:`, error);
    return null;
  }
};

export const useCrateStore = create<CrateState>((set, getStore) => ({
  selectedAlbums: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const savedAlbums = await CrateStorageService.load();

      // 1. Set state immediately with saved data (showing placeholders/remote URLs)
      set({ selectedAlbums: savedAlbums, isHydrated: true });

      // 2. Background hydrate blobs for better performance
      const albumsWithBlobs = await Promise.all(
        savedAlbums.map(async (album) => {
          const localUrl = await fetchImageBlob(album.url);
          return localUrl ? { ...album, localUrl } : album;
        }),
      );

      // 3. Update state with blobs without overwriting concurrent modifications
      set((state) => ({
        selectedAlbums: state.selectedAlbums.map((a) => {
          const updated = albumsWithBlobs.find((b) => b.id === a.id);
          return updated ? { ...a, localUrl: updated.localUrl } : a;
        }),
      }));
    } catch (error) {
      console.error("Hydration failed:", error);
      set({ isHydrated: true });
    }
  },

  addAlbum: async (album) => {
    const { selectedAlbums } = getStore();
    if (selectedAlbums.find((a) => a.id === album.id)) return;

    // 1. Optimistic Update: Add immediately
    const newAlbums = [...selectedAlbums, album];
    set({ selectedAlbums: newAlbums });

    // 2. Persist to DB (async, doesn't block UI)
    CrateStorageService.save(newAlbums).catch(console.error);

    // 3. Background: Fetch Blob for performance
    const localUrl = await fetchImageBlob(album.url);
    if (localUrl) {
      const exists = getStore().selectedAlbums.some((a) => a.id === album.id);
      if (!exists) {
        URL.revokeObjectURL(localUrl);
        return;
      }
      set((state) => ({
        selectedAlbums: state.selectedAlbums.map((a) =>
          a.id === album.id ? { ...a, localUrl } : a,
        ),
      }));
    }
  },

  addAlbums: async (albums) => {
    const { selectedAlbums } = getStore();
    const uniqueNewAlbums = albums.filter(
      (newAlbum) => !selectedAlbums.some((a) => a.id === newAlbum.id),
    );
    if (uniqueNewAlbums.length === 0) return;

    const newAlbums = [...selectedAlbums, ...uniqueNewAlbums];
    set({ selectedAlbums: newAlbums });
    CrateStorageService.save(newAlbums).catch(console.error);

    // Fetch blobs
    await Promise.all(
      uniqueNewAlbums.map(async (album) => {
        const localUrl = await fetchImageBlob(album.url);
        if (localUrl) {
          const exists = getStore().selectedAlbums.some(
            (a) => a.id === album.id,
          );
          if (!exists) {
            URL.revokeObjectURL(localUrl);
            return;
          }
          set((state) => ({
            selectedAlbums: state.selectedAlbums.map((a) =>
              a.id === album.id ? { ...a, localUrl } : a,
            ),
          }));
        }
      }),
    );
  },

  removeAlbum: (albumId) => {
    const { selectedAlbums } = getStore();
    const albumToRemove = selectedAlbums.find((a) => a.id === albumId);

    if (albumToRemove?.localUrl) {
      URL.revokeObjectURL(albumToRemove.localUrl);
    }

    const newAlbums = selectedAlbums.filter((a) => a.id !== albumId);
    set({ selectedAlbums: newAlbums });
    CrateStorageService.save(newAlbums).catch(console.error);
  },

  reorderAlbums: (startIndex, endIndex) => {
    const { selectedAlbums } = getStore();
    const result = Array.from(selectedAlbums);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    set({ selectedAlbums: result });
    CrateStorageService.save(result).catch(console.error);
  },

  shuffleAlbums: () => {
    const { selectedAlbums } = getStore();
    const shuffled = [...selectedAlbums];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    set({ selectedAlbums: shuffled });
    CrateStorageService.save(shuffled).catch(console.error);
  },

  clearCrate: () => {
    const { selectedAlbums } = getStore();
    selectedAlbums.forEach((a) => {
      if (a.localUrl) URL.revokeObjectURL(a.localUrl);
    });
    set({ selectedAlbums: [] });
    CrateStorageService.save([]).catch(console.error);
  },
}));
