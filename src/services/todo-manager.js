import { generateId } from '../utils/uuid.js';
import { Storage } from './storage.js';
import { DEFAULT_BOARD_STATE, WIP_LIMIT_DEFAULT } from '../config.js';
import { validateTitle, validateDescription } from '../utils/validators.js';
import { CategoryDetector } from './category-detector.js';

/**
 * TodoManager - Core business logic for managing TODOs and board state
 */
export class TodoManager {
  constructor() {
    this.storage = new Storage();
    this.board = this.storage.load();
    this.categoryDetector = new CategoryDetector();
  }

  /**
   * Add a new TODO to the board
   * @param {string} title - TODO title
   * @param {string} description - TODO description (optional)
   * @throws {Error} If title is invalid
   */
  addTodo(title, description = '') {
    // Validate title
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      throw new Error(titleValidation.error);
    }

    const descValidation = validateDescription(description);
    if (!descValidation.valid) {
      throw new Error(descValidation.error);
    }

    const backlogTodos = this.board.todos.filter(t => t.status === 'backlog');
    const newPosition = backlogTodos.length;

    const newTodo = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      status: 'backlog',
      position: newPosition,
      createdAt: new Date().toISOString(),
      category: null,
    };

    this.board.todos.push(newTodo);
    this.board.columns.backlog.push(newTodo.id);
    this._save();
  }

  /**
   * Get current board state
   * @returns {Object} Board state
   */
  getBoard() {
    return this.board;
  }

  /**
   * Move a TODO to a different status
   * @param {string} todoId - TODO ID
   * @param {string} newStatus - New status (backlog, in_progress, done)
   * @throws {Error} If move violates WIP limit
   */
  moveTodo(todoId, newStatus) {
    const todo = this.board.todos.find(t => t.id === todoId);
    if (!todo) {
      throw new Error(`TODO not found: ${todoId}`);
    }

    const oldStatus = todo.status;

    // Detect category if moving to done
    if (newStatus === 'done' && oldStatus !== 'done') {
      todo.category = this.categoryDetector.detect(todo.title);
    }

    // Update status
    todo.status = newStatus;

    // Recompute positions in old column (excluding the moved todo)
    const oldColumnTodos = this.board.todos.filter(t => t.status === oldStatus && t.id !== todoId);
    oldColumnTodos.forEach((t, idx) => {
      t.position = idx;
    });

    // Recompute positions in new column
    const newColumnTodos = this.board.todos.filter(t => t.status === newStatus);
    newColumnTodos.forEach((t, idx) => {
      t.position = idx;
    });

    // Update columns
    this.board.columns[oldStatus] = oldColumnTodos.map(t => t.id);
    this.board.columns[newStatus] = newColumnTodos.map(t => t.id);

    this._save();
  }

  /**
   * Delete a TODO
   * @param {string} todoId - TODO ID
   */
  deleteTodo(todoId) {
    const todoIndex = this.board.todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) {
      throw new Error(`TODO not found: ${todoId}`);
    }

    const todo = this.board.todos[todoIndex];
    this.board.todos.splice(todoIndex, 1);

    // Remove from column
    const columnTodos = this.board.todos.filter(t => t.status === todo.status);
    columnTodos.forEach((t, idx) => {
      t.position = idx;
    });
    this.board.columns[todo.status] = columnTodos.map(t => t.id);

    this._save();
  }

  /**
   * Reorder a TODO within its column
   * @param {string} todoId - TODO ID
   * @param {number} newPosition - New position in column
   */
  reorderTodo(todoId, newPosition) {
    const todo = this.board.todos.find(t => t.id === todoId);
    if (!todo) {
      throw new Error(`TODO not found: ${todoId}`);
    }

    const columnTodos = this.board.todos.filter(t => t.status === todo.status);
    const currentIndex = columnTodos.findIndex(t => t.id === todoId);

    if (currentIndex === -1 || newPosition < 0 || newPosition >= columnTodos.length) {
      throw new Error('Invalid reorder operation');
    }

    // Remove from current position
    columnTodos.splice(currentIndex, 1);

    // Insert at new position
    columnTodos.splice(newPosition, 0, todo);

    // Update positions and board.todos order for backlog
    columnTodos.forEach((t, idx) => {
      t.position = idx;
    });

    // Reorder board.todos to match new column order
    const otherTodos = this.board.todos.filter(t => t.status !== todo.status);
    this.board.todos = [...columnTodos, ...otherTodos];

    this.board.columns[todo.status] = columnTodos.map(t => t.id);

    this._save();
  }

  /**
   * Set WIP limit
   * @param {number} newLimit - New WIP limit
   * @throws {Error} If limit is invalid
   */
  setWIPLimit(newLimit) {
    if (!Number.isInteger(newLimit) || newLimit <= 0) {
      throw new Error('WIP limit must be a positive integer');
    }

    const inProgressCount = this.board.todos.filter(t => t.status === 'in_progress').length;
    if (newLimit < inProgressCount) {
      throw new Error(`WIP limit cannot be less than current in-progress count (${inProgressCount})`);
    }

    this.board.wipLimit = newLimit;
    this._save();
  }

  /**
   * Search for completed TODOs by category or keyword
   * @param {string} query - Search query
   * @returns {Array} Matching TODOs
   */
  searchDone(query) {
    const doneTodos = this.board.todos.filter(t => t.status === 'done');
    const lowerQuery = query.toLowerCase();

    return doneTodos.filter(todo => {
      const titleMatch = todo.title.toLowerCase().includes(lowerQuery);
      const descMatch = todo.description && todo.description.toLowerCase().includes(lowerQuery);
      const categoryMatch = todo.category && todo.category.toLowerCase().includes(lowerQuery);

      return titleMatch || descMatch || categoryMatch;
    });
  }

  /**
   * Save board state to storage
   * @private
   */
  _save() {
    this.storage.save(this.board);
  }
}
