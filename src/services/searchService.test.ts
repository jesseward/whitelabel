import { describe, it, expect } from "vitest";
import { SearchService, matchesAllWords } from "./searchService";

describe("SearchService", () => {
  describe("parseQuery", () => {
    it("should parse simple queries", () => {
      const result = SearchService.parseQuery("Boards of Canada");
      expect(result.query).toBe("Boards of Canada");
      expect(result.artist).toBeUndefined();
    });

    it("should parse artist prefix", () => {
      const result = SearchService.parseQuery("artist:Autechre");
      expect(result.artist).toBe("Autechre");
      expect(result.query).toBe("Autechre"); // Fallback when query is empty
    });

    it("should parse quoted artist prefix", () => {
      const result = SearchService.parseQuery('artist:"Aphex Twin"');
      expect(result.artist).toBe("Aphex Twin");
    });

    it("should parse combined artist and album", () => {
      const result = SearchService.parseQuery("artist:Autechre album:Amber");
      expect(result.artist).toBe("Autechre");
      expect(result.album).toBe("Amber");
    });

    it("should preserve remaining query text", () => {
      const result = SearchService.parseQuery("artist:Autechre something else");
      expect(result.artist).toBe("Autechre");
      expect(result.query).toBe("something else");
    });
  });

  describe("searchAll", () => {
    it("returns no results for a blank or whitespace-only query", async () => {
      expect(await SearchService.searchAll("")).toEqual([]);
      expect(await SearchService.searchAll("   ")).toEqual([]);
    });
  });

  describe("matchesAllWords", () => {
    it("ignores quotes and punctuation in the query", () => {
      expect(matchesAllWords("Some Artist Say Hi", 'Say "Hi"')).toBe(true);
    });

    it("ignores punctuation in the result", () => {
      expect(matchesAllWords('EM XINH "SAY HI"', "say hi")).toBe(true);
    });

    it("requires every word to match", () => {
      expect(matchesAllWords("Autechre Amber", "autechre tri repetae")).toBe(
        false,
      );
    });

    it("matches non-latin text", () => {
      expect(matchesAllWords("Sigur Rós Ágætis byrjun", "rós")).toBe(true);
    });

    it("matches everything when the query has no words", () => {
      expect(matchesAllWords("Anything", '"" --')).toBe(true);
    });
  });
});
