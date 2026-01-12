/**
 * Application configuration and constants
 */

export const WIP_LIMIT_DEFAULT = 3;
export const STORAGE_KEY = 'kanban-board-v1';
export const STORAGE_VERSION = '1.0.0';
export const MAX_TITLE_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH = 5000;

// Default board state
export const DEFAULT_BOARD_STATE = {
  todos: [],
  wipLimit: WIP_LIMIT_DEFAULT,
  categories: {},
  columns: {
    backlog: [],
    in_progress: [],
    paused: [],
    done: [],
  },
};
