import { create } from "zustand";
import pThrottle from "p-throttle";
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

// Cap the request rate so a large crate doesn't hit wsrv.nl all at once.
const throttleImageFetch = pThrottle({ limit: 8, interval: 1000 });

const fetchImageBlob = throttleImageFetch(
  async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(getProxiedUrl(url, "medium"));
      if (!res.ok) {
        throw new Error(`Image request failed with status ${res.status}`);
      }
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn(`Failed to cache image for ${url}:`, error);
      return null;
    }
  },
);

// Shared by hydrate/addAlbums. Revokes blobs for albums removed while the
// fetch was in flight and any blob that gets replaced.
const cacheAlbumBlobs = async (
  albums: AlbumArt[],
  set: (fn: (state: CrateState) => Partial<CrateState>) => void,
  get: () => CrateState,
): Promise<void> => {
  await Promise.all(
    albums.map(async (album) => {
      const localUrl = await fetchImageBlob(album.url);
      if (!localUrl) return;

      const current = get().selectedAlbums.find((a) => a.id === album.id);
      if (!current) {
        URL.revokeObjectURL(localUrl);
        return;
      }
      if (current.localUrl) URL.revokeObjectURL(current.localUrl);
      set((state) => ({
        selectedAlbums: state.selectedAlbums.map((a) =>
          a.id === album.id ? { ...a, localUrl } : a,
        ),
      }));
    }),
  );
};

// Dev StrictMode (and any re-mount) calls hydrate twice; share one run.
let hydrating: Promise<void> | null = null;

export const useCrateStore = create<CrateState>((set, getStore) => ({
  selectedAlbums: [],
  isHydrated: false,

  hydrate: () => {
    hydrating ??= (async () => {
      try {
        const savedAlbums = await CrateStorageService.load();

        // Show saved data immediately (remote URLs), then cache blobs.
        set({ selectedAlbums: savedAlbums, isHydrated: true });
        await cacheAlbumBlobs(savedAlbums, set, getStore);
      } catch (error) {
        console.error("Hydration failed:", error);
        set({ isHydrated: true });
      }
    })();
    return hydrating;
  },

  addAlbum: (album) => getStore().addAlbums([album]),

  addAlbums: async (albums) => {
    const { selectedAlbums } = getStore();
    const uniqueNewAlbums = albums.filter(
      (newAlbum) => !selectedAlbums.some((a) => a.id === newAlbum.id),
    );
    if (uniqueNewAlbums.length === 0) return;

    const newAlbums = [...selectedAlbums, ...uniqueNewAlbums];
    set({ selectedAlbums: newAlbums });
    CrateStorageService.save(newAlbums).catch(console.error);

    await cacheAlbumBlobs(uniqueNewAlbums, set, getStore);
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
