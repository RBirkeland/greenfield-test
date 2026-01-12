import { describe, it, expect, beforeEach } from 'vitest';
import { WIPEnforcer } from '../../src/services/wip-enforcer.js';
import { DEFAULT_BOARD_STATE } from '../../src/config.js';

describe('WIPEnforcer', () => {
  let enforcer;
  let board;

  beforeEach(() => {
    enforcer = new WIPEnforcer();
    board = JSON.parse(JSON.stringify(DEFAULT_BOARD_STATE));
  });

  describe('canMoveToInProgress()', () => {
    it('should return true if count < limit', () => {
      board.todos = [
        { id: '1', status: 'in_progress' },
        { id: '2', status: 'in_progress' },
      ];
      board.wipLimit = 3;

      const result = enforcer.canMoveToInProgress(board);
      expect(result).toBe(true);
    });

    it('should return false if count >= limit', () => {
      board.todos = [
        { id: '1', status: 'in_progress' },
        { id: '2', status: 'in_progress' },
        { id: '3', status: 'in_progress' },
      ];
      board.wipLimit = 3;

      const result = enforcer.canMoveToInProgress(board);
      expect(result).toBe(false);
    });

    it('should return true when starting empty', () => {
      board.todos = [];
      board.wipLimit = 3;

      const result = enforcer.canMoveToInProgress(board);
      expect(result).toBe(true);
    });
  });

  describe('getWIPStatus()', () => {
    it('should return count and limit', () => {
      board.todos = [
        { id: '1', status: 'in_progress' },
        { id: '2', status: 'backlog' },
      ];
      board.wipLimit = 3;

      const status = enforcer.getWIPStatus(board);
      expect(status.count).toBe(1);
      expect(status.limit).toBe(3);
      expect(status.available).toBe(true);
    });

    it('should indicate unavailable when at limit', () => {
      board.todos = [
        { id: '1', status: 'in_progress' },
        { id: '2', status: 'in_progress' },
        { id: '3', status: 'in_progress' },
      ];
      board.wipLimit = 3;

      const status = enforcer.getWIPStatus(board);
      expect(status.count).toBe(3);
      expect(status.available).toBe(false);
    });
  });

  describe('validateWIPLimit()', () => {
    it('should accept valid limits', () => {
      const result = enforcer.validateWIPLimit(5, 2);
      expect(result.valid).toBe(true);
    });

    it('should reject limit <= 0', () => {
      const result = enforcer.validateWIPLimit(0, 2);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject limit < current count', () => {
      const result = enforcer.validateWIPLimit(1, 3);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
