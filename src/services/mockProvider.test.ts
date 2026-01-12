import { describe, it, expect } from "vitest";
import { MockProviderService } from "./mockProvider";

describe("MockProviderService", () => {
  it("should return filtered albums based on query", async () => {
    const result = await MockProviderService.search({ query: "Album 1" });
    expect(result.albums).toHaveLength(1);
    expect(result.albums[0].album).toBe("Album 1");
  });

  it("should return filtered albums based on artist key", async () => {
    const result = await MockProviderService.search({
      query: "",
      artist: "Artist 1",
    });
    expect(result.albums).toHaveLength(1);
    expect(result.albums[0].artist).toBe("Artist 1");
  });

  it("should return empty list if no matches", async () => {
    const result = await MockProviderService.search({ query: "Non-existent" });
    expect(result.albums).toHaveLength(0);
  });
});
