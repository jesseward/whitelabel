import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { get as idbGet } from "idb-keyval";
import { useCrateStore } from "./useCrateStore";

// Mock idb-keyval
vi.mock("idb-keyval", () => ({
  get: vi.fn(),
  set: vi.fn(),
}));

describe("useCrateStore", () => {
  beforeEach(() => {
    // Mock URL and fetch using Vitest's stubGlobal
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal("fetch", vi.fn());

    useCrateStore.getState().clearCrate();
    vi.clearAllMocks();
  });

  it("should start with an empty crate", () => {
    expect(useCrateStore.getState().selectedAlbums).toHaveLength(0);
  });

  it("should add an album and create a local URL", async () => {
    const mockAlbum = {
      id: "1",
      url: "https://example.com/art.jpg",
      artist: "Artist",
      album: "Album",
      provider: "itunes" as const,
    };

    // Mock successful fetch
    (globalThis.fetch as Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });

    await useCrateStore.getState().addAlbum(mockAlbum);

    const state = useCrateStore.getState();
    expect(state.selectedAlbums).toHaveLength(1);
    expect(state.selectedAlbums[0].localUrl).toBe("blob:mock-url");
  });

  it("should not store a local URL when the image fetch fails", async () => {
    const mockAlbum = {
      id: "404",
      url: "https://example.com/missing.jpg",
      artist: "Artist",
      album: "Album",
      provider: "musicbrainz" as const,
    };

    (globalThis.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 404,
      blob: () => Promise.resolve(new Blob()),
    });

    await useCrateStore.getState().addAlbum(mockAlbum);

    const state = useCrateStore.getState();
    expect(state.selectedAlbums).toHaveLength(1);
    expect(state.selectedAlbums[0].localUrl).toBeUndefined();
  });

  it("should add multiple albums and create local URLs", async () => {
    const mockAlbum1 = {
      id: "1",
      url: "https://example.com/art1.jpg",
      artist: "Artist 1",
      album: "Album 1",
      provider: "itunes" as const,
    };
    const mockAlbum2 = {
      id: "2",
      url: "https://example.com/art2.jpg",
      artist: "Artist 2",
      album: "Album 2",
      provider: "itunes" as const,
    };

    (globalThis.fetch as Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });

    await useCrateStore.getState().addAlbums([mockAlbum1, mockAlbum2]);

    const state = useCrateStore.getState();
    expect(state.selectedAlbums).toHaveLength(2);
    expect(state.selectedAlbums[0].localUrl).toBe("blob:mock-url");
    expect(state.selectedAlbums[1].localUrl).toBe("blob:mock-url");
  });

  it("should not add duplicate albums", async () => {
    const mockAlbum = {
      id: "1",
      url: "test",
      artist: "A",
      album: "B",
      provider: "itunes" as const,
    };

    (globalThis.fetch as Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });

    await useCrateStore.getState().addAlbum(mockAlbum);
    await useCrateStore.getState().addAlbum(mockAlbum);

    expect(useCrateStore.getState().selectedAlbums).toHaveLength(1);
  });

  it("should remove an album and revoke its URL", () => {
    const mockAlbum = {
      id: "1",
      url: "test",
      localUrl: "blob:to-revoke",
      artist: "A",
      album: "B",
      provider: "itunes" as const,
    };

    // Manually set state to test removal
    useCrateStore.setState({ selectedAlbums: [mockAlbum] });

    useCrateStore.getState().removeAlbum("1");

    expect(useCrateStore.getState().selectedAlbums).toHaveLength(0);
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:to-revoke",
    );
  });

  it("should revoke the blob when the album is removed during the fetch", async () => {
    const mockAlbum = {
      id: "gone",
      url: "https://example.com/gone.jpg",
      artist: "A",
      album: "B",
      provider: "itunes" as const,
    };

    (globalThis.fetch as Mock).mockImplementation(async () => {
      useCrateStore.getState().removeAlbum("gone");
      return { ok: true, blob: () => Promise.resolve(new Blob()) };
    });

    await useCrateStore.getState().addAlbum(mockAlbum);

    expect(useCrateStore.getState().selectedAlbums).toHaveLength(0);
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:mock-url",
    );
  });

  it("should throttle image fetches for large batches", async () => {
    vi.useFakeTimers();
    try {
      // The throttle is module-level; let earlier tests' calls age out.
      await vi.advanceTimersByTimeAsync(1000);
      const albums = Array.from({ length: 20 }, (_, i) => ({
        id: `bulk-${i}`,
        url: `https://example.com/${i}.jpg`,
        artist: "A",
        album: `B${i}`,
        provider: "itunes" as const,
      }));
      (globalThis.fetch as Mock).mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob()),
      });

      const done = useCrateStore.getState().addAlbums(albums);
      await vi.advanceTimersByTimeAsync(0);
      expect(globalThis.fetch).toHaveBeenCalledTimes(8);

      await vi.advanceTimersByTimeAsync(1000);
      expect(globalThis.fetch).toHaveBeenCalledTimes(16);

      await vi.advanceTimersByTimeAsync(1000);
      await done;
      expect(globalThis.fetch).toHaveBeenCalledTimes(20);
    } finally {
      vi.useRealTimers();
    }
  });

  it("should only hydrate once when called repeatedly", async () => {
    (idbGet as Mock).mockResolvedValue([
      {
        id: "h1",
        url: "https://example.com/h1.jpg",
        artist: "A",
        album: "B",
        provider: "itunes" as const,
      },
    ]);
    (globalThis.fetch as Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });

    await Promise.all([
      useCrateStore.getState().hydrate(),
      useCrateStore.getState().hydrate(),
    ]);

    expect(idbGet).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(useCrateStore.getState().selectedAlbums[0].localUrl).toBe(
      "blob:mock-url",
    );
  });
});
