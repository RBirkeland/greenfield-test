import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TodoManager } from '../../src/services/todo-manager.js';
import { Storage } from '../../src/services/storage.js';
import { STORAGE_KEY, DEFAULT_BOARD_STATE } from '../../src/config.js';

describe('App Persistence - Full Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default board state', () => {
    const manager = new TodoManager();
    const board = manager.getBoard();

    expect(board).toBeDefined();
    expect(board.todos).toEqual([]);
    expect(board.wipLimit).toBe(DEFAULT_BOARD_STATE.wipLimit);
    expect(board.columns).toBeDefined();
  });

  it('should persist a todo across manager instances', () => {
    // First manager: add a todo
    const manager1 = new TodoManager();
    manager1.addTodo('Test TODO', 'Test description');
    const board1 = manager1.getBoard();
    expect(board1.todos).toHaveLength(1);
    const todoId = board1.todos[0].id;

    // Second manager: should load the persisted todo
    const manager2 = new TodoManager();
    const board2 = manager2.getBoard();
    expect(board2.todos).toHaveLength(1);
    expect(board2.todos[0].id).toBe(todoId);
    expect(board2.todos[0].title).toBe('Test TODO');
  });

  it('should persist todo status changes across manager instances', () => {
    // First manager: add and move a todo
    const manager1 = new TodoManager();
    manager1.addTodo('Test', 'Desc');
    const board1 = manager1.getBoard();
    const todoId = board1.todos[0].id;
    manager1.moveTodo(todoId, 'in_progress');

    // Second manager: should see the moved todo
    const manager2 = new TodoManager();
    const board2 = manager2.getBoard();
    const movedTodo = board2.todos.find(t => t.id === todoId);
    expect(movedTodo.status).toBe('in_progress');
  });

  it.skip('should save data to localStorage on mutations', () => {
    const manager = new TodoManager();

    // Add todo
    manager.addTodo('Test', 'Desc');
    let stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.todos.length).toBeGreaterThan(0);

    // Verify the todo is in storage
    expect(stored.todos[0].title).toBe('Test');
  });
});
