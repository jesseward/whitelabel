import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MusicBrainzProvider } from "./musicbrainzProvider";

const emptyResponse = {
  ok: true,
  json: () => Promise.resolve({ count: 0, releases: [] }),
};

const queryFor = (call: unknown[]): string =>
  new URL(call[0] as string).searchParams.get("query")!;

describe("MusicBrainzProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(emptyResponse));
  });

  it("builds a combined artist and release query", async () => {
    await new MusicBrainzProvider().search({
      query: "",
      artist: "Autechre",
      album: "Amber",
    });
    const query = queryFor((globalThis.fetch as Mock).mock.calls[0]);
    expect(query).toBe('artistname:"Autechre" AND release:"Amber"');
  });

  it("escapes quotes and backslashes in user input", async () => {
    await new MusicBrainzProvider().search({
      query: "",
      album: 'Say "Hi" \\ now',
    });
    const query = queryFor((globalThis.fetch as Mock).mock.calls[0]);
    expect(query).toBe('release:"Say \\"Hi\\" \\\\ now"');
  });

  it("escapes the general query in both fields", async () => {
    await new MusicBrainzProvider().search({ query: 'a"b' });
    const query = queryFor((globalThis.fetch as Mock).mock.calls[0]);
    expect(query).toBe('artistname:"a\\"b" OR release:"a\\"b"');
  });

  it("filters out low-score releases", async () => {
    (globalThis.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          count: 2,
          releases: [
            { id: "hi", title: "Good", score: "100" },
            { id: "lo", title: "Bad", score: "10" },
          ],
        }),
    });
    const result = await new MusicBrainzProvider().search({ query: "x" });
    expect(result.albums.map((a) => a.id)).toEqual(["musicbrainz-hi"]);
  });
});
