import { create } from "zustand";

interface TracklistState {
  tracks: string[];
  setTracks: (tracks: string[]) => void;
  clearTracks: () => void;
}

export const useTracklistStore = create<TracklistState>((set) => ({
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
  clearTracks: () => set({ tracks: [] }),
}));
