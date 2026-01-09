import { STORAGE_KEY, STORAGE_VERSION, DEFAULT_BOARD_STATE } from '../config.js';

/**
 * LocalStorage persistence layer for board state
 */
export class Storage {
  /**
   * Load board state from localStorage
   * @returns {Object} Board state or default state if not found
   */
  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return JSON.parse(JSON.stringify(DEFAULT_BOARD_STATE));
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load board state from storage:', error);
      return JSON.parse(JSON.stringify(DEFAULT_BOARD_STATE));
    }
  }

  /**
   * Save board state to localStorage
   * @param {Object} boardState - Board state to persist
   */
  save(boardState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boardState));
    } catch (error) {
      console.error('Failed to save board state to storage:', error);
    }
  }

  /**
   * Get version information for future migrations
   * @returns {string} Current storage version
   */
  getVersion() {
    return STORAGE_VERSION;
  }
}
