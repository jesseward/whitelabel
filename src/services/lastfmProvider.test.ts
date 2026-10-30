import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { LastFmProvider } from "./lastfmProvider";
import { useSettingsStore } from "../store/useSettingsStore";

const jsonResponse = (body: unknown) => ({
  ok: true,
  json: () => Promise.resolve(body),
});

describe("LastFmProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    useSettingsStore.setState({
      apiKeys: { lastfm: "key", discogs: "", gemini: "" },
    });
  });

  it("returns no albums without an API key", async () => {
    useSettingsStore.setState({
      apiKeys: { lastfm: "", discogs: "", gemini: "" },
    });
    const result = await new LastFmProvider().search({ query: "x" });
    expect(result.albums).toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("maps albums from a successful response", async () => {
    (globalThis.fetch as Mock).mockResolvedValue(
      jsonResponse({
        results: {
          "opensearch:totalResults": "1",
          albummatches: {
            album: [
              {
                mbid: "abc",
                url: "https://last.fm/a",
                artist: "Autechre",
                name: "Amber",
                image: [{ size: "extralarge", "#text": "https://img/a.png" }],
              },
            ],
          },
        },
      }),
    );

    const result = await new LastFmProvider().search({ query: "amber" });
    expect(result.albums).toEqual([
      {
        id: "lastfm-abc",
        url: "https://img/a.png",
        artist: "Autechre",
        album: "Amber",
        provider: "lastfm",
      },
    ]);
    expect(result.totalResults).toBe(1);
  });

  it("throws a descriptive error when Last.fm returns an error body", async () => {
    (globalThis.fetch as Mock).mockResolvedValue(
      jsonResponse({ error: 10, message: "Invalid API key" }),
    );

    await expect(
      new LastFmProvider().search({ query: "amber" }),
    ).rejects.toThrow("Invalid API key (10)");
  });
});
