import { describe, it, expect } from 'vitest';
import { SearchService } from './searchService';

describe('SearchService', () => {
  describe('parseQuery', () => {
    it('should parse simple queries', () => {
      const result = SearchService.parseQuery('Boards of Canada');
      expect(result.query).toBe('Boards of Canada');
      expect(result.artist).toBeUndefined();
    });

    it('should parse artist prefix', () => {
      const result = SearchService.parseQuery('artist:Autechre');
      expect(result.artist).toBe('Autechre');
      expect(result.query).toBe('Autechre'); // Fallback when query is empty
    });

    it('should parse quoted artist prefix', () => {
      const result = SearchService.parseQuery('artist:"Aphex Twin"');
      expect(result.artist).toBe('Aphex Twin');
    });

    it('should parse combined artist and album', () => {
      const result = SearchService.parseQuery('artist:Autechre album:Amber');
      expect(result.artist).toBe('Autechre');
      expect(result.album).toBe('Amber');
    });

    it('should preserve remaining query text', () => {
      const result = SearchService.parseQuery('artist:Autechre something else');
      expect(result.artist).toBe('Autechre');
      expect(result.query).toBe('something else');
    });
  });
});
