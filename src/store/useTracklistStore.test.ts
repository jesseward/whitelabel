import { describe, it, expect, beforeEach } from "vitest";
import { useTracklistStore } from "./useTracklistStore";

describe("useTracklistStore", () => {
  beforeEach(() => {
    useTracklistStore.getState().clearTracks();
  });

  it("should start with an empty tracklist", () => {
    expect(useTracklistStore.getState().tracks).toHaveLength(0);
  });

  it("should set tracks", () => {
    const newTracks = ["Track 1", "Track 2", "Track 3"];
    useTracklistStore.getState().setTracks(newTracks);
    expect(useTracklistStore.getState().tracks).toEqual(newTracks);
  });

  it("should clear tracks", () => {
    useTracklistStore.getState().setTracks(["Track 1"]);
    useTracklistStore.getState().clearTracks();
    expect(useTracklistStore.getState().tracks).toHaveLength(0);
  });
});
