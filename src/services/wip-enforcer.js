/**
 * WIPEnforcer - Enforces WIP (Work In Progress) limits
 */
export class WIPEnforcer {
  /**
   * Check if a TODO can be moved to in_progress
   * @param {Object} board - Board state
   * @returns {boolean} True if move is allowed
   */
  canMoveToInProgress(board) {
    const inProgressCount = board.todos.filter(t => t.status === 'in_progress').length;
    return inProgressCount < board.wipLimit;
  }

  /**
   * Get WIP status information
   * @param {Object} board - Board state
   * @returns {Object} { count, limit, available }
   */
  getWIPStatus(board) {
    const inProgressCount = board.todos.filter(t => t.status === 'in_progress').length;
    return {
      count: inProgressCount,
      limit: board.wipLimit,
      available: inProgressCount < board.wipLimit,
    };
  }

  /**
   * Validate a new WIP limit
   * @param {number} newLimit - Proposed new limit
   * @param {number} currentCount - Current in_progress count
   * @returns {Object} { valid: boolean, error: string|null }
   */
  validateWIPLimit(newLimit, currentCount) {
    if (!Number.isInteger(newLimit) || newLimit <= 0) {
      return {
        valid: false,
        error: 'WIP limit must be a positive integer',
      };
    }

    if (newLimit < currentCount) {
      return {
        valid: false,
        error: `WIP limit cannot be less than current in-progress count (${currentCount})`,
      };
    }

    return { valid: true, error: null };
  }
}
