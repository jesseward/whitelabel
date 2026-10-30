import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ITunesProvider } from "./itunesProvider";

describe("ITunesProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("upgrades artwork URLs to 600x600", async () => {
    (globalThis.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          resultCount: 1,
          results: [
            {
              collectionId: 7,
              artistName: "Autechre",
              collectionName: "Amber",
              artworkUrl100: "https://img/100x100bb.jpg",
            },
          ],
        }),
    });

    const result = await new ITunesProvider().search({ query: "amber" });
    expect(result.albums[0].url).toBe("https://img/600x600bb.jpg");
  });

  it("rejects on API failure so callers can report it", async () => {
    (globalThis.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });

    await expect(
      new ITunesProvider().search({ query: "amber" }),
    ).rejects.toThrow("itunes API error");
  });
});
