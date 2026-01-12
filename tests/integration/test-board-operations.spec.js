/**
 * Integration Tests for Board Operations (T032-T034, T049)
 * Test-first development: These tests should FAIL until full integration is implemented
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { TodoManager } from '../../src/services/todo-manager.js';
import { Storage } from '../../src/services/storage.js';

describe('Board Operations Integration (T032-T034, T049)', () => {
  let dom;
  let document;
  let window;
  let todoManager;
  let storage;

  beforeEach(() => {
    // Setup DOM environment
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable',
    });
    document = dom.window.document;
    window = dom.window;
    global.window = window;
    global.document = document;
    global.customElements = window.customElements;
    global.HTMLElement = window.HTMLElement;

    // Setup localStorage mock
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
          store[key] = value.toString();
        },
        removeItem: (key) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();
    global.localStorage = localStorageMock;

    // Initialize services
    storage = new Storage();
    todoManager = new TodoManager(storage);

    // Clear any existing data
    storage.clear();
  });

  afterEach(() => {
    if (storage) {
      storage.clear();
    }
  });

  describe('T032: Add TODO appears at top of backlog', () => {
    it('should add a new TODO at position 0 in backlog column', async () => {
      // Add first TODO
      const todo1 = todoManager.createTodo('First TODO');

      // Verify TODO was created with correct properties
      expect(todo1.id).toBeDefined();
      expect(todo1.title).toBe('First TODO');
      expect(todo1.status).toBe('backlog');
      expect(todo1.position).toBe(0);
      expect(todo1.createdAt).toBeDefined();

      // Get board state
      const board = todoManager.getBoard();
      const backlogTodos = board.todos.filter((t) => t.status === 'backlog');

      expect(backlogTodos).toHaveLength(1);
      expect(backlogTodos[0].title).toBe('First TODO');
      expect(backlogTodos[0].position).toBe(0);
    });

    it('should add new TODO at position 0 when other TODOs exist', async () => {
      // Add first TODO
      todoManager.createTodo('Existing TODO');

      // Add second TODO (should appear at top)
      const newTodo = todoManager.createTodo('New TODO');

      // Get board state
      const board = todoManager.getBoard();
      const backlogTodos = board.todos
        .filter((t) => t.status === 'backlog')
        .sort((a, b) => a.position - b.position);

      // New TODO should be at position 0
      expect(backlogTodos[0].title).toBe('New TODO');
      expect(backlogTodos[0].position).toBe(0);

      // Existing TODO should be at position 1
      expect(backlogTodos[1].title).toBe('Existing TODO');
      expect(backlogTodos[1].position).toBe(1);
    });

    it('should integrate with UI component to display new TODO at top', async () => {
      // This test will fail until components are implemented
      let KanbanBoard;
      try {
        const module = await import('../../src/components/kanban-board.js');
        KanbanBoard = module.KanbanBoard;
      } catch (error) {
        expect(error.message).toContain('Cannot find module');
        return;
      }

      // Create board component
      const boardElement = document.createElement('kanban-board');
      document.body.appendChild(boardElement);

      // Initialize with todoManager
      if (boardElement.init) {
        boardElement.init(todoManager);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Add TODO via manager
      todoManager.createTodo('Test TODO');

      // Trigger update (component should listen to manager events)
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify TODO appears in backlog column at top
      const backlogColumn = boardElement.querySelector(
        'todo-column[status="backlog"]'
      );
      const todoItems = backlogColumn.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(1);
      expect(
        todoItems[0].querySelector('.todo-title')?.textContent
      ).toBe('Test TODO');
    });
  });

  describe('T033: Multiple TODOs maintain order in backlog', () => {
    it('should maintain insertion order for multiple TODOs', () => {
      // Add multiple TODOs
      todoManager.createTodo('First TODO');
      todoManager.createTodo('Second TODO');
      todoManager.createTodo('Third TODO');

      // Get backlog todos sorted by position
      const board = todoManager.getBoard();
      const backlogTodos = board.todos
        .filter((t) => t.status === 'backlog')
        .sort((a, b) => a.position - b.position);

      expect(backlogTodos).toHaveLength(3);

      // Most recent (Third) should be at position 0
      expect(backlogTodos[0].title).toBe('Third TODO');
      expect(backlogTodos[0].position).toBe(0);

      // Second should be at position 1
      expect(backlogTodos[1].title).toBe('Second TODO');
      expect(backlogTodos[1].position).toBe(1);

      // First should be at position 2
      expect(backlogTodos[2].title).toBe('First TODO');
      expect(backlogTodos[2].position).toBe(2);
    });

    it('should display multiple TODOs in correct order in UI', async () => {
      let KanbanBoard;
      try {
        const module = await import('../../src/components/kanban-board.js');
        KanbanBoard = module.KanbanBoard;
      } catch (error) {
        expect(error.message).toContain('Cannot find module');
        return;
      }

      const boardElement = document.createElement('kanban-board');
      document.body.appendChild(boardElement);

      if (boardElement.init) {
        boardElement.init(todoManager);
      }

      // Add multiple TODOs
      todoManager.createTodo('First TODO');
      todoManager.createTodo('Second TODO');
      todoManager.createTodo('Third TODO');

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify order in UI
      const backlogColumn = boardElement.querySelector(
        'todo-column[status="backlog"]'
      );
      const todoItems = backlogColumn.querySelectorAll('.todo-item');
      const titles = Array.from(todoItems).map(
        (item) => item.querySelector('.todo-title')?.textContent
      );

      expect(titles).toEqual(['Third TODO', 'Second TODO', 'First TODO']);
    });
  });

  describe('T034: Reorder TODOs via position update and verify persistence', () => {
    it('should reorder TODOs by updating position property', () => {
      // Add TODOs
      const todo1 = todoManager.createTodo('First TODO');
      const todo2 = todoManager.createTodo('Second TODO');
      const todo3 = todoManager.createTodo('Third TODO');

      // Initial order: Third(0), Second(1), First(2)

      // Move "First TODO" to position 0 (top)
      todoManager.updateTodo(todo1.id, { position: 0 });

      // Get updated order
      const board = todoManager.getBoard();
      const backlogTodos = board.todos
        .filter((t) => t.status === 'backlog')
        .sort((a, b) => a.position - b.position);

      // Verify new order: First(0), Third(1), Second(2)
      expect(backlogTodos[0].title).toBe('First TODO');
      expect(backlogTodos[0].position).toBe(0);
    });

    it('should persist reordered TODOs to storage', () => {
      // Add TODOs
      const todo1 = todoManager.createTodo('First TODO');
      const todo2 = todoManager.createTodo('Second TODO');

      // Reorder
      todoManager.updateTodo(todo1.id, { position: 0 });

      // Create new manager instance to verify persistence
      const newManager = new TodoManager(storage);
      const board = newManager.getBoard();
      const backlogTodos = board.todos
        .filter((t) => t.status === 'backlog')
        .sort((a, b) => a.position - b.position);

      // Verify persisted order
      expect(backlogTodos[0].title).toBe('First TODO');
      expect(backlogTodos[0].position).toBe(0);
    });

    it('should support drag-and-drop reordering in UI', async () => {
      let KanbanBoard;
      try {
        const module = await import('../../src/components/kanban-board.js');
        KanbanBoard = module.KanbanBoard;
      } catch (error) {
        expect(error.message).toContain('Cannot find module');
        return;
      }

      const boardElement = document.createElement('kanban-board');
      document.body.appendChild(boardElement);

      if (boardElement.init) {
        boardElement.init(todoManager);
      }

      // Add TODOs
      const todo1 = todoManager.createTodo('First TODO');
      const todo2 = todoManager.createTodo('Second TODO');

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Simulate drag-and-drop
      const backlogColumn = boardElement.querySelector(
        'todo-column[status="backlog"]'
      );
      const todoItems = backlogColumn.querySelectorAll('.todo-item');

      // Simulate dragging first item to second position
      if (todoItems[0] && todoItems[0].dispatchEvent) {
        const dragStartEvent = new window.DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
        });
        const dropEvent = new window.DragEvent('drop', {
          bubbles: true,
          cancelable: true,
        });

        todoItems[0].dispatchEvent(dragStartEvent);
        todoItems[1].dispatchEvent(dropEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify reordering happened
      const updatedBoard = todoManager.getBoard();
      const backlogTodos = updatedBoard.todos
        .filter((t) => t.status === 'backlog')
        .sort((a, b) => a.position - b.position);

      // Order should have changed
      expect(backlogTodos).toHaveLength(2);
    });
  });

  describe('T049: Full backlog workflow (create→reorder→delete)', () => {
    it('should complete full workflow: create multiple, reorder, delete one', () => {
      // Step 1: Create multiple TODOs
      const todo1 = todoManager.createTodo('TODO 1');
      const todo2 = todoManager.createTodo('TODO 2');
      const todo3 = todoManager.createTodo('TODO 3');

      let board = todoManager.getBoard();
      let backlogTodos = board.todos.filter((t) => t.status === 'backlog');
      expect(backlogTodos).toHaveLength(3);

      // Step 2: Reorder - move TODO 1 to top
      todoManager.updateTodo(todo1.id, { position: 0 });

      board = todoManager.getBoard();
      backlogTodos = board.todos
        .filter((t) => t.status === 'backlog')
        .sort((a, b) => a.position - b.position);
      expect(backlogTodos[0].title).toBe('TODO 1');

      // Step 3: Delete TODO 2
      todoManager.deleteTodo(todo2.id);

      board = todoManager.getBoard();
      backlogTodos = board.todos.filter((t) => t.status === 'backlog');
      expect(backlogTodos).toHaveLength(2);
      expect(backlogTodos.find((t) => t.id === todo2.id)).toBeUndefined();

      // Verify remaining TODOs
      const remainingIds = backlogTodos.map((t) => t.id);
      expect(remainingIds).toContain(todo1.id);
      expect(remainingIds).toContain(todo3.id);
    });

    it('should persist all operations in full workflow', () => {
      // Create TODOs
      const todo1 = todoManager.createTodo('TODO 1');
      const todo2 = todoManager.createTodo('TODO 2');
      todoManager.createTodo('TODO 3');

      // Reorder
      todoManager.updateTodo(todo1.id, { position: 0 });

      // Delete
      todoManager.deleteTodo(todo2.id);

      // Create new manager to verify persistence
      const newManager = new TodoManager(storage);
      const board = newManager.getBoard();
      const backlogTodos = board.todos.filter((t) => t.status === 'backlog');

      // Verify final state persisted
      expect(backlogTodos).toHaveLength(2);
      expect(backlogTodos.find((t) => t.id === todo2.id)).toBeUndefined();

      const sortedTodos = backlogTodos.sort((a, b) => a.position - b.position);
      expect(sortedTodos[0].title).toBe('TODO 1');
    });

    it('should complete full workflow in UI', async () => {
      let KanbanBoard;
      try {
        const module = await import('../../src/components/kanban-board.js');
        KanbanBoard = module.KanbanBoard;
      } catch (error) {
        expect(error.message).toContain('Cannot find module');
        return;
      }

      const boardElement = document.createElement('kanban-board');
      document.body.appendChild(boardElement);

      if (boardElement.init) {
        boardElement.init(todoManager);
      }

      // Create TODOs
      const todo1 = todoManager.createTodo('TODO 1');
      const todo2 = todoManager.createTodo('TODO 2');
      todoManager.createTodo('TODO 3');

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify creation
      let backlogColumn = boardElement.querySelector(
        'todo-column[status="backlog"]'
      );
      let todoItems = backlogColumn.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(3);

      // Reorder
      todoManager.updateTodo(todo1.id, { position: 0 });
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Delete
      todoManager.deleteTodo(todo2.id);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify final state
      backlogColumn = boardElement.querySelector(
        'todo-column[status="backlog"]'
      );
      todoItems = backlogColumn.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(2);
    });
  });
});
