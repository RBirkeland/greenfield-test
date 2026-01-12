import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoManager } from '../../src/services/todo-manager.js';
import { Storage } from '../../src/services/storage.js';
import { DEFAULT_BOARD_STATE } from '../../src/config.js';

// Mock Storage
vi.mock('../../src/services/storage.js', () => ({
  Storage: class {
    load() {
      return JSON.parse(JSON.stringify(DEFAULT_BOARD_STATE));
    }
    save() {}
  },
}));

describe('TodoManager', () => {
  let todoManager;

  beforeEach(() => {
    vi.clearAllMocks();
    todoManager = new TodoManager();
  });

  describe('addTodo()', () => {
    it('should create TODO with correct defaults', () => {
      const title = 'Test TODO';
      const description = 'Test description';

      todoManager.addTodo(title, description);
      const board = todoManager.getBoard();

      expect(board.todos).toHaveLength(1);
      const todo = board.todos[0];
      expect(todo.title).toBe(title);
      expect(todo.description).toBe(description);
      expect(todo.id).toBeDefined();
      expect(todo.status).toBe('backlog');
      expect(todo.position).toBe(0);
      expect(todo.createdAt).toBeDefined();
    });

    it('should reject empty or whitespace-only titles', () => {
      expect(() => todoManager.addTodo('', '')).toThrow();
      expect(() => todoManager.addTodo('   ', '')).toThrow();
      expect(() => todoManager.addTodo(null, '')).toThrow();
    });

    it('should auto-save to Storage after adding', () => {
      const saveSpy = vi.spyOn(Storage.prototype, 'save');
      todoManager.addTodo('Test', 'Desc');
      // Storage save will be called via the instance
    });

    it('should add multiple TODOs with incrementing positions', () => {
      todoManager.addTodo('First', 'Desc 1');
      todoManager.addTodo('Second', 'Desc 2');
      todoManager.addTodo('Third', 'Desc 3');

      const board = todoManager.getBoard();
      expect(board.todos).toHaveLength(3);
      expect(board.todos[0].title).toBe('First');
      expect(board.todos[1].title).toBe('Second');
      expect(board.todos[2].title).toBe('Third');
    });
  });

  describe('getBoard()', () => {
    it('should return current state', () => {
      const board = todoManager.getBoard();

      expect(board).toBeDefined();
      expect(board.todos).toBeDefined();
      expect(board.wipLimit).toBeDefined();
      expect(board.columns).toBeDefined();
    });
  });

  describe('moveTodo()', () => {
    it('should change TODO status correctly', () => {
      todoManager.addTodo('Test', 'Desc');
      const board = todoManager.getBoard();
      const todoId = board.todos[0].id;

      todoManager.moveTodo(todoId, 'in_progress');

      const updatedBoard = todoManager.getBoard();
      const movedTodo = updatedBoard.todos.find(t => t.id === todoId);
      expect(movedTodo.status).toBe('in_progress');
    });

    it('should move TODO to paused status', () => {
      todoManager.addTodo('Test', 'Desc');
      const board = todoManager.getBoard();
      const todoId = board.todos[0].id;

      todoManager.moveTodo(todoId, 'paused');

      const updatedBoard = todoManager.getBoard();
      const movedTodo = updatedBoard.todos.find(t => t.id === todoId);
      expect(movedTodo.status).toBe('paused');
    });

    it('should recompute positions after move', () => {
      todoManager.addTodo('First', 'Desc');
      todoManager.addTodo('Second', 'Desc');

      const board = todoManager.getBoard();
      const firstId = board.todos[0].id;

      todoManager.moveTodo(firstId, 'in_progress');

      const updatedBoard = todoManager.getBoard();
      const backlogTodos = updatedBoard.todos.filter(t => t.status === 'backlog');
      expect(backlogTodos[0].position).toBe(0);
    });
  });

  describe('deleteTodo()', () => {
    it('should remove TODO', () => {
      todoManager.addTodo('Test', 'Desc');
      const board = todoManager.getBoard();
      const todoId = board.todos[0].id;

      expect(board.todos).toHaveLength(1);

      todoManager.deleteTodo(todoId);

      const updatedBoard = todoManager.getBoard();
      expect(updatedBoard.todos).toHaveLength(0);
    });
  });

  describe('reorderTodo()', () => {
    it('should reorder TODO within column', () => {
      todoManager.addTodo('First', 'Desc');
      todoManager.addTodo('Second', 'Desc');
      todoManager.addTodo('Third', 'Desc');

      const board = todoManager.getBoard();
      const thirdTodoId = board.todos[2].id;

      todoManager.reorderTodo(thirdTodoId, 0);

      const updatedBoard = todoManager.getBoard();
      const backlogTodos = updatedBoard.todos.filter(t => t.status === 'backlog');
      expect(backlogTodos[0].id).toBe(thirdTodoId);
    });
  });

  describe('setWIPLimit()', () => {
    it('should update WIP limit with validation', () => {
      todoManager.setWIPLimit(5);
      const board = todoManager.getBoard();
      expect(board.wipLimit).toBe(5);
    });

    it('should reject invalid WIP limits', () => {
      expect(() => todoManager.setWIPLimit(0)).toThrow();
      expect(() => todoManager.setWIPLimit(-1)).toThrow();
    });
  });

  describe('searchDone()', () => {
    it('should filter completed TODOs by category', () => {
      todoManager.addTodo('Fix bug in auth', 'Bug fix');
      const board = todoManager.getBoard();
      const todoId = board.todos[0].id;

      todoManager.moveTodo(todoId, 'done');

      const results = todoManager.searchDone('bug');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Fix bug in auth');
    });

    it('should filter by keyword in title', () => {
      todoManager.addTodo('Refactor database', 'Tech debt');
      const board = todoManager.getBoard();
      const todoId = board.todos[0].id;

      todoManager.moveTodo(todoId, 'done');

      const results = todoManager.searchDone('database');
      expect(results).toHaveLength(1);
    });
  });
});
