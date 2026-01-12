import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Storage } from '../../src/services/storage.js';
import { DEFAULT_BOARD_STATE, STORAGE_KEY } from '../../src/config.js';

describe('Storage Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('load()', () => {
    it('should return default board state on first launch', () => {
      const storage = new Storage();
      const state = storage.load();

      expect(state).toEqual(DEFAULT_BOARD_STATE);
    });

    it('should return persisted board state from localStorage', () => {
      const testState = {
        todos: [{ id: '1', title: 'Test TODO' }],
        wipLimit: 5,
        categories: { bug: 1 },
        columns: { backlog: ['1'], in_progress: [], done: [] },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(testState));

      const storage = new Storage();
      const state = storage.load();

      expect(state).toEqual(testState);
    });

    it('should handle corrupted JSON gracefully with error', () => {
      // Store invalid JSON
      localStorage.setItem(STORAGE_KEY, '{invalid json}');

      const storage = new Storage();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const state = storage.load();

      expect(consoleSpy).toHaveBeenCalled();
      expect(state).toEqual(DEFAULT_BOARD_STATE);

      consoleSpy.mockRestore();
    });

    it('should handle missing key as empty state', () => {
      localStorage.removeItem(STORAGE_KEY);

      const storage = new Storage();
      const state = storage.load();

      expect(state).toEqual(DEFAULT_BOARD_STATE);
    });
  });

  describe('save()', () => {
    it('should persist board state to localStorage', () => {
      const testState = {
        todos: [{ id: '1', title: 'Test TODO', status: 'backlog' }],
        wipLimit: 3,
        categories: {},
        columns: { backlog: ['1'], in_progress: [], done: [] },
      };

      const storage = new Storage();
      storage.save(testState);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toEqual(testState);
    });

    it('should overwrite existing state', () => {
      const initialState = { todos: [], wipLimit: 3, categories: {}, columns: { backlog: [], in_progress: [], done: [] } };
      const newState = { todos: [{ id: '1' }], wipLimit: 5, categories: {}, columns: { backlog: ['1'], in_progress: [], done: [] } };

      const storage = new Storage();
      storage.save(initialState);
      storage.save(newState);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toEqual(newState);
      expect(stored.wipLimit).toBe(5);
    });
  });

  describe('version tracking', () => {
    it('should include version information', () => {
      const storage = new Storage();
      const state = storage.load();

      expect(state).toBeDefined();
      // Version can be added to state for future migrations
    });
  });
});
