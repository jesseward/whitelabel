import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
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
      provider: "mock" as const,
    };

    // Mock successful fetch
    (globalThis.fetch as Mock).mockResolvedValue({
      blob: () => Promise.resolve(new Blob()),
    });

    await useCrateStore.getState().addAlbum(mockAlbum);

    const state = useCrateStore.getState();
    expect(state.selectedAlbums).toHaveLength(1);
    expect(state.selectedAlbums[0].localUrl).toBe("blob:mock-url");
  });

  it("should not add duplicate albums", async () => {
    const mockAlbum = {
      id: "1",
      url: "test",
      artist: "A",
      album: "B",
      provider: "mock" as const,
    };

    (globalThis.fetch as Mock).mockResolvedValue({
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
      provider: "mock" as const,
    };

    // Manually set state to test removal
    useCrateStore.setState({ selectedAlbums: [mockAlbum] });

    useCrateStore.getState().removeAlbum("1");

    expect(useCrateStore.getState().selectedAlbums).toHaveLength(0);
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:to-revoke",
    );
  });
});
