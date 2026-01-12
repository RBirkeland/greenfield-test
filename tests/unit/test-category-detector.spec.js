import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryDetector } from '../../src/services/category-detector.js';

describe('CategoryDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new CategoryDetector();
  });

  describe('detect()', () => {
    it('should return "bug" for bug-related keywords', () => {
      expect(detector.detect('Fix bug in auth')).toBe('bug');
      expect(detector.detect('BUG: Database error')).toBe('bug');
      expect(detector.detect('fix issue with login')).toBe('bug');
    });

    it('should return "feature" for feature-related keywords', () => {
      expect(detector.detect('Add dark mode')).toBe('feature');
      expect(detector.detect('FEATURE: User preferences')).toBe('feature');
      expect(detector.detect('implement new API')).toBe('feature');
    });

    it('should be case-insensitive', () => {
      expect(detector.detect('FIX BUG IN AUTH')).toBe('bug');
      expect(detector.detect('Add Feature')).toBe('feature');
      expect(detector.detect('DOCS: Update README')).toBe('docs');
    });

    it('should return "Other" for unmatched titles', () => {
      expect(detector.detect('Random task title')).toBe('Other');
      expect(detector.detect('Something unrelated')).toBe('Other');
    });

    it('should match all keyword patterns', () => {
      expect(detector.detect('fix: auth bug')).toBe('bug');
      expect(detector.detect('feature: new page')).toBe('feature');
      expect(detector.detect('docs: API guide')).toBe('docs');
      expect(detector.detect('refactor: database layer')).toBe('refactor');
      expect(detector.detect('design: new UI')).toBe('design');
      expect(detector.detect('test: authentication')).toBe('test');
      expect(detector.detect('performance: optimize queries')).toBe('performance');
    });
  });
});
